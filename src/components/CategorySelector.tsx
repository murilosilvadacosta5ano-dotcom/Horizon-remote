import React from 'react';
import { GIF_CATEGORIES } from '../data/categoriesData';

interface CategorySelectorProps {
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <div className="px-4 my-2">
      {/* Clean horizontal scrollbar for categories without side arrows or clutter */}
      <div 
        className="flex items-center gap-2 overflow-x-auto py-1.5 px-0.5 no-scrollbar scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {GIF_CATEGORIES.map((cat) => {
          const isActive = cat.id === activeCategory;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`py-2 px-4 rounded-xl text-xs font-black tracking-wider uppercase whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#2481cc] text-white shadow-md shadow-[#2481cc]/25 scale-[1.02]'
                  : 'bg-[#1c2733] text-[#8293a4] hover:text-white hover:bg-[#22303f] border border-[#253241]/40'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
