'use client';

import Image from "next/image";
import { useCallback, useState, useEffect } from 'react';
import LoadingPage from "../../../components/userStatePages/loading";
import ErrorPage from "../../../components/userStatePages/error";

type topics = {
    id: number;
    subject_id: number;
    title: string;
    material_count: number;
    created_at: string;
    selecionado?: boolean; 
}

type MaterialList = {
    id: number;
    list: topics[];
}

export default function Page() {
    const [materialList, setMaterialList] = useState<MaterialList>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMaterialList = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:8080/students/subjects/topics?subjectId=3', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlclJvbGUiOiJTVFVERU5UIiwiaWF0IjoxNzY0Nzg0OTQ4LCJleHAiOjE3NjQ3ODg1NDh9.VX6X-q02FT3gT35sdFrtXOF6Modq38z-Te1w-zB1MrY`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Erro ao carregar materiais');
                }
                
                const data = await response.json();
                
                
                const materialsWithSelection = data.map((material: Omit<topics, 'selecionado'>) => ({
                    ...material,
                    selecionado: false 
                }));
                
                setMaterialList({
                    id: 1,
                    list: materialsWithSelection
                });
                
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Erro desconhecido');
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchMaterialList();
    }, []);

    const selecionarMaterial = useCallback((materialId: number) => {
        setMaterialList(prev => {
            if (!prev) return prev;
            
            return {
                ...prev,
                list: prev.list.map(material =>
                    material.id === materialId 
                        ? { ...material, selecionado: !material.selecionado }
                        : material
                )
            };
        });
    }, []);

    const handleConfirmar = useCallback( async () => {
        setLoading(true);
        if (!materialList) return;
        
        const selecionados = materialList.list
        .filter(material => material.selecionado)
        .map(material => material.id);
         try {

            const response = await fetch('http://localhost:8080/students/llm/transcripts/send', {
                method : 'POST',
                body : JSON.stringify(selecionados),
                headers : {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlclJvbGUiOiJTVFVERU5UIiwiaWF0IjoxNzY0Nzg0OTQ4LCJleHAiOjE3NjQ3ODg1NDh9.VX6X-q02FT3gT35sdFrtXOF6Modq38z-Te1w-zB1MrY`
                }
            })
         }catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Erro desconhecido');
            }
         }finally{
            setLoading(false);
         }
    }, [materialList]);

    return (
        <main className="flex flex-col w-screen h-screen overflow-hidden bg-[#F5F5F5]">
            <div className="flex flex-row justify-between px-6 py-3 w-screen max-h-[7%] bg-[#098842] drop-shadow">
                <h1 className="flex grow justify-center ml-5 text-white">Criar Plano de Estudos</h1>
                <button className="w-5 h-5 cursor-pointer">
                    <Image src="/imagens/X-branco.svg" width={16} height={16} alt="Fechar"/>
                </button>
            </div>

            {loading ? 
                (<LoadingPage/>) 
            : error ? 
                (<ErrorPage/>) 
            : !materialList || materialList.list.length === 0 ? (
                <div className="flex items-center justify-center h-[93%]">
                    <p className="text-[#686464]">Nenhum material disponível</p>
                </div>
            ) : (
                <div className="flex flex-col justify-center items-center h-[93%] px-8">
                    <h2 className="text-center p-5 text-sm text-[#686464]">
                        Confirme o material que você deseja incluir no plano de estudos    
                    </h2>        
                    
                    <div className="flex flex-col justify-center items-center min-w-full min-h-[90%]">
                        <div className="min-w-[60%] max-w-[60%] h-[80%] bg-[#FFFFFF] rounded-lg drop-shadow gap-2 overflow-auto p-4 mb-6">
                            {materialList.list.map(material => (
                                <div 
                                    key={material.id} 
                                    className={`flex flex-row items-center mb-3 p-3 rounded-lg transition-colors ${
                                        material.selecionado ? 'bg-[#E3E3E3]' : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <button 
                                        className="m-4 cursor-pointer flex-none"
                                        onClick={() => selecionarMaterial(material.id)}
                                    >
                                        <Image 
                                            src={material.selecionado ? '/imagens/check_box_marcada.svg' : '/imagens/check_box.svg'} 
                                            width={18} 
                                            height={18} 
                                            alt="checkbox"
                                        />
                                    </button>
                                    
                                    <div className="flex flex-col justify-center flex-1">
                                        <h3 className="text-[#686464] font-semibold text-sm">{material.title}</h3>
                                        <p className="text-[#686464] text-xs">
                                            {material.material_count} arquivo{material.material_count !== 1 ? 's' : ''} adicionado{material.material_count !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={handleConfirmar}
                            className="w-51 h-10 cursor-pointer bg-[#098842] rounded-lg hover:bg-[#087735] transition-colors flex items-center justify-center"
                        >
                            <p className="font-semibold text-white text-base">
                                Confirmar
                            </p>
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}