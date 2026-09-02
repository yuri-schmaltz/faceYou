import React from "react";
import { Cpu, Sliders, Save } from "lucide-react";
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
  return (
    <div className="space-y-4 flex flex-col flex-1 overflow-hidden">
      {/* Processadores de Frame */}
      <div className="bg-zinc-950/30 border border-zinc-900 rounded-xl p-4 flex flex-col flex-[0.8] min-h-[110px] overflow-hidden">
        <div className="flex items-center gap-2 text-white font-bold border-b border-zinc-900 pb-1.5 mb-2">
          <Cpu size={14} className="text-red-500" />
          <h3 className="text-xs">Processadores Ativos</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1 overflow-y-auto pr-1">
          {availableProcessors.map((proc) => (
            <button
              key={proc}
              type="button"
              onClick={() => onToggleProcessor(proc)}
              className={`flex items-center justify-between p-2 rounded-lg border text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
                selectedProcessors.includes(proc)
                  ? "bg-red-500/10 border-red-500/40 text-red-400"
                  : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
              }`}
            >
              <span className="truncate">{proc.replace(/_/g, " ").toUpperCase()}</span>
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ml-1.5 transition-colors ${
                  selectedProcessors.includes(proc) ? "bg-red-500" : "bg-zinc-700"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Parâmetros e Sliders */}
      <div className="bg-zinc-950/30 border border-zinc-900 rounded-xl p-4 flex flex-col flex-[1.2] min-h-[160px]">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5 mb-3">
          <div className="flex items-center gap-2 text-white font-bold">
            <Sliders size={14} className="text-red-500" />
            <h3 className="text-xs">Ajustes Técnicos do Pipeline</h3>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoPreview}
              onChange={(e) => setAutoPreview(e.target.checked)}
              className="w-3 h-3 accent-red-600 rounded cursor-pointer"
            />
            <span className="text-[10px] text-zinc-400 font-bold hover:text-zinc-200 transition-colors">
              Preview Automático
            </span>
          </label>
        </div>

        {/* Presets Selection & Saving */}
        <div className="flex items-center gap-3 bg-zinc-900/30 border border-zinc-900 rounded-lg p-2.5 mb-3 justify-between flex-wrap flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Preset:</span>
            <select
              value={selectedPresetName}
              onChange={(e) => onApplyPreset(e.target.value)}
              className="bg-zinc-950 border border-zinc-850 text-zinc-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
            >
              <option value="" disabled>Selecionar preset...</option>
              {presets.map((p, idx) => (
                <option key={idx} value={p.name}>
                  {p.name} {p.isCustom ? "(Custom)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Nome do preset..."
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="bg-zinc-950 border border-zinc-850 text-zinc-300 text-[10px] rounded-lg px-2 py-1 w-28 focus:outline-none focus:border-red-500 transition-colors placeholder:text-zinc-600"
            />
            <button
              onClick={onSavePreset}
              className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-red-500/20"
            >
              <Save size={10} /> Salvar
            </button>
          </div>
        </div>

        {/* Controls scroll container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin max-h-[300px]">
          {/* Face Swapper */}
          {selectedProcessors.includes("face_swapper") && (
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-1">
                Ajustes de Face Swapper (Substituição de Rosto)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-zinc-400">Peso do Rosto</span>
                    <span className="text-red-400 font-mono font-bold">{(faceSwapperWeight * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={faceSwapperWeight}
                    onChange={(e) => setFaceSwapperWeight(parseFloat(e.target.value))}
                    className="w-full accent-red-600 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-zinc-400">Suavização da Máscara</span>
                    <span className="text-red-400 font-mono font-bold">{faceMaskBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={faceMaskBlur}
                    onChange={(e) => setFaceMaskBlur(parseInt(e.target.value))}
                    className="w-full accent-red-600 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-zinc-400">Sensibilidade de Detecção</span>
                    <span className="text-red-400 font-mono font-bold">{detectionThreshold.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={detectionThreshold}
                    onChange={(e) => setDetectionThreshold(parseFloat(e.target.value))}
                    className="w-full accent-red-600 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-zinc-400">Estabilidade Temporal</span>
                    <span className="text-red-400 font-mono font-bold">{smoothing} frames</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={smoothing}
                    onChange={(e) => setSmoothing(parseInt(e.target.value))}
                    className="w-full accent-red-600 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400 font-semibold block">Modelo Swapper</label>
                  <select
                    value={faceSwapperModel}
                    onChange={(e) => setFaceSwapperModel(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded font-bold text-zinc-200 outline-none cursor-pointer"
                  >
                    <option value="inswapper_128_fp16">inswapper_128_fp16 (Rápido)</option>
                    <option value="inswapper_128">inswapper_128</option>
                    <option value="simswap_256">simswap_256</option>
                    <option value="simswap_unofficial_512">simswap_unofficial_512 (Alta Resolução)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400 font-semibold block">Pixel Boost</label>
                  <select
                    value={faceSwapperPixelBoost}
                    onChange={(e) => setFaceSwapperPixelBoost(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded font-bold text-zinc-200 outline-none cursor-pointer"
                  >
                    <option value="">Desativado</option>
                    <option value="512x512">512x512</option>
                    <option value="1024x1024">1024x1024</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Face Enhancer */}
          {selectedProcessors.includes("face_enhancer") && (
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider border-b border-zinc-900 pb-1">
                Ajustes de Face Enhancer (Nitidez do Rosto)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400 font-semibold block">Modelo Enhancer</label>
                  <select
                    value={faceEnhancerModel}
                    onChange={(e) => setFaceEnhancerModel(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded font-bold text-zinc-200 outline-none cursor-pointer"
                  >
                    <option value="gfpgan_1.4">GFPGAN 1.4 (Natural)</option>
                    <option value="codeformer">CodeFormer (Robusto)</option>
                    <option value="gpen_bfr_512">GPEN 512</option>
                    <option value="restoreformer_plus_plus">RestoreFormer++</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-zinc-400">Intensidade (Blend)</span>
                    <span className="text-emerald-400 font-mono font-bold">{faceEnhancerBlend}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={faceEnhancerBlend}
                    onChange={(e) => setFaceEnhancerBlend(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Frame Enhancer */}
          {selectedProcessors.includes("frame_enhancer") && (
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider border-b border-zinc-900 pb-1">
                Ajustes de Frame Enhancer (Super Resolução da Imagem)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400 font-semibold block">Modelo Super Resolução</label>
                  <select
                    value={frameEnhancerModel}
                    onChange={(e) => setFrameEnhancerModel(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded font-bold text-zinc-200 outline-none cursor-pointer"
                  >
                    <option value="span_kendata_x4">SPAN Kendata x4</option>
                    <option value="real_esrgan_x4">Real-ESRGAN x4</option>
                    <option value="real_esrgan_x4_fp16">Real-ESRGAN x4 FP16</option>
                    <option value="nomos8k_sc_x4">Nomos8k SC x4</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-zinc-400">Intensidade (Blend)</span>
                    <span className="text-blue-400 font-mono font-bold">{frameEnhancerBlend}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={frameEnhancerBlend}
                    onChange={(e) => setFrameEnhancerBlend(parseInt(e.target.value))}
                    className="w-full accent-blue-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Face Editor (Expressões) */}
          {selectedProcessors.includes("face_editor") && (
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider border-b border-zinc-900 pb-1">
                Ajustes de Face Editor (Expressões Faciais)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400 font-semibold block">Modelo Editor</label>
                  <select
                    value={faceEditorModel}
                    onChange={(e) => setFaceEditorModel(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded font-bold text-zinc-200 outline-none cursor-pointer"
                  >
                    <option value="live_portrait">LivePortrait</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-zinc-400">Sorriso</span>
                    <span className="text-purple-400 font-mono font-bold">{faceEditorSmile}</span>
                  </div>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.05"
                    value={faceEditorSmile}
                    onChange={(e) => setFaceEditorSmile(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Age Modifier */}
          {selectedProcessors.includes("age_modifier") && (
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider border-b border-zinc-900 pb-1">
                Ajustes de Age Modifier (Modificação de Idade)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400 font-semibold block">Modelo de Idade</label>
                  <select
                    value={ageModifierModel}
                    onChange={(e) => setAgeModifierModel(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded font-bold text-zinc-200 outline-none cursor-pointer"
                  >
                    <option value="styleganex_age">StyleGANEX Age</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-zinc-400">Direção da Idade (Jovem / Maduro)</span>
                    <span className="text-amber-400 font-mono font-bold">
                      {ageModifierDirection > 0 ? `+${ageModifierDirection}` : ageModifierDirection}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={ageModifierDirection}
                    onChange={(e) => setAgeModifierDirection(parseInt(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Expression Restorer */}
          {selectedProcessors.includes("expression_restorer") && (
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider border-b border-zinc-900 pb-1">
                Ajustes de Expression Restorer (Fidelidade Emocional)
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-zinc-400">Fator de Restauração</span>
                  <span className="text-cyan-400 font-mono font-bold">{(expressionRestorerFactor * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={expressionRestorerFactor}
                  onChange={(e) => setExpressionRestorerFactor(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
