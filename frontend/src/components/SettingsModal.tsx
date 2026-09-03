import React, { useState, useEffect } from "react";
import { Settings, Folder, Cpu, Terminal, Download, RefreshCw, CheckCircle, Trash2, Layers, AlertCircle, XCircle } from "lucide-react";
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

interface ModelStatusData {
  status: "idle" | "downloading" | "completed" | "error" | "cancelled";
  scope: string;
  current_model: string;
  downloaded: number;
  total: number;
  percent: number;
  error?: string | null;
  disk?: {
    count: number;
    size_gb: number;
  };
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
  
  // Model Download States
  const [downloadScope, setDownloadScope] = useState<"full" | "lite">("full");
  const [downloadProvider, setDownloadProvider] = useState<"github" | "huggingface">("github");
  const [modelStatus, setModelStatus] = useState<ModelStatusData | null>(null);
  const [isStartingDownload, setIsStartingDownload] = useState(false);

  // Polling de status dos modelos
  const fetchModelStatus = async () => {
    try {
      const url = formatApiUrl(apiUrl, "/api/models/status");
      const res = await fetch(url);
      if (res.ok) {
        const data: ModelStatusData = await res.json();
        setModelStatus(data);
      }
    } catch {
      // silencioso se desconectado
    }
  };

  useEffect(() => {
    fetchModelStatus();
    const interval = setInterval(() => {
      fetchModelStatus();
    }, 2000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  const handleStartDownload = async () => {
    setIsStartingDownload(true);
    try {
      const url = formatApiUrl(apiUrl, "/api/models/download");
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          download_scope: downloadScope,
          download_provider: downloadProvider,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("info", "Download Iniciado", `Baixando modelos (${downloadScope}) em segundo plano.`);
        fetchModelStatus();
      } else {
        showToast("error", "Falha no Download", data.message || data.detail || "Erro ao iniciar download.");
      }
    } catch {
      showToast("error", "Erro de Rede", "Não foi possível disparar o download dos modelos.");
    } finally {
      setIsStartingDownload(false);
    }
  };

  const handleCancelDownload = async () => {
    try {
      const url = formatApiUrl(apiUrl, "/api/models/cancel");
      const res = await fetch(url, { method: "POST" });
      if (res.ok) {
        showToast("warning", "Download Cancelado", "O processo de download foi interrompido.");
        fetchModelStatus();
      }
    } catch {
      showToast("error", "Erro", "Não foi possível cancelar o download.");
    }
  };

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

  const isDownloading = modelStatus?.status === "downloading";

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in flex-1 overflow-y-auto pr-2 pb-10 select-none">
      <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
        <Settings className="text-red-500" size={24} />
        <div>
          <h2 className="text-xl font-bold text-white">Configurações do Sistema</h2>
          <p className="text-xs text-zinc-500">Gerencie diretórios, download de modelos de IA, logs e aceleração de hardware.</p>
        </div>
      </div>

      {/* SEÇÃO 1: BAIXAR TODOS OS MODELOS DE IA (ORIGINAL FACEFUSION FEATURE) */}
      <div className="bg-zinc-950/60 border border-red-500/30 rounded-2xl p-6 space-y-4 shadow-xl shadow-red-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-wide">
                Download de Modelos de IA (Model Manager)
              </h3>
              <p className="text-[11px] text-zinc-500">
                Baixe todos os modelos oficiais para operar de forma 100% autônoma e offline.
              </p>
            </div>
          </div>

          {modelStatus?.disk && (
            <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 px-3 py-1 rounded-xl text-xs font-mono">
              <span className="text-zinc-400">Armazenamento:</span>
              <span className="text-emerald-400 font-bold">{modelStatus.disk.count} modelos</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-300 font-bold">{modelStatus.disk.size_gb} GB</span>
            </div>
          )}
        </div>

        {/* Opções de Escopo e Provedor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300 font-bold">Escopo de Modelos (Download Scope)</label>
            <div className="relative">
              <select
                value={downloadScope}
                disabled={isDownloading}
                onChange={(e) => setDownloadScope(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-200 outline-none focus:border-red-500 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <option value="full">Todos os Modelos (Full - 245 modelos com Deep Swapper)</option>
                <option value="lite">Modelos Essenciais (Lite - 112 modelos básicos)</option>
              </select>
            </div>
            <span className="text-[10px] text-zinc-500 block">
              {downloadScope === "full"
                ? "Inclui celebridades do Deep Swapper, Wav2Lip, restauração, super resolução e remoção de fundo."
                : "Apenas detectores, landmarkers, máscaras e swappers essenciais."}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300 font-bold">Servidor Fonte (Download Provider)</label>
            <div className="relative">
              <select
                value={downloadProvider}
                disabled={isDownloading}
                onChange={(e) => setDownloadProvider(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-200 outline-none focus:border-red-500 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <option value="github">GitHub Releases (Oficial FaceFusion)</option>
                <option value="huggingface">HuggingFace Mirror</option>
              </select>
            </div>
            <span className="text-[10px] text-zinc-500 block">
              Servidor de origem dos arquivos de peso .onnx validados por hash SHA256.
            </span>
          </div>
        </div>

        {/* Barra de Progresso e Status em Execução */}
        {isDownloading && (
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-2.5 shadow-inner animate-fade-in">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <RefreshCw size={13} className="animate-spin text-red-500" />
                <span className="text-zinc-300 font-bold truncate max-w-[300px]">
                  {modelStatus?.current_model || "Baixando modelo..."}
                </span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 font-bold">
                <span>{modelStatus?.downloaded} / {modelStatus?.total}</span>
                <span className="text-red-400 font-black">{modelStatus?.percent}%</span>
              </div>
            </div>

            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300 rounded-full shadow-md shadow-red-500/50"
                style={{ width: `${modelStatus?.percent || 0}%` }}
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleCancelDownload}
                className="text-[11px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <XCircle size={13} /> Cancelar Download
              </button>
            </div>
          </div>
        )}

        {/* Mensagem de Concluído */}
        {modelStatus?.status === "completed" && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 rounded-xl text-emerald-400 text-xs font-bold animate-fade-in">
            <CheckCircle size={15} />
            <span>Todos os modelos do escopo selecionado foram baixados e validados no disco!</span>
          </div>
        )}

        {/* Mensagem de Erro */}
        {modelStatus?.status === "error" && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-xl text-red-400 text-xs font-bold animate-fade-in">
            <AlertCircle size={15} />
            <span>Erro durante o download: {modelStatus?.error}</span>
          </div>
        )}

        {/* Botão de Disparo */}
        {!isDownloading && (
          <button
            type="button"
            onClick={handleStartDownload}
            disabled={isStartingDownload}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black py-3 rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
          >
            {isStartingDownload ? <RefreshCw size={15} className="animate-spin" /> : <Download size={15} />}
            BAIXAR TODOS OS MODELOS ({downloadScope.toUpperCase()})
          </button>
        )}
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

        {/* Desempenho & Aceleração */}
        <div className="space-y-4 border-t border-zinc-900 pt-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu size={16} className="text-red-500" /> Desempenho e Aceleração
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-semibold">Estratégia de Memória de Vídeo</label>
              <select
                value={configMemoryStrategy}
                onChange={(e) => setConfigMemoryStrategy(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300 outline-none focus:border-red-500 transition-colors cursor-pointer"
              >
                <option value="strict">Strict (Estrita / Economia Máxima)</option>
                <option value="moderate">Moderate (Moderada / Equilibrada)</option>
                <option value="tolerant">Tolerant (Tolerante / Desempenho Máximo)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-semibold">Threads de Execução ({configThreadCount})</label>
              <input
                type="range"
                min="1"
                max="32"
                value={configThreadCount}
                onChange={(e) => setConfigThreadCount(parseInt(e.target.value))}
                className="w-full accent-red-600 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer mt-2"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-400 font-semibold block">Provedores de Execução (Execution Providers)</label>
              <span className="text-[10px] text-zinc-500 font-mono">
                {availableProviders.includes("cuda") ? "⚡ Aceleração GPU Ativa" : "Modo CPU ativo"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {availableProviders.map((provider) => {
                const isChecked = configProviders.includes(provider);
                const isGpu = provider === "cuda" || provider === "tensorrt";

                return (
                  <label
                    key={provider}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                      isChecked
                        ? isGpu
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold shadow-sm"
                          : "bg-red-600/10 border-red-500/40 text-white font-bold"
                        : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setConfigProviders([...configProviders, provider]);
                        } else {
                          setConfigProviders(configProviders.filter((p) => p !== provider));
                        }
                      }}
                      className="accent-emerald-500 w-3.5 h-3.5 rounded"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate uppercase tracking-wider font-extrabold">{provider}</span>
                        {provider === "cuda" && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                            GPU
                          </span>
                        )}
                        {provider === "tensorrt" && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold">
                            TensorCore
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-normal">
                        {provider === "cuda"
                          ? "NVIDIA CUDA Core"
                          : provider === "tensorrt"
                          ? "Motor TensorRT Ultra"
                          : "Processador Central"}
                      </span>
                    </div>
                  </label>
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
