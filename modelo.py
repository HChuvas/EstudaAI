from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_chroma import Chroma
from Coletor import *
from dotenv import load_dotenv
from flask import Flask, jsonify, request
import json
import re

load_dotenv()

app = Flask(__name__)

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=os.getenv("API_KEY"))

def parse_llm_json(response_text):
    cleaned = re.sub(r"^```[a-zA-Z]*\n?", "", response_text.strip())
    cleaned = re.sub(r"```$", "", cleaned.strip())
    return json.loads(cleaned)

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
                    Caso haja anúncio de DIA, MÊS E/OU ANO, retorne a data no formato YYYY-MM-DDTHH:mm:ss.sss (FORMATO ISO) DENTRO do campo de DATA. 
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

def conversar_com_llm(conteudo:str):
    prompt = ChatPromptTemplate.from_template(conteudo)
    chain = prompt | llm
    response = chain.invoke({})
    return response.content

arquivo = "UECE-CC-Sem 2025.2-Extensão 3-Regras do Jogo (1).pptx"
entrada = pdf2md_extractor(arquivo)
result = geracao_resumo(entrada)

#Lembrete precisamos PROCESSAR OS DADOS EM  (pdf2md_extractor ou mp2text_extractor) para evitar erros na leitura
@app.route("/generate", methods=["GET"])
def generate_summary():
    
    try:
        # data = request.get_json()
        # user_prompt = data.get("prompt")

        # if not user_prompt:
        #     return jsonify({"error": "Campo 'prompt' é obrigatório"}), 400

        result = geracao_resumo(entrada)
        print(result)

        try:
            json_result = parse_llm_json(result)
        
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
    
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)