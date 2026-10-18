import { useState } from 'react';
import { 
  Check, 
  Calendar, 
  Clock, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  AlarmClock,
  ListTodo,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { Task } from '../types/todo';
import { DEFAULT_CATEGORIES, PRIORITY_CONFIG } from '../utils/categories';
import { getLocalDateString, getRelativeDayString, parseLocalDate } from '../utils/date';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

export function TaskItem({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onToggleSubtask,
}: TaskItemProps) {
  const [showSubtasks, setShowSubtasks] = useState(false);

  const category = DEFAULT_CATEGORIES.find((c) => c.id === task.category) || {
    id: task.category,
    name: task.category,
    color: '#606362',
    bgColor: '#FBF9F2',
    borderColor: '#DDD6EC',
  };

  const priorityMeta = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  const todayStr = getLocalDateString();
  const cleanDueDate = task.dueDate ? task.dueDate.split('T')[0] : '';
  const isOverdue = !task.completed && cleanDueDate !== '' && cleanDueDate < todayStr;
  const isDueToday = !task.completed && cleanDueDate === todayStr;

  const formatDueDisplay = (dateStr?: string, timeStr?: string) => {
    if (!dateStr) return null;
    const cleanStr = dateStr.split('T')[0];
    const tomorrowStr = getRelativeDayString(1);
    const date = parseLocalDate(cleanStr);
    
    let label = '';
    if (cleanStr === todayStr) {
      label = 'Today';
    } else {
      label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    if (timeStr) {
      label += ` · ${timeStr}`;
    }
    return label;
  };

  const dueLabel = formatDueDisplay(task.dueDate, task.dueTime);
  const totalSubtasksCount = task.subtasks?.length || 0;
  const completedSubtasksCount = task.subtasks?.filter((st) => st.completed).length || 0;

  return (
    <div
      id={`task-card-${task.id}`}
      className={`group relative rounded-2xl border transition-all duration-200 p-3.5 sm:p-4 shadow-xs ${
        task.completed
          ? 'bg-[#FBF9F2]/60 border-[#E5DFEE] opacity-60'
          : isOverdue
          ? 'bg-[#FFF8F9] border-[#F6BCC5] hover:border-[#D44355]/40'
          : 'bg-[#FFFFFF] border-[#DDD6EC] hover:border-[#606362]/30 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox button */}
        <button
          onClick={() => onToggleComplete(task.id)}
          className={`shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
            task.completed
              ? 'bg-[#606362] border-[#606362] text-white scale-100 shadow-2xs'
              : 'border-[#766E87] hover:border-[#2E2741] hover:bg-[#EDE9F6] active:scale-90'
          }`}
          aria-label={task.completed ? 'Mark task incomplete' : 'Mark task completed'}
        >
          {task.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {/* Title */}
            <h4
              className={`text-sm sm:text-base font-semibold leading-snug break-words transition-colors ${
                task.completed ? 'line-through text-[#766E87]' : 'text-[#2E2741]'
              }`}
            >
              {task.title}
            </h4>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-[#766E87] mb-2 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            {/* Category Badge */}
            <span
              style={{
                backgroundColor: category.bgColor,
                color: category.color,
                borderColor: category.borderColor,
              }}
              className="px-2 py-0.5 rounded-md border font-semibold inline-flex items-center gap-1"
            >
              <span className="text-[9px]">●</span>
              <span>{category.name}</span>
            </span>

            {/* Priority Badge */}
            <span
              style={{
                backgroundColor: priorityMeta.bgColor,
                color: priorityMeta.textColor,
                borderColor: priorityMeta.borderColor,
              }}
              className="px-2 py-0.5 rounded-md border font-semibold"
            >
              {priorityMeta.label}
            </span>

            {/* Due Date Indicator with AlarmClock icon if overdue */}
            {dueLabel && (
              <span
                className={`px-2 py-0.5 rounded-md border inline-flex items-center gap-1 font-semibold ${
                  isOverdue
                    ? 'bg-[#FDECEF] text-[#D44355] border-[#F6BCC5]'
                    : isDueToday
                    ? 'bg-[#D9E4EC]/60 text-[#2E2741] border-[#C2D2DE]'
                    : 'bg-[#FBF9F2] text-[#766E87] border-[#DDD6EC]'
                }`}
              >
                {isOverdue ? (
                  <AlarmClock className="h-3 w-3 text-[#D44355]" />
                ) : (
                  <Calendar className="h-3 w-3" />
                )}
                <span>{dueLabel}</span>
              </span>
            )}

            {/* Subtasks Count with dropdown toggle */}
            {totalSubtasksCount > 0 && (
              <button
                onClick={() => setShowSubtasks(!showSubtasks)}
                className="px-2 py-0.5 rounded-md border border-[#DDD6EC] bg-[#FBF9F2] text-[#766E87] hover:text-[#2E2741] inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ListTodo className="h-3 w-3" />
                <span>
                  {completedSubtasksCount}/{totalSubtasksCount}
                </span>
                {showSubtasks ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
            )}
          </div>

          {/* Subtasks List */}
          {showSubtasks && totalSubtasksCount > 0 && (
            <div className="mt-3 pt-2.5 border-t border-[#DDD6EC] space-y-1.5">
              {task.subtasks.map((st) => (
                <div
                  key={st.id}
                  onClick={() => onToggleSubtask(task.id, st.id)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#EDE9F6]/60 cursor-pointer text-xs transition-colors"
                >
                  <button
                    className="shrink-0 text-[#606362]"
                    aria-label={st.completed ? 'Mark subtask incomplete' : 'Mark subtask complete'}
                  >
                    {st.completed ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#3B607A]" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-[#766E87]" />
                    )}
                  </button>
                  <span
                    className={`${
                      st.completed ? 'line-through text-[#766E87]' : 'text-[#2E2741]'
                    }`}
                  >
                    {st.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            title="Edit task"
            className="p-1.5 rounded-lg text-[#766E87] hover:text-[#2E2741] hover:bg-[#EDE9F6] transition-colors cursor-pointer"
            aria-label="Edit task"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            title="Delete task"
            className="p-1.5 rounded-lg text-[#766E87] hover:text-[#D44355] hover:bg-[#FDECEF] transition-colors cursor-pointer"
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
