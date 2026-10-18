import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon
} from 'lucide-react';
import { Task } from '../types/todo';
import { getLocalDateString } from '../utils/date';
import { CloverIcon } from './CloverIcon';

interface TaskCalendarProps {
  tasks: Task[];
  onToggleComplete?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onAddTaskForDate?: (dateStr: string) => void;
  onSelectCalendarDate?: (dateStr: string) => void;
}

export function TaskCalendar({
  tasks,
  onSelectCalendarDate,
}: TaskCalendarProps) {
  // Use local date instead of UTC to avoid timezone delay
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const todayStr = getLocalDateString();
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => {
    return daysInPrevMonth - firstDayOfMonth + i + 1;
  });

  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const totalCells = prevMonthDays.length + currentMonthDays.length;
  const nextMonthDaysCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const nextMonthDays = Array.from({ length: nextMonthDaysCount }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleJumpToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(getLocalDateString());
  };

  const formatDateStr = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Group active tasks by date (cleaning any timestamp suffix)
  const tasksByDate = tasks.reduce((acc, t) => {
    if (!t.completed && t.dueDate) {
      const cleanDate = t.dueDate.split('T')[0];
      acc[cleanDate] = acc[cleanDate] || [];
      acc[cleanDate].push(t);
    }
    return acc;
  }, {} as Record<string, Task[]>);

  // Smoothly scroll and highlight task location without opening edit modal
  const handleScrollToTask = (taskId: string, dateStr: string) => {
    setSelectedDateStr(dateStr);
    onSelectCalendarDate?.(dateStr);

    setTimeout(() => {
      const taskCard = document.getElementById(`task-card-${taskId}`);
      const daySection = document.getElementById(`schedule-day-${dateStr}`);
      const targetEl = taskCard || daySection;

      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetEl.classList.add('ring-2', 'ring-[#3B607A]', 'shadow-lg');
        setTimeout(() => {
          targetEl.classList.remove('ring-2', 'ring-[#3B607A]', 'shadow-lg');
        }, 2200);
      }
    }, 80);
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    onSelectCalendarDate?.(dateStr);

    const dayTasks = tasksByDate[dateStr] || [];
    if (dayTasks.length > 0) {
      handleScrollToTask(dayTasks[0].id, dateStr);
    }
  };

  return (
    <section className="bg-[#FBF9F2] rounded-3xl border border-[#DDD6EC] p-5 sm:p-7 shadow-sm">
      {/* Calendar Header with Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#DDD6EC]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFFFFF] border border-[#DDD6EC] flex items-center justify-center text-[#2E2741] shadow-2xs">
            <CalendarIcon className="h-5 w-5 text-[#3B607A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-xl text-[#2E2741]">
                {monthNames[month]} {year}
              </h3>
              <CloverIcon className="w-4 h-4 text-[#D9E4EC]" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleJumpToday}
            className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#EDE9F6] border border-[#DDD6EC] text-xs font-mono font-semibold text-[#2E2741] transition-colors cursor-pointer shadow-2xs"
          >
            Today
          </button>
          <div className="flex items-center gap-1 bg-[#FFFFFF] rounded-xl border border-[#DDD6EC] p-0.5 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              title="Previous month"
              className="p-1.5 rounded-lg text-[#766E87] hover:text-[#2E2741] hover:bg-[#EDE9F6] transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextMonth}
              title="Next month"
              className="p-1.5 rounded-lg text-[#766E87] hover:text-[#2E2741] hover:bg-[#EDE9F6] transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-[11px] font-mono font-bold text-[#766E87] uppercase tracking-wider">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {/* Previous Month Days */}
        {prevMonthDays.map((d, i) => (
          <div
            key={`prev-${i}`}
            className="min-h-[58px] sm:min-h-[72px] p-1.5 sm:p-2 rounded-2xl bg-[#F6F3EC]/50 border border-transparent text-[#B8ADC9] text-xs select-none"
          >
            <span className="font-mono text-[11px]">{d}</span>
          </div>
        ))}

        {/* Current Month Days */}
        {currentMonthDays.map((d) => {
          const dateStr = formatDateStr(year, month, d);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDateStr;
          const dayTasks = tasksByDate[dateStr] || [];

          return (
            <div
              key={`curr-${d}`}
              onClick={() => handleDateClick(dateStr)}
              className={`min-h-[64px] sm:min-h-[76px] p-1.5 sm:p-2 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-[#E7D1DA] border-[#D9BFCC] shadow-xs scale-[1.02] ring-2 ring-[#8A5D6F]'
                  : isToday
                  ? 'bg-[#D9E4EC]/70 border-[#B8CAD8] hover:border-[#606362]/40 ring-1 ring-[#3B607A]'
                  : 'bg-[#FFFFFF] border-[#DDD6EC] hover:border-[#606362]/30 hover:bg-[#FAF7F2]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs font-mono font-bold ${
                    isSelected
                      ? 'text-[#2E2741]'
                      : isToday
                      ? 'text-[#2E2741] underline decoration-[#3B607A] decoration-2'
                      : 'text-[#606362]'
                  }`}
                >
                  {d}
                </span>

                {isToday && (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded-full bg-[#3B607A] text-white font-semibold">
                    TODAY
                  </span>
                )}
              </div>

              {/* Task Dots / Badges inside the day cell */}
              <div className="w-full space-y-1 mt-1">
                {dayTasks.slice(0, 2).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScrollToTask(t.id, dateStr);
                    }}
                    title={`Click to view "${t.title}"`}
                    className="w-full text-left truncate text-[10px] px-1 py-0.5 rounded-md bg-[#FAF7F2] hover:bg-[#EDE9F6] border border-[#DDD6EC] text-[#2E2741] font-sans font-medium transition-colors cursor-pointer"
                  >
                    {t.title}
                  </button>
                ))}
                {dayTasks.length > 2 && (
                  <span className="text-[9px] font-mono text-[#766E87] block leading-none font-medium">
                    +{dayTasks.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Next Month Days */}
        {nextMonthDays.map((d, i) => (
          <div
            key={`next-${i}`}
            className="min-h-[58px] sm:min-h-[72px] p-1.5 sm:p-2 rounded-2xl bg-[#F6F3EC]/50 border border-transparent text-[#B8ADC9] text-xs select-none"
          >
            <span className="font-mono text-[11px]">{d}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
