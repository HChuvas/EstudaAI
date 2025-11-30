"use client";

import { Navbar } from "@/app/components/navbar";
import Image from "next/image";
import { useState, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

type Topic = {
  id: string;
  title: string;
  filesCount: number;
};

export default function TopicosPage() {
  const pathname = usePathname() || "";
  const router = useRouter();

  const disciplineSlug = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1] : "disciplina";
  }, [pathname]);

  const disciplineName = useMemo(() => {
    return disciplineSlug
      .replace(/[-_]/g, " ")
      .split(" ")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  }, [disciplineSlug]);

  const [topics, setTopics] = useState<Topic[]>([
    { id: "t1", title: "Ponteiros em C", filesCount: 2 },
    { id: "t2", title: "Notação Assintótica", filesCount: 2 }
  ]);

  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");

  const [isPlanUploadOpen, setIsPlanUploadOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  function handleAddTopic() {
    if (!newTopicTitle.trim()) return;
    const newT: Topic = {
      id: String(Date.now()),
      title: newTopicTitle.trim(),
      filesCount: 0,
    };

    setTopics((s) => [newT, ...s]);
    setNewTopicTitle("");
    setIsAddTopicOpen(false);
  }

  function handleDeleteTopic(id: string) {
    setTopics((s) => s.filter((t) => t.id !== id));
  }

  function openTopic(topicId: string) {
    router.push(`/grupos/${disciplineSlug}/topico/${topicId}`);
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

  async function handleSendPlanFiles() {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);

    const form = new FormData();
    form.append("planId", "plano-ed");
    selectedFiles.forEach((f) => form.append("files", f));

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        console.error("Upload falhou");
      } else {
        setSelectedFiles([]);
        setIsPlanUploadOpen(false);
      }
    } catch (err) {
      console.error("Erro no upload:", err);
    } finally {
      setIsUploading(false);
    }
  }

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
            {/* Adicionar tópico */}
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
                  <p className="text-sm text-[#686464]">Arquivos adicionados: {t.filesCount}</p>

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
              onClick={() => setIsPlanUploadOpen(true)}
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2">
                  <Image src="/imagens/add.svg" width={34} height={34} alt="Adicionar Plano" />
                </div>
                <span className="text-[#686464] font-medium">Adicionar Plano de Estudos</span>
              </div>
            </div>

            <div
              className={`${cardClass} bg-white flex flex-col justify-between`}
              onClick={() => {
                router.push(`/grupos/${disciplineSlug}/plano/ed`);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") router.push(`/grupos/${disciplineSlug}/plano/ed`);
              }}
            >
              <div>
                <h3 className="font-medium text-lg text-[#3b3b3b]">Plano de Estudos ED</h3>
              </div>

              <div className="mt-2">
                <p className="text-sm text-[#686464]">Arquivos adicionados: 2</p>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Modal de adicionar tópico */}
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
                Cancelar
              </button>
              <button className="px-4 py-2 bg-[#098842] text-white rounded" onClick={handleAddTopic}>
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de upar arquivo */}
      {isPlanUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 pb-12 bg-black/40">
          <div className="bg-white w-full max-w-3xl rounded-2xl overflow-hidden">
            <div className="bg-[#098842] h-16 flex justify-end items-center px-6">
              <button
                onClick={() => {
                  setIsPlanUploadOpen(false);
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
                      disabled={isUploading}
                    >
                      Voltar
                    </button>

                    <button
                      className="px-6 py-3 bg-[#098842] text-white rounded disabled:opacity-60"
                      onClick={handleSendPlanFiles}
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
    </div>
  );
}
