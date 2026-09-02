import React, { useRef, useState } from "react";
import { Download, Play, Pause, Volume2, VolumeX, Maximize2, ImageIcon, ChevronDown } from "lucide-react";

interface VideoComparatorProps {
  previewOutputUrl: string | null;
  onDownloadOutput: () => void;
  outputFormat: string;
  setOutputFormat: (fmt: string) => void;
  outputQuality: string;
  setOutputQuality: (q: string) => void;
}

export const VideoComparator: React.FC<VideoComparatorProps> = ({
  previewOutputUrl,
  onDownloadOutput,
  outputFormat,
  setOutputFormat,
  outputQuality,
  setOutputQuality,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isVideo = previewOutputUrl && previewOutputUrl.match(/\.(mp4|webm|mkv|avi|mov)/i);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return "00:00";
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
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

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="space-y-4 flex flex-col overflow-hidden h-full">
      <div className="bg-zinc-950/30 border border-zinc-900 rounded-xl p-4 flex-1 flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
          <span>Visualização de Resultado</span>
          <div className="flex items-center gap-2">
            {previewOutputUrl && (
              <button
                onClick={onDownloadOutput}
                className="text-[10px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-2 py-0.5 rounded font-bold transition-all cursor-pointer flex items-center gap-1"
                title="Baixar resultado"
              >
                <Download size={10} />
                Baixar
              </button>
            )}
            <span className="text-[10px] bg-red-600/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded font-bold">
              1080p
            </span>
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
              <span className="text-[10px] text-zinc-600 text-center max-w-[220px]">
                Selecione a origem/destino e clique em "Gerar Preview" ou inicie o processamento.
              </span>
            </div>
          )}
        </div>

        {/* Video Player Controls */}
        <div className="flex items-center gap-4 bg-zinc-950/55 border border-zinc-900 rounded-lg p-2.5 mt-2">
          <button
            onClick={togglePlay}
            disabled={!isVideo}
            className="text-zinc-200 hover:text-red-500 transition-colors disabled:text-zinc-700 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <input
            type="range"
            min={0}
            max={videoDuration || 100}
            step={0.1}
            value={currentTime}
            disabled={!isVideo}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            className="flex-1 accent-red-600 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          />

          <span className="text-[10px] text-zinc-500 font-mono select-none">
            {formatTime(currentTime)} / {formatTime(videoDuration)}
          </span>

          <button
            onClick={toggleMute}
            disabled={!isVideo}
            className="text-zinc-400 hover:text-zinc-200 transition-colors disabled:text-zinc-700 disabled:cursor-not-allowed cursor-pointer"
            title={isMuted ? "Desativar Mudo" : "Ativar Mudo"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <button
            onClick={handleFullscreen}
            disabled={!previewOutputUrl}
            className="text-zinc-400 hover:text-zinc-200 transition-colors disabled:text-zinc-700 disabled:cursor-not-allowed cursor-pointer"
            title="Tela Cheia"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-zinc-950/30 border border-zinc-900 rounded-xl p-4 space-y-2 flex-shrink-0">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Opções de Exportação</span>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-zinc-500 block mb-1">Formato</label>
            <div className="relative">
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded appearance-none font-bold text-zinc-200 outline-none cursor-pointer"
              >
                <option value="MP4">MP4</option>
                <option value="WEBM">WEBM</option>
                <option value="MKV">MKV</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-2.5 text-zinc-500 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 block mb-1">Qualidade</label>
            <div className="relative">
              <select
                value={outputQuality}
                onChange={(e) => setOutputQuality(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-1.5 rounded appearance-none font-bold text-zinc-200 outline-none cursor-pointer"
              >
                <option value="High">Alta (100%)</option>
                <option value="Medium">Média (80%)</option>
                <option value="Low">Baixa (50%)</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-2.5 text-zinc-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
