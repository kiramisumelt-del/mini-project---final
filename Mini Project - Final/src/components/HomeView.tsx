import { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Sparkles, 
  AlertTriangle, 
  ArrowRight,
  Check,
  Search,
  Layers,
  CalendarDays
} from 'lucide-react';
import { Task, Priority } from '../types/todo';
import { TaskItem } from './TaskItem';
import { QuickAddBar } from './QuickAddBar';
import { TaskCalendar } from './TaskCalendar';
import { CloverIcon } from './CloverIcon';
import { getLocalDateString, getRelativeDayString, parseLocalDate } from '../utils/date';

interface HomeViewProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onQuickAdd: (taskData: {
    title: string;
    category: string;
    priority: Priority;
    dueDate?: string;
    dueTime?: string;
  }) => void;
  onOpenFullModal: (prefillTitle?: string, prefillDate?: string, prefillCategory?: string) => void;
  onNavigateToTab: (tab: 'all' | 'categories' | 'overdue' | 'completed') => void;
  searchQuery?: string;
  onClearSearch?: () => void;
}

export function HomeView({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  onToggleSubtask,
  onQuickAdd,
  onOpenFullModal,
  onNavigateToTab,
  searchQuery,
  onClearSearch,
}: HomeViewProps) {
  // Use local date instead of UTC
  const todayStr = getLocalDateString();

  // Selected view filter for the Next 3 Days widget: 'all' | dateStr
  const [activeUpcomingFilter, setActiveUpcomingFilter] = useState<string>('all');

  // Search query matches for HomeView
  const matchingTasks = searchQuery?.trim()
    ? tasks.filter((t) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q))
        );
      })
    : [];

  // Overdue tasks check
  const overdueTasks = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate.split('T')[0] < todayStr);

  // 1. WIDGET 1 DATA: TODAY'S TASKS
  const dueTodayTasks = tasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate.split('T')[0] === todayStr
  );
  const allTodayTasks = tasks.filter(
    (t) => t.dueDate && t.dueDate.split('T')[0] === todayStr
  );
  const dueTodayCompleted = allTodayTasks.filter((t) => t.completed).length;

  // 2. WIDGET 2 DATA: UPCOMING NEXT 3 DAYS (Using exact day names and dates)
  const upcomingDays = [
    {
      dateStr: getRelativeDayString(1),
      badgeColor: 'bg-[#E7D1DA] text-[#2E2741] border-[#D9BFCC]',
    },
    {
      dateStr: getRelativeDayString(2),
      badgeColor: 'bg-[#EDE9F6] text-[#2E2741] border-[#DDD6EC]',
    },
    {
      dateStr: getRelativeDayString(3),
      badgeColor: 'bg-[#F2EDDC] text-[#2E2741] border-[#DDD6EC]',
    },
  ].map((item) => {
    const dObj = parseLocalDate(item.dateStr);
    const shortLabel = dObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const fullDate = dObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
    const activeTasks = tasks.filter(
      (t) => !t.completed && t.dueDate && t.dueDate.split('T')[0] === item.dateStr
    );
    const completedTasks = tasks.filter(
      (t) => t.completed && t.dueDate && t.dueDate.split('T')[0] === item.dateStr
    );

    return {
      dateStr: item.dateStr,
      badgeColor: item.badgeColor,
      shortLabel,
      fullDate,
      activeTasks,
      completedTasks,
      totalCount: activeTasks.length + completedTasks.length,
    };
  });

  const totalUpcomingActiveCount = upcomingDays.reduce((acc, d) => acc + d.activeTasks.length, 0);

  const displayedUpcomingDays = activeUpcomingFilter === 'all'
    ? upcomingDays
    : upcomingDays.filter((d) => d.dateStr === activeUpcomingFilter);

  return (
    <div className="space-y-6">
      {/* Search Outcomes in Home View */}
      {searchQuery && searchQuery.trim() && (
        <section className="bg-[#FFFFFF] rounded-3xl border border-[#DDD6EC] p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#D9E4EC] flex items-center justify-center text-[#2E2741] shadow-2xs">
                <Search className="w-4 h-4 text-[#3B607A]" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[#2E2741] flex items-center gap-2">
                  <span>Search Outcomes for &ldquo;{searchQuery}&rdquo;</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#EDE9F6] text-[#2E2741]">
                    {matchingTasks.length} found
                  </span>
                </h3>
                <p className="text-xs text-[#606362] font-mono">
                  {matchingTasks.length > 0
                    ? 'Matching tasks across all categories and status'
                    : 'No matching tasks found. Try another keyword or create a new task.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onClearSearch && (
                <button
                  type="button"
                  onClick={onClearSearch}
                  className="px-3 py-1 rounded-full bg-[#FBF9F2] hover:bg-[#EDE9F6] border border-[#DDD6EC] text-xs font-mono text-[#606362] transition-colors cursor-pointer"
                >
                  Clear search
                </button>
              )}
              <button
                type="button"
                onClick={() => onNavigateToTab('all')}
                className="px-3.5 py-1.5 rounded-full bg-[#2E2741] hover:bg-[#3B607A] text-[#FFFDF9] text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <span>View all in repository</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {matchingTasks.length > 0 ? (
            <div className="space-y-2 pt-1">
              {matchingTasks.map((task) => (
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
          ) : (
            <div className="p-5 rounded-2xl bg-[#FBF9F2] text-center border border-dashed border-[#DDD6EC] space-y-2">
              <p className="text-xs font-semibold text-[#2E2741]">
                No tasks match &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-[11px] text-[#606362] font-mono">
                Ways to satisfy this: Use Quick Add below to create it, or clear your search to see today&rsquo;s schedule.
              </p>
            </div>
          )}
        </section>
      )}

      {/* 1. QUICK ADD TASK WIDGET */}
      <QuickAddBar 
        onQuickAdd={onQuickAdd} 
        onOpenFullModal={(title, date, cat) => onOpenFullModal(title, date, cat)}
      />

      {/* 2. WIDGET 1: DUE TODAY (Retaining original design and styling) */}
      <section className="bg-[#FBF9F2] rounded-3xl border border-[#DDD6EC] shadow-sm overflow-hidden">
        {/* Original Aesthetic Header */}
        <div className="relative bg-gradient-to-r from-[#D9E4EC]/70 via-[#E7D1DA]/50 to-[#FBF9F2] p-5 sm:p-6 border-b border-[#DDD6EC]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFFFFF] border border-[#DDD6EC] flex items-center justify-center text-[#2E2741] shadow-xs">
                <CalendarIcon className="h-4 w-4 text-[#3B607A]" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-[#2E2741] flex items-center gap-1.5">
                  <span>Due Today</span>
                  <CloverIcon className="w-4 h-4 text-[#E7D1DA]" />
                </h2>
                <p className="text-xs text-[#766E87] font-mono mt-0.5">
                  {dueTodayTasks.length} active · {dueTodayCompleted} checked off
                </p>
              </div>
            </div>

            {dueTodayCompleted > 0 && (
              <button
                type="button"
                onClick={() => onNavigateToTab('completed')}
                className="px-3.5 py-1.5 rounded-full bg-[#FFFFFF] hover:bg-[#F5EFF8] border border-[#DDD6EC] text-xs font-mono font-medium text-[#2E2741] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Check className="h-3.5 w-3.5 text-[#3B607A]" />
                <span>View Done</span>
              </button>
            )}
          </div>
        </div>

        {/* Original Due Today Tasks List / Empty State */}
        <div className="p-5 sm:p-6">
          {dueTodayTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#DDD6EC] bg-[#FFFFFF]/70 p-6 text-center">
              <Sparkles className="h-6 w-6 text-[#E7D1DA] mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-[#2E2741]">
                {dueTodayCompleted > 0
                  ? 'All tasks for today are completed!'
                  : 'No tasks due on today'}
              </h4>
              <p className="text-xs text-[#766E87] mt-1 max-w-sm mx-auto font-mono">
                {dueTodayCompleted > 0
                  ? `${dueTodayCompleted} completed task${dueTodayCompleted > 1 ? 's' : ''} moved to Completed tab.`
                  : 'Nothing scheduled for today. Add a new task above.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {dueTodayTasks.map((task) => (
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
      </section>

      {/* 3. WIDGET 2: SEPARATE WIDGET FOR UPCOMING NEXT 3 DAYS */}
      <section className="bg-[#FBF9F2] rounded-3xl border border-[#DDD6EC] shadow-sm overflow-hidden">
        {/* Widget Header with Dates */}
        <div className="relative bg-gradient-to-r from-[#EDE9F6]/80 via-[#F5E7ED]/70 to-[#FBF9F2] p-5 sm:p-6 border-b border-[#DDD6EC]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFFFFF] border border-[#DDD6EC] flex items-center justify-center text-[#2E2741] shadow-xs">
                <CalendarDays className="h-5 w-5 text-[#8A5D6F]" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-[#2E2741] flex items-center gap-1.5">
                  <span>Upcoming Schedule</span>
                  <CloverIcon className="w-4 h-4 text-[#8A5D6F]/60" />
                </h2>
                <p className="text-xs text-[#766E87] font-mono mt-0.5">
                  {totalUpcomingActiveCount} active {totalUpcomingActiveCount === 1 ? 'task' : 'tasks'} scheduled
                </p>
              </div>
            </div>
          </div>

          {/* Date Filter Pills Bar */}
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-[#DDD6EC]/60 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveUpcomingFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeUpcomingFilter === 'all'
                  ? 'bg-[#2E2741] text-[#FFFDF9] shadow-xs'
                  : 'bg-[#FFFFFF] text-[#606362] hover:bg-[#EDE9F6] border border-[#DDD6EC]'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>All 3 Days</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeUpcomingFilter === 'all' ? 'bg-[#FFFDF9]/20 text-white' : 'bg-[#EDE9F6] text-[#2E2741]'
              }`}>
                {totalUpcomingActiveCount}
              </span>
            </button>

            {upcomingDays.map((d) => (
              <button
                key={d.dateStr}
                type="button"
                onClick={() => setActiveUpcomingFilter(d.dateStr)}
                className={`px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeUpcomingFilter === d.dateStr
                    ? 'bg-[#8A5D6F] text-white shadow-xs'
                    : 'bg-[#FFFFFF] text-[#606362] hover:bg-[#EDE9F6] border border-[#DDD6EC]'
                }`}
              >
                <span>{d.shortLabel}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeUpcomingFilter === d.dateStr
                    ? 'bg-white/20 text-white'
                    : d.activeTasks.length > 0
                    ? 'bg-[#E7D1DA] text-[#2E2741] font-bold'
                    : 'bg-[#EDE9F6] text-[#766E87]'
                }`}>
                  {d.activeTasks.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Days List Content */}
        <div className="p-4 sm:p-6 space-y-5">
          {displayedUpcomingDays.map((day) => (
            <div 
              key={day.dateStr} 
              id={`schedule-day-${day.dateStr}`}
              className="rounded-2xl border border-[#DDD6EC] bg-[#FFFFFF] p-4 sm:p-5 shadow-2xs space-y-3"
            >
              {/* Day Subheader with Actual Date */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#DDD6EC]/60">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${day.badgeColor}`}>
                    {day.shortLabel}
                  </span>
                  <span className="text-xs font-mono text-[#766E87]">
                    ({day.activeTasks.length} {day.activeTasks.length === 1 ? 'task' : 'tasks'})
                  </span>
                </div>
              </div>

              {/* Day Tasks List */}
              {day.activeTasks.length > 0 ? (
                <div className="space-y-2.5 pt-1">
                  {day.activeTasks.map((task) => (
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
              ) : (
                <div className="rounded-2xl border border-dashed border-[#DDD6EC] bg-[#FFFFFF]/70 p-6 text-center">
                  <Sparkles className="h-6 w-6 text-[#E7D1DA] mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-[#2E2741]">
                    {day.completedTasks.length > 0 ? 'All tasks completed!' : 'All tasks for today are completed!'}
                  </h4>
                  <p className="text-xs text-[#766E87] mt-1 max-w-sm mx-auto font-mono">
                    Nothing scheduled.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Overdue Alert Strip (if any exist) */}
      {overdueTasks.length > 0 && (
        <div className="bg-[#FDECEF] rounded-3xl border border-[#F6BCC5] p-4 sm:p-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFFFFF] border border-[#F6BCC5] flex items-center justify-center text-[#D44355] shadow-2xs">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-[#A02535] block">
                {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}
              </span>
              <span className="text-[11px] text-[#766E87] font-mono">Cutoff dates passed</span>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('overdue')}
            className="px-3.5 py-1.5 rounded-full bg-[#FFFFFF] hover:bg-[#FDF2F4] border border-[#F6BCC5] text-xs font-mono font-semibold text-[#A02535] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <span>Review</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* 4. CALENDAR WIDGET WITH INTERACTIVE DAY SELECTION & TASK REDIRECT */}
      <TaskCalendar
        tasks={tasks}
        onSelectCalendarDate={(dateStr) => {
          if (upcomingDays.some((d) => d.dateStr === dateStr)) {
            setActiveUpcomingFilter('all');
          }
        }}
      />
    </div>
  );
}
