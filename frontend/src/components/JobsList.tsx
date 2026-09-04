import React, { useState } from "react";
import { AlertCircle, RefreshCw, ExternalLink, Download, Trash2, XCircle, Layers, Clock, CheckCircle2 } from "lucide-react";
import { Job } from "../types";

interface JobsListProps {
  jobs: Job[];
  onLoadToComparator: (job: Job) => void;
  onRequestDelete: (jobId: string) => void;
  onCancelJob: (jobId: string) => void;
  onNavigateToStudio?: () => void;
}

export const JobsList: React.FC<JobsListProps> = ({
  jobs,
  onLoadToComparator,
  onRequestDelete,
  onCancelJob,
  onNavigateToStudio
}) => {
  const [projectFilter, setProjectFilter] = useState<"all" | "queued" | "processing" | "completed" | "failed">("all");

  const filteredJobs = jobs.filter((job) => {
    if (projectFilter === "all") return true;
    if (projectFilter === "completed") return job.status === "completed";
    if (projectFilter === "failed") return job.status === "failed";
    if (projectFilter === "queued") return job.status === "queued" || (job.status === "idle" && job.progress === 0);
    if (projectFilter === "processing") return job.status === "processing";
    return true;
  });

  const getJobStatusConfig = (job: Job) => {
    if (job.status === "completed") {
      return {
        label: "CONCLUÍDO",
        badgeClass: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
        borderClass: "hover:border-cyan-500/40",
        icon: CheckCircle2,
        iconClass: "text-cyan-400",
        stepText: "Concluído com Sucesso",
        stepColor: "text-cyan-400"
      };
    }
    if (job.status === "failed") {
      return {
        label: "FALHOU",
        badgeClass: "bg-red-500/15 text-red-400 border-red-500/30",
        borderClass: "hover:border-red-500/40 border-red-500/20",
        icon: AlertCircle,
        iconClass: "text-red-500",
        stepText: "Falha no Processamento",
        stepColor: "text-red-400"
      };
    }
    if (job.status === "queued" || (job.status === "idle" && job.progress === 0)) {
      return {
        label: "AGUARDANDO",
        badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        borderClass: "hover:border-emerald-500/40 border-emerald-500/20",
        icon: Clock,
        iconClass: "text-emerald-400",
        stepText: "Aguardando na Fila",
        stepColor: "text-emerald-400"
      };
    }
    return {
      label: "PROCESSANDO",
      badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse",
      borderClass: "hover:border-amber-500/40 border-amber-500/20",
      icon: RefreshCw,
      iconClass: "text-amber-500 animate-spin",
      stepText: job.step || "Processando",
      stepColor: "text-amber-400"
    };
  };

  return (
    <div className="space-y-5 animate-fade-in flex-1 overflow-hidden flex flex-col w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
            <Layers size={18} />
          </div>
          <h2 className="text-lg font-black text-white tracking-tight">Fila de Renderização (Jobs)</h2>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-1.5 bg-zinc-900/50 p-1 border border-zinc-800 rounded-lg">
          <button
            onClick={() => setProjectFilter("all")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
              projectFilter === "all" ? "bg-red-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setProjectFilter("queued")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              projectFilter === "queued" ? "bg-emerald-600 text-white shadow-sm" : "text-zinc-400 hover:text-emerald-400"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${projectFilter === "queued" ? "bg-white" : "bg-emerald-400"}`} />
            Aguardando
          </button>
          <button
            onClick={() => setProjectFilter("processing")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              projectFilter === "processing" ? "bg-amber-600 text-white shadow-sm" : "text-zinc-400 hover:text-amber-400"
            }`}
          >
            <span className="relative flex h-2 w-2">
              {jobs.some(j => j.status === "processing") && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${projectFilter === "processing" ? "bg-white" : "bg-amber-400"}`} />
            </span>
            Processando
          </button>
          <button
            onClick={() => setProjectFilter("completed")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              projectFilter === "completed" ? "bg-cyan-600 text-white shadow-sm" : "text-zinc-400 hover:text-cyan-400"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${projectFilter === "completed" ? "bg-white" : "bg-cyan-400"}`} />
            Concluídos
          </button>
          <button
            onClick={() => setProjectFilter("failed")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              projectFilter === "failed" ? "bg-red-600 text-white shadow-sm" : "text-zinc-400 hover:text-red-400"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${projectFilter === "failed" ? "bg-white" : "bg-red-400"}`} />
            Falhas
          </button>
        </div>
      </div>

      {/* Grid de Projetos com rolagem vertical aproveitando toda a largura */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-5">
          {filteredJobs.map((job, index) => {
            const statusConfig = getJobStatusConfig(job);
            const isQueued = job.status === "queued" || (job.status === "idle" && job.progress === 0);

            return (
              <div
                key={job.id}
                className={`bg-zinc-950/40 border border-zinc-900 rounded-xl overflow-hidden flex flex-col justify-between group transition-all duration-200 ${statusConfig.borderClass}`}
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
                  ) : isQueued ? (
                    <div className="flex flex-col items-center gap-2 text-zinc-500 w-full p-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Clock size={24} />
                      </div>
                      <span className="text-xs font-bold text-center px-4 max-w-full truncate text-emerald-400">
                        Aguardando na Fila (0%)
                      </span>
                      <span className="text-[10px] text-zinc-500 text-center">
                        Aguardando término da tarefa anterior
                      </span>
                      <button
                        onClick={() => onCancelJob(job.id)}
                        className="mt-1 text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 px-2.5 py-1 rounded flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <XCircle size={12} /> Cancelar Tarefa
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-500 w-full p-4">
                      <RefreshCw size={32} className="animate-spin text-amber-500" />
                      <span className="text-xs font-bold text-center px-4 max-w-full truncate text-zinc-200">
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
                    <span className={`text-[10px] px-2.5 py-0.5 rounded font-extrabold uppercase tracking-wider border shadow-sm ${statusConfig.badgeClass}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

              {/* Card Details */}
              <div className="p-5 space-y-4">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-white truncate max-w-[180px]">{job.id}</h3>
                      {job.project_name && (
                        <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700/60 text-zinc-300">
                          📁 {job.project_name}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-semibold">{job.time}</span>
                  </div>
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
          );
        })}
        </div>
      </div>
    </div>
  );
};
