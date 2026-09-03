import React from "react";
import { Folder, Sparkles, Settings, Layers } from "lucide-react";

interface HeaderProps {
  activeTab: "projects" | "create_new" | "jobs" | "settings";
  setActiveTab: (tab: "projects" | "create_new" | "jobs" | "settings") => void;
  queuedCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  queuedCount = 0,
}) => {
  return (
    <header className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl px-6 flex items-center justify-between flex-shrink-0 z-30">
      {/* 1. Esquerda: Logo & Identidade Visual */}
      <div className="flex-1 flex items-center justify-start gap-3 min-w-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center font-black text-white text-base shadow-lg shadow-red-600/30 border border-red-500/20">
            F
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-black text-lg tracking-tight text-white">Face</span>
            <span className="font-black text-lg tracking-tight text-red-500">Fusion</span>
            <span className="text-xs font-mono font-medium text-zinc-500 ml-1.5">
              v3.8.2
            </span>
          </div>
        </div>
      </div>

      {/* 2. Centro: Abas de Navegação (Projetos / Estúdio / Jobs / Configurações) */}
      <nav className="flex items-center justify-center">
        <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800/80 p-1 rounded-xl shadow-inner backdrop-blur-md">
          {/* Aba 1: Projetos */}
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "projects"
                ? "bg-zinc-800 text-white shadow-md border border-zinc-700/60 shadow-black/40"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
            }`}
          >
            <Folder
              size={15}
              className={activeTab === "projects" ? "text-amber-400" : "text-zinc-500"}
            />
            <span>Projetos</span>
          </button>

          {/* Aba 2: Estúdio */}
          <button
            onClick={() => setActiveTab("create_new")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "create_new"
                ? "bg-zinc-800 text-white shadow-md border border-zinc-700/60 shadow-black/40"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
            }`}
          >
            <Sparkles
              size={15}
              className={activeTab === "create_new" ? "text-red-500" : "text-zinc-500"}
            />
            <span>Estúdio</span>
          </button>

          {/* Aba 3: Jobs (Fila de Renderização) */}
          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "jobs"
                ? "bg-zinc-800 text-white shadow-md border border-zinc-700/60 shadow-black/40"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
            }`}
          >
            <Layers
              size={15}
              className={activeTab === "jobs" ? "text-blue-400" : "text-zinc-500"}
            />
            <span>Jobs</span>
            {queuedCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full animate-pulse">
                {queuedCount}
              </span>
            )}
          </button>

          {/* Aba 4: Configurações */}
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "settings"
                ? "bg-zinc-800 text-white shadow-md border border-zinc-700/60 shadow-black/40"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
            }`}
          >
            <Settings
              size={15}
              className={activeTab === "settings" ? "text-zinc-300" : "text-zinc-500"}
            />
            <span>Configurações</span>
          </button>
        </div>
      </nav>

      {/* 3. Direita: Spacer para manter centralização balanceada */}
      <div className="flex-1 flex items-center justify-end min-w-0" />
    </header>
  );
};
