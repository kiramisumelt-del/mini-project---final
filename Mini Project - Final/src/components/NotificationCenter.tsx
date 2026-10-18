import { X, AlarmClock, Calendar, Sparkles, ArrowRight, Clock } from 'lucide-react';
import { AppNotification } from '../types/todo';
import { CloverIcon } from './CloverIcon';
import { DEFAULT_CATEGORIES, PRIORITY_CONFIG } from '../utils/categories';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onSelectTask: (taskId?: string, type?: 'due_today' | 'overdue' | 'reminder') => void;
  onGoToTodayList: () => void;
}

export function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  onSelectTask,
  onGoToTodayList,
}: NotificationCenterProps) {
  if (!isOpen) return null;

  const todayNotifications = notifications.filter((n) => n.type === 'due_today');
  const overdueNotifications = notifications.filter((n) => n.type === 'overdue');

  const handleItemClick = (notif: AppNotification) => {
    onSelectTask(notif.taskId, notif.type);
    onClose();
  };

  const handleGoToList = () => {
    onGoToTodayList();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2E2741]/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-[#FBF9F2] rounded-3xl border border-[#DDD6EC] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#DDD6EC] bg-[#FAF7F2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E7D1DA] border border-[#D9BFCC] flex items-center justify-center text-[#2E2741] shadow-2xs">
              <CloverIcon className="w-4 h-4 text-[#2E2741]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#2E2741] leading-tight">
                Notifications
              </h3>
              <p className="text-[10px] font-mono text-[#766E87]">
                Today&apos;s To-Do List &amp; Reminders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#766E87] hover:text-[#2E2741] hover:bg-[#EDE9F6] transition-colors cursor-pointer"
            aria-label="Close notifications"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Quick summary button to jump straight to Today's To-Do List */}
          <button
            type="button"
            onClick={handleGoToList}
            className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-r from-[#D9E4EC]/80 to-[#E7D1DA]/60 border border-[#DDD6EC] hover:border-[#606362]/40 transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-2xs shrink-0">
                  <Calendar className="w-4 h-4 text-[#3B607A]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2E2741] group-hover:text-[#3B607A] transition-colors">
                    Today&apos;s To-Do List
                  </p>
                  <p className="text-[11px] font-mono text-[#606362]">
                    {todayNotifications.length > 0
                      ? `${todayNotifications.length} task${todayNotifications.length > 1 ? 's' : ''} scheduled for today`
                      : 'View your scheduled agenda'}
                    {overdueNotifications.length > 0 && ` · ${overdueNotifications.length} overdue`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono font-semibold text-[#2E2741] group-hover:translate-x-1 transition-transform">
                <span>View list</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>

          {/* Active Notifications list */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#766E87]">
                Pending Tasks ({notifications.length})
              </h4>
              <span className="text-[10px] font-mono text-[#766E87]">Click item to open list</span>
            </div>

            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#766E87] font-mono bg-white rounded-2xl border border-dashed border-[#DDD6EC] p-4">
                <Sparkles className="h-6 w-6 text-[#E7D1DA] mx-auto mb-2" />
                <p className="font-semibold text-[#2E2741]">All caught up!</p>
                <p className="text-[11px] mt-1 text-[#606362]">
                  No pending tasks for today. You&apos;re completely on schedule.
                </p>
                <button
                  type="button"
                  onClick={handleGoToList}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2E2741] text-white text-xs font-mono font-semibold hover:bg-[#3B607A] transition-colors cursor-pointer"
                >
                  <span>Go to To-Do List</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Overdue alerts first */}
                {overdueNotifications.map((notif) => {
                  const categoryMeta = DEFAULT_CATEGORIES.find((c) => c.id === notif.category);
                  const priorityMeta = notif.priority ? PRIORITY_CONFIG[notif.priority] : undefined;

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleItemClick(notif)}
                      className="p-3.5 rounded-2xl border border-[#F6BCC5] bg-[#FFF8F9] hover:bg-[#FCE3E7] hover:border-[#D44355]/40 text-xs cursor-pointer transition-all shadow-2xs group"
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <AlarmClock className="h-3.5 w-3.5 text-[#D44355] shrink-0" />
                        <span className="font-bold text-[#A02535]">Overdue</span>
                        {priorityMeta && (
                          <span
                            className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md uppercase"
                            style={{
                              backgroundColor: priorityMeta.bgColor,
                              color: priorityMeta.color,
                              borderColor: priorityMeta.borderColor,
                            }}
                          >
                            {priorityMeta.label}
                          </span>
                        )}
                        <span className="text-[10px] text-[#A02535] ml-auto font-mono">
                          {notif.date}
                        </span>
                      </div>
                      <p className="font-semibold text-[#2E2741] group-hover:text-[#A02535] transition-colors truncate">
                        {notif.taskTitle}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[#766E87]">
                        <span>{categoryMeta?.name || notif.category || 'Task'}</span>
                        <span className="inline-flex items-center gap-1 text-[#D44355] font-semibold group-hover:translate-x-0.5 transition-transform">
                          <span>View in list</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Due Today items */}
                {todayNotifications.map((notif) => {
                  const categoryMeta = DEFAULT_CATEGORIES.find((c) => c.id === notif.category);
                  const priorityMeta = notif.priority ? PRIORITY_CONFIG[notif.priority] : undefined;

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleItemClick(notif)}
                      className="p-3.5 rounded-2xl border border-[#DDD6EC] bg-[#FFFFFF] hover:bg-[#FAF7F2] hover:border-[#3B607A]/40 text-xs cursor-pointer transition-all shadow-2xs group"
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#3B607A] shrink-0" />
                        <span className="font-bold text-[#2E2741]">Due Today</span>
                        {priorityMeta && (
                          <span
                            className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md uppercase"
                            style={{
                              backgroundColor: priorityMeta.bgColor,
                              color: priorityMeta.color,
                              borderColor: priorityMeta.borderColor,
                            }}
                          >
                            {priorityMeta.label}
                          </span>
                        )}
                        {notif.dueTime && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-[#606362] bg-[#EDE9F6] px-1.5 py-0.5 rounded-md">
                            <Clock className="w-2.5 h-2.5" />
                            {notif.dueTime}
                          </span>
                        )}
                        <span className="text-[10px] text-[#766E87] ml-auto font-mono">
                          Today
                        </span>
                      </div>
                      <p className="font-semibold text-[#2E2741] group-hover:text-[#3B607A] transition-colors truncate">
                        {notif.taskTitle}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[#766E87]">
                        <span>{categoryMeta?.name || notif.category || 'Task'}</span>
                        <span className="inline-flex items-center gap-1 text-[#3B607A] font-semibold group-hover:translate-x-0.5 transition-transform">
                          <span>View in list</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#DDD6EC] bg-[#FAF7F2] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleGoToList}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#2E2741] hover:text-[#3B607A] transition-colors cursor-pointer"
          >
            <span>Open To-Do List</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-semibold text-[#766E87] hover:text-[#2E2741] hover:bg-[#EDE9F6] rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
