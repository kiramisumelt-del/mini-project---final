import { Task } from '../types/todo';
import { getLocalDateString } from './date';

const STORAGE_KEY = 'kiras_to_do_list_tasks_v2';

export const SAMPLE_TASKS: Task[] = [];

export function loadTasksFromStorage(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Check legacy storage key to purge previous sample tasks
      const legacyRaw = localStorage.getItem('kiras_to_do_list_tasks_v2');
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw);
        if (Array.isArray(legacyParsed)) {
          const userOnly = legacyParsed.filter((t: Task) => !t.id?.startsWith('sample-task-'));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(userOnly));
          return userOnly;
        }
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((t: Task) => !t.id?.startsWith('sample-task-'));
    }
    return [];
  } catch (err) {
    console.error('Failed to parse tasks from storage:', err);
    return [];
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to storage:', err);
  }
}

export function exportTasksToJSON(tasks: Task[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = getLocalDateString();
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `kira-tasks-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importTasksFromJSON(file: File): Promise<Task[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          throw new Error('Imported JSON must be an array of tasks.');
        }
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}
