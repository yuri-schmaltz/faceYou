import React from "react";
import { ChevronDown, ScanFace } from "lucide-react";

interface FaceMaskSettingsProps {
  faceMaskTypes?: string[];
  setFaceMaskTypes?: (val: string[]) => void;
  faceMaskPadding?: number[];
  setFaceMaskPadding?: (val: number[]) => void;
  faceDetectorModel?: string;
  setFaceDetectorModel?: (val: string) => void;
  faceDetectorSize?: string;
  setFaceDetectorSize?: (val: string) => void;
  faceDetectorAngles?: number[];
  setFaceDetectorAngles?: (val: number[]) => void;
  faceLandmarkerModel?: string;
  setFaceLandmarkerModel?: (val: string) => void;
  faceLandmarkerScore?: number;
  setFaceLandmarkerScore?: (val: number) => void;
}

export const FaceMaskSettings: React.FC<FaceMaskSettingsProps> = ({
  faceMaskTypes = ["box", "occlusion"],
  setFaceMaskTypes,
  faceMaskPadding = [0, 0, 0, 0],
  setFaceMaskPadding,
  faceDetectorModel = "yolo_face",
  setFaceDetectorModel,
  faceDetectorSize = "640x640",
  setFaceDetectorSize,
  faceDetectorAngles = [0],
  setFaceDetectorAngles,
  faceLandmarkerModel = "2dfan4",
  setFaceLandmarkerModel,
  faceLandmarkerScore = 0.5,
  setFaceLandmarkerScore,
}) => {
  return (
    <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-3.5 space-y-2.5 flex-1 flex flex-col justify-between shadow-inner h-full">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5 flex-shrink-0">
        <span className="text-[11px] font-black text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
          <ScanFace size={12} className="text-cyan-400" />
          Detecção Facial & Máscaras
        </span>
        <span className="text-[10px] font-mono text-cyan-400 font-bold">
          {faceDetectorModel} ({faceDetectorSize})
        </span>
      </div>

      {/* Linha 1: Tipos de Máscara (Face Mask Types) */}
      <div className="space-y-1">
        <label className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider block">
          Tipos de Máscara (Face Mask Types)
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: "box", label: "Box (Caixa)" },
            { id: "occlusion", label: "Oclusão (XSeg)" },
            { id: "area", label: "Área" },
            { id: "region", label: "Região" },
          ].map((item) => {
            const isChecked = faceMaskTypes?.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (!setFaceMaskTypes || !faceMaskTypes) return;
                  if (isChecked) {
                    if (faceMaskTypes.length > 1) {
                      setFaceMaskTypes(faceMaskTypes.filter((t) => t !== item.id));
                    }
                  } else {
                    setFaceMaskTypes([...faceMaskTypes, item.id]);
                  }
                }}
                className={`py-1 rounded border text-[9.5px] font-bold transition-all cursor-pointer text-center ${
                  isChecked
                    ? "bg-cyan-500/20 border-cyan-400/60 text-cyan-300 shadow-sm"
                    : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Linha 2: Padding da Máscara (Margens em Pixels) */}
      <div className="space-y-1">
        <label className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider block">
          Padding da Máscara (Margens em Pixels)
        </label>
        <div className="grid grid-cols-4 gap-2 bg-zinc-900/40 px-2 py-1.5 rounded-lg border border-zinc-800/80">
          <div>
            <div className="flex justify-between text-[9px] font-bold text-zinc-400 mb-0.5">
              <span>Topo</span>
              <span className="font-mono text-cyan-400">{faceMaskPadding?.[0] ?? 0}px</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="1"
              value={faceMaskPadding?.[0] ?? 0}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setFaceMaskPadding?.([val, faceMaskPadding?.[1] ?? 0, faceMaskPadding?.[2] ?? 0, faceMaskPadding?.[3] ?? 0]);
              }}
              className="w-full accent-cyan-400 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-[9px] font-bold text-zinc-400 mb-0.5">
              <span>Direita</span>
              <span className="font-mono text-cyan-400">{faceMaskPadding?.[1] ?? 0}px</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="1"
              value={faceMaskPadding?.[1] ?? 0}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setFaceMaskPadding?.([val, faceMaskPadding?.[1] ?? 0, faceMaskPadding?.[2] ?? 0, faceMaskPadding?.[3] ?? 0]);
              }}
              className="w-full accent-cyan-400 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-[9px] font-bold text-zinc-400 mb-0.5">
              <span>Base</span>
              <span className="font-mono text-cyan-400">{faceMaskPadding?.[2] ?? 0}px</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="1"
              value={faceMaskPadding?.[2] ?? 0}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setFaceMaskPadding?.([val, faceMaskPadding?.[1] ?? 0, faceMaskPadding?.[2] ?? 0, faceMaskPadding?.[3] ?? 0]);
              }}
              className="w-full accent-cyan-400 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-[9px] font-bold text-zinc-400 mb-0.5">
              <span>Esquerda</span>
              <span className="font-mono text-cyan-400">{faceMaskPadding?.[3] ?? 0}px</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="1"
              value={faceMaskPadding?.[3] ?? 0}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setFaceMaskPadding?.([val, faceMaskPadding?.[1] ?? 0, faceMaskPadding?.[2] ?? 0, faceMaskPadding?.[3] ?? 0]);
              }}
              className="w-full accent-cyan-400 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Linha 3: Detector Facial & Tamanho */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9.5px] font-bold text-zinc-400 block mb-0.5">
            Detector Facial
          </label>
          <div className="relative">
            <select
              value={faceDetectorModel}
              onChange={(e) => setFaceDetectorModel?.(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2 py-1.5 rounded-lg appearance-none font-bold text-zinc-200 outline-none cursor-pointer focus:border-cyan-400"
            >
              <option value="yolo_face">YOLO-Face (Padrão)</option>
              <option value="retinaface">RetinaFace (Alta Precisão)</option>
              <option value="scrfd">SCRFD (Eficiente)</option>
              <option value="yunet">YuNet (Leve)</option>
            </select>
            <ChevronDown size={11} className="absolute right-2 top-2.5 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="text-[9.5px] font-bold text-zinc-400 block mb-0.5">
            Tamanho do Detector
          </label>
          <div className="relative">
            <select
              value={faceDetectorSize}
              onChange={(e) => setFaceDetectorSize?.(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2 py-1.5 rounded-lg appearance-none font-bold text-zinc-200 outline-none cursor-pointer focus:border-cyan-400"
            >
              <option value="640x640">640x640 (Padrão)</option>
              <option value="512x512">512x512</option>
              <option value="480x480">480x480</option>
              <option value="320x320">320x320</option>
              <option value="160x160">160x160</option>
            </select>
            <ChevronDown size={11} className="absolute right-2 top-2.5 text-zinc-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Linha 4: Ângulos de Busca & Landmarker Facial */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-900">
        <div>
          <label className="text-[9.5px] font-bold text-zinc-400 block mb-0.5">
            Ângulos de Busca
          </label>
          <div className="flex items-center gap-1">
            {[0, 90, 180, 270].map((angle) => {
              const isChecked = faceDetectorAngles?.includes(angle);
              return (
                <button
                  key={angle}
                  type="button"
                  onClick={() => {
                    if (!setFaceDetectorAngles || !faceDetectorAngles) return;
                    if (isChecked) {
                      if (faceDetectorAngles.length > 1) {
                        setFaceDetectorAngles(faceDetectorAngles.filter((a) => a !== angle));
                      }
                    } else {
                      setFaceDetectorAngles([...faceDetectorAngles, angle]);
                    }
                  }}
                  className={`flex-1 py-1 rounded border text-[9.5px] font-bold transition-all cursor-pointer ${
                    isChecked
                      ? "bg-cyan-500/20 border-cyan-400/60 text-cyan-300"
                      : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {angle}°
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-[9.5px] font-bold text-zinc-400 block mb-0.5">
            Landmarker Facial
          </label>
          <div className="relative">
            <select
              value={faceLandmarkerModel}
              onChange={(e) => setFaceLandmarkerModel?.(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2 py-1.5 rounded-lg appearance-none font-bold text-zinc-200 outline-none cursor-pointer focus:border-cyan-400"
            >
              <option value="2dfan4">2DFAN4 (Padrão)</option>
              <option value="peppa_wutz">Peppa Wutz</option>
            </select>
            <ChevronDown size={11} className="absolute right-2 top-2.5 text-zinc-500 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
