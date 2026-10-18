import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Task, Priority, Subtask, Category } from '../types/todo';
import { DEFAULT_CATEGORIES, PRIORITY_CONFIG } from '../utils/categories';
import { getLocalDateString } from '../utils/date';
import { CloverIcon } from './CloverIcon';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt'>, existingId?: string) => void;
  taskToEdit?: Task | null;
  defaultDate?: string;
  defaultTitle?: string;
  defaultCategory?: string;
  categories?: Category[];
}

export function TaskModal({ 
  isOpen, 
  onClose, 
  onSave, 
  taskToEdit,
  defaultDate,
  defaultTitle,
  defaultCategory,
  categories = DEFAULT_CATEGORIES,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('personal');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>(undefined);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const todayStr = getLocalDateString();
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setCategory(taskToEdit.category || 'personal');
      setPriority(taskToEdit.priority || 'medium');
      setDueDate(taskToEdit.dueDate || '');
      setDueTime(taskToEdit.dueTime || '');
      setEstimatedMinutes(taskToEdit.estimatedMinutes);
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setTitle(defaultTitle || '');
      setDescription('');
      setCategory(defaultCategory || 'personal');
      setPriority('medium');
      setDueDate(defaultDate || todayStr);
      setDueTime('');
      setEstimatedMinutes(undefined);
      setSubtasks([]);
    }
    setError('');
  }, [taskToEdit, defaultDate, defaultTitle, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    const trimmed = subtaskInput.trim();
    if (trimmed) {
      setSubtasks([
        ...subtasks,
        { id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, title: trimmed, completed: false },
      ]);
      setSubtaskInput('');
    }
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter what needs to be done');
      return;
    }

    onSave(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        completed: taskToEdit ? taskToEdit.completed : false,
        tags: taskToEdit?.tags || [],
        subtasks,
        estimatedMinutes: estimatedMinutes && estimatedMinutes > 0 ? Number(estimatedMinutes) : undefined,
      },
      taskToEdit?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2E2741]/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FBF9F2] rounded-3xl border border-[#DDD6EC] shadow-2xl overflow-hidden my-6">
        {/* Top Accent Line */}
        <div className="h-1.5 bg-gradient-to-r from-[#D9E4EC] via-[#E7D1DA] to-[#FBF9F2]" />

        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#DDD6EC]">
          <div className="flex items-center gap-2">
            <CloverIcon className="w-4 h-4 text-[#E7D1DA]" />
            <h3 className="font-display font-bold text-lg text-[#2E2741]">
              {taskToEdit ? 'Edit Task' : 'New Task'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#766E87] hover:text-[#2E2741] hover:bg-[#EDE9F6] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-[#FDECEF] text-[#D44355] border border-[#F6BCC5]">
              {error}
            </div>
          )}

          {/* Title / What needs to be done */}
          <div>
            <label className="block text-xs font-mono uppercase text-[#606362] mb-1">
              What needs to be done? <span className="text-[#D44355]">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#DDD6EC] bg-[#FFFFFF] text-[#2E2741] focus:outline-hidden focus:border-[#606362] transition-all shadow-2xs"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-mono uppercase text-[#606362] mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes or links"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DDD6EC] bg-[#FFFFFF] text-[#2E2741] focus:outline-hidden focus:border-[#606362] transition-all resize-none shadow-2xs"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#606362] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDD6EC] bg-[#FFFFFF] text-[#2E2741] cursor-pointer focus:outline-hidden focus:border-[#606362] shadow-2xs"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#606362] mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDD6EC] bg-[#FFFFFF] text-[#2E2741] cursor-pointer focus:outline-hidden focus:border-[#606362] shadow-2xs"
              >
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Time */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-[#606362]">Due Date & Time</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDD6EC] bg-[#FFFFFF] text-[#2E2741] focus:outline-hidden focus:border-[#606362] shadow-2xs"
              />
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDD6EC] bg-[#FFFFFF] text-[#2E2741] focus:outline-hidden focus:border-[#606362] shadow-2xs"
              />
            </div>
          </div>

          {/* Subtasks */}
          <div className="pt-1">
            <label className="block text-xs font-mono uppercase text-[#606362] mb-1">
              Checklist
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add subtask step"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#DDD6EC] bg-[#FFFFFF] text-[#2E2741] focus:outline-hidden focus:border-[#606362] shadow-2xs"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-xl bg-[#606362] hover:bg-[#494D4B] text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#DDD6EC] text-[#2E2741]"
                  >
                    <span className="truncate">{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-[#766E87] hover:text-[#D44355] transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>



          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-[#DDD6EC] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#766E87] hover:text-[#2E2741] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#606362] hover:bg-[#494D4B] rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
