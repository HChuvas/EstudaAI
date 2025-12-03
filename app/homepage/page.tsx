"use client";
import { Navbar } from "../components/navbar";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


type Disciplina = {
  id: number,
  name: string,
  userId: number
}
const disciplinasIniciais = [
  { id: "estrutura-de-dados", nome: "Estrutura de Dados" },
  { id: "poo", nome: "Programação Orientada a Objetos" },
  { id: "aps", nome: "Análise e Projeto de Software" },
  { id: "algebra-linear", nome: "Álgebra Linear" }
];

export default function HomePage() {
  const router = useRouter();
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [novaDisciplina, setNovaDisciplina] = useState("");

  async function createSubject() {
    try {
      const response = await fetch("http://localhost:8080/students/subjects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ name: novaDisciplina }),
      });

      const data = await response.json();

      // Adicionar nova disciplina à lista sem refetch
      setDisciplinas((prev) => [...prev, data]);

      // Limpa campo + fecha modal
      setNovaDisciplina("");
      setShowModal(false);
      router.push(`grupos/${data.id}?nomeDisciplina=${data.name}`)
    } catch (err) {
      console.error("Erro ao criar disciplina:", err);
    }
  }

  useEffect(() => {
    async function fetchUser() {
      const response = await fetch("http://localhost:8080/students/subjects", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const data = await response.json();
      setDisciplinas(data)
      console.log("User:", data);
    }

    fetchUser();
  }, []);

  return (
    <div className="w-screen min-h-screen">
      <Navbar />
    <div className="flex min-w-screen min-h-screen bg-white text-[#494949]">
      <div className="w-72 bg-[#C2DFC0] border-r border-[#098842] drop-shadow h-screen p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-normal text-center">Disciplinas</h1>
        </div>
        
        <div className="overflow-y-auto pr-2 flex-1" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <nav className="space-y-6">
            {disciplinas.map((disciplina) => (
              <Link 
                key={disciplina.id}
                href={`/grupos/${disciplina.id}?nomeDisciplina=${disciplina.name}`}
                className="block p-3 bg-[#098842] text-white hover:bg-white hover:text-[#098842] rounded-xl whitespace-nowrap overflow-hidden text-ellipsis"
              >
                {disciplina.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          <button className="flex items-center gap-3 p-3 w-1/2 border border-[#098842] bg-[#F5F5F5] hover:text-red-600 rounded-xl cursor-pointer">
            <Image 
              src="/imagens/sair.svg"
              width={20}
              height={20}
              alt="Sair"
            />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <Image 
              src="/imagens/livro.svg"
              width={200}
              height={200}
              alt="Livro"
              className="mx-auto"
            />
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            className="mb-4 cursor-pointer hover:opacity-80"
          >
            <Image 
              src="/imagens/add.svg"
              width={40}
              height={40}
              alt="Adicionar Disciplina"
              className="mx-auto"
            />
          </button>
          <p className="text-xl">Adicionar Disciplina</p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-96 shadow-lg">
            <div className="bg-[#098842] rounded-t-xl p-6">
              <div className="flex justify-between items-center">
                <div className="w-6 h-6"></div>
                
                <h2 className="text-xl font-semibold text-white text-center flex-1">
                  Criar Disciplina
                </h2>
                
                <button 
                  onClick={() => setShowModal(false)}
                >
                  <Image 
                    src="/imagens/X-branco.svg"
                    width={16}
                    height={16}
                    alt="Fechar"
                  />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <input
                  type="text"
                  value={novaDisciplina}
                  onChange={(e) => setNovaDisciplina(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#098842] focus:border-transparent"
                  placeholder="Digite o nome da disciplina"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && novaDisciplina.trim()) {
                      createSubject();
                    }
                  }}
                />
              </div>

              <button
                onClick={createSubject}
                className="w-full py-3 bg-[#098842] text-white rounded-lg hover:bg-[#098842]/90 font-medium"
                disabled={!novaDisciplina.trim()}
              >
                Criar Disciplina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}