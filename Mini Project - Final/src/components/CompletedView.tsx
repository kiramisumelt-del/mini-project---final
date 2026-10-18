import { CheckCircle2, Trash2, Sparkles } from 'lucide-react';
import { Task } from '../types/todo';
import { TaskItem } from './TaskItem';
import { CloverIcon } from './CloverIcon';

interface CompletedViewProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onClearCompleted: () => void;
}

export function CompletedView({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  onToggleSubtask,
  onClearCompleted,
}: CompletedViewProps) {
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-6">
      <div className="bg-[#FBF9F2] rounded-3xl border border-[#DDD6EC] p-5 sm:p-7 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#DDD6EC]">
          <div className="flex items-center gap-3">
            {/* Clean CheckCircle2 icon as requested */}
            <div className="w-10 h-10 rounded-2xl bg-[#E6EFF5] border border-[#D9E4EC] flex items-center justify-center text-[#3B607A] shadow-2xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-xl text-[#2E2741]">
                  Completed Archive
                </h3>
                <span className="text-[11px] font-mono font-bold bg-[#E6EFF5] text-[#3B607A] px-2.5 py-0.5 rounded-full border border-[#D9E4EC]">
                  {completedTasks.length} achieved
                </span>
              </div>
              <p className="text-xs text-[#766E87] mt-0.5 font-mono">
                Log of finished items.
              </p>
            </div>
          </div>

          {completedTasks.length > 0 && (
            <button
              onClick={onClearCompleted}
              className="px-4 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FDECEF] border border-[#DDD6EC] hover:border-[#F6BCC5] text-[#D44355] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer font-mono shadow-2xs"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear Archive</span>
            </button>
          )}
        </div>

        {completedTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#DDD6EC] bg-[#FFFFFF] p-8 text-center">
            <Sparkles className="h-8 w-8 text-[#E7D1DA] mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-[#2E2741]">
              No completed tasks yet
            </h4>
            <p className="text-xs text-[#766E87] mt-1 max-w-sm mx-auto font-mono">
              Tasks you check off will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {completedTasks.map((task) => (
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
