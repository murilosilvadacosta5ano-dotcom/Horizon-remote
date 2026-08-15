import React, { useState, useMemo } from 'react';
import { SearchBar } from './components/SearchBar';
import { Toast } from './components/Toast';
import { CommandItem } from './components/CommandItem';
import { BotApiSection } from './components/BotApiSection';
import { ONLY_COMMANDS } from './data/commands';
import { MoreHorizontal } from 'lucide-react';
import { Command } from './types';

export default function App() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real-time search filtering by name and description
  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) return ONLY_COMMANDS;
    const q = searchQuery.toLowerCase().trim();
    return ONLY_COMMANDS.filter((cmd) => {
      const matchName = cmd.name.toLowerCase().includes(q);
      const matchDesc = cmd.description.toLowerCase().includes(q);
      const matchAliases = cmd.aliases.some((a) => a.toLowerCase().includes(q));
      return matchName || matchDesc || matchAliases;
    });
  }, [searchQuery]);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const handleCopyCommand = (cmd: Command) => {
    navigator.clipboard.writeText(cmd.usage);
    showToast(`Comando ${cmd.usage} copiado!`);
  };

  const handleToggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-[#0e1621] text-[#f5f5f5] flex justify-center selection:bg-[#2481cc]/30">
      {/* Mobile-Only Container */}
      <div className="w-full max-w-md min-h-screen bg-[#0e1621] flex flex-col pb-12">
        
        {/* Title Header */}
        <div className="pt-8 pb-3 px-4 text-center">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Raphael
          </h1>
          <p className="text-xs text-[#8293a4] font-medium mt-0.5">
            @raphaelsbot
          </p>
        </div>

        {/* Real-Time Search Bar */}
        <SearchBar
          query={searchQuery}
          onQueryChange={setSearchQuery}
          resultCount={filteredCommands.length}
        />

        {/* Commands List in Telegram Group Style */}
        <div className="px-4 space-y-2 mt-1">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold text-[#8293a4] uppercase tracking-wider">
              Comandos
            </h2>
            <span className="text-[11px] text-[#708499]">
              Toque para copiar & preview
            </span>
          </div>

          {/* Solid Container with Smooth Spring Transitions */}
          <div className="bg-[#1c2733] rounded-2xl overflow-hidden shadow-none">
            {filteredCommands.map((cmd, idx) => {
              const isLast = idx === filteredCommands.length - 1 && !searchQuery.trim();

              return (
                <CommandItem
                  key={cmd.id}
                  command={cmd}
                  isExpanded={expandedId === cmd.id}
                  onToggleExpand={() => handleToggleExpand(cmd.id)}
                  onCopy={() => handleCopyCommand(cmd)}
                  isLast={idx === filteredCommands.length - 1 && isLast}
                />
              );
            })}

            {/* "Entre outros..." Row */}
            {(!searchQuery.trim() || 'entre outros'.includes(searchQuery.toLowerCase().trim())) && (
              <div 
                onClick={() => showToast('Comandos adicionais disponíveis diretamente no bot!')}
                className="w-full flex items-center justify-between p-3.5 active:bg-[#253342] transition-colors cursor-pointer text-left border-t border-[#253241]/70"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <div className="w-7 h-7 rounded-full bg-[#101720] flex items-center justify-center flex-shrink-0">
                    <MoreHorizontal className="w-4 h-4 text-[#8293a4]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-semibold text-white">
                      Entre outros...
                    </span>
                    <p className="text-xs text-[#8293a4] truncate mt-0.5">
                      Outros comandos adicionais disponíveis no bot
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 text-[#8293a4]">
                  <span className="text-[11px] text-[#708499]">Ver mais</span>
                </div>
              </div>
            )}

            {/* Empty Search State */}
            {filteredCommands.length === 0 && searchQuery.trim() && (
              <div className="p-6 text-center text-[#8293a4] space-y-1">
                <p className="text-sm font-semibold text-white">Nenhum comando encontrado</p>
                <p className="text-xs">Tente buscar por nome (ex: abraco, kiss, socar...)</p>
              </div>
            )}
          </div>
        </div>

        {/* API for External Telegram / Discord Bots Section */}
        <BotApiSection onShowToast={showToast} />

        {/* Minimalist Footer with requested label */}
        <div className="mt-8 pt-4 pb-4 text-center text-[11px] text-[#708499] px-4 space-y-1">
          <p>Raphael Bot API • v2.5</p>
          <p className="text-[10px] text-[#566573] tracking-wide">tenor implement</p>
        </div>

      </div>

      {/* Floating Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
}
