'use client';

import Image from "next/image";
import { useCallback, useState } from 'react';

type material = {
    id: number;
    titulo: string;
    arquivos_adicionados: number;
    selecionado?: boolean;
}

type MaterialList = {
    id: number;
    list: material[];
}


export default function Page() {

    const [materialList, setMaterialList] = useState<MaterialList>({
        id: 1,
        list: [
            {
                id: 1,
                titulo: 'Leitura Obrigatória',
                arquivos_adicionados: 3,
                selecionado: false
            },
            {
                id: 2,
                titulo: 'Leitura Obrigatória',
                arquivos_adicionados: 5,
                selecionado: false
            },
            {
                id: 3,
                titulo: 'Leitura Obrigatória',
                arquivos_adicionados: 2,
                selecionado: false
            }
        ]
        
    })

        const selecionarMaterial = useCallback((materialId: number) => {
    setMaterialList(prev => (
        {
        ...prev,
        tasks: prev.list.map(material =>
            material.id === materialId 
                ? { ...material, selecionado: !material.selecionado }
                : material
        )
    }));
}, []);

    return (
        <main className="flex flex-col w-screen h-screen overflow-hidden bg-[#F5F5F5] ">

            <div className="flex flex-row  justify-between px-6 py-3 w-screen max-h-[7%] bg-[#098842] drop-shadow ">
                <h1 className="flex grow justify-center ml-5">Criar Plano de Estudos</h1>
                <button className="w-5 h-5 cursor-pointer">
                    <Image src="/imagens/X-branco.svg" width={16} height={16} alt="Fechar"></Image>
                </button>
            </div>

            <div className="flex flex-col justify-center h-[93%]">

                <h2 className="text-center p-5 text-sm text-[#686464]">
                    Confirme o material que você deseja incluir no plano de estudos    
                </h2>        
                
                <div className="flex flex-row justify-center min-w-full min-h-[90%]">

                    <div className=" min-w-[60%] max-w-[60%] h-[80%] bg-[#FFFFFF] rounded-lg drop-shadow gap-2 overflow-auto">

                    </div>

                </div>

            </div>

        </main>
    );
}

