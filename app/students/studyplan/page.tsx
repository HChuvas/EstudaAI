'use client';
import Image from "next/image";
import { useCallback, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import LoadingPage from "../../components/userStatePages/loading"
import ErrorPage from "../../components/userStatePages/error"

type topics = {
    id : number;
    plan_id : number;
    title: string;
    order_index: number;
}

type task = {
    id: number;
    plan_id: number;
    order_index: number;
    title : string;
    description: string;
    completed: boolean;
}

type complementary = {
    id: number;
    plan_id: number;
    topic_title: string;
    description: string;
    order_index: number;
}

type expanded = {
    id: number;
    plan_id : number;
    topic_title: string;
    justification : string;
    order_index: number;


}

type studyplan = {
    id: number;
    userId: number;
    discipline_id: number;
    title: string;
    created_at: string;
    study_plan_topics: topics[];
    study_plans_checklist: task[];
    study_plans_complementary: complementary[];
    study_plans_expanded: expanded[]
}

type CheckList = {
    tasks: task[];
}


export default function Page() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [studyplan, setStudyplan] = useState<studyplan>();

    const toggleTaskCompletion = useCallback(async (taskId: number) => {
        setStudyplan(prev => {
            if (!prev) return prev; 
            
            return {
                ...prev,
                study_plans_checklist: prev.study_plans_checklist.map(task =>
                    task.id === taskId 
                        ? { ...task, completed: !task.completed }
                        : task
                ),
                
                
            };
        });

        try{
            const response = await fetch(`http://localhost:8080/students/studyplan/checklist/mark?itemId=${taskId}`, {
                method: 'PUT',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlclJvbGUiOiJTVFVERU5UIiwiaWF0IjoxNzY0Njc4OTAzLCJleHAiOjE3NjQ2ODI1MDN9.MJaFKyXEV6PgaCI8U8jc4tVkKn-A6kvmr-hlJzDovUs`
                }
            });

        } catch (err) {
            if (err instanceof Error){
                setError(err.message);
            } 
        }

    }, []);

    useEffect(() => {
        const id = searchParams.get('id');
        const fetchStudyplanData = async() => {
            setLoading(true);
            
            try{
                const response = await fetch(`http://localhost:8080/students/studyplan?id=${id}`, {
                    method: 'GET',
                    headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlclJvbGUiOiJTVFVERU5UIiwiaWF0IjoxNzY0Njc1MjU3LCJleHAiOjE3NjQ2Nzg4NTd9.ODa7jEY47N7GoF0qBoQkQgxjQPbJVesxnEM9Awp5ZLo`
                    }
                });

                const data = await response.json();
                setStudyplan(data)

            } catch (err) {
                if (err instanceof Error){
                    setError(err.message);
                } 
            } finally {
                setLoading(false);
            } 
        }
        fetchStudyplanData();
    }, []);

    return (
    <main className="flex flex-col w-screen h-screen overflow-hidden bg-[#F5F5F5]">
        
            <div className="flex flex-row  justify-between px-6 py-3 w-screen max-h-[7%] bg-[#098842] drop-shadow ">
                <h1 className="flex grow justify-center">{studyplan? studyplan.title : ''}</h1>
                <button className="w-5 h-5 cursor-pointer">
                    <Image src="/imagens/X-branco.svg" width={16} height={16} alt="Fechar"></Image>
                </button>
            </div>

        {loading? 
        (<LoadingPage/>) 
        : error?
        (<ErrorPage/>) 
        : (

            <div className="flex flex-row justify-between min-h-[93%] px-8 py-10 gap-8">

                <div className=" flex flex-row w-[75%] min-h-[85%] bg-[#FFFFFF] rounded-lg drop-shadow">
                    
                    <p className=" px-5 py-5 text-[#494949] whitespace-pre-line w-[97%] overflow-auto
                    
                    [&::-webkit-scrollbar]:hidden
                  [-ms-overflow-style:none]
                  [scrollbar-width:none]"
                
                    >{'planoEstudos.conteudo'}</p>
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

                    {(studyplan?.study_plans_checklist || []).map(task => (
                        
                        <div key={task.id} className = {  ` flex flex-row ${task.completed ? 'bg-[#E3E3E3] line-through decoration-[#686464]' : '' } ` }  >
                            <button className="m-4 cursor-pointer flex-none" onClick={() => toggleTaskCompletion(task.id)}>
                                <Image src={ task.completed ? '/imagens/check_box_marcada.svg' : '/imagens/check_box.svg' } width={18} height={18} alt = 'checkbox'></Image>
                            </button>
                            
                            <div className="flex flex-col max-h-[65%] justify-center m-1.5">
                                <h3 className="text-[#686464] font-semibold text-sm">{task.title}</h3>
                                <p className=" text-[#686464] text-xs">{task.description}</p>
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

                    ))}

                </div>

            </div>
          
    )  
    }
    </main>

    );
}