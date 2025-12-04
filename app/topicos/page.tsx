'use client';
import Image from "next/image";
import { useCallback, useEffect, useState, useRef } from 'react';
import LoadingPage from "../components/userStatePages/loading"
import ErrorPage from "../components/userStatePages/error"
import ModalConfirmacao from "../components/userStatePages/modalConfirmarAcao"; 
import { Navbar } from "../components/navbar";
import { useSearchParams } from 'next/navigation';

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

type MaterialDocumento = {
  id: number;
  nome: string;
}

type Mensagem = {
  id: number;
  conteudo: string;
  tempo: string;
  ia: boolean;
}

type Chat = {
  id: number;
  mensagens: Mensagem[];
}

export default function Page() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [conteudoTemp, setConteudoTemp] = useState('');
  const [tituloTemp, setTituloTemp] = useState('');
  const [modalDelecaoAberto, setModalDelecaoAberto] = useState(false);
  const [conteudoParaDeletar, setConteudoParaDeletar] = useState<ConteudoData | null>(null);
  const [chatProcessando, setChatProcessando] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [materiais, setMateriais] = useState<MaterialDocumento[]>([
    {
      id: 1,
      nome: 'Aula_Ponteiros.MP3',
    },
    {
      id: 2,
      nome: 'Slide_Aula_Ponteiros_suahdasuhdasiuhdasiuhdasudh.pdf',
    },
    {
      id: 3,
      nome: 'Exercicios_Ponteiros.doc',
    },
    {
      id: 4,
      nome: 'Exercicios_Ponteiros.doc',
    },
    {
      id: 5,
      nome: 'Exercicios_Ponteiros.doc',
    },
    {
      id: 6,
      nome: 'Exercicios_Ponteiros.doc',
    }
  ]);

  const [chat, setChat] = useState<Chat>({
    id: 0,
    mensagens: [
      {
        id: 0,
        conteudo: 'teste teste teste teste',
        tempo: 'teste',
        ia: false 
      },
      {
        id: 1,
        conteudo: 'teste teste teste teste',
        tempo: 'teste',
        ia: true 
      }
    ]
  });

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
  });

  const handleAdicionarMaterial = useCallback(() => {
    console.log('Botão: Adicionar Novo Material');
    alert('Funcionalidade de adicionar novo material será implementada aqui');
  }, []);

  const handleBaixarMaterial = useCallback(async (material: MaterialDocumento) => {
    try {
      setLoading(true);
      console.log('Baixando material:', material.nome);

      const response = await fetch(`/materiais/${material.id}`, {
        method: 'GET',
      });

      if (!response.ok) throw new Error('Erro ao baixar material');

      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = material.nome;
      
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('Material baixado com sucesso:', material.nome);

    } catch (err) {
      console.error('Erro ao baixar material:', err);
      alert('Erro ao baixar material. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chat.mensagens, scrollToBottom]);

  const handleIniciarEdicao = useCallback((conteudo: ConteudoData) => {
    setEditandoId(conteudo.id);
    setTituloTemp(conteudo.titulo);
    setConteudoTemp(conteudo.conteudo);
  }, []);

  const handleSalvarEdicao = useCallback(async (id: number) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/topico/conteudo/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: tituloTemp,
          conteudo: conteudoTemp,
        }),
      });

      if (!response.ok) throw new Error('Erro ao salvar edição');

      setTopicoData(prev => ({
        ...prev,
        conteudos: prev.conteudos.map(conteudo =>
          conteudo.id === id
            ? { ...conteudo, titulo: tituloTemp, conteudo: conteudoTemp }
            : conteudo
        )
      }));

      setEditandoId(null);
      console.log('Edição salva com sucesso!');

    } catch (err) {
      console.error('Erro ao salvar edição:', err);
      alert('Erro ao salvar edição. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [tituloTemp, conteudoTemp]);

  const handleCancelarEdicao = useCallback(() => {
    setEditandoId(null);
    setTituloTemp('');
    setConteudoTemp('');
  }, []);

  const handleAbrirModalDelecao = useCallback((conteudo: ConteudoData) => {
    setConteudoParaDeletar(conteudo);
    setModalDelecaoAberto(true);
  }, []);

  const handleConfirmarDelecao = useCallback(async () => {
    if (!conteudoParaDeletar) return;

    try {
      setLoading(true);
      
      const response = await fetch(`/topico/conteudo/${conteudoParaDeletar.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao deletar conteúdo');

      setTopicoData(prev => ({
        ...prev,
        conteudos: prev.conteudos.filter(conteudo => conteudo.id !== conteudoParaDeletar.id)
      }));

      console.log('Conteúdo deletado com sucesso!');
      
    } catch (err) {
      console.error('Erro ao deletar conteúdo:', err);
      alert('Erro ao deletar conteúdo. Tente novamente.');
    } finally {
      setLoading(false);
      setModalDelecaoAberto(false);
      setConteudoParaDeletar(null);
    }
  }, [conteudoParaDeletar]);

  const handleCancelarDelecao = useCallback(() => {
    setModalDelecaoAberto(false);
    setConteudoParaDeletar(null);
  }, []);

  const handleAtualizarTranscricao = useCallback(() => {
    console.log('Botão: Atualizar Transcrição');
  }, []);

  const handleEnviarMensagem = useCallback(() => {
    if (!mensagem.trim() || chatProcessando) return;

    console.log('Botão: Enviar Mensagem', mensagem);
    
    const novaMensagemUsuario: Mensagem = {
      id: Date.now(),
      conteudo: mensagem.trim(),
      tempo: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      ia: false
    };

    setChat(prev => ({
      ...prev,
      mensagens: [...prev.mensagens, novaMensagemUsuario]
    }));

    setMensagem('');
    setChatProcessando(true);

    setTimeout(() => {
      const respostaIA: Mensagem = {
        id: Date.now() + 1,
        conteudo: `Recebi sua mensagem: "${mensagem.trim()}". Como posso ajudá-lo?`,
        tempo: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        ia: true
      };

      setChat(prev => ({
        ...prev,
        mensagens: [...prev.mensagens, respostaIA]
      }));

      setChatProcessando(false);
    }, 1000);

  }, [mensagem, chatProcessando]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!chatProcessando) {
      setMensagem(event.target.value);
    }
  }, [chatProcessando]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && mensagem.trim() && !chatProcessando) {
      handleEnviarMensagem();
    }
    }, [mensagem, chatProcessando, handleEnviarMensagem]);

  useEffect(() => {
    const subjectIdParam = searchParams.get('subjectId');
    const fetchTopicoData = async() => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/students/subjects/topics?subjectId=${subjectIdParam}`);

        if (!response.ok) throw new Error("Failed to fetch Users");
        const data = await response.json();
          
        setTopicoData(data);

      } catch (err) {
        if (err instanceof Error){
        } else {
        }
      } finally {
        setLoading(false);
      }
    }
    fetchTopicoData();
  }, []);

  return(
    <main>
      <Navbar />
      
      <ModalConfirmacao
        isOpen={modalDelecaoAberto}
        titulo="Excluir Conteúdo"
        mensagem={`Tem certeza que deseja excluir "${conteudoParaDeletar?.titulo}"? Esta ação não pode ser desfeita.`}
        onConfirmar={handleConfirmarDelecao}
        onCancelar={handleCancelarDelecao}
        loading={loading}
      />

      {loading ? (
        <LoadingPage />
      ) : error ? (
        <ErrorPage />
      ) : (
        <div className="flex min-h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] gap-4 bg-white w-full p-4 box-border">
          <section className="overflow-y-auto flex flex-col flex-1 gap-4 border-2 border-[#098842] bg-white rounded-xl p-4 max-h-[calc(100vh-6rem)] w-7/10 drop-shadow-md">
            <h1 className="font-montserrat font-bold text-[#686464] text-center m-0 pt-2 text-2xl">
              {topicoData.titulo}
            </h1> 

            <div className="flex flex-col pl-2 pr-3 pt-2 pb-3 border-[1.5px] border-[#098842] rounded-2xl bg-[#F5F5F5]">
              <span className="flex justify-between items-center mb-2 px-0.5 py-0.5">
                <h2 className="font-montserrat font-bold text-[#494949] text-left mb-2 text-lg">
                  Material Original
                </h2>
              </span>

              <div className="flex flex-row gap-2 overflow-x-auto py-2
                [&::-webkit-scrollbar]:h-1.5
                [&::-webkit-scrollbar-track]:bg-gray-100
                [&::-webkit-scrollbar-track]:rounded
                [&::-webkit-scrollbar-thumb]:bg-[#098842]
                [&::-webkit-scrollbar-thumb]:rounded">
                
                <button 
                  className="flex flex-col justify-center items-center min-w-36 min-h-20 pt-3 ml-2 mb-2 border-2 border-dashed border-[#098842] rounded-xl shrink-0 bg-white hover:bg-[#f0f8f0] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#098842] focus:ring-opacity-50 group"
                  onClick={handleAdicionarMaterial}
                  aria-label="Adicionar novo material"
                >
                  <Image 
                    src="/imagens/add.svg" 
                    width={24} 
                    height={24} 
                    className="group-hover:scale-110 transition-transform" 
                    alt="Adicionar material"
                  />
                  <span className="font-montserrat font-normal text-[0.7rem] text-center text-[#098842] mx-0.5 px-1 mt-1">
                    Adicionar Material
                  </span>
                </button>
                
                {materiais.map(material => (
                  <button 
                    key={material.id} 
                    className="flex grow-0 flex-col justify-around items-center min-w-36 min-h-20  max-w-36 max-h-20 pt-3 ml-2 mb-2 border-[1.5px] border-[#098842] rounded-xl shrink-0 bg-[#F5F5F5] hover:bg-[#e8f5e8] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#098842] focus:ring-opacity-50"
                    onClick={() => handleBaixarMaterial(material)}
                    disabled={loading}
                    aria-label={`Baixar ${material.nome}`}
                  >
                    <Image 
                      src="/imagens/file.svg" 
                      width={36} 
                      height={20} 
                      className="mx-14" 
                      alt={`Ícone do ${material.nome}`}
                    />
                    <span className="font-montserrat font-normal text-[0.7rem] text-center text-[#098842] mx-0.5 px-1 w-full truncate">
                      {material.nome}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {topicoData.conteudos.map(conteudo => (
              <div key={conteudo.id} className="flex-1 pr-3 pl-2 pt-2 pb-3 border-[1.5px] border-[#098842] rounded-2xl bg-[#F5F5F5] text-black">
                <span className="flex justify-between items-center mb-2 px-0.5 py-0.5">
                  {editandoId === conteudo.id ? (
                    <input
                      type="text"
                      value={tituloTemp}
                      onChange={(e) => setTituloTemp(e.target.value)}
                      className="font-montserrat font-bold text-[#494949] text-left mb-2 text-lg bg-transparent border-b border-[#098842] focus:outline-none w-full"
                      autoFocus
                    />
                  ) : (
                    <h2 className="font-montserrat font-bold text-[#494949] text-left mb-2 text-lg">
                      {conteudo.titulo}
                    </h2>
                  )}
                  <div className="flex gap-2">
                    {editandoId === conteudo.id ? (
                      <>
                        <button 
                          className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity" 
                          aria-label="Salvar edição"
                          onClick={() => handleSalvarEdicao(conteudo.id)}
                        >
                          <Image src="/imagens/check.svg" width={20} height={20} alt="Salvar"/>
                        </button>
                        <button 
                          className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity" 
                          aria-label="Cancelar edição"
                          onClick={handleCancelarEdicao}
                        >
                          <Image src="/imagens/X-pequeno.svg" width={20} height={20} alt="Cancelar"/>
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity" 
                          aria-label="Excluir conteúdo"
                          onClick={() => handleAbrirModalDelecao(conteudo)}
                        >
                          <Image src="/imagens/X-pequeno.svg" width={20} height={20} alt="Excluir"/>
                        </button>
                      </>
                    )}
                  </div>
                </span>
                
                {editandoId === conteudo.id ? (
                  <textarea
                    value={conteudoTemp}
                    onChange={(e) => setConteudoTemp(e.target.value)}
                    className="font-montserrat font-normal text-[#494949] text-left leading-6 m-0 w-full h-64 p-2 border border-[#098842] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#098842]"
                  />
                ) : (
                  <p className="font-montserrat font-normal text-[#494949] text-left leading-6 m-0 text-clamp-1">
                    {conteudo.conteudo}
                  </p>
                )}
                
                {editandoId !== conteudo.id && (
                  <span className="flex flex-row justify-end gap-5 px-0.5 py-0.5 mt-4">
                    <button 
                      className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity" 
                      aria-label="Atualizar"
                      onClick={handleAtualizarTranscricao}
                    >
                      <Image src="/imagens/refresh.svg" width={20} height={20} alt="Atualizar"/>
                    </button>
                    <button 
                      className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity" 
                      aria-label="Editar"
                      onClick={() => handleIniciarEdicao(conteudo)}
                    >
                      <Image src="/imagens/editar.svg" width={20} height={20} alt="Editar"/>
                    </button>
                  </span>
                )}
              </div>
            ))}
          </section>

          <section className="flex flex-col w-3/10 min-w-72 gap-3 ">
            <div 
              ref={chatContainerRef}
              className="flex-1 border-2 border-[#098842] bg-white rounded-xl min-h-86 p-4 overflow-y-auto flex flex-col gap-4 box-border drop-shadow-md"
            >
              {chat.mensagens.map(mensagem => ( 
                <div key={mensagem.id} className={mensagem.ia ? "self-start max-w-80 p-3 bg-white border-2 border-[#098842] rounded-2xl text-[#333333] font-montserrat text-sm leading-6 relative box-border" : "self-end max-w-80 p-3 bg-[#098842] rounded-2xl text-white font-montserrat text-sm leading-6 relative box-border"}>
                  {mensagem.conteudo}
                  <div className="text-[0.7rem] opacity-80 mt-1 text-right">{mensagem.tempo}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center h-12 border-2 border-[#098842] bg-white rounded-xl px-4 gap-2 box-border drop-shadow-md">
              <button 
                className="w-6 h-6 cursor-pointer" 
                aria-label="Enviar mensagem"
                onClick={handleEnviarMensagem}
                disabled={!mensagem.trim() || chatProcessando}
              >
                <Image src="/imagens/send.svg" width={24} height={24} alt="Enviar"/>
              </button>
              <input
                type="text"
                value={mensagem}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={chatProcessando ? "IA está respondendo..." : "Faça uma pergunta"}
                className="font-montserrat font-normal text-[#494949] p-2 flex-1 bg-transparent border-none outline-none box-border placeholder:text-[#989898] placeholder:italic"
                aria-label="Digite sua pergunta"
                disabled={chatProcessando}
              />
            </div>
          </section>
        </div>
      )}
    </main>
  );
}