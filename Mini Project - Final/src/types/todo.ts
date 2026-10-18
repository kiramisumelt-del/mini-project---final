export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  category: string;
  dueDate?: string; // YYYY-MM-DD or YYYY-MM-DDTHH:mm
  dueTime?: string; // HH:mm
  createdAt: string;
  completedAt?: string;
  tags: string[];
  subtasks: Subtask[];
  estimatedMinutes?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export type FilterStatus = 'all' | 'active' | 'completed';
export type FilterDue = 'all' | 'today' | 'upcoming' | 'overdue' | 'no-date';
export type SortOption = 'due-date' | 'priority' | 'created-desc' | 'created-asc' | 'alphabetical';
export type GroupOption = 'none' | 'due-date' | 'category' | 'priority';

export type NavigationTab = 'home' | 'all' | 'categories' | 'overdue' | 'completed';

export interface AppNotification {
  id: string;
  taskId: string;
  taskTitle: string;
  type: 'due_today' | 'overdue' | 'reminder';
  date: string;
  read: boolean;
  priority?: Priority;
  dueTime?: string;
  category?: string;
}
