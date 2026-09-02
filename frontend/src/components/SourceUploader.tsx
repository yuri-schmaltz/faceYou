import React, { useRef } from "react";
import { Upload, Plus, Trash2, Check, User } from "lucide-react";
import { SourceItem } from "../types";

interface SourceUploaderProps {
  sourceItems: SourceItem[];
  sourceImageFullPath: string | null;
  onSelectSource: (item: SourceItem) => void;
  onRemoveSource: (index: number) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const SourceUploader: React.FC<SourceUploaderProps> = ({
  sourceItems,
  sourceImageFullPath,
  onSelectSource,
  onRemoveSource,
  onUpload,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Imagens de Origem (Source)</span>
        {sourceItems.length > 0 && (
          <span className="text-[10px] text-zinc-500 font-medium">
            {sourceItems.length} carregada(s)
          </span>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        multiple
        className="hidden"
        onChange={onUpload}
      />

      {sourceItems.length > 0 ? (
        <div className="flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 min-h-0 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            {sourceItems.map((item, index) => {
              const isSelected = item.file_path === sourceImageFullPath;
              return (
                <div
                  key={index}
                  onClick={() => onSelectSource(item)}
                  className={`relative aspect-square bg-zinc-950 border rounded-md overflow-hidden group cursor-pointer transition-all duration-200 ${
                    isSelected ? "border-red-500 ring-2 ring-red-500/20" : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 z-10">
                      <Check size={8} className="stroke-[3]" />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSource(index);
                    }}
                    className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-500 hover:text-red-400 transition-all duration-150 z-20"
                    title="Remover imagem"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square border border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-900/40 rounded-md flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer group"
              title="Adicionar mais imagens"
            >
              <Plus size={16} className="group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-bold mt-1 uppercase tracking-wider">Adicionar</span>
            </button>
          </div>
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
              Selecione Imagem(ns) de Rosto
            </span>
            <span className="text-[10px] text-zinc-600">Arraste fotos ou clique aqui</span>
          </div>
        </div>
      )}
    </div>
  );
};
