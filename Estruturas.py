from typing import Dict, Optional
from pydantic import BaseModel, Field

#A função desse módulo é separar as classes para validação de cada saída estruturada gerada pela llm
class Resumo(BaseModel):
        titulo: str
        conteudo: str

class Lembrete(BaseModel):
    titulo: str
    descricao: str
    data: str = ""

class SaidaResumo(BaseModel):
     resumo: Resumo
     lembretes: Dict[str, Lembrete] = {}

class TopicoSimplificado(BaseModel):
    ordem: int
    titulo: str

class TopicoExpandido(BaseModel):
    ordem: int
    titulo: str
    justificativa: str

class ConteudoComplementar(BaseModel):
    titulo: str
    descricao: str

class Plano(BaseModel):
    titulo: str

class SaidaPlanoDeEstudos(BaseModel):
    plano: Plano
    conteudos_prioritarios: Dict[str, TopicoSimplificado]
    topicos_expandidos: Dict[str, TopicoExpandido]
    conteudos_complementares: Dict[str, ConteudoComplementar]
