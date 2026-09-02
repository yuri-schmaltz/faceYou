import React, { useState } from "react";
import { FolderOpen, AlertCircle, RefreshCw, ExternalLink, Download, Trash2, XCircle } from "lucide-react";
import { Job } from "../types";

interface JobsListProps {
  jobs: Job[];
  onLoadToComparator: (job: Job) => void;
  onRequestDelete: (jobId: string) => void;
  onCancelJob: (jobId: string) => void;
}

export const JobsList: React.FC<JobsListProps> = ({
  jobs,
  onLoadToComparator,
  onRequestDelete,
  onCancelJob
}) => {
  const [projectFilter, setProjectFilter] = useState<"all" | "completed" | "processing" | "failed">("all");

  const filteredJobs = jobs.filter((job) => {
    if (projectFilter === "all") return true;
    if (projectFilter === "completed") return job.status === "completed";
    if (projectFilter === "failed") return job.status === "failed";
    if (projectFilter === "processing") return job.status === "processing" || job.status === "queued";
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in flex-1 overflow-hidden flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <FolderOpen className="text-red-500" size={24} />
          <div>
            <h2 className="text-xl font-bold text-white">Galeria de Projetos</h2>
            <p className="text-xs text-zinc-500">Histórico de todas as manipulações criadas e seus arquivos.</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 bg-zinc-900/50 p-1 border border-zinc-800 rounded-lg">
          <button
            onClick={() => setProjectFilter("all")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
              projectFilter === "all" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setProjectFilter("completed")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
              projectFilter === "completed" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Concluídos
          </button>
          <button
            onClick={() => setProjectFilter("processing")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
              projectFilter === "processing" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Ativos
          </button>
          <button
            onClick={() => setProjectFilter("failed")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
              projectFilter === "failed" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Falhas
          </button>
        </div>
      </div>

      {/* Grid de Projetos com rolagem vertical */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredJobs.map((job, index) => (
            <div
              key={job.id}
              className="bg-zinc-950/40 border border-zinc-900 rounded-xl overflow-hidden flex flex-col justify-between group hover:border-zinc-700 transition-all duration-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Preview Media */}
              <div className="aspect-[16/10] bg-zinc-900/60 flex items-center justify-center border-b border-zinc-900 relative">
                {job.status === "completed" && job.outputUrl ? (
                  job.outputUrl.match(/\.(mp4|webm|mkv|avi|mov)/i) ? (
                    <video src={job.outputUrl} className="w-full h-full object-cover" muted loop autoPlay />
                  ) : (
                    <img src={job.outputUrl} alt="Output" className="w-full h-full object-cover" />
                  )
                ) : job.status === "failed" ? (
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <AlertCircle size={32} className="text-red-500" />
                    <span className="text-xs font-bold text-zinc-400">Falha no Processamento</span>
                    <div className="max-h-[80px] overflow-y-auto text-[10px] text-zinc-600 bg-black/40 p-2 rounded max-w-[200px] break-all border border-zinc-900 font-mono">
                      {job.error_message || "Erro desconhecido durante execução."}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-zinc-500 w-full p-4">
                    <RefreshCw size={32} className="animate-spin text-amber-500" />
                    <span className="text-xs font-bold text-center px-4 max-w-full truncate text-zinc-300">
                      {job.step || "Processando"} ({job.progress}%)
                    </span>
                    <button
                      onClick={() => onCancelJob(job.id)}
                      className="mt-2 text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 px-2.5 py-1 rounded flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <XCircle size={12} /> Cancelar Tarefa
                    </button>
                  </div>
                )}

                {/* Status Overlay Badge */}
                <div className="absolute top-3 right-3">
                  {job.status === "completed" ? (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-extrabold uppercase">
                      Concluído
                    </span>
                  ) : job.status === "failed" ? (
                    <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-extrabold uppercase">
                      Falhou
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-extrabold uppercase animate-pulse">
                      Ativo
                    </span>
                  )}
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 space-y-4">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm text-white truncate max-w-[150px]">{job.id}</h3>
                    <span className="text-[10px] text-zinc-500 font-semibold">{job.time}</span>
                  </div>
                  <p className="text-xs text-zinc-400">Face Swap Pipeline</p>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 border-t border-zinc-900 pt-4">
                  {job.status === "completed" && (
                    <>
                      <button
                        onClick={() => onLoadToComparator(job)}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 border border-zinc-800 cursor-pointer"
                      >
                        <ExternalLink size={12} /> Comparar
                      </button>
                      <a
                        href={job.outputUrl}
                        download={`faceswap-${job.id}`}
                        className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs p-2 rounded-lg font-bold transition-all border border-zinc-800 flex items-center justify-center"
                        title="Baixar Mídia de Saída"
                      >
                        <Download size={14} />
                      </a>
                    </>
                  )}
                  {job.status !== "processing" && (
                    <button
                      onClick={() => onRequestDelete(job.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-xs p-2 rounded-lg font-bold transition-all flex items-center justify-center cursor-pointer"
                      title="Excluir Tarefa"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="bg-zinc-950/20 border border-zinc-900 rounded-xl p-12 text-center text-zinc-500 max-w-md mx-auto mt-12">
            Nenhum projeto encontrado para o filtro selecionado.
          </div>
        )}
      </div>
    </div>
  );
};
