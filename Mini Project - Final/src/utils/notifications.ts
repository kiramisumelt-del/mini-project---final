import { Task, AppNotification } from '../types/todo';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  try {
    const result = await Notification.requestPermission();
    return result === 'granted';
  } catch {
    return false;
  }
}

export function sendBrowserNotification(title: string, options?: NotificationOptions): boolean {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }
  try {
    new Notification(title, {
      icon: '/images/mascot-bunny-avatar.jpg',
      badge: '/images/mascot-bunny-avatar.jpg',
      ...options,
    });
    return true;
  } catch (err) {
    console.warn('Browser notification failed to trigger', err);
    return false;
  }
}

import { getLocalDateString } from './date';
export { getLocalDateString };

export function generateTaskNotifications(tasks: Task[]): AppNotification[] {
  const todayStr = getLocalDateString(new Date());
  const notifications: AppNotification[] = [];

  tasks.forEach((task) => {
    // Only active (uncompleted) tasks should be in active to-do notifications
    if (task.completed) return;

    const taskDate = task.dueDate ? task.dueDate.split('T')[0] : '';

    if (taskDate && taskDate < todayStr) {
      notifications.push({
        id: `notif-overdue-${task.id}`,
        taskId: task.id,
        taskTitle: task.title,
        type: 'overdue',
        date: taskDate,
        read: false,
        priority: task.priority,
        dueTime: task.dueTime,
        category: task.category,
      });
    } else if (taskDate === todayStr) {
      notifications.push({
        id: `notif-today-${task.id}`,
        taskId: task.id,
        taskTitle: task.title,
        type: 'due_today',
        date: taskDate,
        read: false,
        priority: task.priority,
        dueTime: task.dueTime,
        category: task.category,
      });
    }
  });

  return notifications;
}
