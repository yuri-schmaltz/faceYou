import React from "react";
import { X, Check } from "lucide-react";
import { DetectedFace, SourceItem } from "../types";
import { formatApiUrl } from "../utils/api";

interface FaceMappingModalProps {
  apiUrl: string;
  selectedFace: DetectedFace | null;
  onClose: () => void;
  sourceItems: SourceItem[];
  faceMappings: Record<number, string>;
  onSelectMapping: (targetFaceIndex: number, sourceFilePath?: string) => void;
}

export const FaceMappingModal: React.FC<FaceMappingModalProps> = ({
  apiUrl,
  selectedFace,
  onClose,
  sourceItems,
  faceMappings,
  onSelectMapping
}) => {
  if (!selectedFace) return null;

  const currentCropUrl = selectedFace.crop_url
    ? formatApiUrl(apiUrl, selectedFace.crop_url)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-950/95 border border-zinc-800 rounded-2xl w-full max-w-md p-6 relative backdrop-blur-xl shadow-2xl flex flex-col space-y-4">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Mapeamento do Rosto #{selectedFace.index + 1}
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Rosto Crop e Demografia */}
        <div className="flex gap-4 items-center bg-zinc-900/40 p-4 rounded-xl border border-zinc-900">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 flex-shrink-0">
            {currentCropUrl ? (
              <img src={currentCropUrl} alt="Recorte" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">?</div>
            )}
          </div>
          <div className="space-y-1.5 min-w-0">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Atributos Estimados</span>
            <div className="flex flex-wrap gap-1.5">
              <span className="bg-zinc-800/80 px-2 py-0.5 rounded text-[10px] font-bold text-zinc-300">
                Gênero: {selectedFace.gender === "male" ? "Masculino" : "Feminino"}
              </span>
              <span className="bg-zinc-800/80 px-2 py-0.5 rounded text-[10px] font-bold text-zinc-300">
                Idade: {selectedFace.age} anos
              </span>
              <span className="bg-zinc-800/80 px-2 py-0.5 rounded text-[10px] font-bold text-zinc-300 capitalize">
                Raça: {selectedFace.race}
              </span>
            </div>
          </div>
        </div>

        {/* Grade de Origens para Seleção */}
        <div className="space-y-2">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Escolha a Imagem de Substituição</span>

          <div className="grid grid-cols-4 gap-2.5 max-h-[160px] overflow-y-auto pr-1">
            {/* Opção: Manter Original */}
            <div
              onClick={() => onSelectMapping(selectedFace.index, undefined)}
              className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${
                !faceMappings[selectedFace.index]
                  ? "border-red-500 bg-red-500/10 text-white"
                  : "border-zinc-850 hover:border-zinc-750 text-zinc-400 bg-zinc-900/30"
              }`}
            >
              <span className="text-[10px] font-bold">Original</span>
            </div>

            {/* Origens da Galeria */}
            {sourceItems.map((item, sIdx) => {
              const isSelected = faceMappings[selectedFace.index] === item.file_path;
              return (
                <div
                  key={sIdx}
                  onClick={() => onSelectMapping(selectedFace.index, item.file_path)}
                  className={`relative aspect-square rounded-lg border-2 overflow-hidden cursor-pointer transition-all hover:scale-105 ${
                    isSelected ? "border-red-500 ring-2 ring-red-500/30" : "border-zinc-850 hover:border-zinc-750"
                  }`}
                  title={item.filename}
                >
                  <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 z-10">
                      <Check size={8} className="stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="bg-zinc-900 hover:bg-zinc-850 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors border border-zinc-850"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
