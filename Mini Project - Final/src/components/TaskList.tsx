import { 
  Trash2, 
  Sparkles
} from 'lucide-react';
import { Task, FilterStatus, FilterDue, SortOption, GroupOption } from '../types/todo';
import { TaskItem } from './TaskItem';
import { DEFAULT_CATEGORIES, PRIORITY_CONFIG } from '../utils/categories';
import { getLocalDateString, getRelativeDayString, parseLocalDate } from '../utils/date';
import { CloverIcon } from './CloverIcon';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onClearCompleted: () => void;
  filterStatus: FilterStatus;
  onFilterStatusChange: (status: FilterStatus) => void;
  filterDue: FilterDue;
  onFilterDueChange: (due: FilterDue) => void;
  sortOption: SortOption;
  onSortOptionChange: (sort: SortOption) => void;
  groupOption: GroupOption;
  onGroupOptionChange: (group: GroupOption) => void;
  searchQuery: string;
}

export function TaskList({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  onToggleSubtask,
  onClearCompleted,
  filterStatus,
  onFilterStatusChange,
  filterDue,
  onFilterDueChange,
  sortOption,
  onSortOptionChange,
  groupOption,
  onGroupOptionChange,
  searchQuery,
}: TaskListProps) {
  const completedCount = tasks.filter((t) => t.completed).length;

  const todayStr = getLocalDateString();
  const tomorrowStr = getRelativeDayString(1);

  const filteredTasks = tasks.filter((task) => {
    // Status filter
    if (filterStatus === 'active' && task.completed) return false;
    if (filterStatus === 'completed' && !task.completed) return false;

    const cleanDate = task.dueDate ? task.dueDate.split('T')[0] : '';

    // Due date filter
    if (filterDue === 'today' && cleanDate !== todayStr) return false;
    if (filterDue === 'overdue' && (!cleanDate || cleanDate >= todayStr || task.completed)) return false;
    if (filterDue === 'upcoming' && (!cleanDate || cleanDate <= todayStr)) return false;
    if (filterDue === 'no-date' && cleanDate) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchTag = task.tags?.some((t) => t.toLowerCase().includes(q));
      const matchCategory = task.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchTag && !matchCategory) return false;
    }

    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortOption === 'due-date') {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (sortOption === 'priority') {
      const pMap = { urgent: 4, high: 3, medium: 2, low: 1 };
      return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
    }
    if (sortOption === 'created-desc') {
      return b.createdAt.localeCompare(a.createdAt);
    }
    if (sortOption === 'created-asc') {
      return a.createdAt.localeCompare(b.createdAt);
    }
    if (sortOption === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  // Group tasks
  const renderGroupedContent = () => {
    if (groupOption === 'due-date') {
      const overdue: Task[] = [];
      const today: Task[] = [];
      const tomorrow: Task[] = [];
      const upcoming: Task[] = [];
      const someday: Task[] = [];

      sortedTasks.forEach((t) => {
        const cleanDate = t.dueDate ? t.dueDate.split('T')[0] : '';
        if (!cleanDate) {
          someday.push(t);
        } else if (!t.completed && cleanDate < todayStr) {
          overdue.push(t);
        } else if (cleanDate === todayStr) {
          today.push(t);
        } else if (cleanDate === tomorrowStr) {
          tomorrow.push(t);
        } else {
          upcoming.push(t);
        }
      });

      const tomorrowObj = parseLocalDate(tomorrowStr);
      const tomorrowLabel = tomorrowObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      const groups = [
        { title: 'Overdue', list: overdue, badgeColor: '#D44355' },
        { title: 'Due Today', list: today, badgeColor: '#3B607A' },
        { title: `Due ${tomorrowLabel}`, list: tomorrow, badgeColor: '#8A5D6F' },
        { title: 'Upcoming', list: upcoming, badgeColor: '#606362' },
        { title: 'Unscheduled', list: someday, badgeColor: '#766E87' },
      ].filter((g) => g.list.length > 0);

      if (groups.length === 0) return renderEmptyState();

      return (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.title} className="space-y-2.5">
              <div className="flex items-center gap-2 px-1">
                <span
                  style={{ backgroundColor: group.badgeColor }}
                  className="w-2.5 h-2.5 rounded-full"
                />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#2E2741]">
                  {group.title}
                </h4>
                <span className="text-[11px] font-mono text-[#766E87] tabular-nums">
                  ({group.list.length})
                </span>
              </div>
              <div className="space-y-2.5">
                {group.list.map((task) => (
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
            </div>
          ))}
        </div>
      );
    }

    if (groupOption === 'priority') {
      const priorityKeys: ('urgent' | 'high' | 'medium' | 'low')[] = ['urgent', 'high', 'medium', 'low'];
      const groups = priorityKeys
        .map((pk) => ({
          key: pk,
          config: PRIORITY_CONFIG[pk],
          list: sortedTasks.filter((t) => t.priority === pk),
        }))
        .filter((g) => g.list.length > 0);

      if (groups.length === 0) return renderEmptyState();

      return (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.key} className="space-y-2.5">
              <div className="flex items-center gap-2 px-1">
                <span
                  style={{ backgroundColor: group.config.color }}
                  className="w-2.5 h-2.5 rounded-full"
                />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#2E2741]">
                  {group.config.label}
                </h4>
                <span className="text-[11px] font-mono text-[#766E87] tabular-nums">
                  ({group.list.length})
                </span>
              </div>
              <div className="space-y-2.5">
                {group.list.map((task) => (
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
            </div>
          ))}
        </div>
      );
    }

    if (groupOption === 'category') {
      const groups = DEFAULT_CATEGORIES.map((cat) => ({
        cat,
        list: sortedTasks.filter((t) => t.category === cat.id),
      })).filter((g) => g.list.length > 0);

      if (groups.length === 0) return renderEmptyState();

      return (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.cat.id} className="space-y-2.5">
              <div className="flex items-center gap-2 px-1">
                <span
                  style={{ backgroundColor: group.cat.color }}
                  className="w-2.5 h-2.5 rounded-full"
                />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#2E2741]">
                  {group.cat.name}
                </h4>
                <span className="text-[11px] font-mono text-[#766E87] tabular-nums">
                  ({group.list.length})
                </span>
              </div>
              <div className="space-y-2.5">
                {group.list.map((task) => (
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
            </div>
          ))}
        </div>
      );
    }

    // Flat list
    if (sortedTasks.length === 0) return renderEmptyState();

    return (
      <div className="space-y-2.5">
        {sortedTasks.map((task) => (
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
    );
  };

  const renderEmptyState = () => (
    <div className="rounded-3xl border border-dashed border-[#DDD6EC] bg-[#FFFFFF]/60 p-10 text-center flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-[#EDE9F6] border border-[#DDD6EC] flex items-center justify-center text-[#766E87] mb-3">
        <Sparkles className="h-6 w-6 text-[#E7D1DA]" />
      </div>
      <h3 className="font-display font-bold text-base text-[#2E2741]">
        No tasks found
      </h3>
      <p className="mt-1 text-xs text-[#766E87] max-w-sm font-mono">
        {searchQuery
          ? `No tasks match "${searchQuery}".`
          : filterStatus === 'completed'
          ? "No completed tasks yet."
          : "Your to-do list is clean. Add a task using the + button to get started."}
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#EDE9F6] rounded-2xl border border-[#DDD6EC]">
          <button
            onClick={() => onFilterStatusChange('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-[#FFFFFF] text-[#2E2741] shadow-2xs font-bold'
                : 'text-[#766E87] hover:text-[#2E2741]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onFilterStatusChange('active')}
            className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              filterStatus === 'active'
                ? 'bg-[#FFFFFF] text-[#2E2741] shadow-2xs font-bold'
                : 'text-[#766E87] hover:text-[#2E2741]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => onFilterStatusChange('completed')}
            className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              filterStatus === 'completed'
                ? 'bg-[#FFFFFF] text-[#2E2741] shadow-2xs font-bold'
                : 'text-[#766E87] hover:text-[#2E2741]'
            }`}
          >
            Done ({completedCount})
          </button>
        </div>

        {/* Due Date, Sort, and Group */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterDue}
            onChange={(e) => onFilterDueChange(e.target.value as FilterDue)}
            style={{ textAlign: 'center', textAlignLast: 'center' }}
            className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#DDD6EC] text-xs text-[#2E2741] cursor-pointer focus:outline-hidden shadow-2xs text-center"
          >
            <option value="all" style={{ textAlign: 'center' }}>Any Date</option>
            <option value="today" style={{ textAlign: 'center' }}>Due Today</option>
            <option value="upcoming" style={{ textAlign: 'center' }}>Upcoming</option>
            <option value="overdue" style={{ textAlign: 'center' }}>Overdue</option>
            <option value="no-date" style={{ textAlign: 'center' }}>No Date</option>
          </select>

          <select
            value={groupOption}
            onChange={(e) => onGroupOptionChange(e.target.value as GroupOption)}
            style={{ textAlign: 'center', textAlignLast: 'center' }}
            className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#DDD6EC] text-xs text-[#2E2741] cursor-pointer focus:outline-hidden shadow-2xs text-center"
          >
            <option value="none" style={{ textAlign: 'center' }}>Flat View</option>
            <option value="due-date" style={{ textAlign: 'center' }}>By Due Date</option>
            <option value="priority" style={{ textAlign: 'center' }}>By Priority</option>
            <option value="category" style={{ textAlign: 'center' }}>By Category</option>
          </select>

          <select
            value={sortOption}
            onChange={(e) => onSortOptionChange(e.target.value as SortOption)}
            style={{ textAlign: 'center', textAlignLast: 'center' }}
            className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#DDD6EC] text-xs text-[#2E2741] cursor-pointer focus:outline-hidden shadow-2xs text-center"
          >
            <option value="due-date" style={{ textAlign: 'center' }}>Sort: Due Date</option>
            <option value="priority" style={{ textAlign: 'center' }}>Sort: Priority</option>
            <option value="created-desc" style={{ textAlign: 'center' }}>Sort: Newest</option>
            <option value="created-asc" style={{ textAlign: 'center' }}>Sort: Oldest</option>
            <option value="alphabetical" style={{ textAlign: 'center' }}>Sort: Title (A-Z)</option>
          </select>

          {completedCount > 0 && filterStatus !== 'active' && (
            <button
              onClick={onClearCompleted}
              title="Clear all completed tasks"
              className="p-1.5 text-xs text-[#766E87] hover:text-[#D44355] hover:bg-[#FDECEF] rounded-xl transition-colors cursor-pointer flex items-center gap-1 font-mono border border-transparent hover:border-[#F6BCC5]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear done</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {renderGroupedContent()}
    </div>
  );
}
