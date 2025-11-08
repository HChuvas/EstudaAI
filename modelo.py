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
                    Caso haja anúncio de DIA, MÊS E/OU ANO, retorne a data no formato DD/MM/YYYY DENTRO do campo de DATA. 
                    Se o ano não for explícito, use o ano atual (2025).
                    Para categorizar um lembrete, busque por mensagens que evoquem eventos no futuro próximo como:

                    Exemplos de datas inválidas:

                        - '[Na próxima Segunda] (data inválida), [haverá prova.] (descrição)'
                        - '[Amanhã] (data) [eu irei para um congresso e ficarei fora até dia 26] (descrição)'
                        - '[Próximo mês] (data), [ocorrerá a Semana Universitária] (descrição), não faltem'
                    
                    Exemplos de datas válidas:

                        - '[Dia 25 de Dezembro / 25/12] (data válida. esperado (25/12/2025)), [será feriado.] (descrição), então não haverá aula.'
                        - '[16 de Novembro / 16/11] (data válida. esperado (16/11/2025)) [eu irei para um congresso e ficarei fora até dia 26] (descrição. Segunda data é opcional.)'
                        - '[14 de Maio de 2026 / 14/05] (data válida, esperado (14/05/2026)), celebrarei 50 anos de casamento, por isso [não haverá aula] (descrição)'
                        Você DEVE formatar a data para qualquer tipo de expressão que se refira a uma data.

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

def conversar(conteudo:str):
    prompt = ChatPromptTemplate.from_template(conteudo)
    chain = prompt | llm
    response = chain.invoke({})
    return response.content

entrada = "07 - Arquitetura Computadores - Entrada e saida (1).pdf"
result = geracao_resumo(entrada)
print(parse_llm_json(result))
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
    
"""if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)"""