'use client';
import Image from "next/image";
import { useCallback, useState } from 'react';
import { Navbar } from "../components/navbar";

type ConteudoData = {
  id: number;
  titulo: string;
  conteudo: string;
}

type TopicoData = {
  id: number;
  titulo: string;
  conteudos: ConteudoData[];
}

export default function Page() {
  const [topicoData, setTopicoData] = useState<TopicoData>({
    id: 1,
    titulo: 'Ponteiros em C',
    conteudos: [
      {
        id: 1,
        titulo: 'Transcrição do Arquivo Original',
        conteudo: 'A utilização de ponteiros em linguagem C é uma das características que tornam a linguagem tão flexível e poderosa. Ponteiros ou apontadores, são variáveis que armazenam o endereço de memória de outras variáveis. Dizemos que um ponteiro "aponta" para uma varíável quando contém o endereço da mesma. Os ponteiros podem apontar para qualquer tipo de variável. Portanto temos ponteiros para int, float, double, etc.'
      },
      {
        id: 2,
        titulo: 'Resumo gerado por IA', 
        conteudo: `Os Ponteiros representam a elite suprema das operações em C, uma casta especial de variáveis que transcendem a mera armazenagem de valores convencionais para operar em um plano superior: o das coordenadas de memória. Estes não são meros portadores de dados, mas sim navegadores cósmicos que, em vez de carregarem planetas (valores) em sua essência, detêm os mapas estelares mais precisos com as localizações exatas (endereços) onde esses corpos celestes orbitam na vastidão do espaço de memória. Eles são os cartógrafos do universo digital, os únicos capazes de mapear e percorrer diretamente as constelações de bytes que compõem a realidade computacional.`
      }
    ]
  })

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
    <main>
      <Navbar></Navbar>
      <div className="flex min-h-[calc(100vh-4rem)] gap-4 bg-white w-full p-4 box-border overflow-hidden">
        <section className="flex flex-col flex-1 gap-4 border-2 border-[#098842] bg-white rounded-xl p-4 overflow-y-auto max-h-[calc(100vh-6rem)] w-7/10 drop-shadow-md 
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-gray-100
          [&::-webkit-scrollbar-track]:rounded
          [&::-webkit-scrollbar-thumb]:bg-[#098842]
          [&::-webkit-scrollbar-thumb]:rounded ">

          <h1 className=" font-montserrat font-bold text-[#686464] text-center m-0 pt-2 text-2xl">
            {topicoData.titulo}
          </h1> 

          <div className="flex flex-col  pl-2 pr-3 pt-2 pb-3 border-[1.5px] border-[#098842] rounded-2xl bg-[#F5F5F5]">
            <span className="flex justify-between items-center mb-2 px-0.5 py-0.5">
              <h2 className="font-montserrat font-bold text-[#494949] text-left mb-2 text-lg">
                Material Original
              </h2>
              <button 
                className="cursor-pointer" 
                aria-label="Mais opções"
                onClick={handleMaisOpcoes}
              >
                <Image src="/imagens/more.svg" width={22} height={22} alt="Mais opções"/>
              </button>
            </span>

            <div className="flex flex-row gap-2 overflow-x-auto py-2
              [&::-webkit-scrollbar]:h-1.5
              [&::-webkit-scrollbar-track]:bg-gray-100
              [&::-webkit-scrollbar-track]:rounded
              [&::-webkit-scrollbar-thumb]:bg-[#098842]
              [&::-webkit-scrollbar-thumb]:rounded">
              <div className="flex flex-col justify-around overflow-hidden min-w-36 min-h-20 pt-3 ml-2 mb-2 border-[1.5px] border-[#098842] rounded-xl shrink-0">
                <Image src="/imagens/file.svg" width={36} height={20}  className="mx-14" alt="Ícone do arquivo"/>
                <span className="font-montserrat font-normal text-[0.7rem] text-center text-[#098842] mx-0.5">
                  Aula_Ponteiros.MP3
                </span>
              </div>
            </div>
          </div>

          {topicoData.conteudos.map(conteudo => (
            <div key={conteudo.id} className="flex-1  pr-3 pl-2 pt-2 pb-3 border-[1.5px] border-[#098842] rounded-2xl bg-[#F5F5F5] text-black">
              <span className="flex justify-between items-center mb-2 px-0.5 py-0.5">
                <h2 className="font-montserrat font-bold text-[#494949] text-left mb-2 text-lg">
                  {conteudo.titulo}
                </h2>
                <button 
                  className="w-5 h-5 cursor-pointer" 
                  aria-label={`Fechar ${conteudo.titulo}`}
                  onClick={handleFecharTranscricao}
                >
                  <Image src="/imagens/X-pequeno.svg"  width={20} height={20} alt="Fechar"/>
                </button>
              </span>
              
              <p className="font-montserrat font-normal text-[#494949] text-left leading-6 m-0 text-clamp-1">
                {conteudo.conteudo}
              </p>
              
              <span className="flex flex-row justify-end gap-5 px-0.5 py-0.5 mt-4">
                <button 
                  className="w-5 h-5 cursor-pointer" 
                  aria-label={`Atualizar ${conteudo.titulo}`}
                  onClick={handleAtualizarTranscricao}
                >
                  <Image src="/imagens/refresh.svg" width={20} height={20} alt="Atualizar"/>
                </button>
                <button 
                  className="w-5 h-5 cursor-pointer" 
                  aria-label={`Renomear ${conteudo.titulo}`}
                  onClick={handleRenomearTranscricao}
                >
                  <Image src="/imagens/editar.svg" width={20} height={20} alt="Renomear"/>
                </button>
              </span>
            </div>
          ))}

          <button 
            className="h-6 w-56 rounded-lg mb-4 ml-4 flex flex-row justify-center items-center bg-[#098842] font-montserrat font-normal text-white text-xl cursor-pointer border-none box-border"
            aria-label="Abrir plano de estudos"
            onClick={handlePlanoEstudos}
          >
            Plano de Estudos
          </button>

        </section>

        <section className="flex flex-col w-3/10 min-w-72 gap-3">
          <div className="flex-1 border-2 border-[#098842] bg-white rounded-xl min-h-86 p-4 overflow-y-auto flex flex-col gap-4 box-border drop-shadow-md
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-gray-100
            [&::-webkit-scrollbar-track]:rounded
            [&::-webkit-scrollbar-thumb]:bg-[#098842]
            [&::-webkit-scrollbar-thumb]:rounded">
            <div className="self-end max-w-80 p-3 bg-[#098842] rounded-2xl text-white font-montserrat text-sm leading-6 relative box-border">
              O que são ponteiros em C?
              <div className="text-[0.7rem] opacity-80 mt-1 text-right">10:30</div>
            </div>
            <div className="self-start max-w-80 p-3 bg-white border-2 border-[#098842] rounded-2xl text-[#333333] font-montserrat text-sm leading-6 relative box-border">
              Ponteiros em C são variáveis que armazenam endereços de memória de outras variáveis. Eles permitem acesso direto à memória e são fundamentais para manipulação eficiente de dados.
              <div className="text-[0.7rem] opacity-60 mt-1 text-left">10:31</div>
            </div>
          </div>

          <div className="flex items-center h-12 border-2 border-[#098842] bg-white rounded-xl px-4 gap-2 box-border drop-shadow-md">
            <button 
              className="w-6 h-6 cursor-pointer" 
              aria-label="Enviar mensagem"
              onClick={handleEnviarMensagem}
              disabled={!mensagem.trim()}
            >
              <Image src="/imagens/send.svg" width={24} height={24} alt="Enviar"/>
            </button>
            <input
              type="text"
              value={mensagem}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Faça uma pergunta"
              className="font-montserrat font-normal text-[#494949] p-2 flex-1 bg-transparent border-none outline-none box-border placeholder:text-[#989898] placeholder:italic"
              aria-label="Digite sua pergunta"
            />
          </div>
        </section>
      </div>
    </main>
  );
}