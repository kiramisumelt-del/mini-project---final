/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  loadTasksFromStorage, 
  saveTasksToStorage 
} from './utils/storage';
import { 
  Task, 
  FilterStatus, 
  FilterDue, 
  SortOption, 
  GroupOption, 
  NavigationTab,
  AppNotification, 
  Priority 
} from './types/todo';
import { generateTaskNotifications, getLocalDateString } from './utils/notifications';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { TaskList } from './components/TaskList';
import { CategoriesView } from './components/CategoriesView';
import { OverdueView } from './components/OverdueView';
import { CompletedView } from './components/CompletedView';
import { TaskModal } from './components/TaskModal';
import { NotificationCenter } from './components/NotificationCenter';
import { UndoToast } from './components/UndoToast';
import { FloatingAddButton } from './components/FloatingAddButton';
import { NailedItPop } from './components/NailedItPop';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());
  
  // Navigation Menu state
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Category and list filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('personal');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('active');
  const [filterDue, setFilterDue] = useState<FilterDue>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('created-desc');
  const [groupOption, setGroupOption] = useState<GroupOption>('due-date');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Notifications
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultModalDate, setDefaultModalDate] = useState<string | undefined>(undefined);
  const [defaultModalTitle, setDefaultModalTitle] = useState<string | undefined>(undefined);
  const [defaultModalCategory, setDefaultModalCategory] = useState<string | undefined>(undefined);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [nailedItState, setNailedItState] = useState<{
    show: boolean;
    taskTitle?: string;
    key: number;
  }>({
    show: false,
    key: 0,
  });

  // Undo deletion
  const [deletedTask, setDeletedTask] = useState<Task | null>(null);
  const undoTimeoutRef = useRef<number | null>(null);

  // Persist tasks on change
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  // Notifications calculation
  const notifications: AppNotification[] = generateTaskNotifications(tasks);
  const unreadNotificationsCount = notifications.length;

  // Today counters for Header
  const todayStr = getLocalDateString();
  const todayTasks = tasks.filter((t) => t.dueDate?.split('T')[0] === todayStr);
  const todayToDoCount = todayTasks.filter((t) => !t.completed).length;
  const todayDoneCount = todayTasks.filter((t) => t.completed).length;

  // CRUD Handler: Add / Update Task
  const handleSaveTask = (
    taskData: Omit<Task, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === existingId ? { ...t, ...taskData } : t))
      );
    } else {
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  // CRUD Handler: Quick Add Task
  const handleQuickAdd = (data: {
    title: string;
    category: string;
    priority: Priority;
    dueDate?: string;
    dueTime?: string;
  }) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: data.title,
      category: data.category,
      priority: data.priority,
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      completed: false,
      createdAt: new Date().toISOString(),
      tags: [],
      subtasks: [],
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  // CRUD Handler: Toggle Complete
  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            confetti({
              particleCount: 45,
              spread: 70,
              origin: { y: 0.75 },
              colors: ['#D9E4EC', '#E7D1DA', '#FBF9F2', '#606362', '#2E2741'],
            });
            setNailedItState({
              show: true,
              taskTitle: t.title,
              key: Date.now(),
            });
          }
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  // Subtask toggle
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );
  };

  // CRUD Handler: Edit Task
  const handleOpenEditModal = (task: Task) => {
    setTaskToEdit(task);
    setDefaultModalDate(undefined);
    setDefaultModalTitle(undefined);
    setDefaultModalCategory(undefined);
    setIsTaskModalOpen(true);
  };

  // Open task modal with prefilled category, date, or title
  const handleOpenNewTaskModal = (prefillCategory?: string, prefillDate?: string, prefillTitle?: string) => {
    setTaskToEdit(null);
    setDefaultModalDate(prefillDate || getLocalDateString());
    setDefaultModalTitle(prefillTitle || '');
    setDefaultModalCategory(prefillCategory || 'personal');
    setIsTaskModalOpen(true);
  };

  // CRUD Handler: Delete Task with Undo
  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (!taskToDelete) return;

    setTasks((prev) => prev.filter((t) => t.id !== id));
    setDeletedTask(taskToDelete);

    if (undoTimeoutRef.current) {
      window.clearTimeout(undoTimeoutRef.current);
    }
    undoTimeoutRef.current = window.setTimeout(() => {
      setDeletedTask(null);
    }, 6000);
  };

  const handleUndoDelete = () => {
    if (deletedTask) {
      setTasks((prev) => [deletedTask, ...prev]);
      setDeletedTask(null);
    }
  };

  // Reschedule all overdue to today
  const handleRescheduleAllToToday = () => {
    setTasks((prev) =>
      prev.map((t) => {
        if (!t.completed && t.dueDate && t.dueDate < todayStr) {
          return { ...t, dueDate: todayStr };
        }
        return t;
      })
    );
  };

  // Batch Clear Completed
  const handleClearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  // Filter tasks by priority if selected from Header pill
  const visibleTasks = tasks.filter((t) => {
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#EDE9F6] text-[#2E2741] pb-28 selection:bg-[#E7D1DA] selection:text-[#2E2741]">
      {/* Left Collapsible Menu Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setIsSidebarOpen(false);
        }}
        tasks={tasks}
        selectedCategoryId={selectedCategory}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          setCurrentTab('categories');
        }}
      />

      {/* Main Content Layout */}
      <div className="w-full">
        {/* Header with Bigger 'wassup kira', upper right To Do/Done counters, and exact Search pill bar */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadNotificationsCount={unreadNotificationsCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          filterDue={filterDue}
          onFilterDueChange={setFilterDue}
          sortOption={sortOption}
          onSortOptionChange={setSortOption}
          todayToDoCount={todayToDoCount}
          todayDoneCount={todayDoneCount}
          tasks={tasks}
          onSelectTask={handleOpenEditModal}
          onToggleComplete={handleToggleComplete}
          onNavigateToTab={(tab) => setCurrentTab(tab)}
          onQuickCreateFromSearch={(title) => handleOpenNewTaskModal(undefined, undefined, title)}
        />

        {/* View Routing */}
        <main className="max-w-5xl mx-auto px-3 sm:px-6 mt-5 space-y-6">
          {/* TAB 1: HOME */}
          {currentTab === 'home' && (
            <HomeView
              tasks={visibleTasks}
              onToggleComplete={handleToggleComplete}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteTask}
              onToggleSubtask={handleToggleSubtask}
              onQuickAdd={handleQuickAdd}
              onOpenFullModal={(title, prefillDate, cat) => handleOpenNewTaskModal(cat, prefillDate, title)}
              onNavigateToTab={(tab) => setCurrentTab(tab)}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
            />
          )}

          {/* TAB 2: ALL TASKS */}
          {currentTab === 'all' && (
            <div className="space-y-5">
              <div className="bg-[#FBF9F2] rounded-3xl border border-[#DDD6EC] p-5 sm:p-7 shadow-sm">
                <div className="mb-4 pb-3 border-b border-[#DDD6EC] flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-xl text-[#2E2741]">All Tasks</h3>
                    <p className="text-xs text-[#766E87] mt-0.5 font-mono">
                      Full repository of tasks and deadlines.
                    </p>
                  </div>
                </div>

                <TaskList
                  tasks={visibleTasks}
                  onToggleComplete={handleToggleComplete}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteTask}
                  onToggleSubtask={handleToggleSubtask}
                  onClearCompleted={handleClearCompleted}
                  filterStatus={filterStatus}
                  onFilterStatusChange={setFilterStatus}
                  filterDue={filterDue}
                  onFilterDueChange={setFilterDue}
                  sortOption={sortOption}
                  onSortOptionChange={setSortOption}
                  groupOption={groupOption}
                  onGroupOptionChange={setGroupOption}
                  searchQuery={searchQuery}
                />
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {currentTab === 'categories' && (
            <CategoriesView
              tasks={visibleTasks}
              selectedCategoryId={selectedCategory}
              onSelectCategory={(id) => setSelectedCategory(id)}
              onToggleComplete={handleToggleComplete}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteTask}
              onToggleSubtask={handleToggleSubtask}
              onOpenNewTaskModal={(cat) => handleOpenNewTaskModal(cat)}
            />
          )}

          {/* TAB 4: OVERDUE */}
          {currentTab === 'overdue' && (
            <OverdueView
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteTask}
              onToggleSubtask={handleToggleSubtask}
              onRescheduleAllToToday={handleRescheduleAllToToday}
            />
          )}

          {/* TAB 5: COMPLETED */}
          {currentTab === 'completed' && (
            <CompletedView
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteTask}
              onToggleSubtask={handleToggleSubtask}
              onClearCompleted={handleClearCompleted}
            />
          )}
        </main>
      </div>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
          setDefaultModalDate(undefined);
          setDefaultModalTitle(undefined);
          setDefaultModalCategory(undefined);
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        defaultDate={defaultModalDate}
        defaultTitle={defaultModalTitle}
        defaultCategory={defaultModalCategory}
      />

      {/* Notification Center Dialog */}
      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onSelectTask={(taskId, type) => {
          setIsNotificationsOpen(false);
          setSearchQuery('');
          if (type === 'overdue') {
            setCurrentTab('overdue');
          } else {
            setCurrentTab('all');
            setFilterDue('today');
            setFilterStatus('all');
          }
          if (taskId) {
            setTimeout(() => {
              const el = document.getElementById(`task-card-${taskId}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('ring-2', 'ring-[#2E2741]', 'shadow-lg');
                setTimeout(() => {
                  el.classList.remove('ring-2', 'ring-[#2E2741]', 'shadow-lg');
                }, 2500);
              }
            }, 100);
          }
        }}
        onGoToTodayList={() => {
          setIsNotificationsOpen(false);
          setSearchQuery('');
          setCurrentTab('all');
          setFilterDue('today');
          setFilterStatus('all');
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 50);
        }}
      />

      {/* Deleted Task Undo Toast */}
      {deletedTask && (
        <UndoToast
          message={`Deleted "${deletedTask.title}"`}
          onUndo={handleUndoDelete}
          onDismiss={() => setDeletedTask(null)}
        />
      )}

      {/* Celebratory "Nailed It" Pop Effect */}
      <NailedItPop
        show={nailedItState.show}
        taskTitle={nailedItState.taskTitle}
        triggerKey={nailedItState.key}
        onDismiss={() => setNailedItState((prev) => ({ ...prev, show: false }))}
      />

      {/* Lower Screen Floating Add Button */}
      <FloatingAddButton onClick={() => handleOpenNewTaskModal()} />
    </div>
  );
}
