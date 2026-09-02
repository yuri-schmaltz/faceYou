import React from "react";
import { PlusCircle, FolderOpen, Settings, User, Bell } from "lucide-react";

interface SidebarProps {
  activeTab: "create_new" | "projects" | "settings";
  setActiveTab: (tab: "create_new" | "projects" | "settings") => void;
  queuedCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  queuedCount = 0
}) => {
  return (
    <aside className="w-64 bg-zinc-950/40 backdrop-blur-xl border-r border-zinc-900 flex flex-col justify-between p-6 flex-shrink-0">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30">
            <span className="font-extrabold text-white text-lg">F</span>
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white leading-tight">
              Face<span className="text-red-500">Fusion</span>
            </h1>
            <span className="text-[10px] text-zinc-500 font-mono block">v3.7.0 Decoupled</span>
          </div>
        </div>

        {/* Links de Navegação */}
        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab("create_new")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "create_new"
                ? "text-zinc-200 bg-zinc-900/50 border-l-2 border-red-500"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30"
            }`}
          >
            <PlusCircle size={18} className={activeTab === "create_new" ? "text-red-500" : ""} />
            Criar Novo
          </button>
          
          <button
            onClick={() => setActiveTab("projects")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "projects"
                ? "text-zinc-200 bg-zinc-900/50 border-l-2 border-red-500"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <FolderOpen size={18} className={activeTab === "projects" ? "text-red-500" : ""} />
              Projetos
            </div>
            {queuedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {queuedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "settings"
                ? "text-zinc-200 bg-zinc-900/50 border-l-2 border-red-500"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30"
            }`}
          >
            <Settings size={18} className={activeTab === "settings" ? "text-red-500" : ""} />
            Configurações
          </button>
        </nav>
      </div>

      {/* Footer Sidebar (User Info) */}
      <div className="border-t border-zinc-900 pt-6 space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
              <User size={18} className="text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Operador</p>
              <p className="text-xs text-zinc-500">Local Cockpit</p>
            </div>
          </div>
          <button className="text-zinc-400 hover:text-red-500 transition-colors cursor-pointer" title="Notificações">
            <Bell size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};
