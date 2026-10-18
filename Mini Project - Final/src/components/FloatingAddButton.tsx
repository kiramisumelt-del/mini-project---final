import { Plus } from 'lucide-react';
import { CloverIcon } from './CloverIcon';

interface FloatingAddButtonProps {
  onClick: () => void;
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40">
      <button
        onClick={onClick}
        title="Create new task"
        className="group relative flex items-center gap-2 px-5 py-3.5 rounded-full bg-[#606362] hover:bg-[#494D4B] active:scale-95 text-white font-display font-extrabold text-sm shadow-xl shadow-[#2E2741]/20 transition-all duration-200 cursor-pointer border border-white/20"
        aria-label="Add new task"
      >
        <CloverIcon className="w-4 h-4 text-[#E7D1DA]" />
        <Plus className="h-4 w-4 stroke-[3] transition-transform group-hover:rotate-90 duration-200" />
        <span className="font-mono text-xs uppercase tracking-wider font-bold">New Task</span>
      </button>
    </div>
  );
}
