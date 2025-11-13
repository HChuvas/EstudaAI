'use client';
import { useCallback, useState } from 'react';
import styles from "../components/CSS/transcricao.module.css";

interface TranscricaoData {
  titulo: string;
  conteudo: string;
}

interface ResumoData {
  titulo: string;
  conteudo: string;
}

const transcricaoExemplo: TranscricaoData = {
  titulo: "Transcrição do Arquivo",
  conteudo: `A utilização de ponteiros em linguagem C é uma das características que tornam a linguagem tão flexível e poderosa.
Ponteiros ou apontadores, são variáveis que armazenam o endereço de memória de outras variáveis.
Dizemos que um ponteiro "aponta" para uma varíável quando contém o endereço da mesma.
Os ponteiros podem apontar para qualquer tipo de variável. Portanto temos ponteiros para int, float, double, etc.`
};

const resumoExemplo: ResumoData = {
  titulo: "Resumo gerado por IA", 
  conteudo: `Este resumo aborda os conceitos fundamentais de ponteiros na linguagem C, incluindo:
• Definição e funcionamento de ponteiros
• Armazenamento de endereços de memória
• Flexibilidade para diferentes tipos de dados
• Aplicações práticas na programação`
};

export default function Transcricao_Resumo() {
  const [mensagem, setMensagem] = useState('');

  const handleMaisOpcoes = useCallback(() => {
    console.log('Botão: Mais Opções');
  }, []);

  const handleFecharTranscricao = useCallback(() => {
    console.log('Botão: Fechar Transcrição');
  }, []);

  const handleAtualizarTranscricao = useCallback(() => {
    console.log('Botão: Atualizar Transcrição');
  }, []);

  const handleRenomearTranscricao = useCallback(() => {
    console.log('Botão: Renomear Transcrição');
  }, []);

  const handleFecharResumo = useCallback(() => {
    console.log('Botão: Fechar Resumo');
  }, []);

  const handleAtualizarResumo = useCallback(() => {
    console.log('Botão: Atualizar Resumo');
  }, []);

  const handleRenomearResumo = useCallback(() => {
    console.log('Botão: Renomear Resumo');
  }, []);

  const handlePlanoEstudos = useCallback(() => {
    console.log('Botão: Plano de Estudos');
  }, []);

  const handleEnviarMensagem = useCallback(() => {
    console.log('Botão: Enviar Mensagem', mensagem);
    setMensagem('');
  }, [mensagem]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setMensagem(event.target.value);
  }, []);

  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && mensagem.trim()) {
      handleEnviarMensagem();
    }
  }, [mensagem, handleEnviarMensagem]);

  return(
    <main className={`${styles.mainContainer} min-h-[calc(100vh-4rem)] p-4 overflow-hidden`}>

        <section className={`${styles.transcricaoResumoContainer} drop-shadow-md`}>

          <h1 className={styles.heading1}>Ponteiros em C</h1> 

          <div className={styles.arquivosContainer}>
            <span className={styles.upperBar}>
              <h2 className={styles.heading2}>Material Original</h2>
              <button 
                className={`${styles.buttonImage} cursor-pointer`} 
                aria-label="Mais opções"
                onClick={handleMaisOpcoes}
              >
                <img src="/imagens/more.svg" alt="Mais opções"/>
              </button>
            </span>

            <div className={styles.arquivosRowContainer}>
              <div className={styles.arquivosBox}>
                <img src="/imagens/file.svg" className={styles.arquivosImage} alt="Ícone do arquivo"/>
                <span className={styles.arquivosHeading}> Aula_Ponteiros.MP3 </span>
              </div>
            </div>
          </div>

          <div className={styles.transcricaoResumoBox}>
            <span className={styles.upperBar}>
              <h2 className={styles.heading2}>{transcricaoExemplo.titulo}</h2>
              <button 
                className={`${styles.buttonImage} cursor-pointer`} 
                aria-label="Fechar transcrição"
                onClick={handleFecharTranscricao}
              >
                <img src="/imagens/X.svg" alt="Fechar"/>
              </button>
            </span>
            
            <p className={styles.transcricaoResumoText}>
              {transcricaoExemplo.conteudo}
            </p>
            
            <span className={styles.downBar}>
              <button 
                className={`${styles.buttonImage} cursor-pointer`} 
                aria-label="Atualizar transcrição"
                onClick={handleAtualizarTranscricao}
              >
                <img src="/imagens/refresh.svg" alt="Atualizar"/>
              </button>
              <button 
                className={`${styles.buttonImage} cursor-pointer`} 
                aria-label="Renomear transcrição"
                onClick={handleRenomearTranscricao}
              >
                <img src="/imagens/editar.svg" alt="Renomear"/>
              </button>
            </span>
          </div>

          <div className={styles.transcricaoResumoBox}>
            <span className={styles.upperBar}>
              <h2 className={styles.heading2}>{resumoExemplo.titulo}</h2>
              <button 
                className={`${styles.buttonImage} cursor-pointer`} 
                aria-label="Fechar resumo"
                onClick={handleFecharResumo}
              >
                <img src="/imagens/X.svg" alt="Fechar"/>
              </button>
            </span>

            <p className={styles.transcricaoResumoText}>
              {resumoExemplo.conteudo}
            </p>

            <span className={styles.downBar}>
              <button 
                className={`${styles.buttonImage} cursor-pointer`} 
                aria-label="Atualizar resumo"
                onClick={handleAtualizarResumo}
              >
                <img src="/imagens/refresh.svg" alt="Atualizar"/>
              </button>
              <button 
                className={`${styles.buttonImage} cursor-pointer`} 
                aria-label="Renomear resumo"
                onClick={handleRenomearResumo}
              >
                <img src="/imagens/editar.svg" alt="Renomear"/>
              </button>
            </span>
          </div>

          <button 
            className={`${styles.buttonPlanoEstudos} cursor-pointer`} 
            aria-label="Abrir plano de estudos"
            onClick={handlePlanoEstudos}
          >
            Plano de Estudos
          </button>

        </section>

        <section className={styles.chatContainer}>
          <div className={`${styles.chatBox} drop-shadow-md`}>
            <div className={styles.textBoxUser}>
              O que são ponteiros em C?
              <div className="timestamp">10:30</div>
            </div>
            <div className={styles.textBoxIA}>
              Ponteiros em C são variáveis que armazenam endereços de memória de outras variáveis. Eles permitem acesso direto à memória e são fundamentais para manipulação eficiente de dados.
              <div className="timestamp">10:31</div>
            </div>
          </div>

          <div className={`${styles.mensageBox} drop-shadow-md`}>
            <button 
              className={`${styles.buttonSendImage} cursor-pointer`} 
              aria-label="Enviar mensagem"
              onClick={handleEnviarMensagem}
              disabled={!mensagem.trim()}
            >
              <img src="/imagens/send.svg" alt="Enviar"/>
            </button>
            <input
              type="text"
              value={mensagem}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Faça uma pergunta"
              className={styles.textMensageInput}
              aria-label="Digite sua pergunta"
            />
          </div>
        </section>
              
    </main>
  );
}