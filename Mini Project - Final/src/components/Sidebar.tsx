import { useState } from 'react';
import { 
  Home, 
  ListTodo, 
  FolderHeart, 
  AlarmClock, 
  CheckCircle2, 
  PanelLeftClose, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';
import { NavigationTab, Task, Category } from '../types/todo';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import { getLocalDateString } from '../utils/date';
import { CloverIcon } from './CloverIcon';

const COLOR_PRESETS = [
  { color: '#8A5D6F', bg: '#F5E7ED', border: '#E7D1DA' },
  { color: '#3B607A', bg: '#E6EFF5', border: '#D9E4EC' },
  { color: '#606362', bg: '#FBF9F2', border: '#E2DDD4' },
  { color: '#5C3854', bg: '#F2E4ED', border: '#E3C8D9' },
  { color: '#494D4B', bg: '#EDEBE6', border: '#D8D4CC' },
  { color: '#D44355', bg: '#FDECEF', border: '#F6BCC5' },
  { color: '#C9772B', bg: '#FDF1E6', border: '#F9D0AF' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  tasks: Task[];
  categories?: Category[];
  selectedCategoryId: string;
  onSelectCategory: (catId: string) => void;
  onAddCategory?: (category: { name: string; color: string; bgColor: string; borderColor: string }) => void;
  onDeleteCategory?: (catId: string) => void;
}

export function Sidebar({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  tasks,
  categories = DEFAULT_CATEGORIES,
  selectedCategoryId,
  onSelectCategory,
  onAddCategory,
  onDeleteCategory,
}: SidebarProps) {
  // Sub-stack accordion for Categories
  const [isCategoriesSubstackOpen, setIsCategoriesSubstackOpen] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const categoriesList = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  const todayStr = getLocalDateString();
  const overdueCount = tasks.filter((t) => {
    const clean = t.dueDate ? t.dueDate.split('T')[0] : '';
    return !t.completed && clean !== '' && clean < todayStr;
  }).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = tasks.filter((t) => !t.completed).length;
  const dueTodayCount = tasks.filter((t) => {
    const clean = t.dueDate ? t.dueDate.split('T')[0] : '';
    return !t.completed && clean === todayStr;
  }).length;

  // Handle adding a new category
  const handleCreateCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCatName.trim()) return;
    const preset = COLOR_PRESETS[selectedColorIdx] || COLOR_PRESETS[0];
    onAddCategory?.({
      name: newCatName.trim(),
      color: preset.color,
      bgColor: preset.bg,
      borderColor: preset.border,
    });
    setNewCatName('');
    setIsAddingCategory(false);
  };

  // Clicking the main "Categories" item ONLY expands/collapses the sub-stack; does NOT redirect
  const handleToggleCategoriesSubstack = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCategoriesSubstackOpen((prev) => !prev);
  };

  // Only when clicking a specific category (e.g. personal and fits), redirect to it
  const handleSelectSpecificCategory = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectCategory(catId);
    onSelectTab('categories');
    onClose();
  };

  return (
    <>
      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#2E2741]/40 backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container in Warm Cream & Clover Palette */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#FBF9F2] border-r border-[#DDD6EC] flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header of Sidebar */}
        <div className="p-4 sm:p-5 border-b border-[#DDD6EC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E7D1DA] border border-[#D9BFCC] flex items-center justify-center text-[#2E2741] shadow-xs">
              <CloverIcon className="w-4 h-4 text-[#2E2741]" />
            </div>
            <div>
              <span className="font-display font-bold text-base text-[#2E2741] tracking-tight block leading-tight">
                Menu
              </span>
              <span className="text-[10px] font-mono text-[#766E87] block">Kira's To-Do List</span>
            </div>
          </div>

          <button
            onClick={onClose}
            title="Hide menu"
            className="p-1.5 rounded-lg text-[#766E87] hover:text-[#2E2741] hover:bg-[#EDE9F6] transition-colors cursor-pointer"
            aria-label="Hide menu"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation List - Styled like Image 2 with clean pills and icons */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
          {/* Home */}
          <button
            onClick={() => {
              onSelectTab('home');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'home'
                ? 'bg-[#E7D1DA] text-[#2E2741] font-bold shadow-xs'
                : 'text-[#606362] hover:bg-[#EDE9F6] hover:text-[#2E2741]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Home className={`h-4 w-4 ${currentTab === 'home' ? 'text-[#2E2741]' : 'text-[#766E87]'}`} />
              <span>Home</span>
            </div>
            {dueTodayCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-[#FFFFFF] text-[#2E2741] border border-[#DDD6EC] shadow-2xs">
                {dueTodayCount}
              </span>
            )}
          </button>

          {/* All Tasks */}
          <button
            onClick={() => {
              onSelectTab('all');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'all'
                ? 'bg-[#E7D1DA] text-[#2E2741] font-bold shadow-xs'
                : 'text-[#606362] hover:bg-[#EDE9F6] hover:text-[#2E2741]'
            }`}
          >
            <div className="flex items-center gap-3">
              <ListTodo className={`h-4 w-4 ${currentTab === 'all' ? 'text-[#2E2741]' : 'text-[#766E87]'}`} />
              <span>All Tasks</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-[#FFFFFF] text-[#2E2741] border border-[#DDD6EC] shadow-2xs">
              {activeCount}
            </span>
          </button>

          {/* Categories Accordion: Click expands list without redirecting */}
          <div className="rounded-2xl border border-[#DDD6EC] bg-[#FFFFFF] overflow-hidden shadow-2xs">
            <button
              onClick={handleToggleCategoriesSubstack}
              className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold transition-all cursor-pointer ${
                isCategoriesSubstackOpen
                  ? 'text-[#2E2741] bg-[#EDE9F6]/60'
                  : 'text-[#606362] hover:bg-[#EDE9F6] hover:text-[#2E2741]'
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderHeart className="h-4 w-4 text-[#766E87]" />
                <span>Categories</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono bg-[#EDE9F6] text-[#606362]">
                  {categoriesList.length}
                </span>
                {isCategoriesSubstackOpen ? (
                  <ChevronUp className="h-3.5 w-3.5 text-[#2E2741]" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-[#766E87]" />
                )}
              </div>
            </button>

            {/* Sub-Stack List of Categories with Add & Remove */}
            {isCategoriesSubstackOpen && (
              <div className="py-2 px-2.5 border-t border-[#DDD6EC] space-y-1.5 bg-[#FAF7F2]">
                {/* Option to Add Categories */}
                {!isAddingCategory ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border border-dashed border-[#DDD6EC] hover:border-[#8A5D6F] text-[11px] font-semibold text-[#8A5D6F] bg-[#FFFFFF] hover:bg-[#FAF2F6] transition-all cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Category</span>
                  </button>
                ) : (
                  <form
                    onSubmit={handleCreateCategory}
                    className="p-2.5 rounded-xl bg-white border border-[#DDD6EC] shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#2E2741]">New Category</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingCategory(false);
                          setNewCatName('');
                        }}
                        className="text-[10px] font-mono text-[#766E87] hover:text-[#2E2741]"
                      >
                        ✕
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Category name..."
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#DDD6EC] text-[#2E2741] focus:outline-hidden focus:ring-1 focus:ring-[#8A5D6F] bg-[#FFFDF9]"
                      autoFocus
                    />
                    <div>
                      <span className="text-[10px] font-mono text-[#766E87] block mb-1">Color Palette:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {COLOR_PRESETS.map((preset, idx) => (
                          <button
                            key={preset.color}
                            type="button"
                            onClick={() => setSelectedColorIdx(idx)}
                            className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                              selectedColorIdx === idx
                                ? 'scale-125 ring-2 ring-offset-1 ring-[#2E2741]'
                                : 'hover:scale-110'
                            }`}
                            style={{ backgroundColor: preset.color }}
                            title={preset.color}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingCategory(false);
                          setNewCatName('');
                        }}
                        className="px-2.5 py-1 text-[11px] font-mono rounded-lg text-[#766E87] hover:bg-[#EDE9F6] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!newCatName.trim()}
                        className="px-3 py-1 text-[11px] font-mono font-semibold rounded-lg bg-[#2E2741] hover:bg-[#433A5E] text-white disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                )}

                {/* List of Categories */}
                <div className="space-y-0.5 max-h-56 overflow-y-auto pr-0.5">
                  {categoriesList.map((cat) => {
                    const count = tasks.filter((t) => !t.completed && t.category === cat.id).length;
                    const isSelected = currentTab === 'categories' && selectedCategoryId === cat.id;

                    return (
                      <div
                        key={cat.id}
                        className={`group w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-[#E7D1DA] text-[#2E2741] font-semibold shadow-2xs'
                            : 'text-[#606362] hover:bg-[#EDE9F6] hover:text-[#2E2741]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleSelectSpecificCategory(cat.id, e)}
                          className="flex items-center gap-2 truncate flex-1 text-left cursor-pointer mr-1"
                        >
                          <span style={{ color: cat.color }} className="text-[10px] shrink-0">
                            ●
                          </span>
                          <span className="truncate">{cat.name}</span>
                        </button>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono text-[#766E87] tabular-nums">
                            {count}
                          </span>
                          {/* Option to Remove Category */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCategoryToDelete(cat);
                            }}
                            title={`Remove category "${cat.name}"`}
                            aria-label={`Remove category "${cat.name}"`}
                            className="p-1 rounded-md text-[#B8ADC9] hover:text-[#D44355] hover:bg-[#FDECEF] transition-all cursor-pointer opacity-70 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Overdue - using AlarmClock icon as requested from Image 2 */}
          <button
            onClick={() => {
              onSelectTab('overdue');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'overdue'
                ? 'bg-[#E7D1DA] text-[#2E2741] font-bold shadow-xs'
                : 'text-[#606362] hover:bg-[#EDE9F6] hover:text-[#2E2741]'
            }`}
          >
            <div className="flex items-center gap-3">
              <AlarmClock className={`h-4 w-4 ${currentTab === 'overdue' ? 'text-[#2E2741]' : 'text-[#D44355]'}`} />
              <span>Overdue</span>
            </div>
            {overdueCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-[#FDECEF] text-[#D44355] border border-[#F6BCC5] shadow-2xs">
                {overdueCount}
              </span>
            )}
          </button>

          {/* Completed - using clean CheckCircle2 icon as requested from Image 2 */}
          <button
            onClick={() => {
              onSelectTab('completed');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              currentTab === 'completed'
                ? 'bg-[#E7D1DA] text-[#2E2741] font-bold shadow-xs'
                : 'text-[#606362] hover:bg-[#EDE9F6] hover:text-[#2E2741]'
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className={`h-4 w-4 ${currentTab === 'completed' ? 'text-[#2E2741]' : 'text-[#3B607A]'}`} />
              <span>Completed</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-[#FFFFFF] text-[#2E2741] border border-[#DDD6EC] shadow-2xs">
              {completedCount}
            </span>
          </button>
        </div>

        {/* Bottom Footer */}
        <div className="p-4 border-t border-[#DDD6EC] bg-[#FAF7F2] flex items-center justify-center">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#766E87]">
            <CloverIcon className="w-3.5 h-3.5 text-[#8A5D6F]" />
            <span>Kira's To-Do List</span>
          </div>
        </div>
      </aside>

      {/* Remove Category Warning Sign & Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-60 bg-[#2E2741]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border-2 border-[#F6BCC5] rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Warning Sign Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-[#FDECEF] border border-[#F6BCC5] flex items-center justify-center text-[#D44355] mx-auto shadow-xs">
              <AlertTriangle className="w-7 h-7 text-[#D44355]" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-display font-bold text-lg text-[#2E2741]">
                Remove Category
              </h3>
              <p className="text-xs text-[#766E87]">
                Are you sure you want to remove <span className="font-semibold text-[#2E2741]">&ldquo;{categoryToDelete.name}&rdquo;</span>?
              </p>
            </div>

            {/* Warning Sign Callout */}
            <div className="p-3.5 rounded-2xl bg-[#FFF8F0] border border-[#FFE0B2] text-xs text-[#8C480D] flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#C9772B] shrink-0 mt-0.5" />
              <div className="space-y-1 font-mono text-[11px] leading-relaxed">
                <span className="font-bold text-[#C9772B] uppercase tracking-wider block">
                  ⚠️ Warning Sign:
                </span>
                <span>
                  Removing this category cannot be undone. Any tasks currently in this category will not be lost, but will be safely unassigned.
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#FBF9F2] hover:bg-[#EDE9F6] border border-[#DDD6EC] text-xs font-mono font-semibold text-[#606362] hover:text-[#2E2741] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteCategory?.(categoryToDelete.id);
                  setCategoryToDelete(null);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#D44355] hover:bg-[#B83243] text-white text-xs font-mono font-semibold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
