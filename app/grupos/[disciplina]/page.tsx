"use client";

import { Navbar } from "@/app/components/navbar";
import Image from "next/image";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import CreateStudyPlanModal from './CreateStudyPlanModal';
import StudyPlanModal from './StudyPlanModal';

type Topic = {
  id: string;
  title: string;
  material_count: number;
  subject_id: number;
  created_at: Date;
};

type StudyPlan = {
  id: number,
  userId: number,
  discipline_id: number,
  title: string,
  created_at: Date
}

// Componente do Popup de Progresso
function PipelineProgressModal({ 
  isOpen, 
  currentStep, 
  totalSteps,
  stepMessage 
}: { 
  isOpen: boolean; 
  currentStep: number; 
  totalSteps: number; 
  stepMessage: string;
}) {
  if (!isOpen) return null;

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-xl p-8 w-full max-w-md mx-4">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 mb-4">
          </div>
          
          <h3 className="text-xl font-semibold text-[#444] mb-2">
            Processando Materiais
          </h3>
          
          <p className="text-[#666] text-center mb-6">
            {stepMessage}
          </p>
          
          {/* Barra de Progresso */}
          <div className="w-full mb-2">
            <div className="flex justify-between text-sm text-[#666] mb-1">
              <span>Progresso</span>
              <span>{currentStep} de {totalSteps} etapas</span>
            </div>
            
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#098842] rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          
          {/* Indicadores de Etapas */}
          <div className="flex justify-between w-full mt-6 px-2">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${currentStep >= 1 ? 'bg-[#098842]' : 'bg-gray-300'}`}>
                {currentStep > 1 ? (
                  <Image src="/imagens/check.svg" width={16} height={16} alt="Concluído" />
                ) : (
                  <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-white' : 'text-gray-600'}`}>1</span>
                )}
              </div>
              <span className="text-xs text-[#666]">Upload</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${currentStep >= 2 ? 'bg-[#098842]' : 'bg-gray-300'}`}>
                {currentStep > 2 ? (
                  <Image src="/imagens/check.svg" width={16} height={16} alt="Concluído" />
                ) : (
                  <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-white' : 'text-gray-600'}`}>2</span>
                )}
              </div>
              <span className="text-xs text-[#666]">Processamento</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${currentStep >= 3 ? 'bg-[#098842]' : 'bg-gray-300'}`}>
                {currentStep > 3 ? (
                  <Image src="/imagens/check.svg" width={16} height={16} alt="Concluído" />
                ) : (
                  <span className={`text-sm font-medium ${currentStep >= 3 ? 'text-white' : 'text-gray-600'}`}>3</span>
                )}
              </div>
              <span className="text-xs text-[#666]">Resumo</span>
            </div>
          </div>
          
          <p className="text-sm text-[#666] text-center mt-6">
            Por favor, aguarde enquanto processamos seus arquivos...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TopicosPage() {
  const pathname = usePathname() || "";
  const router = useRouter();

  const disciplineSlug = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1] : "disciplina";
  }, [pathname]);

  const { disciplina } = useParams();
  const search = useSearchParams();
  const disciplineName = search.get("nomeDisciplina");

  const [topics, setTopics] = useState<Topic[]>([]);
  const [plans, setStudyPlans] = useState<StudyPlan[]>([]);

  const [createdTopicId, setCreatedTopicId] = useState("")
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");

  const [isFileUploadOpen, setisFileUploadOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const [isStudyPlanModalOpen, setIsStudyPlanModalOpen] = useState(false);
  const [isViewPlanModalOpen, setIsViewPlanModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  // Estados para o popup de progresso
  const [showPipelineProgress, setShowPipelineProgress] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [pipelineMessage, setPipelineMessage] = useState("");

  useEffect(() => {
    async function fetchTopics() {
      try {
      const response = await fetch(`http://localhost:8080/students/subjects/topics?subjectId=${disciplina}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const data = await response.json();
      setTopics(data)      
      } catch (error) {
        console.error("Erro ao criar disciplina:", error);
      }  
      }

      async function fetchStudyPlans() {
        try {
          const response = await fetch(`http://localhost:8080/students/studyplans?subjectId=${disciplina}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        const data = await response.json();
        const plans = data.map((p: any) => ({
          ...p,
          created_at: new Date(p.created_at),
        }));

        setStudyPlans(plans)
        } catch (error) {
          console.error("Erro ao pegar planos de estudos:", error)
        }
      }
    fetchStudyPlans()
    fetchTopics()
  }, [disciplina])

  async function handleAddTopic() {
    try {
      if (!newTopicTitle.trim()) return;
      const response = await fetch("http://localhost:8080/students/topics/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify({
          "subjectId": disciplina,
          "title": newTopicTitle
        })
      })
      if (!response.ok) {
        console.error("Erro ao criar tópico:", await response.text());
        return;
      }

      const data = await response.json()
    
      setCreatedTopicId(data.id)
      setNewTopicTitle("");
      setIsAddTopicOpen(false)
      setisFileUploadOpen(true)
    } catch (error) {
      console.error("Erro ao criar tópico:", error)
    }
  }

  async function handleDeleteTopic(id: string) {
    try {
      const response = await fetch(`http://localhost:8080/students/topics/delete?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        }
      });

      if (!response.ok) {
        console.error("Erro ao criar tópico:", await response.text());
        return;
      }

      setTopics(prev => prev.filter(t => t.id !== id));

    } catch (error) {
      console.log("Erro ao deletar tópico:", error)
    }
  }

  function openTopic(topicId: string) {
    router.push(`/topicos/${topicId}`)
  }

  const handleFilesAdd = useCallback((files: FileList | null) => {
    if (!files) return;
    setSelectedFiles((prev) => {
      const incoming = Array.from(files);
      const all = [...prev, ...incoming];
      const unique = all.reduce<File[]>((acc, f) => {
        if (!acc.find((x) => x.name === f.name && x.size === f.size)) acc.push(f);
        return acc;
      }, []);
      return unique;
    });
  }, []);

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFilesAdd(e.target.files);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    handleFilesAdd(e.dataTransfer.files);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function removeSelectedFile(index: number) {
    setSelectedFiles((s) => s.filter((_, i) => i !== index));
  }

  async function runSummaryPipeline(topicId: string) {
    try {
      // Mostra o popup de progresso
      setShowPipelineProgress(true);
      setPipelineStep(1);
      setPipelineMessage("Enviando arquivos para processamento...");
      
      const token = localStorage.getItem("accessToken");
      const topicIdNum = parseInt(topicId);

      // Etapa 1: Enviar materiais
      setPipelineStep(2);
      setPipelineMessage("Processando conteúdos dos arquivos...");
      
      const sendResponse = await fetch("http://localhost:8080/students/llm/materials/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ topicId: topicIdNum })
      });

      if (!sendResponse.ok) throw new Error("Erro no envio de materiais");

      // Etapa 2: Gerar embeddings
      setPipelineStep(3);
      setPipelineMessage("Analisando e organizando informações...");
      
      const embedResponse = await fetch("http://localhost:8080/students/llm/embed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ topicId: topicIdNum })
      });

      if (!embedResponse.ok) throw new Error("Erro na geração de embeddings");

      // Etapa 3: Gerar resumo
      setPipelineStep(4);
      setPipelineMessage("Gerando resumos com IA...");
      
      const generateResponse = await fetch("http://localhost:8080/students/llm/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ topicId: topicIdNum })
      });

      if (!generateResponse.ok) throw new Error("Erro na geração de resumo");

      const data = await generateResponse.json();
      console.log("Pipeline de resumo concluída com sucesso:", data);

      // Finaliza com sucesso
      setPipelineStep(5);
      setPipelineMessage("Processamento concluído com sucesso!");
      
      // Aguarda um pouco para mostrar a mensagem de sucesso
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error("Erro na pipeline de resumo:", error);
      setPipelineMessage("Erro no processamento. Tente novamente.");
      throw error;
    } finally {
      // Esconde o popup após um breve delay
      setTimeout(() => {
        setShowPipelineProgress(false);
        setPipelineStep(0);
        setIsGeneratingSummary(false);
      }, 1500);
    }
  }

  async function handleSendTopicFiles() {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);

    const form = new FormData();
    form.append("topicId", createdTopicId);
    selectedFiles.forEach((f) => form.append("files", f));

    try {
      // Etapa 0: Upload dos arquivos
      setPipelineStep(1);
      setPipelineMessage("Fazendo upload dos arquivos...");
      setShowPipelineProgress(true);

      const res = await fetch("http://localhost:8080/students/materials/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: form,
      });

      if (!res.ok) {
        console.error("Upload falhou");
        setPipelineMessage("Erro no upload. Tente novamente.");
        setTimeout(() => setShowPipelineProgress(false), 2000);
        return;
      } else {
        setSelectedFiles([]);
        setisFileUploadOpen(false);
        
        // Executa a pipeline de resumo
        await runSummaryPipeline(createdTopicId);
        
        // Navega para o tópico
        router.push(`/topicos/${createdTopicId}`);
      }
    } catch (err) {
      console.error("Erro no upload:", err);
      setPipelineMessage("Erro no processamento. Tente novamente.");
      setTimeout(() => setShowPipelineProgress(false), 2000);
    } finally {
      setIsUploading(false);
    }
  }

  const handleViewPlan = useCallback((planId: number) => {
    setSelectedPlanId(planId);
    setIsViewPlanModalOpen(true);
  }, []);

  const cardClass = "rounded-xl border border-[#098842] p-4 shadow-sm cursor-pointer hover:shadow-md h-28 w-80";

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="px-8 py-6">
        <h1 className="text-2xl font-medium text-[#686464]">
          {disciplineName}
          <hr className="border-2 border-[#098842] w-64 mt-4" />
        </h1>

        <div className="mt-8">
          <div className="flex flex-wrap gap-6">
            <div
              className={`${cardClass} flex items-center justify-center`}
              onClick={() => setIsAddTopicOpen(true)}
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2">
                  <Image src="/imagens/add.svg" width={34} height={34} alt="Adicionar" />
                </div>
                <span className="text-[#686464] font-medium">Adicionar Tópico</span>
              </div>
            </div>

            {topics.map((t) => (
              <div
                key={t.id}
                className={`${cardClass} bg-white flex flex-col justify-between`}
                onClick={() => openTopic(t.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") openTopic(t.id);
                }}
              >
                <div>
                  <h2 className="text-lg font-medium text-[#3b3b3b]">{t.title}</h2>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-[#686464]">Arquivos adicionados: {t.material_count}</p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTopic(t.id);
                    }}
                    title="Apagar tópico"
                    className="p-1 cursor-pointer"
                  >
                    <Image src="/imagens/apagar.svg" width={18} height={18} alt="Apagar" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-[#098842] pt-8">
          <h2 className="text-xl text-[#686464] mb-6 font-medium">Planos De Estudos</h2>
          <div className="flex flex-wrap gap-6">
            <div
              className={`${cardClass} flex items-center justify-center`}
              onClick={() => setIsStudyPlanModalOpen(true)}
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2">
                  <Image src="/imagens/add.svg" width={34} height={34} alt="Adicionar Plano" />
                </div>
                <span className="text-[#686464] font-medium">Adicionar Plano de Estudos</span>
              </div>
            </div>

            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`${cardClass} bg-white flex flex-col justify-between`}
                onClick={() => handleViewPlan(plan.id)}
                role="button"
                tabIndex={0}
              >
                <div>
                  <h3 className="font-medium text-lg text-[#3b3b3b]">
                    {plan.title}
                  </h3>
                </div>

                <div className="mt-2">
                  <p className="text-sm text-[#686464]">
                    Adicionado em: {`${plan.created_at.getDay()}/${plan.created_at.getMonth() + 1}/${plan.created_at.getFullYear()}`}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </main>

      {isAddTopicOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center text-[#686464] bg-black/40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Adicionar Tópico</h3>
            <input
              type="text"
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              placeholder="Nome do tópico"
              className="w-full border rounded px-3 py-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2"
                onClick={() => {
                  setIsAddTopicOpen(false);
                  setNewTopicTitle("");
                }}
              >
                <span className="px-4.5 py-2.5 text-[#444444] font-semibold cursor-pointer bg-[#D9D9D9] rounded">Cancelar</span>
              </button>
              <button className="px-4 py-2 bg-[#098842] font-semibold cursor-pointer text-white rounded" onClick={handleAddTopic}>
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {isFileUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 pb-12 bg-black/40">
          <div className="bg-white w-full max-w-3xl rounded-2xl overflow-hidden">
            <div className="bg-[#098842] h-16 flex justify-end items-center px-6">
              <button
                onClick={() => {
                  setisFileUploadOpen(false);
                  setSelectedFiles([]);
                }}
                aria-label="Fechar"
                className="text-white text-2xl font-bold"
              >
                <Image src="/imagens/X-branco.svg" width={18} height={18} alt="Fechar" />
              </button>
            </div>

            <div className="p-10 flex flex-col items-center min-h-[340px]">
              {selectedFiles.length === 0 ? (
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  className="w-full border border-[#e0e0e0] rounded-lg p-12 flex flex-col items-center justify-center"
                >
                  <div className="w-36 h-36 rounded-full bg-green-100 flex items-center justify-center mb-6">
                    <Image src="/imagens/upload.svg" width={72} height={72} alt="Arraste os arquivos" />
                  </div>

                  <h3 className="text-xl font-semibold text-[#444] mb-2">Arraste os Arquivos Aqui</h3>
                  <p className="text-sm text-[#666] mb-6">OU</p>

                  <label className="inline-block">
                    <input
                      type="file"
                      multiple
                      onChange={onInputChange}
                      className="hidden"
                      aria-label="Abrir explorador"
                    />
                    <span className="inline-block bg-[#098842] text-white px-6 py-3 rounded cursor-pointer">
                      Abrir Explorador de Arquivos
                    </span>
                  </label>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <div className="w-full mb-6 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-[#444]">Arquivos Selecionados</h3>

                    <div className="flex gap-3">
                      <label>
                        <input
                          type="file"
                          multiple
                          onChange={onInputChange}
                          className="hidden"
                          aria-label="Adicionar mais arquivos"
                        />
                        <button
                          className="px-4 py-2 border rounded"
                          style={{ borderColor: "#098842", color: "#098842" }}
                        >
                          Adicionar mais
                        </button>
                      </label>

                    </div>
                  </div>

                  <ul className="w-full space-y-3 max-h-[340px] overflow-auto">
                    {selectedFiles.map((f, i) => (
                      <li
                        key={`${f.name}-${i}`}
                        className="flex items-center justify-between p-3 rounded"
                        style={{
                          backgroundColor: "#FFFFFF",
                          border: "2px solid #098842",
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded bg-white flex items-center justify-center" style={{ border: "1px solid #e6e6e6" }}>
                            <Image src="/imagens/file.svg" width={20} height={20} alt="file" />
                          </div>
                          <div>
                            <div className="font-medium" style={{ color: "#686464" }}>{f.name}</div>
                            <div className="text-xs" style={{ color: "#686464" }}>
                              {Math.round(f.size / 1024)} KB
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => removeSelectedFile(i)}
                            aria-label={`Remover ${f.name}`}
                            className="p-1 rounded"
                            style={{
                              backgroundColor: "#098842",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 32,
                              height: 32,
                            }}
                          >
                            <Image src="/imagens/X-branco.svg" width={14} height={14} alt="Remover" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex gap-3">
                    <button
                      className="px-6 py-3 border rounded"
                      style={{
                        color: "#686464",
                        borderColor: "#098842",
                        backgroundColor: "white"
                      }}
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={isUploading || isGeneratingSummary}
                    >
                      Voltar
                    </button>

                    <button
                      className="px-6 py-3 bg-[#098842] text-white rounded disabled:opacity-60"
                      onClick={handleSendTopicFiles}
                      disabled={isUploading || isGeneratingSummary || selectedFiles.length === 0}
                    >
                      {isUploading ? "Enviando..." : isGeneratingSummary ? "Gerando resumo..." : "Enviar e Gerar Resumo"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <CreateStudyPlanModal 
        isOpen={isStudyPlanModalOpen}
        onClose={() => setIsStudyPlanModalOpen(false)}
        subjectId={disciplina as string}
      />

      {selectedPlanId && (
        <StudyPlanModal 
          isOpen={isViewPlanModalOpen}
          onClose={() => {
            setIsViewPlanModalOpen(false);
            setSelectedPlanId(null);
          }}
          planId={selectedPlanId}
        />
      )}

      {/* Popup de Progresso da Pipeline */}
      <PipelineProgressModal 
        isOpen={showPipelineProgress}
        currentStep={pipelineStep}
        totalSteps={5}
        stepMessage={pipelineMessage}
      />
    </div>
  );
}