import React from 'react';
import { Sparkles, Zap, Flame, MessageCircle, Heart, Star, Compass } from 'lucide-react';

interface RafaBannerProps {
  onSelectSpecial: (term: string) => void;
  onNavigateDocs: () => void;
}

export const RafaBanner: React.FC<RafaBannerProps> = ({ onSelectSpecial, onNavigateDocs }) => {
  return (
    <div className="mx-4 my-3 bg-gradient-to-r from-[#182a3d] via-[#16222f] to-[#121922] p-4 sm:p-5 rounded-3xl border border-[#2481cc]/40 shadow-xl relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#2481cc]/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-8 -top-8 w-32 h-32 bg-[#10b981]/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-3">
        {/* Mascot Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                alt="Rafa das Figurinhas"
                className="w-10 h-10 rounded-2xl object-cover border-2 border-[#2aabee] shadow-md shadow-[#2481cc]/30"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#10b981] border-2 border-[#0e1621] flex items-center justify-center text-[8px]">
                ⚡
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black text-white uppercase tracking-tight">
                  Rafa das Figurinhas
                </h2>
                <span className="px-1.5 py-0.2 rounded-md bg-[#2481cc] text-white text-[9px] font-extrabold uppercase tracking-wide">
                  Curador
                </span>
              </div>
              <p className="text-[10px] text-[#8293a4]">
                As melhores figurinhas animadas, memes e GIFs da web em HD
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981] text-[10px] font-bold">
            <Zap className="w-3 h-3 text-[#10b981]" />
            <span>1.000 req/min</span>
          </div>
        </div>

        {/* Rafa's Recommended Quick Picks */}
        <div className="pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[10px] font-bold text-[#708499] uppercase whitespace-nowrap">
              Coleções do Rafa:
            </span>

            {[
              { label: '🔥 Hype & Trends', query: 'hype memes trending' },
              { label: '😂 Memes BR', query: 'memes engraçados brasil' },
              { label: '⚡ Animes Lendários', query: 'naruto goku luffy jojo' },
              { label: '💖 Fofos & Amor', query: 'cute cat heart love' },
              { label: '💀 Deboche & Reações', query: 'reaction shock laugh' },
              { label: '🎮 Games & Minecraft', query: 'minecraft gta gaming' },
            ].map((col, idx) => (
              <button
                key={idx}
                onClick={() => onSelectSpecial(col.query)}
                className="py-1 px-2.5 rounded-xl bg-[#1c2733] hover:bg-[#2481cc] text-[#2aabee] hover:text-white transition-all text-[11px] font-bold whitespace-nowrap border border-[#253241] cursor-pointer active:scale-95 flex items-center gap-1 shadow-sm"
              >
                <span>{col.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Highlights Bar */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#253241]/70 text-center">
          <div className="bg-[#121922]/80 p-1.5 rounded-xl border border-[#253241]/60">
            <span className="text-[9px] text-[#708499] uppercase font-bold block">Taxa Liberada</span>
            <span className="text-[11px] font-mono font-extrabold text-[#10b981]">1000/min</span>
          </div>

          <div className="bg-[#121922]/80 p-1.5 rounded-xl border border-[#253241]/60">
            <span className="text-[9px] text-[#708499] uppercase font-bold block">Conta & Perfil</span>
            <span className="text-[11px] font-extrabold text-[#2aabee]">Google Login</span>
          </div>

          <div className="bg-[#121922]/80 p-1.5 rounded-xl border border-[#253241]/60">
            <span className="text-[9px] text-[#708499] uppercase font-bold block">Download HD</span>
            <span className="text-[11px] font-extrabold text-[#eab308]">Zap & Bot</span>
          </div>
        </div>

      </div>

    </div>
  );
};
