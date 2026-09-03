import React from "react";
import { Cpu, RefreshCw, Activity, Folder, Sparkles, Settings } from "lucide-react";

interface HeaderProps {
  activeTab: "projects" | "create_new" | "settings";
  setActiveTab: (tab: "projects" | "create_new" | "settings") => void;
  queuedCount?: number;
  hardwareInfo: string;
  isBackendConnected: boolean;
  onRefreshHardware?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  queuedCount = 0,
  hardwareInfo,
  isBackendConnected,
  onRefreshHardware,
}) => {
  return (
    <header className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl px-6 flex items-center justify-between flex-shrink-0 z-30">
      {/* 1. Esquerda: Logo & Identidade Visual */}
      <div className="flex-1 flex items-center justify-start gap-3 min-w-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center font-black text-white text-base shadow-lg shadow-red-600/30 border border-red-500/20">
            F
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-sm tracking-tight text-white">Face</span>
              <span className="font-extrabold text-sm tracking-tight text-red-500">Fusion</span>
            </div>
            <span className="text-[10px] font-mono font-medium text-zinc-500 tracking-wider mt-0.5">
              v3.8.2 Decoupled
            </span>
          </div>
        </div>
      </div>

      {/* 2. Centro: Abas de Navegação (Projetos / Estúdio / Configurações) */}
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
            {queuedCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full animate-pulse">
                {queuedCount}
              </span>
            )}
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

          {/* Aba 3: Configurações */}
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

      {/* 3. Direita: Telemetria de Hardware & Status da Conexão */}
      <div className="flex-1 flex items-center justify-end gap-3 min-w-0">
        {/* Chip de Telemetria de GPU / Hardware */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/70 border border-zinc-800/80 text-xs font-medium text-zinc-300 shadow-inner">
          <Cpu size={14} className="text-red-500 flex-shrink-0" />
          <span className="max-w-[240px] truncate font-mono text-[11px] text-zinc-300">{hardwareInfo}</span>
          {onRefreshHardware && (
            <button
              onClick={onRefreshHardware}
              className="text-zinc-500 hover:text-zinc-300 transition-colors ml-0.5 cursor-pointer"
              title="Atualizar telemetria"
            >
              <RefreshCw size={12} />
            </button>
          )}
        </div>

        {/* Indicador de Status Online / Conexão */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 pl-1">
          <span className="flex h-2 w-2 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isBackendConnected ? "bg-emerald-400" : "bg-red-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isBackendConnected ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
          </span>
          <span className="font-medium text-[11px] text-zinc-300">
            {isBackendConnected ? "Online" : "Offline"}
          </span>
        </div>
      </div>
    </header>
  );
};
