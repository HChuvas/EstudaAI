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
    completado?: boolean;
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
            conteudo: 'Ler Capítulo 3 do livro "Introdução a Algoritmos" (Cormen)',
            completado: true
        },
        {
            id: 2,
            titulo: 'Leitura Obrigatória',
            conteudo: 'Ler Capítulo 3 do livro "Introdução a Algoritmos" (Cormen) Ler Capítulo 3 do livro "Introdução a Algoritmos',
            completado: false
        },
        {
            id: 3,
            titulo: 'Leitura Obrigatória',
            conteudo: 'Ler Capítulo 3 do livro "Introdução a Algoritmos" (Cormen)',
            completado: false
        }
    ]
      
    })


    const toggleTaskCompletion = useCallback((taskId: number) => {
    setCheckList(prev => (
        {
        ...prev,
        tasks: prev.tasks.map(task =>
            task.id === taskId 
                ? { ...task, completado: !task.completado }
                : task
        )
    }));
}, []);

    return (
        <main className="flex flex-col w-screen h-screen overflow-hidden bg-[#F5F5F5]">
            
            <div className="flex flex-row  justify-between px-6 py-3 w-screen max-h-[7%] bg-[#098842] drop-shadow ">
                <h1 className="flex grow justify-center">{planoEstudos.titulo}</h1>
                <button className="w-5 h-5 cursor-pointer">
                    <Image src="/imagens/X-branco.svg" width={16} height={16} alt="Fechar"></Image>
                </button>
            </div>

            <div className="flex flex-row justify-between min-h-[93%] px-8 py-10 gap-8">

                <div className=" flex flex-row w-[75%] min-h-[85%] bg-[#FFFFFF] rounded-lg drop-shadow">
                    
                    <p className=" px-5 py-5 text-[#494949] whitespace-pre-line w-[97%] overflow-auto
                    
                    [&::-webkit-scrollbar]:hidden
                  [-ms-overflow-style:none]
                  [scrollbar-width:none]"
                
                    >{planoEstudos.conteudo}</p>
                    <div className="flex flex-col justify-end ml-2 mb-2 w-[3%]">
                        <button className="w-5 h-5 cursor-pointer">
                            <Image src="/imagens/editar-cinza.svg" width={16} height={16} alt="editar"></Image>
                        </button>
                    </div>
            
                </div>

                <div className=" w-[25%] min-h-[85%] bg-[#FFFFFF] rounded-lg drop-shadow gap-2 overflow-auto">

                    <div className="flex justify-center p-1 m-0.5 font-semibold text-[#686464] ">
                        <button className="w-5 h-5 cursor-pointer">
                            <Image src="/imagens/add-cinza.svg" width={16} height={16} alt="adicionar"></Image>
                        </button>
                        <h2>Adicionar Item</h2>
                    </div>

                    {checkList.tasks.map( task=>(
                        
                        <div key={task.id}className = {  ` flex flex-row ${task.completado ? 'bg-[#E3E3E3] line-through decoration-[#686464]' : '' } ` }  >
                            <button className="m-4 cursor-pointer flex-none" onClick={() => toggleTaskCompletion(task.id)}>
                                <Image src={ task.completado ? '/imagens/check_box_marcada.svg' : '/imagens/check_box.svg' } width={18} height={18} alt = 'checkbox'></Image>
                            </button>
                            
                            <div className="flex flex-col max-h-[65%] justify-center">
                                <h3 className="text-[#686464] font-semibold text-sm">{task.titulo}</h3>
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