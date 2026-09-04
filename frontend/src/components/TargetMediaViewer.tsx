import React, { useRef, useEffect } from "react";
import { Upload, X, ScanFace, RefreshCw, Sparkles } from "lucide-react";
import { DetectedFace } from "../types";

interface TargetMediaViewerProps {
  targetMedia: string | null;
  targetMediaName: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  detectedFaces: DetectedFace[];
  faceMappings: Record<number, string>;
  onSelectFace: (face: DetectedFace) => void;
  isAnalyzing: boolean;
  onAnalyzeFaces: () => void;
  targetVideoTime: number;
  setTargetVideoTime: (time: number) => void;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  getScaledBox: (box: number[]) => { left: number; top: number; width: number; height: number } | null;
  targetContainerRef: React.RefObject<HTMLDivElement | null>;
  setTargetDimensions: (dim: { width: number; height: number }) => void;
  onOpenWizard?: () => void;
  isDiagnosing?: boolean;
}

export const TargetMediaViewer: React.FC<TargetMediaViewerProps> = ({
  targetMedia,
  targetMediaName,
  onUpload,
  onClear,
  detectedFaces,
  faceMappings,
  onSelectFace,
  isAnalyzing,
  onAnalyzeFaces,
  targetVideoTime,
  setTargetVideoTime,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  getScaledBox,
  targetContainerRef,
  setTargetDimensions,
  onOpenWizard,
  isDiagnosing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && typeof targetVideoTime === "number" && !isNaN(targetVideoTime)) {
      if (Math.abs(videoRef.current.currentTime - targetVideoTime) > 0.25) {
        videoRef.current.currentTime = targetVideoTime;
      }
    }
  }, [targetVideoTime]);

  const isVideo = targetMedia && targetMedia.match(/\.(mp4|webm|mkv|avi|mov)$/i);

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`bg-zinc-950/30 border rounded-xl p-4 flex flex-col justify-between h-full min-h-0 overflow-hidden transition-all duration-200 ${
        isDragging ? "border-red-500 bg-red-500/5 ring-2 ring-red-500/20" : "border-zinc-900"
      }`}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Mídia de Destino (Target)</span>
        {targetMedia && (
          <div className="flex items-center gap-1.5">
            {isVideo && onOpenWizard && (
              <button
                onClick={onOpenWizard}
                disabled={isDiagnosing}
                className="text-[10px] bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800 hover:to-indigo-800 text-purple-200 border border-purple-500/40 px-2 py-0.5 rounded font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-sm"
                title="Pré-analisar vídeo completo, ruído e takes"
              >
                {isDiagnosing ? <RefreshCw size={10} className="animate-spin text-purple-400" /> : <Sparkles size={10} className="text-purple-400" />}
                {isDiagnosing ? "Analisando..." : "Assistente IA"}
              </button>
            )}
            <button
              onClick={onAnalyzeFaces}
              disabled={isAnalyzing}
              className="text-[10px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-2 py-0.5 rounded font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="Escanear rostos no frame atual"
            >
              {isAnalyzing ? <RefreshCw size={10} className="animate-spin text-red-500" /> : <ScanFace size={10} className="text-red-400" />}
              {isAnalyzing ? "Analisando..." : "Escanear Rostos"}
            </button>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/*"
        className="hidden"
        onChange={onUpload}
      />

      {targetMedia ? (
        <div className="relative flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden group min-h-0">
          {isVideo ? (
            <div className="absolute inset-0 w-full h-full flex flex-col min-h-0">
              <div ref={targetContainerRef} className="relative w-full h-full bg-black flex items-center justify-center min-h-0 overflow-hidden">
                <video
                  ref={videoRef}
                  src={targetMedia}
                  className="object-contain w-full h-full min-h-0"
                  controls
                  onTimeUpdate={(e) => setTargetVideoTime(e.currentTarget.currentTime)}
                  onSeeked={(e) => setTargetVideoTime(e.currentTarget.currentTime)}
                  onSeeking={(e) => setTargetVideoTime(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => {
                    setTargetDimensions({
                      width: e.currentTarget.videoWidth,
                      height: e.currentTarget.videoHeight
                    });
                    if (targetVideoTime > 0 && e.currentTarget) {
                      e.currentTarget.currentTime = targetVideoTime;
                    }
                  }}
                />
                {/* Overlays interativas no Player de Vídeo */}
                {detectedFaces.map((face) => {
                  const box = getScaledBox(face.bounding_box);
                  if (!box) return null;
                  const hasMapping = !!faceMappings[face.index];
                  return (
                    <div
                      key={face.index}
                      onClick={() => onSelectFace(face)}
                      className={`absolute border-2 cursor-pointer transition-all duration-200 hover:scale-105 flex items-center justify-center rounded ${
                        hasMapping
                          ? "border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
                          : "border-red-500 bg-red-500/10 hover:bg-red-500/20"
                      }`}
                      style={{
                        left: `${box.left}px`,
                        top: `${box.top}px`,
                        width: `${box.width}px`,
                        height: `${box.height}px`,
                      }}
                      title={`Rosto #${face.index + 1}`}
                    >
                      <span className="px-1 py-0.5 text-[7px] font-bold text-white rounded bg-black/80 absolute bottom-1 font-mono">
                        Rosto #{face.index + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div ref={targetContainerRef} className="absolute inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden">
              <img
                src={targetMedia}
                alt="Target Media"
                className="object-contain w-full h-full pointer-events-none"
                onLoad={(e) => {
                  setTargetDimensions({
                    width: e.currentTarget.naturalWidth,
                    height: e.currentTarget.naturalHeight
                  });
                }}
              />
              {/* Overlays interativas no Player de Imagem */}
              {detectedFaces.map((face) => {
                const box = getScaledBox(face.bounding_box);
                if (!box) return null;
                const hasMapping = !!faceMappings[face.index];
                return (
                  <div
                    key={face.index}
                    onClick={() => onSelectFace(face)}
                    className={`absolute border-2 cursor-pointer transition-all duration-200 hover:scale-105 flex items-center justify-center rounded ${
                      hasMapping
                        ? "border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
                        : "border-red-500 bg-red-500/10 hover:bg-red-500/20"
                    }`}
                    style={{
                      left: `${box.left}px`,
                      top: `${box.top}px`,
                      width: `${box.width}px`,
                      height: `${box.height}px`,
                    }}
                    title={`Rosto #${face.index + 1}`}
                  >
                    <span className="px-1 py-0.5 text-[7px] font-bold text-white rounded bg-black/80 absolute bottom-1 font-mono">
                      Rosto #{face.index + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute top-3 right-3 z-30 bg-red-600/90 hover:bg-red-500 text-white p-2 rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 cursor-pointer flex items-center justify-center border border-red-500/20"
            title="Substituir mídia de destino"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 w-full border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-zinc-900/40 group p-4"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-red-500 group-hover:scale-105 transition-all">
            <Upload size={18} />
          </div>
          <div className="text-center">
            <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors block">
              Selecione Vídeo ou Imagem de Destino
            </span>
            <span className="text-[10px] text-zinc-600">Arraste mídia ou clique para buscar</span>
          </div>
        </div>
      )}
    </div>
  );
};
