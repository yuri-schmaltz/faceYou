"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { Toast, SourceItem, DetectedFace, Job } from "../types";
import { resolveApiUrl, formatApiUrl, getInitialApiUrl } from "../utils/api";
import { useJobs } from "../hooks/useJobs";
import { useHardware } from "../hooks/useHardware";
import { usePresets } from "../hooks/usePresets";
import { ToastContainer } from "../components/ToastContainer";
import { Header } from "../components/Header";
import { SourceUploader } from "../components/SourceUploader";
import { TargetMediaViewer } from "../components/TargetMediaViewer";
import { FaceMappingModal } from "../components/FaceMappingModal";
import { ProcessorSettings } from "../components/ProcessorSettings";
import { VideoComparator } from "../components/VideoComparator";
import { JobsList } from "../components/JobsList";
import { SettingsModal } from "../components/SettingsModal";

export default function Home() {
  // Configuração e conexão com a API
  const [apiUrl, setApiUrl] = useState<string>(getInitialApiUrl());
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Navegação
  const [activeTab, setActiveTab] = useState<"create_new" | "projects" | "settings">("create_new");

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((type: Toast["type"], title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => (t.id === id ? { ...t, exiting: true } : t)));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Inicializar API URL dinâmica
  useEffect(() => {
    resolveApiUrl().then(url => {
      setApiUrl(url);
    });
  }, []);

  // Custom Hooks
  const { jobs, activeJob, cancelJob, deleteJob, fetchJobs } = useJobs(apiUrl);
  const { telemetry, hardwareInfo, availableProviders, fetchHardware } = useHardware(apiUrl);
  const {
    presets,
    selectedPresetName,
    setSelectedPresetName,
    newPresetName,
    setNewPresetName,
    saveCustomPreset,
  } = usePresets();

  // Testar conexão com o backend
  useEffect(() => {
    if (apiUrl === null) return;
    const testConnection = async () => {
      try {
        const pingUrl = formatApiUrl(apiUrl, "/api/hardware/devices");
        const res = await fetch(pingUrl);
        setIsBackendConnected(res.ok);
      } catch {
        setIsBackendConnected(false);
      }
    };
    testConnection();
    const interval = setInterval(testConnection, 8000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  // Mídia e Uploads
  const [sourceItems, setSourceItems] = useState<SourceItem[]>([]);
  const [sourceImageFullPath, setSourceImageFullPath] = useState<string | null>(null);

  const [targetMedia, setTargetMedia] = useState<string | null>(null);
  const [targetMediaFullPath, setTargetMediaFullPath] = useState<string | null>(null);
  const [targetMediaName, setTargetMediaName] = useState<string>("");
  const [targetVideoTime, setTargetVideoTime] = useState<number>(0);
  const [processFromCurrentPoint, setProcessFromCurrentPoint] = useState<boolean>(false);

  const [targetDimensions, setTargetDimensions] = useState<{ width: number; height: number } | null>(null);
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number } | null>(null);
  const targetContainerRef = useRef<HTMLDivElement>(null);

  // Mapeamento de Múltiplos Rostos
  const [detectedTargetFaces, setDetectedTargetFaces] = useState<DetectedFace[]>([]);
  const [isAnalyzingTargetFaces, setIsAnalyzingTargetFaces] = useState<boolean>(false);
  const [selectedFaceForModal, setSelectedFaceForModal] = useState<DetectedFace | null>(null);
  const [faceMappings, setFaceMappings] = useState<Record<number, string>>({});
  const [referenceFrameNumber, setReferenceFrameNumber] = useState<number>(0);

  // Processadores & Parâmetros
  const [availableProcessors, setAvailableProcessors] = useState<string[]>([
    "face_swapper",
    "face_enhancer",
    "frame_enhancer",
    "face_editor",
    "age_modifier",
    "expression_restorer"
  ]);
  const [selectedProcessors, setSelectedProcessors] = useState<string[]>(["face_swapper"]);
  const [autoPreview, setAutoPreview] = useState<boolean>(true);

  // Swapper options
  const [faceSwapperWeight, setFaceSwapperWeight] = useState<number>(0.85);
  const [faceMaskBlur, setFaceMaskBlur] = useState<number>(12);
  const [detectionThreshold, setDetectionThreshold] = useState<number>(0.70);
  const [smoothing, setSmoothing] = useState<number>(5);
  const [faceSwapperModel, setFaceSwapperModel] = useState<string>("inswapper_128_fp16");
  const [faceSwapperPixelBoost, setFaceSwapperPixelBoost] = useState<string>("512x512");

  // Enhancer options
  const [faceEnhancerModel, setFaceEnhancerModel] = useState<string>("gfpgan_1.4");
  const [faceEnhancerBlend, setFaceEnhancerBlend] = useState<number>(80);
  const [faceEnhancerWeight, setFaceEnhancerWeight] = useState<number>(1.0);
  const [frameEnhancerModel, setFrameEnhancerModel] = useState<string>("span_kendata_x4");
  const [frameEnhancerBlend, setFrameEnhancerBlend] = useState<number>(80);

  // Additional processors options
  const [faceEditorModel, setFaceEditorModel] = useState<string>("live_portrait");
  const [faceEditorSmile, setFaceEditorSmile] = useState<number>(0);
  const [ageModifierModel, setAgeModifierModel] = useState<string>("styleganex_age");
  const [ageModifierDirection, setAgeModifierDirection] = useState<number>(0);
  const [expressionRestorerFactor, setExpressionRestorerFactor] = useState<number>(0.8);

  // Export options
  const [outputFormat, setOutputFormat] = useState<string>("MP4");
  const [outputQuality, setOutputQuality] = useState<string>("High");
  const [previewOutputUrl, setPreviewOutputUrl] = useState<string | null>(null);

  // Estados de execução
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Drag & Drop
  const [isDraggingSource, setIsDraggingSource] = useState<boolean>(false);
  const [isDraggingTarget, setIsDraggingTarget] = useState<boolean>(false);

  // Modal de Exclusão
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  // Configurações do Sistema
  const [configTempPath, setConfigTempPath] = useState<string>(".temp");
  const [configJobsPath, setConfigJobsPath] = useState<string>(".jobs");
  const [configMemoryStrategy, setConfigMemoryStrategy] = useState<string>("balanced");
  const [configThreadCount, setConfigThreadCount] = useState<number>(4);
  const [configLogLevel, setConfigLogLevel] = useState<string>("info");
  const [configProviders, setConfigProviders] = useState<string[]>([]);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);

  // Carregar configurações do backend
  useEffect(() => {
    if (!apiUrl && apiUrl !== "") return;
    const fetchConfig = async () => {
      try {
        const url = formatApiUrl(apiUrl, "/api/config");
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.temp_path) setConfigTempPath(data.temp_path);
          if (data.jobs_path) setConfigJobsPath(data.jobs_path);
          if (data.video_memory_strategy) setConfigMemoryStrategy(data.video_memory_strategy);
          if (data.execution_thread_count) setConfigThreadCount(data.execution_thread_count);
          if (data.log_level) setConfigLogLevel(data.log_level);
          if (data.execution_providers) setConfigProviders(data.execution_providers);
        }
      } catch {
        // use defaults
      }
    };
    fetchConfig();
  }, [apiUrl]);

  // Atualizar dimensões do container de destino para cálculo das caixas faciais
  const updateContainerDimensions = useCallback(() => {
    if (targetContainerRef.current) {
      setContainerDimensions({
        width: targetContainerRef.current.clientWidth,
        height: targetContainerRef.current.clientHeight,
      });
    }
  }, []);

  useEffect(() => {
    updateContainerDimensions();
    window.addEventListener("resize", updateContainerDimensions);
    return () => window.removeEventListener("resize", updateContainerDimensions);
  }, [detectedTargetFaces, targetMedia, updateContainerDimensions]);

  const getScaledBox = useCallback((bbox: number[]) => {
    if (!targetDimensions || !containerDimensions) return null;
    const [x_min, y_min, x_max, y_max] = bbox;
    const Mw = targetDimensions.width;
    const Mh = targetDimensions.height;
    const Cw = containerDimensions.width;
    const Ch = containerDimensions.height;
    if (!Mw || !Mh || !Cw || !Ch) return null;

    const Rm = Mw / Mh;
    const Rc = Cw / Ch;
    let Rw = Cw;
    let Rh = Ch;
    let Ro = 0;
    let To = 0;

    if (Rc > Rm) {
      Rw = Ch * Rm;
      Ro = (Cw - Rw) / 2;
    } else {
      Rh = Cw / Rm;
      To = (Ch - Rh) / 2;
    }

    return {
      left: Ro + (x_min / Mw) * Rw,
      top: To + (y_min / Mh) * Rh,
      width: ((x_max - x_min) / Mw) * Rw,
      height: ((y_max - y_min) / Mh) * Rh,
    };
  }, [targetDimensions, containerDimensions]);

  // Upload file helper
  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const url = formatApiUrl(apiUrl, "/api/media/upload");
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      throw new Error("Falha no upload do arquivo.");
    }
    return await res.json();
  };

  const handleSourceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const data = await uploadFile(file);
        const resolvedUrl = formatApiUrl(apiUrl, data.url);
        const newSource: SourceItem = {
          url: resolvedUrl,
          file_path: data.file_path,
          filename: data.filename,
        };
        setSourceItems(prev => [...prev, newSource]);
        setSourceImageFullPath(data.file_path);
        showToast("success", "Imagem Carregada", file.name);
      } catch {
        showToast("error", "Erro no Upload", `Falha ao enviar ${file.name}`);
      }
    }
  };

  const handleTargetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await uploadFile(file);
      const resolvedUrl = formatApiUrl(apiUrl, data.url);
      setTargetMedia(resolvedUrl);
      setTargetMediaFullPath(data.file_path);
      setTargetMediaName(data.filename);
      setDetectedTargetFaces([]);
      setFaceMappings({});
      showToast("success", "Mídia de Destino Carregada", file.name);
    } catch {
      showToast("error", "Erro no Upload", "Falha ao enviar mídia de destino.");
    }
  };

  // Drag & drop handlers
  const handleDropSource = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingSource(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      try {
        const data = await uploadFile(files[i]);
        const resolvedUrl = formatApiUrl(apiUrl, data.url);
        setSourceItems(prev => [...prev, { url: resolvedUrl, file_path: data.file_path, filename: data.filename }]);
        setSourceImageFullPath(data.file_path);
        showToast("success", "Imagem Carregada", files[i].name);
      } catch {
        showToast("error", "Erro no Upload", "Falha no envio.");
      }
    }
  };

  const handleDropTarget = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingTarget(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    try {
      const data = await uploadFile(file);
      const resolvedUrl = formatApiUrl(apiUrl, data.url);
      setTargetMedia(resolvedUrl);
      setTargetMediaFullPath(data.file_path);
      setTargetMediaName(data.filename);
      setDetectedTargetFaces([]);
      setFaceMappings({});
      showToast("success", "Mídia de Destino Carregada", file.name);
    } catch {
      showToast("error", "Erro no Upload", "Falha no envio.");
    }
  };

  // Analisar rostos
  const handleAnalyzeFaces = async () => {
    if (!targetMediaFullPath) return;
    setIsAnalyzingTargetFaces(true);
    setDetectedTargetFaces([]);
    setFaceMappings({});

    const isVideoFile = !!targetMediaName.match(/\.(mp4|webm|mkv|avi|mov)$/i);
    const timestamp = isVideoFile ? targetVideoTime : null;
    const frameNumber = isVideoFile ? Math.round(targetVideoTime * 30) : 0;
    setReferenceFrameNumber(frameNumber);

    try {
      const url = formatApiUrl(apiUrl, "/api/media/analyze-faces");
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_path: targetMediaFullPath,
          timestamp,
          frame_number: frameNumber,
        }),
      });
      if (!res.ok) throw new Error("Erro na detecção de rostos.");
      const data = await res.json();
      setDetectedTargetFaces(data.faces || []);
      if ((data.faces || []).length === 0) {
        showToast("info", "Nenhum Rosto", "Nenhum rosto foi encontrado neste frame.");
      } else {
        showToast("success", "Rostos Detectados", `${data.faces.length} rostos prontos para mapeamento.`);
      }
    } catch {
      showToast("error", "Erro na Análise", "Não foi possível analisar rostos na mídia.");
    } finally {
      setIsAnalyzingTargetFaces(false);
    }
  };

  // Gerar Preview
  const handleGeneratePreview = async (silent = false) => {
    if (!sourceImageFullPath || !targetMediaFullPath) {
      if (!silent) showToast("warning", "Mídia Incompleta", "Selecione origem e destino antes do preview.");
      return;
    }
    setIsPreviewLoading(true);

    const isVideoFile = !!targetMediaName.match(/\.(mp4|webm|mkv|avi|mov)$/i);
    const timestamp = isVideoFile ? targetVideoTime : null;
    const frameNumber = isVideoFile ? Math.round(targetVideoTime * 30) : 0;

    try {
      const url = formatApiUrl(apiUrl, "/api/preview");
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_paths: [sourceImageFullPath],
          target_path: targetMediaFullPath,
          timestamp,
          frame_number: frameNumber,
          processors: selectedProcessors,
          face_swapper_model: faceSwapperModel,
          face_swapper_pixel_boost: faceSwapperPixelBoost,
          face_swapper_weight: faceSwapperWeight,
          face_mask_blur: faceMaskBlur / 50.0,
          detection_threshold: detectionThreshold,
          face_enhancer_model: faceEnhancerModel,
          face_enhancer_blend: faceEnhancerBlend,
          face_enhancer_weight: faceEnhancerWeight,
          frame_enhancer_model: frameEnhancerModel,
          frame_enhancer_blend: frameEnhancerBlend,
          face_editor_model: faceEditorModel,
          face_editor_mouth_smile: faceEditorSmile,
          age_modifier_model: ageModifierModel,
          age_modifier_direction: ageModifierDirection,
          expression_restorer_factor: expressionRestorerFactor,
        }),
      });

      if (!res.ok) throw new Error("Falha ao gerar preview.");
      const data = await res.json();
      if (data.preview_url) {
        setPreviewOutputUrl(formatApiUrl(apiUrl, data.preview_url));
        if (!silent) showToast("success", "Preview Atualizado", "Novo frame processado.");
      }
    } catch (err: any) {
      if (!silent) showToast("error", "Erro no Preview", err.message || "Falha na pré-visualização.");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Preview automático ao trocar opções (debounce)
  useEffect(() => {
    if (!autoPreview || !sourceImageFullPath || !targetMediaFullPath || isGenerating) return;
    const timer = setTimeout(() => {
      handleGeneratePreview(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [
    autoPreview,
    sourceImageFullPath,
    targetMediaFullPath,
    selectedProcessors,
    faceSwapperWeight,
    faceMaskBlur,
    detectionThreshold,
    faceSwapperModel,
    faceSwapperPixelBoost,
    faceEnhancerModel,
    faceEnhancerBlend,
    frameEnhancerModel,
    frameEnhancerBlend,
    faceEditorSmile,
    ageModifierDirection,
    targetVideoTime,
  ]);

  // Iniciar Tarefa Completa (Job)
  const handleGenerateSwap = async () => {
    if (isGenerating) return;
    if (!sourceImageFullPath || !targetMediaFullPath) {
      showToast("warning", "Mídia Incompleta", "Envie a origem e o destino antes de iniciar.");
      return;
    }
    setIsGenerating(true);

    const trimFrameStart = processFromCurrentPoint ? Math.round(targetVideoTime * 30) : null;
    const mappings = Object.entries(faceMappings).map(([targetIdx, srcPath]) => ({
      source_path: srcPath,
      target_face_index: parseInt(targetIdx, 10),
      reference_frame_number: referenceFrameNumber,
    }));

    const sourcePaths = mappings.length > 0
      ? Array.from(new Set(mappings.map(m => m.source_path)))
      : [sourceImageFullPath];

    try {
      const url = formatApiUrl(apiUrl, "/api/jobs");
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_paths: sourcePaths,
          target_path: targetMediaFullPath,
          face_swapper_weight: faceSwapperWeight,
          face_mask_blur: faceMaskBlur / 50.0,
          detection_threshold: detectionThreshold,
          smoothing: smoothing,
          processors: selectedProcessors,
          output_format: outputFormat.toLowerCase(),
          trim_frame_start: trimFrameStart,
          face_swapper_model: faceSwapperModel,
          face_swapper_pixel_boost: faceSwapperPixelBoost,
          face_enhancer_model: faceEnhancerModel,
          face_enhancer_blend: faceEnhancerBlend,
          face_enhancer_weight: faceEnhancerWeight,
          frame_enhancer_model: frameEnhancerModel,
          frame_enhancer_blend: frameEnhancerBlend,
          face_editor_model: faceEditorModel,
          face_editor_mouth_smile: faceEditorSmile,
          age_modifier_model: ageModifierModel,
          age_modifier_direction: ageModifierDirection,
          expression_restorer_factor: expressionRestorerFactor,
          mappings: mappings.length > 0 ? mappings : undefined,
        }),
      });

      if (!res.ok) throw new Error("Falha ao submeter job.");
      const data = await res.json();
      showToast("success", "Tarefa Criada", `ID: ${data.job_id} na fila de execução.`);
      await fetchJobs();
      setActiveTab("projects");
    } catch (err: any) {
      showToast("error", "Erro ao Criar Tarefa", err.message || "Falha na conexão.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Salvar Configurações
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      const url = formatApiUrl(apiUrl, "/api/config");
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temp_path: configTempPath,
          jobs_path: configJobsPath,
          video_memory_strategy: configMemoryStrategy,
          execution_thread_count: configThreadCount,
          log_level: configLogLevel,
          execution_providers: configProviders,
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar.");
      showToast("success", "Configurações Salvas", "Novos parâmetros registrados.");
    } catch {
      showToast("error", "Erro", "Não foi possível persistir as configurações.");
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Exportar Diagnóstico
  const handleExportDiagnostic = () => {
    const url = formatApiUrl(apiUrl, "/api/diagnostic/export");
    const a = document.createElement("a");
    a.href = url;
    a.download = "facefusion_diagnostic.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast("info", "Diagnóstico", "Download do pacote de logs iniciado.");
  };

  // Download do Resultado
  const handleDownloadOutput = () => {
    if (!previewOutputUrl) return;
    const a = document.createElement("a");
    a.href = previewOutputUrl;
    a.download = "facefusion_output";
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast("info", "Download", "Arquivo sendo transferido.");
  };

  // Toggle Processor Selection
  const toggleProcessor = (proc: string) => {
    setSelectedProcessors(prev =>
      prev.includes(proc) ? prev.filter(p => p !== proc) : [...prev, proc]
    );
  };

  // Presets Handlers
  const handleApplyPreset = (name: string) => {
    const preset = presets.find(p => p.name === name);
    if (!preset) return;
    setSelectedPresetName(name);
    setFaceSwapperWeight(preset.faceSwapperWeight);
    setFaceMaskBlur(preset.faceMaskBlur);
    setDetectionThreshold(preset.detectionThreshold);
    setSmoothing(preset.smoothing);
    setFaceSwapperModel(preset.faceSwapperModel);
    setFaceSwapperPixelBoost(preset.faceSwapperPixelBoost);
    if (preset.faceEnhancerModel) setFaceEnhancerModel(preset.faceEnhancerModel);
    if (preset.faceEnhancerBlend !== undefined) setFaceEnhancerBlend(preset.faceEnhancerBlend);
    if (preset.frameEnhancerModel) setFrameEnhancerModel(preset.frameEnhancerModel);
    if (preset.frameEnhancerBlend !== undefined) setFrameEnhancerBlend(preset.frameEnhancerBlend);
    showToast("success", "Preset Aplicado", preset.name);
  };

  const handleSaveCurrentPreset = () => {
    const success = saveCustomPreset(
      {
        faceSwapperWeight,
        faceMaskBlur,
        detectionThreshold,
        smoothing,
        faceSwapperModel,
        faceSwapperPixelBoost,
        faceEnhancerModel,
        faceEnhancerBlend,
        faceEnhancerWeight,
        frameEnhancerModel,
        frameEnhancerBlend,
      },
      newPresetName
    );
    if (success) {
      showToast("success", "Preset Salvo", newPresetName);
    } else {
      showToast("warning", "Nome Inválido", "Informe um nome válido para o preset.");
    }
  };

  // Carregar job para o comparador
  const handleLoadToComparator = (job: Job) => {
    if (job.outputUrl) {
      setPreviewOutputUrl(formatApiUrl(apiUrl, job.outputUrl));
      setActiveTab("create_new");
      showToast("info", "Job Carregado", `Visualizando resultado de ${job.id}`);
    }
  };

  // Confirmar exclusão de job
  const handleDeleteJobConfirmed = async () => {
    if (!jobToDelete) return;
    const res = await deleteJob(jobToDelete);
    if (res.success) {
      showToast("success", "Job Excluído", `Tarefa ${jobToDelete} removida.`);
    } else {
      showToast("error", "Erro ao Excluir", res.message);
    }
    setJobToDelete(null);
  };

  const queuedCount = jobs.filter(j => j.status === "processing" || j.status === "queued").length;

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-[#ededed] font-sans overflow-hidden">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Top Header with Centered Tabs */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        queuedCount={queuedCount}
        telemetry={telemetry}
        hardwareInfo={hardwareInfo}
        isBackendConnected={isBackendConnected}
        onRefreshHardware={fetchHardware}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Workspace Body */}
        <div className="flex-1 p-4 md:p-6 flex flex-col overflow-hidden">
          {/* TAB 1: CRIAR NOVO */}
          {activeTab === "create_new" && (
            <div className="flex-1 flex flex-col overflow-hidden space-y-4 animate-fade-in">
              {/* Active Job Progress Bar */}
              {activeJob && (
                <div className="flex items-center gap-3 bg-zinc-950/50 border border-zinc-900 rounded-xl px-4 py-2.5 flex-shrink-0 animate-fade-in">
                  <RefreshCw size={14} className="text-amber-500 animate-spin flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-zinc-300 truncate">{activeJob.id}</span>
                      <span className="text-xs font-mono text-amber-500 font-bold">{activeJob.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${activeJob.progress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full flex-shrink-0 animate-pulse">
                    {activeJob.status === "processing" ? (activeJob.step || "Processando") : "Na Fila"}
                  </span>
                </div>
              )}

              {/* Media Inputs & Controls Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden">
                {/* Esquerda: Uploads & Configurações */}
                <div className="space-y-4 flex flex-col overflow-hidden h-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-[1.1] min-h-[160px]">
                    <SourceUploader
                      sourceItems={sourceItems}
                      sourceImageFullPath={sourceImageFullPath}
                      onSelectSource={(item) => setSourceImageFullPath(item.file_path)}
                      onRemoveSource={(idx) => {
                        const next = sourceItems.filter((_, i) => i !== idx);
                        setSourceItems(next);
                        if (next.length > 0) setSourceImageFullPath(next[0].file_path);
                        else setSourceImageFullPath(null);
                      }}
                      onUpload={handleSourceUpload}
                      isDragging={isDraggingSource}
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingSource(true); }}
                      onDragLeave={() => setIsDraggingSource(false)}
                      onDrop={handleDropSource}
                    />

                    <TargetMediaViewer
                      targetMedia={targetMedia}
                      targetMediaName={targetMediaName}
                      onUpload={handleTargetUpload}
                      onClear={() => {
                        setTargetMedia(null);
                        setTargetMediaFullPath(null);
                        setTargetMediaName("");
                        setDetectedTargetFaces([]);
                        setFaceMappings({});
                      }}
                      detectedFaces={detectedTargetFaces}
                      faceMappings={faceMappings}
                      onSelectFace={(face) => setSelectedFaceForModal(face)}
                      isAnalyzing={isAnalyzingTargetFaces}
                      onAnalyzeFaces={handleAnalyzeFaces}
                      processFromCurrentPoint={processFromCurrentPoint}
                      setProcessFromCurrentPoint={setProcessFromCurrentPoint}
                      targetVideoTime={targetVideoTime}
                      setTargetVideoTime={setTargetVideoTime}
                      isDragging={isDraggingTarget}
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingTarget(true); }}
                      onDragLeave={() => setIsDraggingTarget(false)}
                      onDrop={handleDropTarget}
                      getScaledBox={getScaledBox}
                      targetContainerRef={targetContainerRef}
                      setTargetDimensions={setTargetDimensions}
                    />
                  </div>

                  <ProcessorSettings
                    availableProcessors={availableProcessors}
                    selectedProcessors={selectedProcessors}
                    onToggleProcessor={toggleProcessor}
                    autoPreview={autoPreview}
                    setAutoPreview={setAutoPreview}
                    presets={presets}
                    selectedPresetName={selectedPresetName}
                    onApplyPreset={handleApplyPreset}
                    newPresetName={newPresetName}
                    setNewPresetName={setNewPresetName}
                    onSavePreset={handleSaveCurrentPreset}
                    faceSwapperWeight={faceSwapperWeight}
                    setFaceSwapperWeight={setFaceSwapperWeight}
                    faceMaskBlur={faceMaskBlur}
                    setFaceMaskBlur={setFaceMaskBlur}
                    detectionThreshold={detectionThreshold}
                    setDetectionThreshold={setDetectionThreshold}
                    smoothing={smoothing}
                    setSmoothing={setSmoothing}
                    faceSwapperModel={faceSwapperModel}
                    setFaceSwapperModel={setFaceSwapperModel}
                    faceSwapperPixelBoost={faceSwapperPixelBoost}
                    setFaceSwapperPixelBoost={setFaceSwapperPixelBoost}
                    faceEnhancerModel={faceEnhancerModel}
                    setFaceEnhancerModel={setFaceEnhancerModel}
                    faceEnhancerBlend={faceEnhancerBlend}
                    setFaceEnhancerBlend={setFaceEnhancerBlend}
                    faceEnhancerWeight={faceEnhancerWeight}
                    setFaceEnhancerWeight={setFaceEnhancerWeight}
                    frameEnhancerModel={frameEnhancerModel}
                    setFrameEnhancerModel={setFrameEnhancerModel}
                    frameEnhancerBlend={frameEnhancerBlend}
                    setFrameEnhancerBlend={setFrameEnhancerBlend}
                    faceEditorModel={faceEditorModel}
                    setFaceEditorModel={setFaceEditorModel}
                    faceEditorSmile={faceEditorSmile}
                    setFaceEditorSmile={setFaceEditorSmile}
                    ageModifierModel={ageModifierModel}
                    setAgeModifierModel={setAgeModifierModel}
                    ageModifierDirection={ageModifierDirection}
                    setAgeModifierDirection={setAgeModifierDirection}
                    expressionRestorerFactor={expressionRestorerFactor}
                    setExpressionRestorerFactor={setExpressionRestorerFactor}
                  />

                  {/* Actions Bar */}
                  <div className="flex gap-3 flex-shrink-0 pt-2">
                    <button
                      onClick={() => handleGeneratePreview(false)}
                      disabled={isPreviewLoading || !sourceImageFullPath || !targetMediaFullPath}
                      className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold py-3 rounded-xl text-xs transition-all border border-zinc-800 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isPreviewLoading ? <RefreshCw size={14} className="animate-spin text-amber-500" /> : <Play size={14} />}
                      GERAR PREVIEW
                    </button>

                    <button
                      onClick={handleGenerateSwap}
                      disabled={isGenerating || !sourceImageFullPath || !targetMediaFullPath}
                      className="flex-[2] bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold py-3 rounded-xl text-xs tracking-wider transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      INICIAR PROCESSAMENTO
                    </button>
                  </div>
                </div>

                {/* Direita: Preview Comparativo */}
                <VideoComparator
                  previewOutputUrl={previewOutputUrl}
                  onDownloadOutput={handleDownloadOutput}
                  outputFormat={outputFormat}
                  setOutputFormat={setOutputFormat}
                  outputQuality={outputQuality}
                  setOutputQuality={setOutputQuality}
                />
              </div>
            </div>
          )}

          {/* TAB 2: PROJETOS */}
          {activeTab === "projects" && (
            <JobsList
              jobs={jobs}
              onLoadToComparator={handleLoadToComparator}
              onRequestDelete={(id) => setJobToDelete(id)}
              onCancelJob={async (id) => {
                const ok = await cancelJob(id);
                if (ok) showToast("info", "Cancelamento", `Sinal de cancelamento enviado para ${id}.`);
                else showToast("error", "Erro", "Não foi possível cancelar.");
              }}
            />
          )}

          {/* TAB 3: CONFIGURAÇÕES */}
          {activeTab === "settings" && (
            <SettingsModal
              apiUrl={apiUrl}
              configTempPath={configTempPath}
              setConfigTempPath={setConfigTempPath}
              configJobsPath={configJobsPath}
              setConfigJobsPath={setConfigJobsPath}
              configMemoryStrategy={configMemoryStrategy}
              setConfigMemoryStrategy={setConfigMemoryStrategy}
              configThreadCount={configThreadCount}
              setConfigThreadCount={setConfigThreadCount}
              configLogLevel={configLogLevel}
              setConfigLogLevel={setConfigLogLevel}
              configProviders={configProviders}
              setConfigProviders={setConfigProviders}
              availableProviders={availableProviders}
              isSavingConfig={isSavingConfig}
              onSaveConfig={handleSaveConfig}
              onExportDiagnostic={handleExportDiagnostic}
              showToast={showToast}
            />
          )}
        </div>
      </main>

      {/* Modal de Mapeamento de Rosto */}
      <FaceMappingModal
        apiUrl={apiUrl}
        selectedFace={selectedFaceForModal}
        onClose={() => setSelectedFaceForModal(null)}
        sourceItems={sourceItems}
        faceMappings={faceMappings}
        onSelectMapping={(faceIdx, sourcePath) => {
          setFaceMappings(prev => {
            const next = { ...prev };
            if (sourcePath) {
              next[faceIdx] = sourcePath;
            } else {
              delete next[faceIdx];
            }
            return next;
          });
          setSelectedFaceForModal(null);
        }}
      />

      {/* Modal de Confirmação de Exclusão */}
      {jobToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-black/80">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500" /> Confirmar Exclusão
            </h3>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Deseja realmente excluir a tarefa <span className="text-red-500 font-mono font-bold">{jobToDelete}</span>?
              Esta ação removerá todos os arquivos e mídias associados do disco.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setJobToDelete(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteJobConfirmed}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 transition-all cursor-pointer"
              >
                Excluir Tarefa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
