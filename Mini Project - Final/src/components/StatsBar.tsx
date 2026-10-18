import { CheckCircle2, Circle, Flame, AlertCircle } from 'lucide-react';
import { Task } from '../types/todo';
import { getLocalDateString } from '../utils/date';

interface StatsBarProps {
  tasks: Task[];
}

export function StatsBar({ tasks }: StatsBarProps) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;
  const todayStr = getLocalDateString();
  const overdue = tasks.filter((t) => {
    const clean = t.dueDate ? t.dueDate.split('T')[0] : '';
    return !t.completed && clean !== '' && clean < todayStr;
  }).length;

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="rounded-2xl bg-white/90 border border-[#E9DCFA] p-4 shadow-xs">
      {/* Progress Heading */}
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="font-semibold text-[#422F5A]">Daily Harmony</span>
        <span className="font-mono font-bold text-[#7C3AED] tabular-nums">{percent}% completed</span>
      </div>

      {/* Pastel Progress Bar */}
      <div className="w-full h-2.5 bg-[#F1E8FB] rounded-full overflow-hidden p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#A78BFA] via-[#F472B6] to-[#34D399] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-[#F5ECFD] text-center">
        <div>
          <span className="block text-base font-bold font-mono text-[#32214C] tabular-nums">
            {total}
          </span>
          <span className="block text-[10px] text-[#8C7B9E]">Total</span>
        </div>
        <div>
          <span className="block text-base font-bold font-mono text-[#7C3AED] tabular-nums">
            {active}
          </span>
          <span className="block text-[10px] text-[#8C7B9E]">Active</span>
        </div>
        <div>
          <span className="block text-base font-bold font-mono text-[#059669] tabular-nums">
            {completed}
          </span>
          <span className="block text-[10px] text-[#8C7B9E]">Done</span>
        </div>
        <div>
          <span
            className={`block text-base font-bold font-mono tabular-nums ${
              overdue > 0 ? 'text-[#E11D48]' : 'text-[#8C7B9E]'
            }`}
          >
            {overdue}
          </span>
          <span className="block text-[10px] text-[#8C7B9E]">Overdue</span>
        </div>
      </div>
    </div>
  );
}
