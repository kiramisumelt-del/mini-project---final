import { useState, useRef, useEffect } from 'react';
import { Plus, Maximize2 } from 'lucide-react';
import { Priority, Category } from '../types/todo';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import { getLocalDateString } from '../utils/date';
import { CloverIcon } from './CloverIcon';

interface QuickAddBarProps {
  onQuickAdd: (taskData: {
    title: string;
    category: string;
    priority: Priority;
    dueDate?: string;
    dueTime?: string;
  }) => void;
  onOpenFullModal?: (title?: string, date?: string, category?: string) => void;
  categories?: Category[];
}

export function QuickAddBar({ 
  onQuickAdd, 
  onOpenFullModal,
  categories = DEFAULT_CATEGORIES 
}: QuickAddBarProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('personal');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<string>(() => getLocalDateString());
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLFormElement>(null);

  // Click outside detection: when unclicked, hide options
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onQuickAdd({
      title: title.trim(),
      category,
      priority,
      dueDate: dueDate || undefined,
    });
    setTitle('');
    setIsOpen(false);
  };

  return (
    <form
      ref={containerRef}
      onSubmit={handleSubmit}
      className="bg-[#FBF9F2] rounded-3xl border border-[#DDD6EC] hover:border-[#606362]/40 p-4 sm:p-5 shadow-xs transition-all duration-200"
    >
      {/* Main Task Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={title}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onChange={(e) => {
            setTitle(e.target.value);
            setIsOpen(true);
          }}
          placeholder="What needs to be done?"
          className="flex-1 min-w-0 bg-[#FFFFFF] border border-[#DDD6EC] text-sm text-[#2E2741] placeholder-[#766E87] px-4 py-2.5 rounded-2xl focus:outline-hidden focus:border-[#606362] focus:ring-2 focus:ring-[#D9E4EC] transition-all"
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-5 py-2.5 rounded-2xl bg-[#606362] hover:bg-[#494D4B] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95"
        >
          <CloverIcon className="w-3.5 h-3.5 text-[#E7D1DA]" />
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Add</span>
        </button>
      </div>

      {/* Pop-up Options: Hidden when unclicked/blurred */}
      {isOpen && (
        <div className="mt-3.5 pt-3.5 border-t border-[#DDD6EC] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-fadeIn">
          {/* Category Selector */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-[#766E87] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#DDD6EC] text-xs text-[#2E2741] cursor-pointer focus:outline-hidden focus:border-[#606362]"
            >
              {DEFAULT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-[#2E2741]">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-[#766E87] mb-1">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#DDD6EC] text-xs text-[#2E2741] cursor-pointer focus:outline-hidden focus:border-[#606362]"
            >
              <option value="urgent" className="text-[#D44355]">Urgent</option>
              <option value="high" className="text-[#C9772B]">High</option>
              <option value="medium" className="text-[#3B607A]">Medium</option>
              <option value="low" className="text-[#606362]">Low</option>
            </select>
          </div>

          {/* Date Selector */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-[#766E87] mb-1">
              Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#DDD6EC] text-xs text-[#2E2741] cursor-pointer focus:outline-hidden focus:border-[#606362]"
            />
            {onOpenFullModal && (
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onOpenFullModal(title, dueDate, category);
                    setIsOpen(false);
                  }}
                  title="Open full task modal"
                  aria-label="Open full task modal"
                  className="p-1 rounded-lg text-[#766E87] hover:text-[#2E2741] hover:bg-[#EDE9F6] transition-colors cursor-pointer flex items-center justify-center"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
