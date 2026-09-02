import React, { useState } from "react";
import { Settings, Folder, Cpu, Terminal, Download, RefreshCw, CheckCircle, Trash2 } from "lucide-react";
import { formatApiUrl } from "../utils/api";

interface SettingsModalProps {
  apiUrl: string;
  configTempPath: string;
  setConfigTempPath: (val: string) => void;
  configJobsPath: string;
  setConfigJobsPath: (val: string) => void;
  configMemoryStrategy: string;
  setConfigMemoryStrategy: (val: string) => void;
  configThreadCount: number;
  setConfigThreadCount: (val: number) => void;
  configLogLevel: string;
  setConfigLogLevel: (val: string) => void;
  configProviders: string[];
  setConfigProviders: (val: string[]) => void;
  availableProviders: string[];
  isSavingConfig: boolean;
  onSaveConfig: (e: React.FormEvent) => void;
  onExportDiagnostic: () => void;
  showToast: (type: "success" | "error" | "info" | "warning", title: string, message?: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  apiUrl,
  configTempPath,
  setConfigTempPath,
  configJobsPath,
  setConfigJobsPath,
  configMemoryStrategy,
  setConfigMemoryStrategy,
  configThreadCount,
  setConfigThreadCount,
  configLogLevel,
  setConfigLogLevel,
  configProviders,
  setConfigProviders,
  availableProviders,
  isSavingConfig,
  onSaveConfig,
  onExportDiagnostic,
  showToast,
}) => {
  const [isCleaning, setIsCleaning] = useState(false);

  const handleCleanupCache = async () => {
    setIsCleaning(true);
    try {
      const url = formatApiUrl(apiUrl, "/api/media/cleanup");
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        showToast("success", "Cache Limpo", data.message || "Arquivos temporários removidos.");
      } else {
        showToast("error", "Erro ao Limpar", data.detail || "Falha na limpeza.");
      }
    } catch {
      showToast("error", "Erro de Rede", "Não foi possível conectar ao servidor para limpeza.");
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in flex-1 overflow-y-auto pr-2">
      <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
        <Settings className="text-red-500" size={24} />
        <div>
          <h2 className="text-xl font-bold text-white">Configurações do Sistema</h2>
          <p className="text-xs text-zinc-500">Gerencie diretórios, níveis de log e parâmetros de aceleração de hardware.</p>
        </div>
      </div>

      <form onSubmit={onSaveConfig} className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-6 space-y-6">
        {/* Diretórios */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Folder size={16} className="text-red-500" /> Diretórios do Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-semibold">Caminho Temporário (Temp Path)</label>
              <input
                type="text"
                value={configTempPath}
                onChange={(e) => setConfigTempPath(e.target.value)}
                placeholder="Ex: .temp"
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300 outline-none focus:border-red-500 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-semibold">Pasta de Tarefas (Jobs Path)</label>
              <input
                type="text"
                value={configJobsPath}
                onChange={(e) => setConfigJobsPath(e.target.value)}
                placeholder="Ex: .jobs"
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300 outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Aceleração de Hardware */}
        <div className="space-y-4 border-t border-zinc-900 pt-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu size={16} className="text-red-500" /> Aceleração e Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-semibold font-sans">Estratégia de Memória do Vídeo</label>
              <select
                value={configMemoryStrategy}
                onChange={(e) => setConfigMemoryStrategy(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300 outline-none focus:border-red-500 transition-colors cursor-pointer"
              >
                <option value="strict">Strict (Baixo Uso de VRAM)</option>
                <option value="balanced">Balanced (Equilibrado)</option>
                <option value="tolerant">Tolerant (Desempenho Máximo)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-semibold">Quantidade de Threads de Execução</label>
              <input
                type="number"
                min="1"
                max="64"
                value={configThreadCount}
                onChange={(e) => setConfigThreadCount(parseInt(e.target.value) || 1)}
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300 outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-zinc-400 font-semibold block">Provedores de Execução Disponíveis</label>
            <div className="flex flex-wrap gap-2">
              {availableProviders.map((prov) => {
                const isSelected = configProviders.includes(prov);
                return (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        if (configProviders.length > 1) {
                          setConfigProviders(configProviders.filter((p) => p !== prov));
                        }
                      } else {
                        setConfigProviders([...configProviders, prov]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase flex items-center gap-1.5 border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-red-500/20 border-red-500/40 text-red-400"
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    {isSelected && <CheckCircle size={10} />}
                    {prov}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sistema Geral & Manutenção */}
        <div className="space-y-4 border-t border-zinc-900 pt-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Terminal size={16} className="text-red-500" /> Logs e Manutenção de Disco
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-semibold">Nível de Log (Log Level)</label>
              <select
                value={configLogLevel}
                onChange={(e) => setConfigLogLevel(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300 outline-none focus:border-red-500 transition-colors cursor-pointer"
              >
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-semibold">Limpeza de Cache</label>
              <button
                type="button"
                onClick={handleCleanupCache}
                disabled={isCleaning}
                className="w-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded px-3 py-2 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={13} className="text-amber-500" />
                {isCleaning ? "Limpando..." : "Limpar Recortes e Cache Efêmero"}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-6 flex justify-between items-center">
          <button
            type="button"
            onClick={onExportDiagnostic}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold px-6 py-2.5 rounded-lg text-xs transition-all border border-zinc-800 flex items-center gap-2 cursor-pointer"
          >
            <Download size={14} />
            EXPORTAR DIAGNÓSTICO (ZIP)
          </button>

          <button
            type="submit"
            disabled={isSavingConfig}
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-all shadow-lg shadow-red-600/20 flex items-center gap-2 cursor-pointer disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed"
          >
            {isSavingConfig ? <RefreshCw size={14} className="animate-spin" /> : null}
            SALVAR CONFIGURAÇÕES
          </button>
        </div>
      </form>
    </div>
  );
};
