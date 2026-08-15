import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  Share2, 
  Code2, 
  ZoomIn, 
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { extractTenorGifId } from '../services/tenorScraper';

export interface DisplayGif {
  id: string;
  title: string;
  url: string;
  category: string;
  tags: string[];
}

interface GifGalleryProps {
  gifs: DisplayGif[];
  activeCategoryName: string;
  onShowToast: (msg: string) => void;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
}

export const GifGallery: React.FC<GifGalleryProps> = ({
  gifs,
  activeCategoryName,
  onShowToast,
  onLoadMore,
  isLoadingMore = false,
  hasMore = true,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedGif, setSelectedGif] = useState<DisplayGif | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Strictly deduplicate GIFs by URL and Tenor ID to prevent identical images
  const uniqueGifs = useMemo(() => {
    const seenUrls = new Set<string>();
    const seenIds = new Set<string>();
    const list: DisplayGif[] = [];

    for (const g of gifs) {
      if (!g.url) continue;
      const tenorId = extractTenorGifId(g.url);

      if (!seenUrls.has(g.url) && !seenIds.has(tenorId)) {
        seenUrls.add(g.url);
        if (tenorId) seenIds.add(tenorId);
        list.push(g);
      }
    }
    return list;
  }, [gifs]);

  // Infinite Scroll Trigger with IntersectionObserver and Window Scroll Fallback
  useEffect(() => {
    if (!onLoadMore || !hasMore) return;

    let debounceTimer: any = null;
    const triggerLoad = () => {
      if (isLoadingMore) return;
      onLoadMore();
    };

    // 1. Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && !isLoadingMore) {
          triggerLoad();
        }
      },
      {
        rootMargin: '600px', // Pre-fetch before user hits the bottom
        threshold: 0.05,
      }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    // 2. Window Scroll Event Listener as a bulletproof fallback
    const handleWindowScroll = () => {
      if (isLoadingMore || !hasMore) return;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      if (fullHeight - (scrollY + windowHeight) < 700) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          triggerLoad();
        }, 100);
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
      observer.disconnect();
      window.removeEventListener('scroll', handleWindowScroll);
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [onLoadMore, isLoadingMore, hasMore, uniqueGifs.length]);

  // Action: Copy Direct Link
  const handleCopyLink = (gif: DisplayGif, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(gif.url);
    setCopiedId(gif.id);
    onShowToast(`Link direto copiado!`);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Action: Download GIF file
  const handleDownloadGif = async (gif: DisplayGif, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDownloadingId(gif.id);
    onShowToast('Iniciando download do GIF...');

    try {
      const response = await fetch(gif.url, { mode: 'cors' });
      if (!response.ok) throw new Error('Falha ao baixar imagem');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      const cleanFileName = (gif.title || 'gif-tenor')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .substring(0, 30);
      a.download = `${cleanFileName}.gif`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);

      onShowToast('Download concluído!');
    } catch {
      // Fallback para download via link direto caso CORS bloqueie fetch
      const a = document.createElement('a');
      a.href = gif.url;
      a.target = '_blank';
      a.download = 'gif_tenor.gif';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      onShowToast('GIF aberto para salvar!');
    } finally {
      setDownloadingId(null);
    }
  };

  // Action: Share GIF
  const handleShareGif = async (gif: DisplayGif, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: gif.title,
          text: `Confira este GIF: ${gif.title}`,
          url: gif.url,
        });
        onShowToast('Compartilhado com sucesso!');
      } catch {
        handleCopyLink(gif);
      }
    } else {
      handleCopyLink(gif);
    }
  };

  // Action: Copy Markdown / Discord code
  const handleCopyCode = (gif: DisplayGif, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const markdown = `![${gif.title}](${gif.url})`;
    navigator.clipboard.writeText(markdown);
    onShowToast('Markdown copiado para Discord/Telegram!');
  };

  return (
    <div className="px-4 py-2 flex flex-col flex-1">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className="text-xs font-black text-[#8293a4] uppercase tracking-wider">
          {activeCategoryName}
        </h3>
        <span className="text-[10px] font-bold text-[#8293a4] bg-[#1c2733] px-2 py-0.5 rounded-full border border-[#253241]/60">
          {uniqueGifs.length} GIFs
        </span>
      </div>

      {/* Grid of GIFs */}
      {uniqueGifs.length === 0 ? (
        <div className="py-16 text-center text-[#8293a4] flex flex-col items-center justify-center space-y-2">
          <p className="text-xs font-semibold">Nenhum GIF encontrado nesta categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {uniqueGifs.map((gif, index) => {
            const isCopied = copiedId === gif.id;
            const isDownloading = downloadingId === gif.id;

            return (
              <motion.div
                key={`${gif.id}-${gif.url}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedGif(gif)}
                className="group relative bg-[#161f2a] rounded-2xl overflow-hidden border border-[#253241]/60 hover:border-[#2481cc]/60 transition-all flex flex-col shadow-sm cursor-pointer"
              >
                {/* Visual GIF Container */}
                <div className="relative aspect-video w-full bg-[#101720] overflow-hidden flex items-center justify-center">
                  <img
                    src={gif.url}
                    alt={gif.title}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                  />

                  {/* Overlay on hover/touch */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2 backdrop-blur-[2px]">
                    <button
                      onClick={(e) => handleDownloadGif(gif, e)}
                      disabled={isDownloading}
                      className="p-2 rounded-xl bg-[#2481cc] hover:bg-[#1f70b2] text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
                      title="Baixar GIF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleCopyLink(gif, e)}
                      className="p-2 rounded-xl bg-[#16202c] hover:bg-[#2481cc] text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
                      title="Copiar Link"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-[#34c759]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => handleShareGif(gif, e)}
                      className="p-2 rounded-xl bg-[#16202c] hover:bg-[#2481cc] text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
                      title="Compartilhar"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Real Title & Action Buttons Bar */}
                <div className="p-2.5 flex flex-col justify-between gap-2 bg-[#1c2733] flex-1">
                  <span className="text-[11px] font-bold text-white line-clamp-1 leading-snug">
                    {gif.title}
                  </span>

                  {/* Bottom Action Row */}
                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#253241]/60">
                    <button
                      onClick={(e) => handleDownloadGif(gif, e)}
                      disabled={isDownloading}
                      className="flex-1 py-1 px-1.5 rounded-lg bg-[#161f2a] hover:bg-[#2481cc] text-[10px] font-bold text-[#8293a4] hover:text-white flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Baixar GIF"
                    >
                      <Download className="w-3 h-3" />
                      <span>Baixar</span>
                    </button>

                    <button
                      onClick={(e) => handleCopyLink(gif, e)}
                      className="flex-1 py-1 px-1.5 rounded-lg bg-[#161f2a] hover:bg-[#2481cc] text-[10px] font-bold text-[#8293a4] hover:text-white flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Copiar link"
                    >
                      {isCopied ? (
                        <Check className="w-3 h-3 text-[#34c759]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Link</span>
                    </button>

                    <button
                      onClick={(e) => handleShareGif(gif, e)}
                      className="p-1 rounded-lg bg-[#161f2a] hover:bg-[#2481cc] text-[#8293a4] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Compartilhar"
                    >
                      <Share2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Infinite Scroll Sentinel & Subtle Loading Indicator */}
      <div 
        ref={sentinelRef} 
        className="w-full py-5 flex items-center justify-center min-h-[50px]"
      >
        {isLoadingMore ? (
          <div className="flex items-center gap-2 text-xs font-bold text-[#2aabee] bg-[#1c2733]/80 px-4 py-2 rounded-full border border-[#253241]/70">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Carregando mais GIFs...</span>
          </div>
        ) : (
          <div className="h-2" />
        )}
      </div>

      {/* Modal Preview with Full Actions */}
      <AnimatePresence>
        {selectedGif && (
          <div
            onClick={() => setSelectedGif(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1c2733] rounded-3xl overflow-hidden max-w-sm w-full border border-[#253241] space-y-3.5 p-4 shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white truncate pr-2">
                  {selectedGif.title}
                </h4>
                <button
                  onClick={() => setSelectedGif(null)}
                  className="p-1.5 rounded-full bg-[#161f2a] text-[#8293a4] hover:text-white transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Large Image Box */}
              <div className="w-full rounded-2xl overflow-hidden bg-[#101720] aspect-video flex items-center justify-center">
                <img
                  src={selectedGif.url}
                  alt={selectedGif.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Link Input Box */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#708499] uppercase">URL Direta do GIF</span>
                <input
                  type="text"
                  readOnly
                  value={selectedGif.url}
                  className="w-full px-3 py-2 bg-[#161f2a] rounded-xl text-xs font-mono text-[#2aabee] select-all border-0 focus:outline-none"
                />
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDownloadGif(selectedGif)}
                  className="py-2.5 px-3 rounded-xl bg-[#2481cc] hover:bg-[#1f70b2] active:bg-[#165a91] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-[#2481cc]/20 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar GIF</span>
                </button>

                <button
                  onClick={() => handleCopyLink(selectedGif)}
                  className="py-2.5 px-3 rounded-xl bg-[#161f2a] hover:bg-[#22303f] active:bg-[#101720] text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-[#253241] transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-[#2aabee]" />
                  <span>Copiar Link</span>
                </button>

                <button
                  onClick={() => handleShareGif(selectedGif)}
                  className="py-2 px-3 rounded-xl bg-[#161f2a] hover:bg-[#22303f] text-[#8293a4] hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-[#253241]/70 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartilhar</span>
                </button>

                <button
                  onClick={() => handleCopyCode(selectedGif)}
                  className="py-2 px-3 rounded-xl bg-[#161f2a] hover:bg-[#22303f] text-[#8293a4] hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-[#253241]/70 transition-colors cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Copiar Markdown</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
