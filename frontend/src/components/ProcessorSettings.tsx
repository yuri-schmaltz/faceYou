import React, { useState } from "react";
import { Cpu, Sliders, Save, Sparkles, Wand2, RefreshCw } from "lucide-react";
import { Preset } from "../types";

interface ProcessorSettingsProps {
  availableProcessors: string[];
  selectedProcessors: string[];
  onToggleProcessor: (proc: string) => void;
  autoPreview: boolean;
  setAutoPreview: (val: boolean) => void;
  // Presets
  presets: Preset[];
  selectedPresetName: string;
  onApplyPreset: (name: string) => void;
  newPresetName: string;
  setNewPresetName: (name: string) => void;
  onSavePreset: () => void;
  // Swapper state
  faceSwapperWeight: number;
  setFaceSwapperWeight: (val: number) => void;
  faceMaskBlur: number;
  setFaceMaskBlur: (val: number) => void;
  detectionThreshold: number;
  setDetectionThreshold: (val: number) => void;
  smoothing: number;
  setSmoothing: (val: number) => void;
  faceSwapperModel: string;
  setFaceSwapperModel: (val: string) => void;
  faceSwapperPixelBoost: string;
  setFaceSwapperPixelBoost: (val: string) => void;
  // Enhancers state
  faceEnhancerModel: string;
  setFaceEnhancerModel: (val: string) => void;
  faceEnhancerBlend: number;
  setFaceEnhancerBlend: (val: number) => void;
  faceEnhancerWeight: number;
  setFaceEnhancerWeight: (val: number) => void;
  frameEnhancerModel: string;
  setFrameEnhancerModel: (val: string) => void;
  frameEnhancerBlend: number;
  setFrameEnhancerBlend: (val: number) => void;
  // Face Editor state
  faceEditorModel: string;
  setFaceEditorModel: (val: string) => void;
  faceEditorSmile: number;
  setFaceEditorSmile: (val: number) => void;
  // Age Modifier state
  ageModifierModel: string;
  setAgeModifierModel: (val: string) => void;
  ageModifierDirection: number;
  setAgeModifierDirection: (val: number) => void;
  // Expression Restorer state
  expressionRestorerFactor: number;
  setExpressionRestorerFactor: (val: number) => void;
}

export const ProcessorSettings: React.FC<ProcessorSettingsProps> = ({
  availableProcessors,
  selectedProcessors,
  onToggleProcessor,
  autoPreview,
  setAutoPreview,
  presets,
  selectedPresetName,
  onApplyPreset,
  newPresetName,
  setNewPresetName,
  onSavePreset,
  faceSwapperWeight,
  setFaceSwapperWeight,
  faceMaskBlur,
  setFaceMaskBlur,
  detectionThreshold,
  setDetectionThreshold,
  smoothing,
  setSmoothing,
  faceSwapperModel,
  setFaceSwapperModel,
  faceSwapperPixelBoost,
  setFaceSwapperPixelBoost,
  faceEnhancerModel,
  setFaceEnhancerModel,
  faceEnhancerBlend,
  setFaceEnhancerBlend,
  faceEnhancerWeight,
  setFaceEnhancerWeight,
  frameEnhancerModel,
  setFrameEnhancerModel,
  frameEnhancerBlend,
  setFrameEnhancerBlend,
  faceEditorModel,
  setFaceEditorModel,
  faceEditorSmile,
  setFaceEditorSmile,
  ageModifierModel,
  setAgeModifierModel,
  ageModifierDirection,
  setAgeModifierDirection,
  expressionRestorerFactor,
  setExpressionRestorerFactor,
}) => {
  const [activeTab, setActiveTab] = useState<string>("face_swapper");

  // Se a aba ativa não estiver selecionada, troca para a primeira selecionada ou "face_swapper"
  const currentTab = selectedProcessors.includes(activeTab) || activeTab === "all"
    ? activeTab
    : selectedProcessors[0] || "face_swapper";

  const getProcessorLabel = (proc: string) => {
    switch (proc) {
      case "face_swapper": return "Substituição (Swapper)";
      case "face_enhancer": return "Nitidez (Enhancer)";
      case "frame_enhancer": return "Super Resolução";
      case "face_editor": return "Editor de Expressão";
      case "age_modifier": return "Modificador de Idade";
      case "expression_restorer": return "Restaurador Facial";
      case "lip_syncer": return "Sincronia Labial";
      default: return proc.replace(/_/g, " ").toUpperCase();
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3 overflow-hidden select-none">
      {/* 1. Header do Inspetor com Toggles Rápidos dos Processadores */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex flex-col gap-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-black text-xs tracking-wide">
            <Cpu size={14} className="text-red-500" />
            <span>Processadores Disponíveis</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
              {selectedProcessors.length} ativos
            </span>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer select-none" title="Atualiza o preview automaticamente ao alterar qualquer controle">
            <input
              type="checkbox"
              checked={autoPreview}
              onChange={(e) => setAutoPreview(e.target.checked)}
              className="w-3.5 h-3.5 accent-red-600 rounded cursor-pointer"
            />
            <span className="text-[10px] text-zinc-400 font-bold hover:text-zinc-200 transition-colors">
              Auto Preview
            </span>
          </label>
        </div>

        {/* Chips de Ligar/Desligar Processadores */}
        <div className="grid grid-cols-3 gap-1.5">
          {availableProcessors.map((proc) => {
            const isSelected = selectedProcessors.includes(proc);
            return (
              <button
                key={proc}
                type="button"
                onClick={() => onToggleProcessor(proc)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-red-600/15 border-red-500/40 text-red-400 shadow-sm"
                    : "bg-zinc-950/40 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                }`}
              >
                <span className="truncate">{proc.replace(/_/g, " ").toUpperCase()}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ml-1 transition-colors ${
                    isSelected ? "bg-red-500 shadow-sm shadow-red-500" : "bg-zinc-750"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Barra de Presets Rápidos */}
      <div className="flex items-center gap-2 bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-2.5 justify-between flex-shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Wand2 size={13} className="text-amber-400 flex-shrink-0" />
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex-shrink-0">Preset:</span>
          <select
            value={selectedPresetName}
            onChange={(e) => onApplyPreset(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-lg px-2 py-1 font-semibold focus:outline-none focus:border-red-500 transition-colors cursor-pointer flex-1 min-w-0 truncate"
          >
            <option value="" disabled>Selecionar preset...</option>
            {presets.map((p, idx) => (
              <option key={idx} value={p.name}>
                {p.name} {p.isCustom ? "(Custom)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <input
            type="text"
            placeholder="Salvar como..."
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-[10px] rounded-lg px-2 py-1 w-24 focus:outline-none focus:border-red-500 transition-colors placeholder:text-zinc-600 font-mono"
          />
          <button
            onClick={onSavePreset}
            className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-sm shadow-red-600/30"
            title="Salvar configurações atuais como novo Preset"
          >
            <Save size={11} /> Salvar
          </button>
        </div>
      </div>

      {/* 3. Sub-Abas dos Processadores Ativos (Foco & Ergonomia) */}
      {selectedProcessors.length > 0 && (
        <div className="flex items-center gap-1 bg-zinc-900/40 p-1 border border-zinc-800/80 rounded-xl overflow-x-auto scrollbar-none flex-shrink-0">
          {selectedProcessors.map((proc) => (
            <button
              key={proc}
              onClick={() => setActiveTab(proc)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                currentTab === proc
                  ? "bg-zinc-800 text-white shadow-md border border-zinc-700/60"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              {getProcessorLabel(proc)}
            </button>
          ))}
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-tight whitespace-nowrap transition-all cursor-pointer ${
              currentTab === "all"
                ? "bg-zinc-800 text-white shadow-md border border-zinc-700/60"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Ver Todos
          </button>
        </div>
      )}

      {/* 4. Painel Expansivo de Controles Técnicos dos Processadores */}
      <div className="flex-1 bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-4 overflow-y-auto pr-2 space-y-5 scrollbar-thin">
        {selectedProcessors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-center p-6 space-y-2">
            <Sliders size={28} className="text-zinc-600" />
            <span className="text-xs font-bold text-zinc-400">Nenhum processador ativado</span>
            <p className="text-[11px] text-zinc-600">
              Ative um ou mais processadores acima para visualizar seus controles e modelos de IA.
            </p>
          </div>
        ) : null}

        {/* 4.1 Face Swapper */}
        {selectedProcessors.includes("face_swapper") && (currentTab === "face_swapper" || currentTab === "all") && (
          <div className="bg-zinc-950/40 border border-zinc-850 rounded-xl p-3.5 space-y-3.5 animate-fade-in shadow-inner">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
              <span className="text-xs font-black text-red-400 tracking-tight flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Face Swapper (Substituição de Rosto)
              </span>
              <span className="text-[10px] font-mono text-zinc-500">inswapper</span>
            </div>

            <div className="space-y-3">
              {/* Sliders Principais */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-zinc-300">Peso do Rosto (Fidelidade da Fonte)</span>
                  <span className="text-red-400 font-mono">{(faceSwapperWeight * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={faceSwapperWeight}
                  onChange={(e) => setFaceSwapperWeight(parseFloat(e.target.value))}
                  className="w-full accent-red-600 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-zinc-300">Suavização da Máscara de Borda</span>
                  <span className="text-red-400 font-mono">{faceMaskBlur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={faceMaskBlur}
                  onChange={(e) => setFaceMaskBlur(parseInt(e.target.value))}
                  className="w-full accent-red-600 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-zinc-300">Sensibilidade do Detector Facial</span>
                  <span className="text-red-400 font-mono">{detectionThreshold.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={detectionThreshold}
                  onChange={(e) => setDetectionThreshold(parseFloat(e.target.value))}
                  className="w-full accent-red-600 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-zinc-300">Estabilidade Temporal (Vídeo Smoothing)</span>
                  <span className="text-red-400 font-mono">{smoothing} frames</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={smoothing}
                  onChange={(e) => setSmoothing(parseInt(e.target.value))}
                  className="w-full accent-red-600 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Seletores de Modelo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">Modelo Swapper</label>
                  <select
                    value={faceSwapperModel}
                    onChange={(e) => setFaceSwapperModel(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded-lg font-bold text-zinc-200 outline-none cursor-pointer focus:border-red-500"
                  >
                    <option value="inswapper_128_fp16">inswapper_128_fp16 (Rápido)</option>
                    <option value="inswapper_128">inswapper_128 (Padrão)</option>
                    <option value="simswap_256">simswap_256</option>
                    <option value="simswap_unofficial_512">simswap_512 (Alta Resolução)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">Pixel Boost (Super Sample)</label>
                  <select
                    value={faceSwapperPixelBoost}
                    onChange={(e) => setFaceSwapperPixelBoost(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded-lg font-bold text-zinc-200 outline-none cursor-pointer focus:border-red-500"
                  >
                    <option value="">Desativado</option>
                    <option value="512x512">512x512</option>
                    <option value="1024x1024">1024x1024</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4.2 Face Enhancer */}
        {selectedProcessors.includes("face_enhancer") && (currentTab === "face_enhancer" || currentTab === "all") && (
          <div className="bg-zinc-950/40 border border-zinc-850 rounded-xl p-3.5 space-y-3.5 animate-fade-in shadow-inner">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
              <span className="text-xs font-black text-emerald-400 tracking-tight flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Face Enhancer (Nitidez e Restauração Facial)
              </span>
              <span className="text-[10px] font-mono text-zinc-500">codeformer / gfpgan</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-zinc-300">Intensidade de Restauração (Blend)</span>
                  <span className="text-emerald-400 font-mono">{faceEnhancerBlend}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={faceEnhancerBlend}
                  onChange={(e) => setFaceEnhancerBlend(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">Modelo de Restauração</label>
                <select
                  value={faceEnhancerModel}
                  onChange={(e) => setFaceEnhancerModel(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded-lg font-bold text-zinc-200 outline-none cursor-pointer focus:border-emerald-500"
                >
                  <option value="gfpgan_1.4">GFPGAN 1.4 (Pele Natural)</option>
                  <option value="codeformer">CodeFormer (Robusto / Detalhado)</option>
                  <option value="gpen_bfr_512">GPEN 512</option>
                  <option value="restoreformer_plus_plus">RestoreFormer++</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 4.3 Frame Enhancer */}
        {selectedProcessors.includes("frame_enhancer") && (currentTab === "frame_enhancer" || currentTab === "all") && (
          <div className="bg-zinc-950/40 border border-zinc-850 rounded-xl p-3.5 space-y-3.5 animate-fade-in shadow-inner">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
              <span className="text-xs font-black text-blue-400 tracking-tight flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Frame Enhancer (Super Resolução de Todo o Quadro)
              </span>
              <span className="text-[10px] font-mono text-zinc-500">real-esrgan</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-zinc-300">Mesclagem do Upscaling (Blend)</span>
                  <span className="text-blue-400 font-mono">{frameEnhancerBlend}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={frameEnhancerBlend}
                  onChange={(e) => setFrameEnhancerBlend(parseInt(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">Modelo de Super Resolução</label>
                <select
                  value={frameEnhancerModel}
                  onChange={(e) => setFrameEnhancerModel(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded-lg font-bold text-zinc-200 outline-none cursor-pointer focus:border-blue-500"
                >
                  <option value="span_kendata_x4">SPAN Kendata x4 (Rápido)</option>
                  <option value="real_esrgan_x4">Real-ESRGAN x4 (Ultra Nitidez)</option>
                  <option value="real_esrgan_x4_fp16">Real-ESRGAN x4 FP16</option>
                  <option value="nomos8k_sc_x4">Nomos8k SC x4</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 4.4 Face Editor */}
        {selectedProcessors.includes("face_editor") && (currentTab === "face_editor" || currentTab === "all") && (
          <div className="bg-zinc-950/40 border border-zinc-850 rounded-xl p-3.5 space-y-3.5 animate-fade-in shadow-inner">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
              <span className="text-xs font-black text-amber-400 tracking-tight flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Face Editor (Expressão & Sorriso)
              </span>
              <span className="text-[10px] font-mono text-zinc-500">live_portrait</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-zinc-300">Intensidade do Sorriso</span>
                  <span className="text-amber-400 font-mono">{faceEditorSmile}</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="1"
                  value={faceEditorSmile}
                  onChange={(e) => setFaceEditorSmile(parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">Modelo do Editor</label>
                <select
                  value={faceEditorModel}
                  onChange={(e) => setFaceEditorModel(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded-lg font-bold text-zinc-200 outline-none cursor-pointer focus:border-amber-500"
                >
                  <option value="live_portrait">LivePortrait (Padrão)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 4.5 Age Modifier */}
        {selectedProcessors.includes("age_modifier") && (currentTab === "age_modifier" || currentTab === "all") && (
          <div className="bg-zinc-950/40 border border-zinc-850 rounded-xl p-3.5 space-y-3.5 animate-fade-in shadow-inner">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
              <span className="text-xs font-black text-purple-400 tracking-tight flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Age Modifier (Idade & Rejuvenescimento)
              </span>
              <span className="text-[10px] font-mono text-zinc-500">styleganex</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-zinc-300">Direção da Idade (Mais jovem / Mais velho)</span>
                  <span className="text-purple-400 font-mono">{ageModifierDirection > 0 ? `+${ageModifierDirection}` : ageModifierDirection}</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="1"
                  value={ageModifierDirection}
                  onChange={(e) => setAgeModifierDirection(parseInt(e.target.value))}
                  className="w-full accent-purple-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4.6 Expression Restorer */}
        {selectedProcessors.includes("expression_restorer") && (currentTab === "expression_restorer" || currentTab === "all") && (
          <div className="bg-zinc-950/40 border border-zinc-850 rounded-xl p-3.5 space-y-3.5 animate-fade-in shadow-inner">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
              <span className="text-xs font-black text-pink-400 tracking-tight flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                Expression Restorer (Fidelidade Emocional)
              </span>
              <span className="text-[10px] font-mono text-zinc-500">live_portrait</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-zinc-300">Fator de Restauração</span>
                  <span className="text-pink-400 font-mono">{(expressionRestorerFactor * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={expressionRestorerFactor}
                  onChange={(e) => setExpressionRestorerFactor(parseFloat(e.target.value))}
                  className="w-full accent-pink-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
