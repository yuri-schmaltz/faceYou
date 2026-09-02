import React from "react";
import { Cpu, RefreshCw, Activity } from "lucide-react";

interface HeaderProps {
  title: string;
  hardwareInfo: string;
  isBackendConnected: boolean;
  onRefreshHardware?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  hardwareInfo,
  isBackendConnected,
  onRefreshHardware
}) => {
  return (
    <header className="h-16 border-b border-zinc-900 bg-zinc-950/30 backdrop-blur-md px-6 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <h2 className="font-bold text-lg text-white capitalize">{title}</h2>
        <span className="flex h-2 w-2 relative">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isBackendConnected ? "bg-emerald-400" : "bg-red-400"}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isBackendConnected ? "bg-emerald-500" : "bg-red-500"}`}></span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Hardware Status Chip */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/60 border border-zinc-800/80 text-xs font-medium text-zinc-300 shadow-inner">
          <Cpu size={14} className="text-red-400" />
          <span className="max-w-[280px] truncate">{hardwareInfo}</span>
          {onRefreshHardware && (
            <button
              onClick={onRefreshHardware}
              className="text-zinc-500 hover:text-zinc-300 transition-colors ml-1 cursor-pointer"
              title="Atualizar telemetria"
            >
              <RefreshCw size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-zinc-500">
          <Activity size={14} className={isBackendConnected ? "text-emerald-500" : "text-zinc-600"} />
          <span>{isBackendConnected ? "Online" : "Desconectado"}</span>
        </div>
      </div>
    </header>
  );
};
