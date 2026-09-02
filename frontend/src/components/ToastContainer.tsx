import React from "react";
import { Check, AlertCircle, Info, X } from "lucide-react";
import { Toast } from "../types";

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm">
      {toasts.map((toast) => {
        const colors = {
          success: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: "text-emerald-400", bar: "bg-emerald-500" },
          error: { bg: "bg-red-500/10", border: "border-red-500/30", icon: "text-red-400", bar: "bg-red-500" },
          info: { bg: "bg-blue-500/10", border: "border-blue-500/30", icon: "text-blue-400", bar: "bg-blue-500" },
          warning: { bg: "bg-amber-500/10", border: "border-amber-500/30", icon: "text-amber-400", bar: "bg-amber-500" },
        }[toast.type];

        const Icon = {
          success: Check,
          error: AlertCircle,
          info: Info,
          warning: AlertCircle,
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto ${toast.exiting ? "animate-toast-exit" : "animate-toast-enter"} ${colors.bg} ${colors.border} border backdrop-blur-xl rounded-xl p-4 shadow-2xl shadow-black/40 flex items-start gap-3 min-w-[280px]`}
          >
            <div className={`flex-shrink-0 mt-0.5 ${colors.icon}`}>
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{toast.title}</p>
              {toast.message && <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{toast.message}</p>}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="flex-shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
