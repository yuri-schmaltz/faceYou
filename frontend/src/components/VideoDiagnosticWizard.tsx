"use client";

import React, { useState } from "react";
import {
  Sparkles,
  X,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Play,
  Film,
  Activity,
  Layers,
  Info,
  ChevronRight,
  RefreshCw,
  Gauge,
  ScanFace
} from "lucide-react";
import { VideoDiagnosticReport, SceneDiagnostic } from "../types";

interface VideoDiagnosticWizardProps {
  isOpen: boolean;
  onClose: () => void;
  report: VideoDiagnosticReport | null;
  isLoading: boolean;
  onApplyRecommendation: (config: {
    face_detector_model: string;
    face_detector_size: string;
    detection_threshold: number;
    reference_face_distance: number;
    smoothing: number;
    face_detector_angles: number[];
    face_landmarker_score: number;
  }) => void;
  onJumpToSceneTimestamp?: (seconds: number) => void;
}

export const VideoDiagnosticWizard: React.FC<VideoDiagnosticWizardProps> = ({
  isOpen,
  onClose,
  report,
  isLoading,
  onApplyRecommendation,
  onJumpToSceneTimestamp,
}) => {
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl shadow-black overflow-hidden">
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-zinc-850 bg-gradient-to-r from-zinc-900/90 to-zinc-950 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Assistente de Pré-Análise & Diagnóstico de Vídeo
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  AI Wizard
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Varredura profunda quadro a quadro para detectar ruído de fita, micro-faces e evitar oscilação de tracking.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <RefreshCw size={44} className="animate-spin text-purple-500" />
                <Film size={20} className="absolute inset-0 m-auto text-white opacity-80" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-white">Analisando o Vídeo em Alta Precisão...</h3>
                <p className="text-xs text-zinc-400 max-w-md">
                  Detectando cortes de cena, medição de ruído analógico (Laplaciano), densidade facial e pontos críticos de perda de tracking.
                </p>
              </div>
            </div>
          ) : report ? (
            <>
              {/* Cards de Métricas Principais do Vídeo */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1 flex items-center gap-1">
                    <Film size={12} className="text-purple-400" /> Cenas / Takes
                  </span>
                  <span className="text-lg font-black font-mono text-white">
                    {report.total_scenes} <span className="text-xs font-normal text-zinc-400">cortes</span>
                  </span>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1 flex items-center gap-1">
                    <Activity size={12} className="text-amber-400" /> Ruído Analógico / VHS
                  </span>
                  <span className={`text-sm font-bold flex items-center gap-1.5 mt-0.5 ${
                    report.vhs_noise_detected ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {report.vhs_noise_detected ? (
                      <>
                        <AlertTriangle size={14} /> Detectado
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} /> Sinal Limpo
                      </>
                    )}
                  </span>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1 flex items-center gap-1">
                    <ScanFace size={12} className="text-blue-400" /> Takes Distantes
                  </span>
                  <span className={`text-sm font-bold flex items-center gap-1.5 mt-0.5 ${
                    report.distant_shots_detected ? "text-cyan-400" : "text-zinc-300"
                  }`}>
                    {report.distant_shots_detected ? "Sim (Planos Abertos)" : "Predomínio Close-ups"}
                  </span>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block mb-1 flex items-center gap-1">
                    <Gauge size={12} className="text-red-400" /> Risco de Flickering
                  </span>
                  <span className={`text-sm font-bold font-mono mt-0.5 block ${
                    report.critical_flicker_scenes_count > 0 ? "text-red-400" : "text-emerald-400"
                  }`}>
                    {report.critical_flicker_scenes_count} tomadas vulneráveis
                  </span>
                </div>
              </div>

              {/* Banner de Recomendação Global Otimizada */}
              <div className="bg-gradient-to-r from-purple-950/40 via-zinc-900/90 to-indigo-950/40 border border-purple-500/40 rounded-xl p-4 shadow-lg shadow-purple-950/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                      <Sparkles size={12} /> Diagnóstico e Calibração Global Proposta:
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-bold">
                        Detector: <span className="text-purple-400">{report.overall_recommendation.face_detector_model}</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-bold">
                        Limiar (Score): <span className="text-purple-400">{report.overall_recommendation.detection_threshold}</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-bold">
                        Distância Biométrica: <span className="text-purple-400">{report.overall_recommendation.reference_face_distance}</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-bold">
                        Smoothing: <span className="text-purple-400">{report.overall_recommendation.smoothing}</span>
                      </span>
                    </div>
                    {/* Rationale */}
                    <div className="pt-2 space-y-1">
                      {report.overall_recommendation.rationale.map((r, i) => (
                        <p key={i} className="text-xs text-zinc-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                          {r}
                        </p>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onApplyRecommendation(report.overall_recommendation)}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap active:scale-95"
                  >
                    <Sliders size={14} /> Aplicar Parâmetros Recomendados
                  </button>
                </div>
              </div>

              {/* Tabela de Takes / Cenas Detectadas */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers size={14} className="text-zinc-500" /> Decomposição por Tomada (Takes Detectados):
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {report.scenes.map((scene) => (
                    <div
                      key={scene.scene_index}
                      onClick={() => {
                        setSelectedSceneIndex(scene.scene_index);
                        if (onJumpToSceneTimestamp) onJumpToSceneTimestamp(scene.keyframe_time);
                      }}
                      className={`bg-zinc-900/50 border rounded-xl p-3 space-y-2 transition-all cursor-pointer hover:border-zinc-700 ${
                        scene.tracking_stability === "high_risk"
                          ? "border-red-500/40 bg-red-950/10"
                          : scene.tracking_stability === "flickering_risk"
                          ? "border-amber-500/40 bg-amber-950/10"
                          : "border-zinc-800"
                      }`}
                    >
                      {/* Topo do Card da Cena */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold font-mono text-zinc-400">
                          Take #{scene.scene_index} ({scene.start_time}s - {scene.end_time}s)
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            scene.tracking_stability === "stable"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : scene.tracking_stability === "flickering_risk"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {scene.tracking_stability === "stable"
                            ? "Estável"
                            : scene.tracking_stability === "flickering_risk"
                            ? "Risco de Alternância"
                            : "Alto Risco"}
                        </span>
                      </div>

                      {/* Miniatura e Detalhes */}
                      <div className="flex gap-3">
                        {scene.keyframe_thumb_url ? (
                          <img
                            src={scene.keyframe_thumb_url}
                            alt={`Take ${scene.scene_index}`}
                            className="w-24 h-16 object-cover rounded-lg border border-zinc-800 flex-shrink-0 bg-black"
                          />
                        ) : (
                          <div className="w-24 h-16 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-600 flex-shrink-0">
                            <Film size={18} />
                          </div>
                        )}

                        <div className="text-[10.5px] space-y-0.5 flex-1 min-w-0">
                          <p className="text-zinc-300 font-bold truncate">
                            Enquadramento:{" "}
                            <span className="font-normal text-zinc-400 capitalize">
                              {scene.shot_type.replace("_", " ")}
                            </span>
                          </p>
                          <p className="text-zinc-300 font-bold">
                            Face:{" "}
                            <span className="font-mono text-purple-400">
                              {scene.primary_face_box_size.width}×{scene.primary_face_box_size.height}px
                            </span>
                          </p>
                          <p className="text-zinc-400 text-[9.5px]">
                            Ruído VHS: <span className="font-mono">{scene.noise_blur_level} ({scene.laplacian_var})</span>
                          </p>
                        </div>
                      </div>

                      {/* Recomendação Específica deste Take */}
                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[9.5px]">
                        <span className="text-zinc-500 font-mono">
                          Rec: {scene.recommended_config.face_detector_model} ({scene.recommended_config.detection_threshold})
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onApplyRecommendation(scene.recommended_config);
                          }}
                          className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          Usar neste Take <ChevronRight size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-zinc-500 space-y-2">
              <Info size={32} className="mx-auto text-zinc-600" />
              <p className="text-sm">Nenhum vídeo analisado ainda.</p>
              <p className="text-xs text-zinc-600">Selecione uma mídia de destino e execute o assistente.</p>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="px-6 py-3.5 border-t border-zinc-850 bg-zinc-950 flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-zinc-500">
            {report ? `${report.total_scenes} tomadas diagnosticadas com precisão temporal.` : ""}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-bold transition-all cursor-pointer"
          >
            Fechar Assistente
          </button>
        </div>
      </div>
    </div>
  );
};
