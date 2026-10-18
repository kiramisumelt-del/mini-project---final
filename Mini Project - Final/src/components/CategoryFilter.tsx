import { Category } from '../types/todo';
import { DEFAULT_CATEGORIES } from '../utils/categories';

interface CategoryFilterProps {
  selectedCategory: string; // 'all' or category id
  onSelectCategory: (categoryId: string) => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
}

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  totalCount,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
      {/* All Option */}
      <button
        onClick={() => onSelectCategory('all')}
        className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
          selectedCategory === 'all'
            ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-xs'
            : 'bg-white text-[#5B4874] border-[#E8DAFA] hover:bg-[#FAF6FF]'
        }`}
      >
        <span>All</span>
        <span className="ml-1.5 text-[10px] opacity-80 font-mono tabular-nums">
          ({totalCount})
        </span>
      </button>

      {/* Individual Categories */}
      {DEFAULT_CATEGORIES.map((cat) => {
        const count = categoryCounts[cat.id] || 0;
        const isSelected = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border flex items-center gap-1.5 ${
              isSelected
                ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-xs'
                : 'bg-white text-[#5B4874] border-[#E8DAFA] hover:bg-[#FAF6FF]'
            }`}
          >
            <span
              style={{ color: isSelected ? '#FFFFFF' : cat.color }}
              className="text-[10px]"
            >
              ●
            </span>
            <span>{cat.name}</span>
            <span className="text-[10px] opacity-80 font-mono tabular-nums">
              ({count})
            </span>
          </button>
        );
      })}
    </div>
  );
}
