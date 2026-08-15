import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  resultCount?: number;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  resultCount,
  placeholder = "Pesquisar GIFs por nome (ex: abraço, minecraft, gato, naruto)..."
}) => {
  return (
    <div className="w-full px-4 pt-1 pb-2">
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#708499]">
          <Search className="w-4 h-4 text-[#708499]" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2.5 bg-[#1c2733] rounded-xl text-xs font-medium text-white placeholder-[#708499] focus:outline-none focus:bg-[#22303f] transition-colors border-0"
        />

        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#708499] hover:text-white"
            title="Limpar pesquisa"
          >
            <div className="w-4 h-4 rounded-full bg-[#2c3d50] flex items-center justify-center">
              <X className="w-3 h-3 text-white" />
            </div>
          </button>
        )}
      </div>

      {query && typeof resultCount === 'number' && (
        <div className="px-1 pt-1.5 flex items-center justify-between text-[11px] text-[#708499]">
          <span>GIFs encontrados:</span>
          <span className="font-bold text-[#2aabee]">{resultCount}</span>
        </div>
      )}
    </div>
  );
};
