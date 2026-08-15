import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps { query: string; onQueryChange: (query: string) => void; resultCount?: number; placeholder?: string; }

export const SearchBar: React.FC<SearchBarProps> = ({ query, onQueryChange, resultCount, placeholder = 'Pesquisar GIFs: anime, meme, gato, minecraft...' }) => (
  <div className="w-full px-4 pt-1 pb-2">
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Search className="w-4 h-4 text-[#6f7b89] group-focus-within:text-[#4da3ff] transition-colors" /></div>
      <input type="text" value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder={placeholder} aria-label="Pesquisar GIFs" className="w-full pl-10 pr-10 py-3 bg-[#12171d] rounded-2xl text-xs font-medium text-white placeholder-[#687482] focus:outline-none focus:ring-1 focus:ring-[#2f8cff]/60 border border-white/[0.06] focus:border-[#2f8cff]/40 transition-all shadow-inner" />
      {query && <button onClick={() => onQueryChange('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#71808f] hover:text-white cursor-pointer" title="Limpar pesquisa" aria-label="Limpar pesquisa"><span className="w-5 h-5 rounded-full bg-[#27303a] hover:bg-[#34404d] flex items-center justify-center"><X className="w-3 h-3" /></span></button>}
    </div>
    {query && typeof resultCount === 'number' && <div className="px-1 pt-2 flex items-center justify-between text-[10px] text-[#6f7b89]"><span>Resultados para sua busca</span><span className="font-bold text-[#4da3ff]">{resultCount}</span></div>}
  </div>
);
