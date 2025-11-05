from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_chroma import Chroma
from Coletor import *
from dotenv import load_dotenv

load_dotenv()


llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=os.getenv("API_KEY"))

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
                            }}
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
                    Lembretes consistem de anúncios feitos dentro do conteúdo marcando datas. 
                    No caso de não haver anúncio EXPLÍCITO da data, IGNORE o campo data completamente.
                    Caso haja anúncio de DIA, MÊS E/OU ANO, retorne a data no formato DD/MM/YYYY DENTRO do campo de DATA. 
                    Se o ano não for explícito, use o ano atual.
                    Para categorizar um lembrete, busque por mensagens que evoquem eventos no futuro próximo como:

                    Exemplos de datas inválidas:

                        - '[Na próxima Segunda] (data inválida), [haverá prova.] (descrição)'
                        - '[Amanhã] (data) [eu irei para um congresso e ficarei fora até dia 26] (descrição)'
                        - '[Próximo mês] (data), [ocorrerá a Semana Universitária] (descrição), não faltem'
                    
                    Exemplos de datas válidas:

                        - '[Dia 25 de Dezembro] (data válida. experado (15/12/2025)), [será feriado.] (descrição), então não haverá aula.'
                        - '[16 de Novembro] (data válida. experado (16/11/2025)) [eu irei para um congresso e ficarei fora até dia 26] (descrição. Segunda data é opcional.)'
                        - '[14 de Maio de 2026] (data válida, experado (14/05/2026)), celebrarei 50 anos de casamento, por isso [não haverá aula] (descrição)'

                    Na área de lembretes, caso não haja nenhum lembrete relevante dento do conteúdo analisado, NÃO CRIE essa estrutura. 
                    Essa área de lembretes é estritamente para anúncios feitos em aula ou no material e não tem haver diretamente com o conteúdo do resumo.

                    O tópico desse material é '{input}'.
                    """

    prompt = ChatPromptTemplate.from_template(system_prompt)

    chain = prompt | llm

    output = chain.invoke({
        "input": user_prompt
    })

    return output.content