import { Plus, FolderHeart } from 'lucide-react';
import { Task, Category } from '../types/todo';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import { TaskItem } from './TaskItem';

interface CategoriesViewProps {
  tasks: Task[];
  categories?: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onOpenNewTaskModal: (prefillCategory?: string) => void;
}

export function CategoriesView({
  tasks,
  categories = DEFAULT_CATEGORIES,
  selectedCategoryId,
  onSelectCategory,
  onToggleComplete,
  onEdit,
  onDelete,
  onToggleSubtask,
  onOpenNewTaskModal,
}: CategoriesViewProps) {
  const currentCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0] || DEFAULT_CATEGORIES[0];
  const activeCategoryTasks = tasks.filter((t) => !t.completed && t.category === currentCategory.id);
  const completedCategoryCount = tasks.filter((t) => t.completed && t.category === currentCategory.id).length;

  return (
    <div className="space-y-6">
      {/* Category Pills Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = cat.id === currentCategory.id;
          const count = tasks.filter((t) => !t.completed && t.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-2 shadow-2xs ${
                isSelected
                  ? 'bg-[#E7D1DA] text-[#2E2741] border-[#D9BFCC] shadow-xs'
                  : 'bg-[#FFFFFF] text-[#606362] border-[#DDD6EC] hover:text-[#2E2741] hover:bg-[#FAF7F2]'
              }`}
            >
              <span
                style={{ color: cat.color }}
                className="text-[11px]"
              >
                ●
              </span>
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono tabular-nums ${
                  isSelected ? 'bg-white/60 text-[#2E2741]' : 'bg-[#EDE9F6] text-[#766E87]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Category Workspace Card */}
      <div className="bg-[#FBF9F2] rounded-3xl border border-[#DDD6EC] p-5 sm:p-7 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#DDD6EC]">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                style={{ color: currentCategory.color }}
                className="text-xl"
              >
                ●
              </span>
              <h3 className="font-display font-bold text-xl text-[#2E2741]">
                {currentCategory.name}
              </h3>
            </div>
            <p className="text-xs text-[#766E87] mt-1 font-mono">
              {activeCategoryTasks.length} active · {completedCategoryCount} in completed archive
            </p>
          </div>

          <button
            onClick={() => onOpenNewTaskModal(currentCategory.id)}
            className="px-4 py-2 rounded-xl bg-[#606362] hover:bg-[#494D4B] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer font-mono"
          >
            <Plus className="h-4 w-4" />
            <span>Add to {currentCategory.name}</span>
          </button>
        </div>

        {/* Tasks in Category */}
        {activeCategoryTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#DDD6EC] bg-[#FFFFFF] p-8 text-center">
            <FolderHeart className="h-8 w-8 text-[#E7D1DA] mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-[#2E2741]">
              No active tasks in {currentCategory.name}
            </h4>
            <p className="text-xs text-[#766E87] mt-1 max-w-sm mx-auto font-mono">
              {completedCategoryCount > 0
                ? `${completedCategoryCount} task${completedCategoryCount > 1 ? 's' : ''} finished and moved to Completed tab.`
                : `Add your first task in ${currentCategory.name}.`}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeCategoryTasks.map((task) => (
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
