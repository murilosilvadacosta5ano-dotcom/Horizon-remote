import React from 'react';
import { GIF_CATEGORIES } from '../data/categoriesData';

interface CategorySelectorProps { activeCategory: string; onSelectCategory: (categoryId: string) => void; }

export const CategorySelector: React.FC<CategorySelectorProps> = ({ activeCategory, onSelectCategory }) => (
  <div className="px-4 my-1">
    <div className="flex items-center gap-2 overflow-x-auto py-1.5 px-0.5 no-scrollbar scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {GIF_CATEGORIES.map((cat) => {
        const isActive = cat.id === activeCategory;
        return <button key={cat.id} onClick={() => onSelectCategory(cat.id)} aria-pressed={isActive} className={`py-2 px-3.5 rounded-xl text-[10px] font-extrabold tracking-wide whitespace-nowrap transition-all flex-shrink-0 cursor-pointer border ${isActive ? 'bg-[#147df5] border-[#4da3ff]/40 text-white shadow-lg shadow-[#147df5]/15' : 'bg-[#12171d] border-white/[0.06] text-[#7d8794] hover:text-white hover:bg-[#171d24]'}`}>{cat.name}</button>;
      })}
    </div>
  </div>
);
