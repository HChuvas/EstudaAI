"use client";
import Image from "next/image";
import { useState } from "react";
import { Navbar } from "../components/navbar";

type Reminder = {
  id: number;
  name: string;
  datetime: Date | null;
  description: string;
  isExpanded: boolean;
};

export default function Page() {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: 1,
      name: "Checkpoint",
      datetime: new Date("2025-10-17T08:30:00"),
      description: "Entrega do checkpoint da matéria de Extensão 3 sobre o projeto final",
      isExpanded: false,
    },
    {
      id: 2,
      name: "Prova de PAA",
      datetime: new Date("2025-10-23T07:30:00"),
      description: "Prova teórica sobre algoritmos de ordenação e complexidade",
      isExpanded: false,
    },
    {
      id: 3,
      name: "Semana Universitária com Atividades Extracurriculares e Palestras",
      datetime: null,
      description: "lembrar de comprar frango, arroz, feijão, macarrão, soja, esponja, shampoo, detergente, sabão em pó, amaciante, papel higiênico, guardanapos, café, leite, pão, manteiga, queijo, presunto, iogurte, frutas e verduras",
      isExpanded: false,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newReminder, setNewReminder] = useState({
    name: "",
    datetime: "",
    description: "",
  });

  const formatDate = (date: Date | null) => {
    if (!date) return "Sem data";
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "Sem horário";
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const toggleExpand = (id: number) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id 
        ? { ...reminder, isExpanded: !reminder.isExpanded }
        : reminder
    ));
  };

  const handleAddReminder = () => {
    if (newReminder.name.trim()) {
      const reminder: Reminder = {
        id: reminders.length + 1,
        name: newReminder.name,
        datetime: newReminder.datetime ? new Date(newReminder.datetime) : null,
        description: newReminder.description,
        isExpanded: false,
      };

      setReminders([...reminders, reminder]);
      setNewReminder({ name: "", datetime: "", description: "" });
      setShowModal(false);
    }
  };

  return (
    <div className="w-screen min-h-screen">
      <Navbar/> 
    
    <div className="w-screen min-h-screen bg-white pt-2 pl-8">
      <div className="font-medium text-[#686464]">
        <h1 className="text-2xl py-10 underline decoration-[#098842]/85">
          Lembretes
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pr-8">
          {reminders.map((reminder) => (
            <div 
              key={reminder.id}
              className={`rounded-xl border-1 border-[#098842] border p-6 flex flex-col bg-white shadow-sm cursor-pointer hover:shadow-md ${
                reminder.isExpanded ? 'h-auto' : 'h-62'
              }`}
              onClick={() => toggleExpand(reminder.id)}
            >
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-[#686464] whitespace-nowrap overflow-hidden text-ellipsis flex-1 mr-2">
                    {reminder.name}
                  </h3>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Função de editar aqui
                    }}
                    className="text-[#686464] hover:text-[#098842] flex-shrink-0 ml-2"
                  >
                    <Image 
                      src="/imagens/editar.svg"
                      width={16}
                      height={16}
                      alt="Editar"
                    />
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-[#686464]">Data: </span>
                    <span className="text-sm font-normal text-[#686464]">{formatDate(reminder.datetime)}</span>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-[#686464]">Horário: </span>
                    <span className="text-sm font-normal text-[#686464]">{formatTime(reminder.datetime)}</span>
                  </div>

                  {reminder.description && (
                    <div className="mt-3">
                      <span className="text-sm font-medium text-[#686464]">Descrição: </span>
                      <div className={`text-sm font-normal text-[#686464] mt-1 ${
                        !reminder.isExpanded ? 'overflow-hidden' : ''
                      }`}>
                        {!reminder.isExpanded ? (
                          <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                            {reminder.description}
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap break-words">
                            {reminder.description}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end items-center mt-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // Função de apagar aqui
                  }}
                  className="text-[#686464] hover:text-red-600"
                >
                  <Image 
                    src="/imagens/apagar.svg"
                    width={16}
                    height={16}
                    alt="Apagar"
                  />
                </button>
              </div>
            </div>
          ))}

          <div 
            className="h-62 rounded-xl border-1 border-[#098842] border flex justify-center items-center cursor-pointer hover:bg-gray-50"
            onClick={() => setShowModal(true)}
          >
            <button>
              <Image 
                src="/imagens/add.svg"
                width={34}
                height={34}
                alt="Adicionar Lembrete"
                className="cursor-pointer hover:opacity-80"
              />
            </button> 
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-96 shadow-lg">
            <div className="bg-[#098842] rounded-t-xl p-6">
              <div className="flex justify-between items-center">
                <div className="w-6 h-6"></div>
                
                <h2 className="text-xl font-semibold text-white text-center flex-1">
                  Criar Lembrete
                </h2>
                
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-gray-200"
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
            
            <div className="p-6 bg-white">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#686464] mb-2">
                    Título (obrigatório)
                  </label>
                  <input
                    type="text"
                    value={newReminder.name}
                    onChange={(e) => setNewReminder({...newReminder, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#098842] focus:border-transparent text-[#686464]"
                    placeholder="Digite o título do lembrete"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#686464] mb-2">
                    Data e Hora (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={newReminder.datetime}
                    onChange={(e) => setNewReminder({...newReminder, datetime: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#098842] focus:border-transparent text-[#686464]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#686464] mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={newReminder.description}
                    onChange={(e) => setNewReminder({...newReminder, description: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#098842] focus:border-transparent resize-none text-[#686464]"
                    placeholder="Digite a descrição do lembrete"
                    rows={3}
                  />
                </div>
              </div>

              <button
                onClick={handleAddReminder}
                className="w-full py-3 bg-[#098842] text-white rounded-lg hover:bg-[#098842]/90 font-medium mt-6"
                disabled={!newReminder.name.trim()}
              >
                Criar Lembrete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}