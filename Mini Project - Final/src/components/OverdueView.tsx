import { AlarmClock, Calendar, Check } from 'lucide-react';
import { Task } from '../types/todo';
import { getLocalDateString } from '../utils/date';
import { TaskItem } from './TaskItem';

interface OverdueViewProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onRescheduleAllToToday: () => void;
}

export function OverdueView({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  onToggleSubtask,
  onRescheduleAllToToday,
}: OverdueViewProps) {
  const todayStr = getLocalDateString();
  const overdueTasks = tasks.filter((t) => {
    const clean = t.dueDate ? t.dueDate.split('T')[0] : '';
    return !t.completed && clean !== '' && clean < todayStr;
  });

  return (
    <div className="space-y-6">
      <div className="bg-[#FBF9F2] rounded-3xl border border-[#F6BCC5] p-5 sm:p-7 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#DDD6EC]">
          <div className="flex items-center gap-3">
            {/* AlarmClock icon as requested from Image 2 */}
            <div className="w-10 h-10 rounded-2xl bg-[#FDECEF] border border-[#F6BCC5] flex items-center justify-center text-[#D44355] shadow-2xs">
              <AlarmClock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-xl text-[#2E2741]">
                  Overdue Tasks
                </h3>
                <span className="text-[11px] font-mono font-bold bg-[#FDECEF] text-[#D44355] px-2.5 py-0.5 rounded-full border border-[#F6BCC5]">
                  {overdueTasks.length} pending
                </span>
              </div>
              <p className="text-xs text-[#766E87] mt-0.5 font-mono">
                Past scheduled cutoff dates.
              </p>
            </div>
          </div>

          {overdueTasks.length > 0 && (
            <button
              onClick={onRescheduleAllToToday}
              className="px-4 py-2 rounded-xl bg-[#D44355] hover:bg-[#B73344] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer font-mono"
            >
              <Calendar className="h-4 w-4" />
              <span>Reschedule All to Today</span>
            </button>
          )}
        </div>

        {overdueTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#DDD6EC] bg-[#FFFFFF] p-8 text-center">
            <div className="w-10 h-10 rounded-full bg-[#E6EFF5] border border-[#D9E4EC] flex items-center justify-center text-[#3B607A] mx-auto mb-2">
              <Check className="h-5 w-5 stroke-[2.5]" />
            </div>
            <h4 className="text-sm font-semibold text-[#2E2741]">
              Zero Overdue Tasks
            </h4>
            <p className="text-xs text-[#766E87] mt-1 max-w-sm mx-auto font-mono">
              All tasks are on track.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {overdueTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleSubtask={onToggleSubtask}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
