import { RotateCcw, X } from 'lucide-react';
import { CloverIcon } from './CloverIcon';

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
}

export function UndoToast({ message, onUndo, onDismiss }: UndoToastProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)] animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-[#2E2741] text-[#FBF9F2] px-4 py-3 rounded-2xl shadow-2xl border border-[#433A5E] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-[#E7D1DA] text-[#2E2741] flex items-center justify-center shrink-0">
            <CloverIcon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-medium truncate font-mono text-[#EDE9F6]">
            {message}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onUndo}
            className="px-3 py-1 rounded-xl bg-[#E7D1DA] hover:bg-[#F2E0E7] text-[#2E2741] text-xs font-bold font-mono transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <RotateCcw className="w-3 h-3 stroke-[2.5]" />
            <span>Undo</span>
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="p-1 text-[#C8BFD9] hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-[#433A5E]"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
