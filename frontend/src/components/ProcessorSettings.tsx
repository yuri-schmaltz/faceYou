import React, { useState } from "react";
import { Cpu, Sliders, Save, ChevronDown, ChevronUp, Sparkles, Wand2, RefreshCw } from "lucide-react";
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
  // Estado para controlar abertura/fechamento das sanfonas de cada processador (Opção 1)
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    face_swapper: true,
    face_enhancer: true,
    frame_enhancer: false,
    face_editor: false,
    age_modifier: false,
    expression_restorer: false,
  });

  const toggleExpand = (proc: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [proc]: !prev[proc],
    }));
  };

  const getProcessorTitle = (proc: string) => {
    switch (proc) {
      case "face_swapper": return "FACE SWAPPER";
      case "face_enhancer": return "FACE ENHANCER";
      case "frame_enhancer": return "FRAME ENHANCER";
      case "face_editor": return "FACE EDITOR";
      case "age_modifier": return "AGE MODIFIER";
      case "expression_restorer": return "EXPRESSION RESTORER";
      case "lip_syncer": return "LIP SYNCER";
      default: return proc.replace(/_/g, " ").toUpperCase();
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3 overflow-hidden select-none">
      {/* 1. Header do Inspetor: Chips de Processadores Ativos */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex flex-col gap-2 flex-shrink-0 shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-extrabold text-xs tracking-wide">
            <Cpu size={14} className="text-red-500" />
            <span>Processadores</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
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

        {/* Grade de Ativação Rápida */}
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
                    ? "bg-red-600/20 border-red-500/50 text-red-400 shadow-sm"
                    : "bg-zinc-950/40 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                }`}
              >
                <span className="truncate">{proc.replace(/_/g, " ").toUpperCase()}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ml-1 transition-colors ${
                    isSelected ? "bg-red-500 shadow-sm shadow-red-500" : "bg-zinc-700"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Barra de Presets em Pills Rápidos (Estilo Opção 1) */}
      <div className="flex items-center gap-2 bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-2.5 justify-between flex-shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1 min-w-0">
          <Wand2 size={12} className="text-amber-400 flex-shrink-0" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex-shrink-0">Presets:</span>
          {presets.slice(0, 3).map((p) => (
            <button
              key={p.name}
              onClick={() => onApplyPreset(p.name)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedPresetName === p.name
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50"
              }`}
            >
              {p.name.replace(/ \(Padrão\)/, "").replace(/ Ultra/, "")}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <input
            type="text"
            placeholder="Salvar preset..."
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-[10px] rounded-lg px-2 py-1 w-20 focus:outline-none focus:border-red-500 transition-colors placeholder:text-zinc-600 font-mono"
          />
          <button
            onClick={onSavePreset}
            className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-sm shadow-red-600/30"
            title="Salvar configurações atuais como novo Preset"
          >
            <Save size={10} />
          </button>
        </div>
      </div>

      {/* 3. Cards Expansíveis dos Processadores (Sanfona Estilo Opção 1) */}
      <div className="flex-1 overflow-y-auto pr-1.5 space-y-3 scrollbar-thin">
        {selectedProcessors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-center p-6 space-y-2">
            <Sliders size={28} className="text-zinc-600" />
            <span className="text-xs font-bold text-zinc-400">Nenhum processador ativo</span>
            <p className="text-[11px] text-zinc-600">
              Ative um ou mais processadores acima para ajustar os parâmetros e modelos de IA.
            </p>
          </div>
        ) : null}

        {/* CARD 1: FACE SWAPPER */}
        {selectedProcessors.includes("face_swapper") && (
          <div className="bg-zinc-950/60 border border-red-500/40 shadow-lg shadow-red-600/10 rounded-xl overflow-hidden transition-all">
            {/* Header do Card com Chevron */}
            <div
              onClick={() => toggleExpand("face_swapper")}
              className="px-3.5 py-2.5 bg-zinc-900/50 hover:bg-zinc-900/80 cursor-pointer flex items-center justify-between border-b border-zinc-850"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500" />
                <span className="text-xs font-black text-white tracking-wider">
                  {getProcessorTitle("face_swapper")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="text-[10px] font-mono text-zinc-500">{faceSwapperModel}</span>
                {expandedCards["face_swapper"] !== false ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </div>

            {/* Conteúdo Expansível */}
            {expandedCards["face_swapper"] !== false && (
              <div className="p-3.5 space-y-3 animate-fade-in">
                {/* Seletores de Modelo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">Model</label>
                    <select
                      value={faceSwapperModel}
                      onChange={(e) => setFaceSwapperModel(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded-lg font-bold text-zinc-200 outline-none cursor-pointer focus:border-red-500"
                    >
                      <option value="inswapper_128_fp16">inswapper_128_fp16</option>
                      <option value="inswapper_128">inswapper_128</option>
                      <option value="simswap_256">simswap_256</option>
                      <option value="simswap_unofficial_512">simswap_512 (HQ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">Pixel Boost</label>
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

                {/* Sliders com Alta Visibilidade */}
                <div className="space-y-2.5 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-zinc-300">Intensity (Peso do Rosto)</span>
                      <span className="text-red-400 font-mono font-bold">{(faceSwapperWeight * 100).toFixed(0)}%</span>
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

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-zinc-300">Mask Blur (Suavização de Borda)</span>
                      <span className="text-red-400 font-mono font-bold">{faceMaskBlur}px</span>
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

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-zinc-300">Detection Threshold</span>
                      <span className="text-red-400 font-mono font-bold">{detectionThreshold.toFixed(2)}</span>
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

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-zinc-300">Smoothing (Estabilidade Temporal)</span>
                      <span className="text-red-400 font-mono font-bold">{smoothing} frames</span>
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
                </div>
              </div>
            )}
          </div>
        )}

        {/* CARD 2: FACE ENHANCER */}
        {selectedProcessors.includes("face_enhancer") && (
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl overflow-hidden transition-all hover:border-zinc-700">
            <div
              onClick={() => toggleExpand("face_enhancer")}
              className="px-3.5 py-2.5 bg-zinc-900/50 hover:bg-zinc-900/80 cursor-pointer flex items-center justify-between border-b border-zinc-850"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
                <span className="text-xs font-black text-white tracking-wider">
                  {getProcessorTitle("face_enhancer")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="text-[10px] font-mono text-zinc-500">{faceEnhancerModel}</span>
                {expandedCards["face_enhancer"] !== false ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </div>

            {expandedCards["face_enhancer"] !== false && (
              <div className="p-3.5 space-y-3 animate-fade-in">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">Model</label>
                  <select
                    value={faceEnhancerModel}
                    onChange={(e) => setFaceEnhancerModel(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded-lg font-bold text-zinc-200 outline-none cursor-pointer focus:border-emerald-500"
                  >
                    <option value="gfpgan_1.4">GFPGAN 1.4 (Pele Natural)</option>
                    <option value="codeformer">CodeFormer (Robusto)</option>
                    <option value="gpen_bfr_512">GPEN 512</option>
                    <option value="restoreformer_plus_plus">RestoreFormer++</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-zinc-300">Blend (Intensidade de Restauração)</span>
                    <span className="text-emerald-400 font-mono font-bold">{faceEnhancerBlend}%</span>
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
              </div>
            )}
          </div>
        )}

        {/* CARD 3: FRAME ENHANCER */}
        {selectedProcessors.includes("frame_enhancer") && (
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl overflow-hidden transition-all hover:border-zinc-700">
            <div
              onClick={() => toggleExpand("frame_enhancer")}
              className="px-3.5 py-2.5 bg-zinc-900/50 hover:bg-zinc-900/80 cursor-pointer flex items-center justify-between border-b border-zinc-850"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500" />
                <span className="text-xs font-black text-white tracking-wider">
                  {getProcessorTitle("frame_enhancer")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="text-[10px] font-mono text-zinc-500">{frameEnhancerModel}</span>
                {expandedCards["frame_enhancer"] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </div>

            {expandedCards["frame_enhancer"] && (
              <div className="p-3.5 space-y-3 animate-fade-in">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">Super Resolution Model</label>
                  <select
                    value={frameEnhancerModel}
                    onChange={(e) => setFrameEnhancerModel(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded-lg font-bold text-zinc-200 outline-none cursor-pointer focus:border-blue-500"
                  >
                    <option value="span_kendata_x4">SPAN Kendata x4 (Rápido)</option>
                    <option value="real_esrgan_x4">Real-ESRGAN x4</option>
                    <option value="real_esrgan_x4_fp16">Real-ESRGAN x4 FP16</option>
                    <option value="nomos8k_sc_x4">Nomos8k SC x4</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-zinc-300">Blend de Upscaling</span>
                    <span className="text-blue-400 font-mono font-bold">{frameEnhancerBlend}%</span>
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
              </div>
            )}
          </div>
        )}

        {/* CARD 4: AGE MODIFIER */}
        {selectedProcessors.includes("age_modifier") && (
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl overflow-hidden transition-all hover:border-zinc-700">
            <div
              onClick={() => toggleExpand("age_modifier")}
              className="px-3.5 py-2.5 bg-zinc-900/50 hover:bg-zinc-900/80 cursor-pointer flex items-center justify-between border-b border-zinc-850"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 shadow-sm shadow-purple-500" />
                <span className="text-xs font-black text-white tracking-wider">
                  {getProcessorTitle("age_modifier")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="text-[10px] font-mono text-zinc-500">styleganex</span>
                {expandedCards["age_modifier"] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </div>

            {expandedCards["age_modifier"] && (
              <div className="p-3.5 space-y-3 animate-fade-in">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-zinc-300">Age Scale (Mais Jovem / Mais Velho)</span>
                    <span className="text-purple-400 font-mono font-bold">{ageModifierDirection > 0 ? `+${ageModifierDirection}` : ageModifierDirection}</span>
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
            )}
          </div>
        )}

        {/* CARD 5: FACE EDITOR */}
        {selectedProcessors.includes("face_editor") && (
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl overflow-hidden transition-all hover:border-zinc-700">
            <div
              onClick={() => toggleExpand("face_editor")}
              className="px-3.5 py-2.5 bg-zinc-900/50 hover:bg-zinc-900/80 cursor-pointer flex items-center justify-between border-b border-zinc-850"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500" />
                <span className="text-xs font-black text-white tracking-wider">
                  {getProcessorTitle("face_editor")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="text-[10px] font-mono text-zinc-500">live_portrait</span>
                {expandedCards["face_editor"] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </div>

            {expandedCards["face_editor"] && (
              <div className="p-3.5 space-y-3 animate-fade-in">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-zinc-300">Smile Intensity</span>
                    <span className="text-amber-400 font-mono font-bold">{faceEditorSmile}</span>
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
              </div>
            )}
          </div>
        )}

        {/* CARD 6: EXPRESSION RESTORER */}
        {selectedProcessors.includes("expression_restorer") && (
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl overflow-hidden transition-all hover:border-zinc-700">
            <div
              onClick={() => toggleExpand("expression_restorer")}
              className="px-3.5 py-2.5 bg-zinc-900/50 hover:bg-zinc-900/80 cursor-pointer flex items-center justify-between border-b border-zinc-850"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500 shadow-sm shadow-pink-500" />
                <span className="text-xs font-black text-white tracking-wider">
                  {getProcessorTitle("expression_restorer")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="text-[10px] font-mono text-zinc-500">live_portrait</span>
                {expandedCards["expression_restorer"] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </div>

            {expandedCards["expression_restorer"] && (
              <div className="p-3.5 space-y-3 animate-fade-in">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-zinc-300">Restoration Factor</span>
                    <span className="text-pink-400 font-mono font-bold">{(expressionRestorerFactor * 100).toFixed(0)}%</span>
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};
