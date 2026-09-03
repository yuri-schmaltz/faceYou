import React from "react";
import { ChevronDown, Music, Sliders } from "lucide-react";

interface ExportSettingsProps {
  outputFormat: string;
  setOutputFormat: (fmt: string) => void;
  outputQuality: string;
  setOutputQuality: (q: string) => void;
  outputVideoEncoder?: string;
  setOutputVideoEncoder?: (enc: string) => void;
  outputAudioEncoder?: string;
  setOutputAudioEncoder?: (enc: string) => void;
  outputAudioQuality?: number;
  setOutputAudioQuality?: (q: number) => void;
  outputAudioVolume?: number;
  setOutputAudioVolume?: (v: number) => void;
}

export const ExportSettings: React.FC<ExportSettingsProps> = ({
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
  return (
    <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-3.5 space-y-2.5 flex-1 flex flex-col justify-between shadow-inner h-full">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5 flex-shrink-0">
        <span className="text-[11px] font-black text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders size={12} className="text-red-500" />
          Opções de Exportação
        </span>
        <span className="text-[10px] font-mono text-zinc-500">Pipeline de Renderização</span>
      </div>

      {/* Linha 1: Configurações de Vídeo (3 Comboboxes) */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[9.5px] font-bold text-zinc-400 block mb-0.5">Formato</label>
          <div className="relative">
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2 py-1.5 rounded-lg appearance-none font-bold text-zinc-200 outline-none cursor-pointer focus:border-red-500"
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
            <ChevronDown size={11} className="absolute right-2 top-2.5 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="text-[9.5px] font-bold text-zinc-400 block mb-0.5">Qualidade</label>
          <div className="relative">
            <select
              value={outputQuality}
              onChange={(e) => setOutputQuality(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2 py-1.5 rounded-lg appearance-none font-bold text-zinc-200 outline-none cursor-pointer focus:border-red-500"
            >
              <option value="High">Alta (CRF 18)</option>
              <option value="Medium">Média (CRF 23)</option>
              <option value="Low">Baixa (CRF 28)</option>
            </select>
            <ChevronDown size={11} className="absolute right-2 top-2.5 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="text-[9.5px] font-bold text-zinc-400 block mb-0.5">Encoder / Codec</label>
          <div className="relative">
            <select
              value={outputVideoEncoder}
              onChange={(e) => setOutputVideoEncoder?.(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2 py-1.5 rounded-lg appearance-none font-bold text-zinc-200 outline-none cursor-pointer focus:border-red-500"
            >
              <option value="libx264">H.264 (CPU)</option>
              <option value="h264_nvenc">NVENC H.264</option>
              <option value="libx265">HEVC / H.265</option>
              <option value="hevc_nvenc">NVENC HEVC</option>
              <option value="libvpx-vp9">VP9 (WebM)</option>
            </select>
            <ChevronDown size={11} className="absolute right-2 top-2.5 text-zinc-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Linha 2: Configurações de Áudio Dedicadas */}
      <div className="pt-1 border-t border-zinc-900">
        <div className="grid grid-cols-3 gap-2">
          {/* Codec / Encoder de Áudio */}
          <div>
            <label className="text-[9.5px] font-bold text-zinc-400 block mb-0.5 flex items-center gap-1">
              <Music size={10} className="text-amber-400" />
              Codec Áudio
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
                <option value="pcm_s16le">WAV (PCM 16)</option>
                <option value="none">Mudo (Sem Áudio)</option>
              </select>
              <ChevronDown size={11} className="absolute right-2 top-2.5 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          {/* Qualidade do Áudio (Bitrate) */}
          <div>
            <label className="text-[9.5px] font-bold text-zinc-400 block mb-0.5">Bitrate</label>
            <div className="relative">
              <select
                value={outputAudioQuality}
                onChange={(e) => setOutputAudioQuality?.(parseInt(e.target.value))}
                disabled={outputAudioEncoder === "none"}
                className="w-full bg-zinc-900 border border-zinc-800 text-xs px-2 py-1.5 rounded-lg appearance-none font-bold text-zinc-200 outline-none cursor-pointer focus:border-amber-500 disabled:opacity-40"
              >
                <option value="100">320 kbps (Máx)</option>
                <option value="80">192 kbps (Alta)</option>
                <option value="60">128 kbps (Padrão)</option>
                <option value="40">96 kbps (Eco)</option>
              </select>
              <ChevronDown size={11} className="absolute right-2 top-2.5 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          {/* Volume do Áudio */}
          <div>
            <div className="flex justify-between items-center mb-0.5">
              <label className="text-[9.5px] font-bold text-zinc-400">Volume</label>
              <span className="text-[9.5px] font-mono text-amber-400 font-bold">
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
              className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer mt-1 disabled:opacity-40"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
