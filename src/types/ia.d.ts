declare global {
  interface Lembrete {
    titulo: string;
    descricao: string;
    data?: Date;
  }

  interface Resumo {
    título: string;
    conteúdo: string;
  }

  interface RespostaIA {
    resumo: Resumo;
    lembretes?: Record<string, Lembrete>;
  }
}

export {}; // necessário para que o arquivo seja tratado como um módulo
