import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Command } from '../types';
import { 
  Heart, 
  Swords, 
  Sparkles, 
  Check, 
  Copy
} from 'lucide-react';

interface CommandItemProps {
  command: Command;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCopy: () => void;
  isLast: boolean;
}

export const CommandItem: React.FC<CommandItemProps> = ({
  command,
  isExpanded,
  onToggleExpand,
  onCopy,
  isLast
}) => {
  // Initial GIF from the command's own anime GIF collection
  const [currentGifUrl, setCurrentGifUrl] = useState<string>(() => {
    const randomIdx = Math.floor(Math.random() * command.gifs.length);
    return command.gifs[randomIdx] || command.gifs[0];
  });
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const getCommandIcon = (id: string) => {
    switch (id) {
      case 'abraco':
      case 'kiss':
      case 'cafune':
        return <Heart className="w-4 h-4 text-[#2aabee]" />;
      case 'beliscar':
        return <Sparkles className="w-4 h-4 text-[#2aabee]" />;
      case 'socar':
      case 'tapa':
      case 'chutar':
      case 'atacar':
        return <Swords className="w-4 h-4 text-[#2aabee]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#2aabee]" />;
    }
  };

  // When expanding or tapping, pull a GIF for this command
  const handlePress = async () => {
    // Pick a new random GIF from the command's own anime database
    const randomIdx = Math.floor(Math.random() * command.gifs.length);
    const initialPick = command.gifs[randomIdx] || command.gifs[0];
    setCurrentGifUrl(initialPick);
    
    // Toggle balloon
    onToggleExpand();

    // Copy command usage to clipboard
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);

    // Also query the API in background for live cloud update if available
    try {
      const res = await fetch(`/api/gifs?key=raphaelsboting&search=${encodeURIComponent(command.searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.gif_url && data.gif_url !== initialPick) {
          setCurrentGifUrl(data.gif_url);
        }
      }
    } catch {
      // Keep command's anime gif
    }
  };

  const dynamicSearchUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/gifs?key=raphaelsboting&search=${encodeURIComponent(command.searchQuery)}`
    : command.searchUrl;

  const handleCopySearchUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(dynamicSearchUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1500);
  };

  return (
    <motion.div 
      layout
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`w-full overflow-hidden transition-colors ${
        !isLast ? 'border-b border-[#253241]/70' : ''
      } ${isExpanded ? 'bg-[#151f2b]' : 'bg-[#1c2733]'}`}
    >
      {/* Header Row: Tap to Copy & Stretch Balloon */}
      <div
        onClick={handlePress}
        className="w-full flex items-center justify-between p-3.5 active:bg-[#253342] cursor-pointer text-left select-none"
      >
        {/* Left: Icon + Command Name + Description */}
        <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
          <div className="w-7 h-7 rounded-full bg-[#101720] flex items-center justify-center flex-shrink-0">
            {getCommandIcon(command.id)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white font-mono">
                /{command.name}
              </span>
            </div>
            <p className="text-xs text-[#8293a4] truncate mt-0.5">
              {command.description}
            </p>
          </div>
        </div>

        {/* Right: Copied status or Quick copy hint */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {copied ? (
            <span className="flex items-center gap-1 text-[11px] text-[#34c759] font-medium animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              <span>Copiado</span>
            </span>
          ) : (
            <span className="text-[11px] text-[#2aabee] font-medium opacity-80 hover:opacity-100 flex items-center gap-1">
              <Copy className="w-3 h-3" />
              <span>Copiar</span>
            </span>
          )}
        </div>
      </div>

      {/* Stretching Balloon Preview with Anime GIF */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 360, damping: 26 }}
            className="px-3.5 pb-3.5 pt-0 overflow-hidden"
          >
            {/* Telegram Speech Bubble / Balloon Card */}
            <div className="relative rounded-2xl bg-[#0e1621] p-3 shadow-inner space-y-2.5">
              
              {/* Balloon Header with Anime action query */}
              <div className="flex items-center justify-between text-[11px] text-[#8293a4]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2aabee] animate-pulse" />
                  <span className="font-medium text-[#b8c6d4]">
                    GIF Anime: <strong className="text-white">{command.searchQuery}</strong>
                  </span>
                </div>
                <span className="text-[10px] text-[#708499] font-mono">
                  {command.usage}
                </span>
              </div>

              {/* Action direct URL bar */}
              <div 
                onClick={handleCopySearchUrl}
                className="px-2.5 py-1.5 rounded-lg bg-[#16202c] flex items-center justify-between text-[10px] font-mono text-[#2aabee] cursor-pointer active:bg-[#1f2b3a] transition-colors border border-[#253241]/50"
                title="Clique para copiar a URL"
              >
                <span className="truncate pr-2">{dynamicSearchUrl}</span>
                <span className="text-[#8293a4] flex-shrink-0 flex items-center gap-1 hover:text-white">
                  {copiedLink ? (
                    <Check className="w-3 h-3 text-[#34c759]" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </span>
              </div>

              {/* GIF Container with smooth rendering & Fallback to the command's own anime GIF collection */}
              <div className="relative w-full h-48 rounded-xl overflow-hidden bg-[#16202c] flex items-center justify-center">
                {imageLoading && (
                  <div className="absolute inset-0 bg-[#16202c] flex flex-col items-center justify-center gap-1.5 text-[#708499] animate-pulse">
                    <Sparkles className="w-5 h-5 text-[#2aabee]" />
                    <span className="text-[10px]">Carregando GIF...</span>
                  </div>
                )}

                <img
                  key={currentGifUrl}
                  src={currentGifUrl}
                  alt={`GIF de ${command.searchQuery}`}
                  referrerPolicy="no-referrer"
                  loading="eager"
                  onLoad={() => setImageLoading(false)}
                  onError={(e) => {
                    setImageLoading(false);
                    // Guaranteed fallback: pick the command's first anime GIF
                    const target = e.target as HTMLImageElement;
                    const fallbackGif = command.gifs[0] || command.gifs[1] || '';
                    if (target.src !== fallbackGif && fallbackGif) {
                      target.src = fallbackGif;
                    }
                  }}
                  className={`w-full h-full object-cover rounded-xl transition-opacity duration-200 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
