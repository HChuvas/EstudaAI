"use client";

import { Navbar } from "@/app/components/navbar";
import Image from "next/image";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
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

  const [isStudyPlanModalOpen, setIsStudyPlanModalOpen] = useState(false);
  const [isViewPlanModalOpen, setIsViewPlanModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  // expandir o card de topico pra nao dar o problema de overflow
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

      setSelectedFiles([]);

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

  const confirmDelete = async () => {
    if (!topicToDelete) return;
    try {
      await handleDeleteTopic(topicToDelete.id);
      setShowDeleteModal(false);
      setTopicToDelete(null);
      if (expandedTopicId === topicToDelete.id) setExpandedTopicId(null);
    } catch (err) {
      console.error("Erro ao confirmar exclusão:", err);
    }
  };

  function openTopic(topicId: string) {
    router.push(`/students/subjects/topic/${topicId}`)
  }

  const mergeFilesUnique = (prev: File[], incoming: File[]) => {
    const all = [...prev, ...incoming];
    const unique = all.reduce<File[]>((acc, f) => {
      if (!acc.find((x) => x.name === f.name && x.size === f.size)) acc.push(f);
      return acc;
    }, []);
    return unique;
  }

  const handleFilesAdd = useCallback((files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files);
    setSelectedFiles((prev) => mergeFilesUnique(prev, incoming));
  }, []);

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) {
      try { e.target.value = ""; } catch { /* ignore */ }
      return;
    }

    const incoming = Array.from(files);
    setSelectedFiles((prev) => mergeFilesUnique(prev, incoming));

    setisFileUploadOpen(true);
    try { e.target.value = ""; } catch { /* ignore */ }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    handleFilesAdd(e.dataTransfer.files);
    setisFileUploadOpen(true);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function removeSelectedFile(index: number) {
    setSelectedFiles((s) => s.filter((_, i) => i !== index));
  }

  async function handleSendTopicFiles() {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);

    const form = new FormData();
    form.append("topicId", createdTopicId);
    selectedFiles.forEach((f) => form.append("files", f));

    try {
      const res = await fetch("http://localhost:8080/students/materials/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: form,
      });

      if (!res.ok) {
        console.error("Upload falhou");
      } else {
        setSelectedFiles([]);
        setisFileUploadOpen(false);
      }
    } catch (err) {
      console.error("Erro no upload:", err);
    } finally {
      setIsUploading(false);
      router.push(`/students/subjects/topic/${createdTopicId}`)
    }
  }

  const handleViewPlan = useCallback((planId: number) => {
    setSelectedPlanId(planId);
    setIsViewPlanModalOpen(true);
  }, []);

  const cardClass = "rounded-xl border border-[#098842] p-4 shadow-sm cursor-pointer hover:shadow-md h-28 w-80";

  const handleCardClick = (t: Topic) => {
    if (expandedTopicId === t.id) {
      openTopic(t.id);
    } else {
      setExpandedTopicId(t.id);
    }
  };

  const collapseAll = () => setExpandedTopicId(null);

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
              onClick={() => {
                collapseAll();
                setIsAddTopicOpen(true);
              }}
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2">
                  <Image src="/imagens/add.svg" width={34} height={34} alt="Adicionar" />
                </div>
                <span className="text-[#686464] font-medium">Adicionar Tópico</span>
              </div>
            </div>

            {topics.map((t) => {
              const isExpanded = expandedTopicId === t.id;
              const perCardClass = isExpanded
                ? "rounded-xl border border-[#098842] p-4 shadow-sm cursor-pointer hover:shadow-md w-80"
                : cardClass;

              return (
                <div
                  key={t.id}
                  className={`${perCardClass} bg-white flex flex-col justify-between relative pb-10`}
                  onClick={() => handleCardClick(t)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCardClick(t);
                  }}
                >
                  <div>
                    {!isExpanded ? (
                      <div
                        className="pr-4"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          wordBreak: "break-word",
                        }}
                      >
                        <h2 className="text-lg font-medium text-[#3b3b3b]">
                          {t.title}
                        </h2>
                      </div>
                    ) : (
                      <div className="pr-4">
                        <h2 className="text-lg font-medium text-[#3b3b3b] whitespace-normal break-words">
                          {t.title}
                        </h2>
                      </div>
                    )}
                  </div>

                  {!isExpanded ? (
                    <div className="absolute left-4 right-4 bottom-3 flex items-center justify-between">
                      <p className="text-sm text-[#686464]">Arquivos adicionados: {t.material_count}</p>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTopicToDelete(t);
                          setShowDeleteModal(true);
                        }}
                        title="Apagar tópico"
                        className="p-1 cursor-pointer"
                      >
                        <Image src="/imagens/apagar.svg" width={18} height={18} alt="Apagar" />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-[#686464]">Arquivos adicionados: {t.material_count}</p>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTopicToDelete(t);
                          setShowDeleteModal(true);
                        }}
                        title="Apagar tópico"
                        className="p-1 cursor-pointer"
                      >
                        <Image src="/imagens/apagar.svg" width={18} height={18} alt="Apagar" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
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

      {/* Modal de deletar, igual o do de lembretes */}
      {showDeleteModal && topicToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[640px] shadow-lg overflow-hidden">
            <div className="bg-[#098842] p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Confirmar exclusão</h2>
                <button onClick={() => { setShowDeleteModal(false); setTopicToDelete(null); }} className="text-white cursor-pointer">
                  <Image src="/imagens/X-branco.svg" width={20} height={20} alt="Fechar" />
                </button>
              </div>
            </div>

            <div className="p-8">
              <p className="text-[#686464] text-center">Confirme no botão abaixo que você deseja excluir o tópico.</p>

              <div className="flex justify-end gap-4 mt-6">
                <button onClick={confirmDelete} className="px-4 py-2 rounded-md bg-[#FF6262] text-white font-semibold hover:bg-[#FF6262]/85 cursor-pointer">
                  Excluir
                </button>
                <button onClick={() => { setShowDeleteModal(false); setTopicToDelete(null); }} className="px-4 py-2 rounded-md bg-[#D9D9D9] font-semibold text-[#444444] hover:bg-[#D9D9D9]/70 cursor-pointer">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Modal upload de arquivos */}
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
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={onInputChange}
                className="hidden"
                aria-label="Selecionar arquivos"
              />

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

                  <span
                    className="inline-block bg-[#098842] text-white px-6 py-3 rounded cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Abrir Explorador de Arquivos
                  </span>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <div className="w-full mb-6 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-[#444]">Arquivos Selecionados</h3>

                    <div className="flex gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 border rounded"
                        style={{ borderColor: "#098842", color: "#098842" }}
                      >
                        Adicionar mais
                      </button>
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
                        setisFileUploadOpen(false);
                        setSelectedFiles([]); 
                      }}
                      disabled={isUploading}
                    >
                      Cancelar
                    </button>

                    <button
                      className="px-6 py-3 bg-[#098842] text-white rounded disabled:opacity-60"
                      onClick={handleSendTopicFiles}
                      disabled={isUploading || selectedFiles.length === 0}
                    >
                      {isUploading ? "Enviando..." : "Enviar"}
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
    </div>
  );
}