import React, { useRef, useState } from "react";
import { Download, Play, Pause, Volume2, VolumeX, Maximize2, ImageIcon, ChevronDown, Music, Sliders } from "lucide-react";

interface VideoComparatorProps {
  previewOutputUrl: string | null;
  onDownloadOutput: () => void;
  outputFormat: string;
  setOutputFormat: (fmt: string) => void;
  outputQuality: string;
  setOutputQuality: (q: string) => void;
  // Opções de Vídeo (Encoder / Codec)
  outputVideoEncoder?: string;
  setOutputVideoEncoder?: (enc: string) => void;
  // Opções de Áudio
  outputAudioEncoder?: string;
  setOutputAudioEncoder?: (enc: string) => void;
  outputAudioQuality?: number;
  setOutputAudioQuality?: (q: number) => void;
  outputAudioVolume?: number;
  setOutputAudioVolume?: (v: number) => void;
}

export const VideoComparator: React.FC<VideoComparatorProps> = ({
  previewOutputUrl,
  onDownloadOutput,
  outputFormat,
  setOutputFormat,
  outputQuality,
  setOutputQuality,
  outputVideoEncoder = "libx264",
  setOutputVideoEncoder,
  outputAudioEncoder = "aac",
  setOutputAudioEncoder,
  outputAudioQuality = 80,
  setOutputAudioQuality,
  outputAudioVolume = 100,
  setOutputAudioVolume,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isVideo = previewOutputUrl && previewOutputUrl.match(/\.(mp4|webm|mkv|avi|mov)/i);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="space-y-3.5 flex flex-col overflow-hidden h-full">
      {/* 1. Palco Principal de Visualização */}
      <div className="bg-zinc-950/30 border border-zinc-900 rounded-xl p-4 flex-1 flex flex-col justify-between overflow-hidden shadow-inner">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
          <span className="flex items-center gap-1.5 text-zinc-200">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Visualização de Resultado
          </span>
          <div className="flex items-center gap-2">
            {previewOutputUrl && (
              <button
                onClick={onDownloadOutput}
                className="text-[10px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                title="Baixar mídia renderizada"
              >
                <Download size={11} />
                Baixar
              </button>
            )}
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden select-none min-h-[200px]"
        >
          {previewOutputUrl ? (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
              {isVideo ? (
                <video
                  ref={videoRef}
                  src={previewOutputUrl}
                  className="absolute inset-0 object-contain w-full h-full"
                  muted={isMuted}
                  loop
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onClick={togglePlay}
                />
              ) : (
                <img
                  src={previewOutputUrl}
                  alt="Resultado"
                  className="absolute inset-0 object-contain w-full h-full pointer-events-none"
                />
              )}
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 gap-2 p-4">
              <ImageIcon size={32} className="text-zinc-700" />
              <span className="text-xs font-semibold text-zinc-400">Sem Visualização de Saída</span>
              <span className="text-[10px] text-zinc-600 text-center max-w-[240px]">
                Selecione as mídias de origem e destino para visualizar a composição em tempo real.
              </span>
            </div>
          )}

          {isVideo && previewOutputUrl && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5 flex flex-col gap-1.5">
              <input
                type="range"
                min="0"
                max={videoDuration || 100}
                step="0.01"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <div className="flex items-center justify-between text-zinc-300 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="p-1 hover:text-white transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="p-1 hover:text-white transition-colors cursor-pointer"
                  >
                    {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                  <span className="text-[11px] text-zinc-400">
                    {formatTime(currentTime)} / {formatTime(videoDuration)}
                  </span>
                </div>
                <button
                  onClick={toggleFullscreen}
                  className="p-1 hover:text-white transition-colors cursor-pointer"
                >
                  <Maximize2 size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Opções de Exportação (Vídeo + Áudio Integrado) */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-3.5 space-y-3 flex-shrink-0 shadow-inner">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
          <span className="text-[11px] font-black text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders size={12} className="text-red-500" />
            Opções de Exportação
          </span>
          <span className="text-[10px] font-mono text-zinc-500">Pipeline de Renderização</span>
        </div>

        {/* Linha 1: Configurações de Vídeo (3 Comboboxes) */}
        <div className="grid grid-cols-3 gap-2.5">
          <div>
            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Formato</label>
            <div className="relative">
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded-lg appearance-none font-bold text-zinc-200 outline-none cursor-pointer focus:border-red-500"
              >
                <option value="MP4">MP4 (Universal)</option>
                <option value="MOV">MOV (Apple / ProRes)</option>
                <option value="MKV">MKV (Matroska)</option>
                <option value="WEBM">WEBM (VP9 Web)</option>
                <option value="AVI">AVI (Interleave)</option>
                <option value="M4V">M4V (Apple)</option>
                <option value="MPEG">MPEG (MPEG-2)</option>
                <option value="WMV">WMV (Windows)</option>
                <option value="MXF">MXF (Broadcast)</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-2.5 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Qualidade</label>
            <div className="relative">
              <select
                value={outputQuality}
                onChange={(e) => setOutputQuality(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded-lg appearance-none font-bold text-zinc-200 outline-none cursor-pointer focus:border-red-500"
              >
                <option value="High">Alta (100% - CRF 18)</option>
                <option value="Medium">Média (80% - CRF 23)</option>
                <option value="Low">Baixa (50% - CRF 28)</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-2.5 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Encoder / Codec</label>
            <div className="relative">
              <select
                value={outputVideoEncoder}
                onChange={(e) => setOutputVideoEncoder?.(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded-lg appearance-none font-bold text-zinc-200 outline-none cursor-pointer focus:border-red-500"
              >
                <option value="libx264">H.264 (CPU Padrão)</option>
                <option value="h264_nvenc">NVIDIA NVENC H.264</option>
                <option value="libx265">HEVC / H.265 (CPU)</option>
                <option value="hevc_nvenc">NVIDIA NVENC HEVC</option>
                <option value="libvpx-vp9">VP9 (WebM)</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-2.5 text-zinc-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Linha 2: Configurações de Áudio Dedicadas */}
        <div className="pt-2 border-t border-zinc-900">
          <div className="grid grid-cols-3 gap-2.5">
            {/* Codec / Encoder de Áudio */}
            <div>
              <label className="text-[10px] font-bold text-zinc-400 block mb-1 flex items-center gap-1">
                <Music size={10} className="text-amber-400" />
                Codec de Áudio
              </label>
              <div className="relative">
                <select
                  value={outputAudioEncoder}
                  onChange={(e) => setOutputAudioEncoder?.(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2 py-1.5 rounded-lg appearance-none font-bold text-zinc-200 outline-none cursor-pointer focus:border-amber-500"
                >
                  <option value="aac">AAC (Padrão)</option>
                  <option value="libmp3lame">MP3 (LAME)</option>
                  <option value="libopus">Opus (HQ)</option>
                  <option value="flac">FLAC (Lossless)</option>
                  <option value="pcm_s16le">WAV (PCM 16-bit)</option>
                  <option value="none">Mudo (Sem Áudio)</option>
                </select>
                <ChevronDown size={11} className="absolute right-2 top-2.5 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            {/* Qualidade do Áudio (Bitrate) */}
            <div>
              <label className="text-[10px] font-bold text-zinc-400 block mb-1">Qualidade do Áudio</label>
              <div className="relative">
                <select
                  value={outputAudioQuality}
                  onChange={(e) => setOutputAudioQuality?.(parseInt(e.target.value))}
                  disabled={outputAudioEncoder === "none"}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2 py-1.5 rounded-lg appearance-none font-bold text-zinc-200 outline-none cursor-pointer focus:border-amber-500 disabled:opacity-40"
                >
                  <option value="100">Máxima (320 kbps)</option>
                  <option value="80">Alta (192 kbps)</option>
                  <option value="60">Padrão (128 kbps)</option>
                  <option value="40">Compacta (96 kbps)</option>
                </select>
                <ChevronDown size={11} className="absolute right-2 top-2.5 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            {/* Volume do Áudio */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-zinc-400">Volume</label>
                <span className="text-[10px] font-mono text-amber-400 font-bold">
                  {outputAudioEncoder === "none" ? "Mudo" : `${outputAudioVolume}%`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={outputAudioVolume}
                disabled={outputAudioEncoder === "none"}
                onChange={(e) => setOutputAudioVolume?.(parseInt(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer mt-1.5 disabled:opacity-40"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
