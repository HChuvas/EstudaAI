from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import PydanticOutputParser
from Coletor import *
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_file
from Estruturas import *
import json, re, requests, tempfile
from io import BytesIO
from supabase import create_client, Client
from zipfile import ZipFile

load_dotenv()

app = Flask(__name__)

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=os.getenv("API_KEY"))

llm_json = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=os.getenv("API_KEY"), response_mime_type="application/json")

supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

#depreciado. código mantido para caso seja requerido futuramente.
def parse_llm_json(response_text):
    cleaned = re.sub(r"^```[a-zA-Z]*\n?", "", response_text.strip())
    cleaned = re.sub(r"```$", "", cleaned.strip())
    return json.loads(cleaned)

#depreciado. sucinto a deleção futuramente
def geracao_resumo(user_prompt):
    system_prompt = """
                    Seu trabalho é trazer um resumo baseado nos conteúdos compartilhados contigo.
                    O conteúdo do resumo deve ser composto de:

                        - palavras-chaves do conteúdo;
                        - principais tópicos abordados, explicados com riqueza de detalhes;

                    Gere o resumo no formato JSON seguindo o seguinte template: 

                        {{
                            "resumo": {{
                                "título": "titulo do resumo",
                                "conteúdo": "todo o conteúdo do resumo"
                            }},
                            "lembretes": {{
                                "lembrete1": {{
                                "titulo": "titulo do lembrete",
                                "descricao": "descricao do lembrete",
                                "data": "data importante mencionada no material ou aula"
                                }},
                                "lembrete2": {{
                                "titulo": "titulo do lembrete",
                                "descricao": "descricao do lembrete",
                                "data": "data importante mencionada no material ou aula (campo opcional)"
                                }}
                                .
                                .
                                .
                            }}
                        }}

                    OBS:
                    Gere SOMENTE o json, e nada mais.
                    Não gere NENHUM MARKDOWN, somente como ***STRING PADRÃO***
                    Lembretes consistem de anúncios feitos dentro do conteúdo marcando datas. 
                    No caso de não haver anúncio EXPLÍCITO da data deixe o campo DATA VAZIO ("").
                    Caso haja anúncio de DIA, MÊS E/OU ANO, retorne a data no formato YYYY-MM-DDTHH:mm:ss.sssZ (FORMATO ISO) DENTRO do campo de DATA. 
                    Caso o horário não seja especificado, PREENCHA O HORÁRIO COM O HORÁRIO PADRÃO (00:00:00.000)
                    Se o ano não for explícito, use o ano atual (2025).
                    Para categorizar um lembrete, busque por mensagens que evoquem eventos no futuro próximo como:
                    
                    Exemplos de datas válidas:

                        - '[25/12] (data válida.): [será feriado] (descrição), então não haverá aula.'
                        - '[16 de Novembro / 16/11] (data válida.) [eu irei para um congresso e ficarei fora até dia 26] (descrição. Segunda data é opcional.)'
                        - '[14 de Maio de 2026 / 14/05] (data válida.), celebrarei 50 anos de casamento, por isso [não haverá aula] (descrição)'
                    
                    **IMPORTANTE:**
                    Caso o conteúdo enviado esteja em formato de lista, cronograma, calendário, tabela de eventos, agenda de aulas ou sequência de datas, 
                    cada linha contendo uma ou mais datas deve ser interpretada como um lembrete separado.

                    - Se houver duas datas na mesma linha (ex: “11/11 e 13/11”), gere dois lembretes idênticos, variando apenas a data.  
                    - O título do lembrete deve ser o texto imediatamente após a data (ex: “Aula de Arquitetura”, “Entrega do Projeto”, “Apresentação Final” etc.).  
                    - A descrição pode ser gerada com base no contexto geral do material (ex: “Atividade de entrega”, “Aula de revisão”, “Apresentação de resultados”).  
                    - Sempre que uma linha contiver uma data, gere um lembrete, mesmo que não haja verbo ou contexto narrativo.  
                    - Interprete expressões como “Calendário”, “Cronograma”, “Agenda”, “Planejamento” como indícios de que o texto é uma lista de eventos com datas.

                    Na área de lembretes, caso não haja nenhum lembrete relevante dento do conteúdo analisado, mantenha o campo lembrete como um campo vazio. Ex: "lembretes": {{}}. 
                    Essa área de lembretes é estritamente para anúncios feitos em aula ou no material e não tem haver diretamente com o conteúdo do resumo.

                    O tópico desse material é '{input}'.
                    """

    prompt = ChatPromptTemplate.from_template(system_prompt)

    chain = prompt | llm

    output = chain.invoke({
        "input": user_prompt
    })

    return output.content

#versão atualizada do código acima. mantido por questões de garantia.
def geracao_resumo_json_mode(user_prompt):
    template_resumo =   """
                        Your task is to produce a summary based on the content shared with you.
                        The summary MUST contain:

                            - keywords extracted from the content analyzed;
                            - the main topics covered, explained in rich detail;

                        Generate the summary in JSON format following this template: 

                            {{
                                "resumo": {{
                                    "titulo": "titulo do resumo",
                                    "conteudo": "todo o conteúdo do resumo"
                                }},
                                "lembretes": {{
                                    "lembrete1": {{
                                    "titulo": "titulo do lembrete",
                                    "descricao": "descricao do lembrete",
                                    "data": "data importante mencionada no material ou aula"
                                    }},
                                    "lembrete2": {{
                                    "titulo": "titulo do lembrete",
                                    "descricao": "descricao do lembrete",
                                    "data": "data importante mencionada no material ou aula (campo opcional)"
                                    }}
                                    .
                                    .
                                    .
                                }}
                            }}

                        NOTE:
                        Generate ONLY the JSON, and nothing else.
                        Do NOT generate ANY MARKDOWN, only a ***PLAIN STRING***.

                        Reminders consist of announcements made inside the content that mention dates.
                        If there is NO EXPLICIT date announcement, leave the DATE field EMPTY ("").

                        If a DAY, MONTH AND/OR YEAR is explicitly mentioned, return the date in ISO format:
                        YYYY-MM-DDTHH:mm:ss.sssZ.
                        If the time is not specified, FILL THE TIME WITH THE DEFAULT VALUE (00:00:00.000).
                        If the year is not explicit, use the current year (2025).

                        To categorize a reminder, search for messages that express upcoming future events such as:

                        Valid date examples:

                            - '[25/12] (valid date.): [there will be a holiday] (description), so there will be no class.'
                            - '[November 16 / 16/11] (valid date.) [I will attend a conference and will be away until the 26th] (description. The second date is optional.)'
                            - '[May 14, 2026 / 14/05] (valid date.), I will celebrate 50 years of marriage, therefore [there will be no class] (description)'

                        IMPORTANT:
                        If the content sent is in list format, schedule, calendar, table of events, class agenda, or sequence of dates,  
                        each line containing one or more dates must be interpreted as a separate reminder.

                        - If there are two dates in the same line (e.g., “11/11 e 13/11”), generate two identical reminders, varying only the date.  
                        - The title of the reminder must be the text immediately after the date (e.g., “Architecture Class”, “Project Delivery”, “Final Presentation”).  
                        - The description may be generated based on the general context of the material (e.g., “Delivery activity”, “Review class”, “Presentation of results”).  
                        - Whenever a line contains a date, generate a reminder, even if there is no verb or narrative context.  
                        - Interpret expressions such as “Calendar”, “Schedule”, “Agenda”, “Planning” as indications that the text is a list of events with dates.

                        In the reminders area, if there are no relevant reminders in the analyzed content, keep the reminders field empty, e.g., "lembretes": {{}}.
                        This reminder area is strictly for announcements made in class or within the material and is NOT directly related to the content of the summary.

                        The topic of this material is '{input}'.

                        THE OUTPUT ***MUST ALWAYS BE IN PORTUGUESE***, even though the instructions are written in English.
                        """
    
    parser_saida = PydanticOutputParser(pydantic_object=SaidaResumo)

    prompt = ChatPromptTemplate.from_template(template_resumo)

    chain = prompt | llm_json | parser_saida

    output = chain.invoke({
        "input": user_prompt
    })

    return output.model_dump_json(indent=2)

def conversar_com_llm(conteudo:str):
    prompt = ChatPromptTemplate.from_template(conteudo)
    chain = prompt | llm
    response = chain.invoke({})
    return response.content

def gerar_plano_de_estudo(user_prompt):
    template_plano_de_estudo =  """
                                Seu trabalho é trazer um plano de estudos, no estilo de um roadmap, para orientar um aluno em quais conteúdos priorizar, dado uma série de
                                materiais e assuntos.
                                O conteúdo esperado do resumo consiste de:

                                - Uma lista simplificada do fluxo geral dos conteúdos, organizada em tópicos baseados em prioridade. Essa prioridade consiste em definir
                                o quão crucial aquele conteúdo é para que se possa compreender os assuntos seguintes. A lista deve conter todos os assuntos relevantes. Ex:
                                        1. Introdução a Ponteiros;
                                        2. Aritmética de Ponteiros;
                                        3. Ponteiros Aplicados em Estrutura de Dados;
                                        4. ...
                                    - Uma lista expandida, estruturada com a ordem dos tópicos, explicando o motivo para aquele conteúdo ter sido escolhido naquela ordem.
                                        OBS1: A explicação DEVE ser composta de 2 a 3 sentenças curtas.
                                        OBS2: NÃO mostre o contador de caracteres em nenhum ponto da conversa. É necessário apenas o conteúdo. 
                                        OBS3: A intenção desse limite é apenas para que sirva como uma breve justificativa e orientação para o que deve ser visto e por que.

                                    - Ao final da lista, baseado no que já foi explicado, gere uma segunda lista com conteúdos não explicitamente mencionados que podem ser
                                    relevantes para melhorar a compreensão do resumo. Ex:
                                        (mantendo o contexto de aula de ponteiros)
                                        a) Conceitos básicos de C;
                                        b) Estruturas de dados básicas (vetores e construtores);
                                        c) ...
                                        OBS: Os assuntos devem ser relevantes para o conteúdo e não puxar de conhecimentos que estão muito além do escopo estudado.
                                    
                                    Gere o plano de estudos seguindo o formato JSON especificado:

                                        {
                                            "plano": {
                                                "titulo": "Titulo do plano de estudos"
                                            },
                                            "conteudos_prioritarios": {
                                                "topico1": {
                                                    "ordem": 1,
                                                    "titulo": "Nome do primeiro tópico prioritário"
                                                },
                                                "topico2": {
                                                    "ordem": 2,
                                                    "titulo": "Nome do segundo tópico prioritário"
                                                }
                                                ...
                                            },
                                            "topicos_expandidos": {
                                                "topico1": {
                                                    "ordem": 1,
                                                    "titulo": "Nome do primeiro tópico",
                                                    "justificativa": "Explicação do porquê esse tópico vem nessa ordem"
                                                },
                                                "topico2": {
                                                    "ordem": 2,
                                                    "titulo": "Nome do segundo tópico",
                                                    "justificativa": "Explicação do porquê esse tópico vem nessa ordem"
                                                }
                                                ...
                                            },
                                            "conteudos_complementares": {
                                                "complemento1": {
                                                    "titulo": "Conteúdo complementar relevante",
                                                    "descricao": "Descrição resumida da importância desse conteúdo adicional"
                                                },
                                                "complemento2": {
                                                    "titulo": "Outro conteúdo complementar",
                                                    "descricao": "Descrição resumida"
                                                }
                                                ...
                                            },
                                            "checklist": {
                                                "topico1": {
                                                    "titulo": "Nome do Topico",
                                                    "Descricao": "Descricao do Topico"
                                                },
                                                "topico1": {
                                                    "titulo": "Nome do Topico",
                                                    "Descricao": "Descricao do Topico"
                                                }
                                                ...
                                            }
                                        }
                                    """
    
    parser_plano_de_estudos = PydanticOutputParser(pydantic_object=SaidaPlanoDeEstudos)

    prompt = ChatPromptTemplate.from_template(template_plano_de_estudo)

    chain = prompt | llm_json | parser_plano_de_estudos

    output = chain.invoke({
        "input": user_prompt
    })

    return output.model_dump_json(indent=2)

#Lembrete precisamos PROCESSAR OS DADOS EM  (pdf2md_extractor ou mp2text_extractor) para evitar erros na leitura
@app.route("/generate", methods=["GET"])
def generate_summary():
    
    try:
        data = request.get_json()
        user_prompt = data.get("material")

        if not user_prompt:
            return jsonify({"error": "Campo 'material' é obrigatório"}), 400

        result = geracao_resumo_json_mode(user_prompt)

        try:
            json_result = result
        
        except json.JSONDecodeError:
            json_result = {"raw_output": result}
        
        return jsonify(json_result)

    except Exception as e:
        print(e)
        return jsonify({"error": e}), 500
    
@app.route("/studyplan", methods=["GET"])
def generate_study_plan():
    
    try:
        data = request.get_json()
        user_prompt = data.get("transcription")

        if not user_prompt:
            return jsonify({"error": "Campo 'material' é obrigatório"}), 400

        result = gerar_plano_de_estudo(user_prompt)

        try:
            json_result = result
        
        except json.JSONDecodeError:
            json_result = {"raw_output": result}
        
        return jsonify(json_result)

    except Exception as e:
        print(e)
        return jsonify({"error": e}), 500

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()

        if not data or 'texto' not in data:
            return jsonify({"erro": "Envie uma mensagem. Campo 'mensagem' obrigatório."}), 400
        
        text = data['texto']
        response = conversar_com_llm(text)

        return jsonify({"resposta": response})
    except Exception as e:
        print(e)
        return jsonify({"error": e}), 500

@app.route("/download", methods=["POST"])
def download():
    
    data = request.json
    buffer = BytesIO()
    results = []

    with ZipFile(buffer, "w") as zipf:
        for obj in data:
            path = obj.get("file_path")
            material_id = obj.get("id")
            if not path:
                return jsonify({"error": "File path unknown"}), 400
            
            resp = requests.get(path, stream=True)

            if resp.status_code != 200:
                return jsonify({"error": "Failed to fetch file"}), 500

            conteudo = resp.content
            mem_file = BytesIO(conteudo)
            mem_file.seek(0)
            filename = path.split("/")[-1]
            #zipf.writestr(filename,resp.content)
            ext = filename.split(".")[-1].lower() if "." in filename else ""

            AUDIO_EXTS = {"mp3", "wav", "m4a", "flac", "aac", "ogg"}
            DOC_EXTS = {"pdf", "docx", "pptx"}

            try:
                if ext in AUDIO_EXTS:
                    #transcricao = mp2txt_extractor(mem_file)
                    continue
                elif ext in DOC_EXTS:
                    transcricao = pdf2md_extractormod(mem_file ,filename)
                else:
                    transcricao = None

            except Exception as e:
                results.append({
                    "filename": filename,
                    "transcription": "" 
                })
                continue

            results.append({
                "material_id": material_id,
                "filename": filename,
                "transcription": transcricao 
            })

    return jsonify({"results": results}), 200

@app.route("/transcript", methods=["POST"])
def transcript_test():
    
    data = request.json
    results = []

    for obj in data:
        path = obj.get("file_path")
        material_id = obj.get("id")
        filename = path.split("/")[-1]

        if not path:
            return jsonify({"error": "File path unknown"}), 400
        
        try:
            transcricao = pdf2md_extractor(path)
            results.append({
                "id": material_id,
                "filename": filename,
                "transcription": transcricao
            })
        except Exception as e:
            results.append({
                "id": material_id,
                "filename": filename,
                "transcription": "" 
            })
            continue


    return jsonify({"results": results}), 200





    

    
# a ser feito: 
# 1. rota para receber arquivo do back. baixar e retornar transcrição
# 2. rota para chamar o modelo de embedding e transferir o conteudo da transcrição como embedding para o pg vector
# 3. verificar persistência da conversa dentro de um tópico
    
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

