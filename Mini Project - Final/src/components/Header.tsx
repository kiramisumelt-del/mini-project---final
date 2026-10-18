import { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Search, 
  X, 
  ChevronDown, 
  Check, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import { CloverIcon } from './CloverIcon';
import { motion, AnimatePresence } from 'motion/react';
import { Task, NavigationTab, SortOption, FilterDue } from '../types/todo';
import { DEFAULT_CATEGORIES, PRIORITY_CONFIG } from '../utils/categories';

const GREETINGS = [
  'wassup kira',
  'you got this kira',
  "what's new kira",
  'ready, kira?',
  'stay cozy kira',
];

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'Any priority', colorClass: 'text-[#362C4C]' },
  { value: 'urgent', label: 'Urgent', colorClass: 'text-[#D44355] font-semibold' },
  { value: 'high', label: 'High', colorClass: 'text-[#C9772B] font-semibold' },
  { value: 'medium', label: 'Medium', colorClass: 'text-[#3B607A]' },
  { value: 'low', label: 'Low', colorClass: 'text-[#606362]' },
];

const DUE_OPTIONS: { value: FilterDue; label: string; colorClass?: string }[] = [
  { value: 'all', label: 'Any due date', colorClass: 'text-[#362C4C]' },
  { value: 'today', label: 'Due Today', colorClass: 'text-[#3B607A] font-semibold' },
  { value: 'upcoming', label: 'Upcoming', colorClass: 'text-[#2E2741]' },
  { value: 'overdue', label: 'Overdue', colorClass: 'text-[#D44355] font-semibold' },
  { value: 'no-date', label: 'No due date', colorClass: 'text-[#766E87]' },
];

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  filterDue?: FilterDue;
  onFilterDueChange?: (due: FilterDue) => void;
  sortOption?: SortOption;
  onSortOptionChange?: (sort: SortOption) => void;
  todayToDoCount: number;
  todayDoneCount: number;
  tasks?: Task[];
  onSelectTask?: (task: Task) => void;
  onToggleComplete?: (id: string) => void;
  onNavigateToTab?: (tab: NavigationTab) => void;
  onQuickCreateFromSearch?: (title: string) => void;
}

export function Header({
  onToggleSidebar,
  isSidebarOpen,
  onOpenNotifications,
  unreadNotificationsCount,
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  filterDue = 'all',
  onFilterDueChange,
  todayToDoCount,
  todayDoneCount,
  tasks = [],
  onSelectTask,
  onToggleComplete,
  onNavigateToTab,
  onQuickCreateFromSearch,
}: HeaderProps) {
  const [dateInfo, setDateInfo] = useState({
    weekday: '',
    shortWeekday: '',
    monthDay: '',
    fullDate: '',
  });

  // Five greetings state and handler
  const [greetingIndex, setGreetingIndex] = useState(() => {
    try {
      const saved = localStorage.getItem('kira_greeting_index');
      return saved !== null ? parseInt(saved, 10) % GREETINGS.length : 0;
    } catch {
      return 0;
    }
  });

  const handleNextGreeting = () => {
    setGreetingIndex((prev) => {
      const next = (prev + 1) % GREETINGS.length;
      try {
        localStorage.setItem('kira_greeting_index', next.toString());
      } catch {}
      return next;
    });
  };

  // Search outcomes popup state
  const [isOutcomeOpen, setIsOutcomeOpen] = useState(false);
  const [outcomeStatusFilter, setOutcomeStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Custom Filter Dropdowns state and refs
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isDueOpen, setIsDueOpen] = useState(false);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const dueDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = new Date();
    setDateInfo({
      weekday: now.toLocaleDateString('en-US', { weekday: 'long' }),
      shortWeekday: now.toLocaleDateString('en-US', { weekday: 'short' }),
      monthDay: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    });
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsOutcomeOpen(false);
      }
      if (
        priorityDropdownRef.current &&
        !priorityDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPriorityOpen(false);
      }
      if (
        dueDropdownRef.current &&
        !dueDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDueOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute matching tasks / possible outcomes
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const matchingTasks = trimmedQuery
    ? tasks.filter((t) => {
        const matchTitle = t.title.toLowerCase().includes(trimmedQuery);
        const matchDesc = t.description?.toLowerCase().includes(trimmedQuery);
        const matchCategory = t.category.toLowerCase().includes(trimmedQuery);
        const matchTag = t.tags?.some((tag) => tag.toLowerCase().includes(trimmedQuery));
        return matchTitle || matchDesc || matchCategory || matchTag;
      })
    : [];

  // Filter outcomes by status if user clicks filter chips inside popup
  const filteredOutcomes = matchingTasks.filter((t) => {
    if (outcomeStatusFilter === 'active') return !t.completed;
    if (outcomeStatusFilter === 'completed') return t.completed;
    return true;
  });

  const activeOutcomesCount = matchingTasks.filter((t) => !t.completed).length;
  const completedOutcomesCount = matchingTasks.filter((t) => t.completed).length;

  // Check if query matches any known category
  const matchingCategories = trimmedQuery
    ? DEFAULT_CATEGORIES.filter((c) =>
        c.name.toLowerCase().includes(trimmedQuery) || c.id.toLowerCase().includes(trimmedQuery)
      )
    : [];

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      setIsOutcomeOpen(true);
      if (onNavigateToTab) {
        onNavigateToTab('all');
      }
    } else {
      setIsOutcomeOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOutcomes.length > 0 && onSelectTask) {
        onSelectTask(filteredOutcomes[0]);
        setIsOutcomeOpen(false);
      } else if (onNavigateToTab) {
        onNavigateToTab('all');
        setIsOutcomeOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOutcomeOpen(false);
    }
  };

  const searchBarElement = (
    <div ref={searchContainerRef} className="relative flex-1 max-w-xl mx-1 sm:mx-3 flex items-center">
      {/* Clickable Search Icon Button on Left */}
      <button
        type="button"
        onClick={handleSearchClick}
        className="absolute left-2.5 p-1 rounded-full text-[#362C4C] hover:bg-[#EDE9F6] active:scale-95 transition-all cursor-pointer z-10"
        title="Search tasks and show outcomes"
        aria-label="Search tasks"
      >
        <Search className="h-4 w-4 text-[#362C4C]" />
      </button>

      {/* Search Input (Selected Element) */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => {
          onSearchChange(e.target.value);
          setIsOutcomeOpen(true);
        }}
        onFocus={() => {
          if (searchQuery.trim()) {
            setIsOutcomeOpen(true);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search tasks..."
        className="w-full pl-9 sm:pl-10 pr-16 sm:pr-24 py-2 text-xs sm:text-sm rounded-full bg-[#FFFDF9] border border-[#DDD6EC] hover:border-[#606362]/50 text-[#362C4C] placeholder-[#362C4C]/65 focus:outline-hidden focus:border-[#2E2741] focus:ring-2 focus:ring-[#D9E4EC] shadow-xs transition-all font-sans"
        aria-label="Search tasks"
      />

      {/* Action buttons inside right of input: Clear (X) + Working Search Button */}
      <div className="absolute right-1.5 sm:right-2 flex items-center gap-1 z-10">
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              setIsOutcomeOpen(false);
            }}
            className="p-1 text-[#606362] hover:text-[#2E2741] hover:bg-[#EDE9F6] rounded-full transition-colors cursor-pointer"
            aria-label="Clear search"
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Dedicated Search Action Button */}
        <button
          type="button"
          onClick={handleSearchClick}
          className="px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-full bg-[#2E2741] hover:bg-[#3B607A] active:scale-95 text-[#FFFDF9] transition-all cursor-pointer shadow-2xs flex items-center gap-1 font-mono"
          title="Search and provide possible outcomes"
          aria-label="Search"
        >
          <Search className="h-3 w-3" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* POPUP: POSSIBLE OUTCOMES & SOLUTIONS */}
      {isOutcomeOpen && searchQuery.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#FFFFFF] border border-[#DDD6EC] rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Outcomes Header */}
          <div className="p-3 bg-gradient-to-r from-[#EDE9F6] via-[#FBF9F2] to-[#FFFFFF] border-b border-[#DDD6EC] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#3B607A]" />
              <span className="font-display font-bold text-xs sm:text-sm text-[#2E2741]">
                Possible Outcomes ({matchingTasks.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOutcomeOpen(false)}
              className="p-1 text-[#606362] hover:text-[#2E2741] hover:bg-[#EDE9F6] rounded-lg transition-colors cursor-pointer"
              aria-label="Close outcomes"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Scrollable Matching Outcomes List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-[#DDD6EC]/50 p-1.5">
            {matchingTasks.length > 0 ? (
              matchingTasks.slice(0, 6).map((task) => {
                const category = DEFAULT_CATEGORIES.find((c) => c.id === task.category);
                const isDone = task.completed;
                return (
                  <div
                    key={task.id}
                    onClick={() => {
                      onSelectTask?.(task);
                      setIsOutcomeOpen(false);
                    }}
                    className="group p-2.5 rounded-xl hover:bg-[#EDE9F6]/60 transition-colors cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Quick Toggle Done button in outcomes */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComplete?.(task.id);
                        }}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                          isDone
                            ? 'bg-[#98A1BC] border-[#98A1BC] text-white'
                            : 'border-[#DDD6EC] bg-[#FFFFFF] hover:border-[#606362]'
                        }`}
                        aria-label={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {isDone && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-0">
                        <p
                          className={`text-xs sm:text-sm font-medium truncate ${
                            isDone ? 'line-through text-[#606362]' : 'text-[#2E2741]'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#606362]">
                          {category && (
                            <span className="inline-flex items-center gap-1">
                              <span>{category.icon}</span>
                              <span>{category.name}</span>
                            </span>
                          )}
                          {task.dueDate && (
                            <span>• Due: {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Priority Badge */}
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
                      style={{
                        backgroundColor: `${PRIORITY_CONFIG[task.priority].color}20`,
                        color: PRIORITY_CONFIG[task.priority].color,
                      }}
                    >
                      {PRIORITY_CONFIG[task.priority].label}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-[#606362]">
                <p className="font-medium">No tasks found matching "{searchQuery}"</p>
                <p className="mt-1 text-[11px] text-[#606362]/75">
                  Use the quick action below to view repository
                </p>
              </div>
            )}
          </div>

          {/* Ways to Satisfy this Search */}
          <div className="p-3 bg-[#FBF9F2] border-t border-[#DDD6EC] space-y-2">
            <div className="flex items-center gap-1.5">
              <CloverIcon className="w-3.5 h-3.5 text-[#3B607A]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#606362] font-mono">
                Ways to satisfy this search
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {/* Single Way: View all in All Tasks */}
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToTab) onNavigateToTab('all');
                  setIsOutcomeOpen(false);
                }}
                className="w-full p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#EDE9F6] border border-[#DDD6EC] text-left text-xs font-semibold text-[#2E2741] flex items-center justify-between gap-2 shadow-2xs transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2 truncate">
                  <span>📁</span>
                  <span>View all in All Tasks ({matchingTasks.length})</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#3B607A] shrink-0" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <header className="relative w-full space-y-4">
      {/* Top Bar with Star Menu Button, Center Search Bar, & Notification Bell */}
      <div className="bg-[#EDE9F6]/90 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4 border-b border-[#DDD6EC]/60">
        {/* Left: Star Menu Button */}
        <button
          onClick={onToggleSidebar}
          title={isSidebarOpen ? 'Close menu' : 'Open menu'}
          className="group relative flex items-center justify-center w-10 h-10 rounded-2xl bg-[#FBF9F2] border border-[#DDD6EC] hover:border-[#606362]/40 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
          aria-label="Toggle menu"
        >
          <span className="text-lg leading-none select-none text-[#606362] group-hover:scale-110 group-hover:text-[#2E2741] transition-transform">
            ★
          </span>
          <span className="sr-only">Menu</span>
        </button>

        {/* Center: Search Bar in top bar */}
        {searchBarElement}

        {/* Right: Notifications Bell */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenNotifications}
            title="View reminders & notifications"
            className="relative w-10 h-10 rounded-2xl bg-[#FBF9F2] border border-[#DDD6EC] hover:border-[#606362]/40 text-[#606362] hover:text-[#2E2741] flex items-center justify-center transition-all cursor-pointer shadow-xs"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-[#D44355] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Greeting Card: Date inside here & Upper Right To Do / Done Counters */}
      <div className="mx-3 sm:mx-6 p-5 sm:p-7 rounded-3xl bg-[#FBF9F2] border border-[#DDD6EC] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-3">
          {/* Left: Greeting & Lower Left Single-Line Date */}
          <div className="min-w-0 flex-1 sm:pr-2 flex flex-col items-start">
            {/* Interactive Animated Greeting Title (5 cycling greetings) */}
            <motion.button
              type="button"
              onClick={handleNextGreeting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className="group flex items-center gap-2.5 sm:gap-3 flex-nowrap text-left cursor-pointer select-none focus:outline-hidden"
              title="Click to cycle greetings ✨"
            >
              <div className="relative overflow-hidden py-0.5">
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={greetingIndex}
                    initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className="font-display font-extrabold tracking-tight text-[#2E2741] lowercase text-[34px] leading-[38px] sm:text-[40px] sm:leading-[43.5px] group-hover:text-[#3B607A] transition-colors"
                  >
                    {GREETINGS[greetingIndex]}
                  </motion.h1>
                </AnimatePresence>
              </div>

              {/* Clover with interactive bounce and rotate */}
              <motion.div
                key={`clover-${greetingIndex}`}
                initial={{ rotate: -45, scale: 0.7 }}
                animate={{ rotate: 0, scale: 1 }}
                whileHover={{ rotate: 180, scale: 1.15 }}
                transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                className="w-8 h-8 sm:w-9 sm:h-9 text-[#E7D1DA] group-hover:text-[#8A5D6F] transition-colors shrink-0 flex items-center justify-center"
              >
                <CloverIcon className="w-full h-full" />
              </motion.div>

              {/* Subtle hover badge hint */}
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-[#766E87] bg-[#EDE9F6] px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1 shadow-2xs">
                <span>✦ shuffle</span>
              </span>
            </motion.button>

              {/* Date badge on the lower left - guaranteed strictly one single line */}
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#DDD6EC] text-[11px] sm:text-xs font-mono text-[#606362] shadow-2xs whitespace-nowrap">
                <CloverIcon className="w-3.5 h-3.5 text-[#8A5D6F] shrink-0" />
                <span className="font-semibold text-[#2E2741] sm:hidden">{dateInfo.shortWeekday}</span>
                <span className="font-semibold text-[#2E2741] hidden sm:inline">{dateInfo.weekday}</span>
                <span className="text-[#DDD6EC]">•</span>
                <span className="sm:hidden">{dateInfo.monthDay}</span>
                <span className="hidden sm:inline">{dateInfo.fullDate}</span>
              </div>
            </div>

          {/* Upper Right Counter for To Do and Done for That Day (Vertical placement: To do on top, Done below) */}
          <div className="grid grid-cols-2 sm:flex sm:flex-col sm:items-end gap-2 shrink-0">
            {/* To Do for Today */}
            <div className="flex items-center justify-between gap-2.5 px-3 py-1.5 min-w-[90px] sm:min-w-[100px] rounded-full bg-[#FFFFFF] border border-[#D9E4EC] shadow-2xs">
              <span className="text-[11px] sm:text-xs font-semibold text-[#606362]">To do</span>
              <span className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full bg-[#D9E4EC] text-[#2E2741] font-mono font-bold text-xs flex items-center justify-center">
                {todayToDoCount}
              </span>
            </div>

            {/* Done for Today */}
            <div className="flex items-center justify-between gap-2.5 px-3 py-1.5 min-w-[90px] sm:min-w-[100px] rounded-full bg-[#FFFFFF] border border-[#E7D1DA] shadow-2xs">
              <span className="text-[11px] sm:text-xs font-semibold text-[#606362]">Done</span>
              <span className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full bg-[#E7D1DA] text-[#2E2741] font-mono font-bold text-xs flex items-center justify-center">
                {todayDoneCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Priority & Due Date Filters below the greeting card: evenly distributed with no extra space on the right */}
      <div className="mx-3 sm:mx-6 grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* Priority Filter Custom Dropdown */}
        <div ref={priorityDropdownRef} className="relative w-full">
          <button
            type="button"
            onClick={() => {
              setIsPriorityOpen((prev) => !prev);
              setIsDueOpen(false);
            }}
            className={`w-full relative px-7 sm:px-8 py-2 text-xs sm:text-sm font-medium rounded-full border transition-all cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#8A70D6] shadow-xs text-center flex items-center justify-center ${
              priorityFilter !== 'all'
                ? 'bg-[#EFE9FA] border-[#8A70D6] text-[#241C38] font-semibold'
                : 'bg-[#FFFDF9] border-[#DDD6EC] text-[#362C4C] hover:border-[#606362]/40 hover:bg-[#FAF7FE]'
            }`}
          >
            <span className="truncate">
              {PRIORITY_OPTIONS.find((p) => p.value === priorityFilter)?.label || 'Any priority'}
            </span>
            <ChevronDown
              className={`absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#362C4C] transition-transform duration-200 ${
                isPriorityOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {isPriorityOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-1.5 w-full left-0 z-50 bg-[#FFFDF9] border border-[#DDD6EC] rounded-2xl shadow-xl overflow-hidden py-1.5 backdrop-blur-md"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onPriorityFilterChange(opt.value);
                      setIsPriorityOpen(false);
                    }}
                    className={`w-full text-center py-2 px-3 text-xs sm:text-sm transition-colors cursor-pointer block ${
                      opt.colorClass || 'text-[#362C4C]'
                    } ${
                      priorityFilter === opt.value
                        ? 'bg-[#EFE9FA] font-bold'
                        : 'hover:bg-[#FAF7FE]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Due Date Filter Custom Dropdown */}
        <div ref={dueDropdownRef} className="relative w-full">
          <button
            type="button"
            onClick={() => {
              setIsDueOpen((prev) => !prev);
              setIsPriorityOpen(false);
            }}
            className={`w-full relative px-7 sm:px-8 py-2 text-xs sm:text-sm font-medium rounded-full border transition-all cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[#8A70D6] shadow-xs text-center flex items-center justify-center ${
              filterDue !== 'all'
                ? 'bg-[#EFE9FA] border-[#8A70D6] text-[#241C38] font-semibold'
                : 'bg-[#FFFDF9] border-[#DDD6EC] text-[#362C4C] hover:border-[#606362]/40 hover:bg-[#FAF7FE]'
            }`}
          >
            <span className="truncate">
              {DUE_OPTIONS.find((d) => d.value === filterDue)?.label || 'Any due date'}
            </span>
            <ChevronDown
              className={`absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#362C4C] transition-transform duration-200 ${
                isDueOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {isDueOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-1.5 w-full left-0 z-50 bg-[#FFFDF9] border border-[#DDD6EC] rounded-2xl shadow-xl overflow-hidden py-1.5 backdrop-blur-md"
              >
                {DUE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onFilterDueChange?.(opt.value);
                      setIsDueOpen(false);
                    }}
                    className={`w-full text-center py-2 px-3 text-xs sm:text-sm transition-colors cursor-pointer block ${
                      opt.colorClass || 'text-[#362C4C]'
                    } ${
                      filterDue === opt.value
                        ? 'bg-[#EFE9FA] font-bold'
                        : 'hover:bg-[#FAF7FE]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </header>
    );
  }
