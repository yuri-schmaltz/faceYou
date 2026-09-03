import React, { useRef, useState } from "react";
import { Download, Play, Pause, Volume2, VolumeX, Maximize2, ImageIcon } from "lucide-react";

interface VideoComparatorProps {
  previewOutputUrl: string | null;
  onDownloadOutput: () => void;
}

export const VideoComparator: React.FC<VideoComparatorProps> = ({
  previewOutputUrl,
  onDownloadOutput,
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
    <div className="bg-zinc-950/30 border border-zinc-900 rounded-xl p-4 flex-1 flex flex-col justify-between overflow-hidden shadow-inner h-full">
      <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex-shrink-0">
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
        className="relative flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden select-none min-h-[220px]"
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
                alt="Preview de Saída"
                className="absolute inset-0 object-contain w-full h-full"
              />
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 gap-2 p-6 text-center">
            <ImageIcon size={32} className="stroke-1 text-zinc-700" />
            <p className="text-xs font-bold text-zinc-500">Sem Visualização de Saída</p>
            <p className="text-[10px] text-zinc-600 max-w-xs">
              Selecione as mídias de origem e destino para visualizar a composição em tempo real.
            </p>
          </div>
        )}

        {/* Video Player Overlay Controls */}
        {isVideo && previewOutputUrl && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-1.5 transition-opacity duration-300">
            <input
              type="range"
              min="0"
              max={videoDuration || 100}
              step="0.01"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-500"
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
  );
};
