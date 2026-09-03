import React, { useState } from "react";
import {
  Folder,
  FolderOpen,
  Sparkles,
  Download,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  RefreshCw,
  ExternalLink,
  Layers
} from "lucide-react";
import { Project } from "../types";
import { formatApiUrl } from "../utils/api";

interface ProjectsGalleryProps {
  projects: Project[];
  apiUrl: string;
  onOpenFolder: (projectName: string) => Promise<boolean>;
  onDeleteProject: (projectName: string) => Promise<boolean>;
  onOpenInStudio: (project: Project) => void;
  onNavigateToStudio: () => void;
  onRefresh: () => void;
}

export const ProjectsGallery: React.FC<ProjectsGalleryProps> = ({
  projects,
  apiUrl,
  onOpenFolder,
  onDeleteProject,
  onOpenInStudio,
  onNavigateToStudio,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<"all" | "completed" | "processing" | "failed">("all");
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filteredProjects = projects.filter((p) => {
    if (filter === "all") return true;
    if (filter === "completed") return p.status === "completed";
    if (filter === "failed") return p.status === "failed";
    if (filter === "processing") return p.status === "processing" || p.status === "queued";
    return true;
  });

  const handleOpenFolder = async (name: string) => {
    setActionLoading(name);
    try {
      await onOpenFolder(name);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setActionLoading(projectToDelete);
    try {
      await onDeleteProject(projectToDelete);
      setProjectToDelete(null);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in flex-1 overflow-hidden flex flex-col p-6 max-w-7xl mx-auto w-full">
      {/* Header Superior da Galeria */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5 flex-shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
            <Folder size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">Galeria de Projetos</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                ~/Vídeos/FaceFusion_Projects
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Pastas dedicadas com arquivos de origem, destino e resultados renderizados salvos no seu disco.
            </p>
          </div>
        </div>

        {/* Ações e Filtros */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-zinc-900/60 p-1 border border-zinc-800/80 rounded-xl shadow-inner">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === "all" ? "bg-red-600 text-white shadow-md shadow-red-600/30" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === "completed" ? "bg-red-600 text-white shadow-md shadow-red-600/30" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Concluídos
            </button>
            <button
              onClick={() => setFilter("processing")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === "processing" ? "bg-red-600 text-white shadow-md shadow-red-600/30" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Ativos
            </button>
          </div>

          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
            title="Atualizar lista de projetos"
          >
            <RefreshCw size={15} />
          </button>

          <button
            onClick={onNavigateToStudio}
            className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* Grid de Cards de Projetos */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
            {filteredProjects.map((project) => {
              const fullOutputUrl = project.output_url ? formatApiUrl(apiUrl, project.output_url) : null;
              const fullTargetUrl = project.target_url ? formatApiUrl(apiUrl, project.target_url) : null;
              const fullSourceUrl = project.source_url ? formatApiUrl(apiUrl, project.source_url) : null;
              const isVideo = project.output_files?.some(f => f.endsWith(".mp4") || f.endsWith(".mov") || f.endsWith(".mkv") || f.endsWith(".webm"));

              return (
                <div
                  key={project.id || project.name}
                  className="bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:shadow-2xl hover:shadow-black/50 group"
                >
                  {/* Área de Visualização / Preview de Mídia */}
                  <div className="relative aspect-video bg-zinc-950 flex items-center justify-center overflow-hidden border-b border-zinc-800/60">
                    {fullOutputUrl ? (
                      isVideo ? (
                        <video
                          src={fullOutputUrl}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                          }}
                        />
                      ) : (
                        <img
                          src={fullOutputUrl}
                          alt={project.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )
                    ) : fullTargetUrl ? (
                      <div className="w-full h-full relative">
                        <img
                          src={fullTargetUrl}
                          alt="Destino"
                          className="w-full h-full object-cover opacity-60 filter blur-sm"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-center p-4">
                          <Clock size={28} className="text-amber-400 animate-pulse mb-2" />
                          <span className="text-xs font-bold text-white">Renderização em Andamento</span>
                          <span className="text-[10px] text-zinc-400 mt-0.5">Arquivo salvo na conclusão</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-zinc-600 gap-2">
                        <Folder size={32} />
                        <span className="text-xs font-mono">Pasta sem mídia</span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      {project.status === "completed" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md shadow-sm">
                          <CheckCircle size={10} /> Concluído
                        </span>
                      ) : project.status === "processing" || project.status === "queued" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-md shadow-sm animate-pulse">
                          <Clock size={10} /> Em Fila
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 backdrop-blur-md shadow-sm">
                          <AlertCircle size={10} /> Falha
                        </span>
                      )}
                    </div>

                    {/* Badge de Miniaturas (Origem / Destino) */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[10px] text-zinc-300 font-mono">
                      <span>{project.source_files?.length || 0} origem</span>
                      <span className="text-zinc-500">•</span>
                      <span>{project.target_files?.length || 0} destino</span>
                      <span className="text-zinc-500">•</span>
                      <span>{project.output_files?.length || 0} saída</span>
                    </div>
                  </div>

                  {/* Detalhes do Projeto */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-white text-sm tracking-tight truncate" title={project.name}>
                        {project.name}
                      </h3>
                      <p className="text-[11px] text-zinc-500 font-mono mt-0.5 truncate" title={project.project_dir}>
                        {project.project_dir}
                      </p>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-800/60">
                      {/* Abrir Pasta no SO */}
                      <button
                        onClick={() => handleOpenFolder(project.name)}
                        disabled={actionLoading === project.name}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 text-xs py-2 rounded-xl font-bold transition-all border border-zinc-700/50 cursor-pointer shadow-sm"
                        title="Abrir pasta deste projeto no explorador de arquivos local"
                      >
                        <FolderOpen size={13} className="text-amber-400" />
                        <span>Abrir Pasta</span>
                      </button>

                      {/* Abrir no Estúdio */}
                      <button
                        onClick={() => onOpenInStudio(project)}
                        className="flex items-center justify-center gap-1.5 bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 text-xs px-2.5 py-2 rounded-xl font-bold transition-all border border-zinc-700/50 cursor-pointer shadow-sm"
                        title="Carregar mídias deste projeto no Estúdio"
                      >
                        <Sparkles size={13} className="text-red-400" />
                      </button>

                      {/* Download */}
                      {fullOutputUrl && (
                        <a
                          href={fullOutputUrl}
                          download={`${project.name}-resultado`}
                          className="bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 text-xs p-2 rounded-xl font-bold transition-all border border-zinc-700/50 flex items-center justify-center shadow-sm"
                          title="Baixar mídia renderizada"
                        >
                          <Download size={14} className="text-emerald-400" />
                        </a>
                      )}

                      {/* Excluir */}
                      <button
                        onClick={() => setProjectToDelete(project.name)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs p-2 rounded-xl font-bold transition-all flex items-center justify-center cursor-pointer shadow-sm"
                        title="Excluir projeto do disco"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-zinc-950/40 border border-zinc-900/90 rounded-2xl p-12 text-center text-zinc-400 max-w-lg mx-auto mt-16 shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-inner">
              <FolderOpen size={30} />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Nenhum projeto criado ainda</h3>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              Cada renderização iniciada cria automaticamente uma subpasta em{" "}
              <span className="font-mono text-zinc-400">~/Vídeos/FaceFusion_Projects/</span> com as mídias de origem, destino e o produto final perfeitamente isolados.
            </p>
            <button
              onClick={onNavigateToStudio}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              <Sparkles size={14} /> Ir para o Estúdio e Criar Projeto
            </button>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <Trash2 size={20} />
              </div>
              <h3 className="font-bold text-white">Excluir Projeto do Disco?</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tem certeza que deseja apagar a pasta do projeto{" "}
              <span className="font-mono text-white font-bold">"{projectToDelete}"</span> em ~/Vídeos? Todos os arquivos de origem, destino e resultado serão removidos permanentemente.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={actionLoading === projectToDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all cursor-pointer"
              >
                {actionLoading === projectToDelete ? "Excluindo..." : "Sim, Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
