'use client';
import Image from "next/image";
import { useCallback, useState } from 'react';

type PlanoEstudos = {
    id: number;
    titulo: string;
    conteudo: string;
}

type Task = {
    id: number;
    titulo: string;
    conteudo: string;
}

type CheckList = {
    id: number;
    tasks: Task[];
}

export default function Page() {
    
    const [planoEstudos, setPlanoEstudos] = useState<PlanoEstudos>({
    id: 1,
    titulo: 'Ponteiros em C',
    conteudo: "Dia 1: Fundamentos da Análise Assintótica\n\nConceitos: O que é análise de algoritmos? Por que analisar complexidade?\nNotação O (Big O): Definição formal e intuitiva\nExercícios: Identificar complexidade de loops simples\n\nMaterial:\n\nLivro: \"Introdução a Algoritmos\" - Cormen (Cap. 3)\nVideoaula: Complexidade de Algoritmos - Conceitos Iniciais\n\nDia 2: Notações Ω, Θ e o\n\nNotação Ω (Omega): Limite inferior\nNotação Θ (Theta): Limite justo\nNotação o (little o): Limite superior não assintoticamente restrito\nExercícios: Classificar funções usando diferentes notações\n\nDia 3: Análise de Complexidade em Códigos\n\nLoops simples e aninhados\nRecursão: Equações de recorrência simples"
  })

      const [checkList, setCheckList] = useState<CheckList>({
    id: 1,
    tasks: [
        {
            id: 1,
            titulo: 'Leitura Obrigatória',
            conteudo: 'Ler Capítulo 3 do livro "Introdução a Algoritmos" (Cormen)'
        },
        {
            id: 1,
            titulo: 'Leitura Obrigatória',
            conteudo: 'Ler Capítulo 3 do livro "Introdução a Algoritmos" (Cormen)'
        },
        {
            id: 1,
            titulo: 'Leitura Obrigatória',
            conteudo: 'Ler Capítulo 3 do livro "Introdução a Algoritmos" (Cormen)'
        }
    ]
      
    })

    return (
        <main className="flex flex-col w-screen h-screen overflow-hidden bg-[#F5F5F5]">
            
            <div className="flex flex-row  justify-between px-6 py-3 w-screen max-h-[7%] bg-[#098842] drop-shadow ">
                <h1 className="flex grow justify-center">Plano de Estudos ED</h1>
                <button className="w-5 h-5 cursor-pointer">
                    <Image src="/imagens/X-branco.svg" width={16} height={16} alt="Fechar"></Image>
                </button>
            </div>

            <div className="flex flex-row justify-between min-h-[93%] px-8 py-10 gap-8">

                <div className=" w-[75%] min-h-[85%] px-5 py-5 bg-[#FFFFFF] rounded-lg drop-shadow overflow-auto">
                    <p className="text-[#494949] whitespace-pre-line">{planoEstudos.conteudo}</p>
            
                </div>

                <div className=" w-[25%] min-h-[85%] bg-[#FFFFFF] rounded-lg drop-shadow gap-2 overflow-auto">

                    <div className="flex justify-center p-1 m-0.5 font-semibold text-[#686464] border-b border-[#494949]">
                        <button className="w-5 h-5 cursor-pointer">
                            <Image src="/imagens/add-cinza.svg" width={16} height={16} alt="adicionar"></Image>
                        </button>
                        <h2>Adicionar Item</h2>
                    </div>

                    {checkList.tasks.map( task=>(
                        
                        <div className="flex flex-row ">
                            <input className="m-4 w-7 h-7" type="checkbox" />
                            
                            <div className="flex shrink flex-col max-h-[65%] justify-center">
                                <h3 className="  text-[#686464] font-semibold text-sm">{task.titulo}</h3>
                                <p className=" text-[#686464] text-xs">{task.conteudo}</p>
                            </div>

                            <div className="flex flex-col m-3 justify-center gap-1.5">

                                <button className="w-5 h-5 cursor-pointer">
                                    <Image src="/imagens/editar-cinza.svg" width={16} height={16} alt="Editar"></Image>
                                </button>

                                <button className="w-5 h-5 cursor-pointer">
                                    <Image src="/imagens/apagar-cinza.svg" width={16} height={16} alt="Apagar"></Image>
                                </button>

                            </div>
                        </div>

                    ) )}

                </div>

            </div>

        </main>
    );
}