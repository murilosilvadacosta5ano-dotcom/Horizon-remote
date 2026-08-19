import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  Share2, 
  Code2, 
  X, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  ImageOff, 
  Sparkles, 
  Heart,
  ExternalLink 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { extractTenorGifId } from '../services/tenorScraper';
import { toggleFavorite, checkIsFavorite } from '../services/authService';

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
  onNavigate?: (path: string) => void;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
}

export const GifGallery: React.FC<GifGalleryProps> = ({
  gifs,
  activeCategoryName,
  onShowToast,
  onNavigate,
  onLoadMore,
  isLoadingMore = false,
  hasMore = true,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedGifIndex, setSelectedGifIndex] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, number>>({});
  
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

  const selectedGif = selectedGifIndex !== null ? uniqueGifs[selectedGifIndex] || null : null;

  // Image load & failover handlers
  const handleImageLoad = (url: string) => {
    setLoadedImages((prev) => ({ ...prev, [url]: true }));
  };

  const handleImageError = (url: string) => {
    setFailedImages((prev) => {
      const currentFailures = prev[url] || 0;
      return { ...prev, [url]: currentFailures + 1 };
    });
  };

  const getFailoverUrl = (url: string, attempts: number): string => {
    if (attempts >= 3) return '';
    if (url.includes('media1.tenor.com')) return url.replace('media1.tenor.com', 'media.tenor.com');
    if (url.includes('media.tenor.com')) return url.replace('media.tenor.com', 'c.tenor.com');
    if (url.includes('c.tenor.com')) return url.replace('c.tenor.com', 'media1.tenor.com');
    return url;
  };

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedGifIndex === null) return;
      if (e.key === 'ArrowRight') {
        setSelectedGifIndex((prev) => (prev !== null && prev < uniqueGifs.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        setSelectedGifIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : uniqueGifs.length - 1));
      } else if (e.key === 'Escape') {
        setSelectedGifIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGifIndex, uniqueGifs.length]);

  // Infinite Scroll Trigger with IntersectionObserver and Window Scroll Fallback
  useEffect(() => {
    if (!onLoadMore || !hasMore) return;

    let debounceTimer: any = null;
    const triggerLoad = () => {
      if (isLoadingMore) return;
      onLoadMore();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && !isLoadingMore) {
          triggerLoad();
        }
      },
      {
        rootMargin: '600px',
        threshold: 0.05,
      }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

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
  const handleCopyLink = useCallback((gif: DisplayGif, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(gif.url);
    setCopiedId(gif.id);
    onShowToast(`Link direto copiado!`);
    setTimeout(() => setCopiedId(null), 1500);
  }, [onShowToast]);

  // Action: Download GIF file
  const handleDownloadGif = useCallback(async (gif: DisplayGif, e?: React.MouseEvent) => {
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
  }, [onShowToast]);

  // Action: Share GIF
  const handleShareGif = useCallback(async (gif: DisplayGif, e?: React.MouseEvent) => {
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
  }, [handleCopyLink, onShowToast]);

  // Action: Copy Markdown / Discord code
  const handleCopyCode = useCallback((gif: DisplayGif, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const markdown = `![${gif.title}](${gif.url})`;
    navigator.clipboard.writeText(markdown);
    onShowToast('Markdown copiado para Discord/Telegram!');
  }, [onShowToast]);

  return (
    <div className="px-4 py-2 flex flex-col flex-1 select-none">
      {/* Section Header without counter */}
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <h3 className="text-xs font-black text-[#8293a4] uppercase tracking-wider">
          {activeCategoryName}
        </h3>
      </div>

      {/* Grid of GIFs */}
      {uniqueGifs.length === 0 ? (
        <div className="py-16 text-center text-[#8293a4] flex flex-col items-center justify-center space-y-3 bg-[#1c2733]/40 rounded-3xl border border-[#253241]/50 p-6">
          <div className="p-3 rounded-2xl bg-[#16202c] text-[#708499]">
            <ImageOff className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-white">Nenhum GIF encontrado para esta busca.</p>
          <p className="text-[11px] text-[#708499] max-w-xs">
            Tente pesquisar por outros termos como <span className="text-[#2aabee] font-medium">naruto, minecraft, memes, risada</span> ou selecione uma das categorias acima.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {uniqueGifs.map((gif, index) => {
            const isCopied = copiedId === gif.id;
            const isDownloading = downloadingId === gif.id;
            const isLoaded = loadedImages[gif.url];
            const failCount = failedImages[gif.url] || 0;
            const effectiveUrl = failCount > 0 ? getFailoverUrl(gif.url, failCount) : gif.url;
            const isTotallyFailed = failCount >= 3 || !effectiveUrl;

            return (
              <motion.div
                key={`${gif.id}-${gif.url}-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                onClick={() => setSelectedGifIndex(index)}
                className="group relative bg-[#161f2a] rounded-2xl overflow-hidden border border-[#253241]/60 hover:border-[#2481cc]/60 transition-all flex flex-col shadow-sm cursor-pointer"
              >
                {/* Visual GIF Container */}
                <div className="relative aspect-video w-full bg-[#101720] overflow-hidden flex items-center justify-center">
                  {/* Skeleton loading animation */}
                  {!isLoaded && !isTotallyFailed && (
                    <div className="absolute inset-0 bg-[#141d27] animate-pulse flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-[#253241] opacity-60" />
                    </div>
                  )}

                  {/* Fallback box if URL completely failed */}
                  {isTotallyFailed ? (
                    <div className="w-full h-full p-3 flex flex-col items-center justify-center text-center bg-[#18222e] text-[#8293a4]">
                      <ImageOff className="w-5 h-5 mb-1 text-[#e05252]" />
                      <span className="text-[10px] font-bold text-white line-clamp-1">{gif.title}</span>
                      <span className="text-[9px] text-[#708499] mt-0.5">Mídia Indisponível</span>
                    </div>
                  ) : (
                    <img
                      src={effectiveUrl}
                      alt={gif.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      onLoad={() => handleImageLoad(gif.url)}
                      onError={() => handleImageError(gif.url)}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 pointer-events-none ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  )}

                  {/* Overlay on hover/touch */}
                  {!isTotallyFailed && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2 backdrop-blur-[2px]">
                      <button
                        onClick={(e) => handleDownloadGif(gif, e)}
                        disabled={isDownloading}
                        className="p-2.5 rounded-xl bg-[#2481cc] hover:bg-[#1f70b2] text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
                        title="Baixar GIF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleCopyLink(gif, e)}
                        className="p-2.5 rounded-xl bg-[#16202c] hover:bg-[#2481cc] text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
                        title="Copiar Link"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-[#34c759]" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => handleShareGif(gif, e)}
                        className="p-2.5 rounded-xl bg-[#16202c] hover:bg-[#2481cc] text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
                        title="Compartilhar"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Real Title & Action Buttons Bar */}
                <div className="p-2.5 flex flex-col justify-between gap-2 bg-[#1c2733] flex-1">
                  <span className="text-[11px] font-bold text-white line-clamp-1 leading-snug">
                    {gif.title}
                  </span>

                  {/* Bottom Action Row with optimized comfortable button sizes */}
                  <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-[#253241]/60">
                    <button
                      onClick={(e) => handleDownloadGif(gif, e)}
                      disabled={isDownloading}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-[#161f2a] hover:bg-[#2481cc] active:bg-[#1f70b2] text-[11px] font-bold text-[#8293a4] hover:text-white flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Baixar GIF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar</span>
                    </button>

                    <button
                      onClick={(e) => handleCopyLink(gif, e)}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-[#161f2a] hover:bg-[#2481cc] active:bg-[#1f70b2] text-[11px] font-bold text-[#8293a4] hover:text-white flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Copiar link"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-[#34c759]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Link</span>
                    </button>

                    <button
                      onClick={(e) => handleShareGif(gif, e)}
                      className="p-1.5 rounded-xl bg-[#161f2a] hover:bg-[#2481cc] active:bg-[#1f70b2] text-[#8293a4] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Compartilhar"
                    >
                      <Share2 className="w-3.5 h-3.5" />
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
        className="w-full py-4 flex items-center justify-center min-h-[44px]"
      >
        {isLoadingMore ? (
          <div className="flex items-center gap-2 text-xs font-bold text-[#2aabee] bg-[#1c2733] px-4 py-2 rounded-full border border-[#253241] shadow-lg animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-[#2aabee]" />
            <span>Carregando figurinhas...</span>
          </div>
        ) : (
          <div className="h-1" />
        )}
      </div>

      {/* Modal Preview with Full Actions & Navigation */}
      <AnimatePresence>
        {selectedGif && selectedGifIndex !== null && (
          <div
            onClick={() => setSelectedGifIndex(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1c2733] rounded-3xl overflow-hidden max-w-sm w-full border border-[#253241] space-y-3.5 p-4 shadow-2xl relative"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="text-[10px] font-bold text-[#2aabee] bg-[#16202c] px-2 py-0.5 rounded-full">
                    {selectedGifIndex + 1} / {uniqueGifs.length}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate">
                    {selectedGif.title}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedGifIndex(null)}
                  className="p-1.5 rounded-full bg-[#161f2a] text-[#8293a4] hover:text-white transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Large Image Box with Next/Prev Overlay Arrows */}
              <div className="relative w-full rounded-2xl overflow-hidden bg-[#101720] aspect-video flex items-center justify-center group">
                <img
                  src={selectedGif.url}
                  alt={selectedGif.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />

                {/* Left Arrow */}
                {uniqueGifs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGifIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : uniqueGifs.length - 1));
                    }}
                    className="absolute left-2 p-2 rounded-full bg-black/60 hover:bg-[#2481cc] text-white backdrop-blur-sm transition-all active:scale-95 cursor-pointer"
                    title="GIF Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                {/* Right Arrow */}
                {uniqueGifs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGifIndex((prev) => (prev !== null && prev < uniqueGifs.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-2 p-2 rounded-full bg-black/60 hover:bg-[#2481cc] text-white backdrop-blur-sm transition-all active:scale-95 cursor-pointer"
                    title="Próximo GIF"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
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

              {/* Dedicated Details Page & Favorites Button */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    const { isFavorite } = toggleFavorite({
                      id: selectedGif.id,
                      title: selectedGif.title,
                      url: selectedGif.url,
                      category: selectedGif.category
                    });
                    onShowToast(isFavorite ? 'Salvo nas suas figurinhas favoritas! ❤️' : 'Removido dos favoritos.');
                  }}
                  className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    checkIsFavorite(selectedGif.url)
                      ? 'bg-[#ef4444]/20 border-[#ef4444]/50 text-[#ef4444]'
                      : 'bg-[#161f2a] border-[#253241] text-[#8293a4] hover:text-white'
                  }`}
                  title="Favoritar Figurinha"
                >
                  <Heart className={`w-4 h-4 ${checkIsFavorite(selectedGif.url) ? 'fill-[#ef4444] text-[#ef4444]' : ''}`} />
                  <span>{checkIsFavorite(selectedGif.url) ? 'Favoritado' : 'Favoritar'}</span>
                </button>

                {onNavigate && (
                  <button
                    onClick={() => {
                      const slug = extractTenorGifId(selectedGif.url) || encodeURIComponent(selectedGif.title);
                      setSelectedGifIndex(null);
                      onNavigate(`/${slug}`);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#1e2f42] to-[#16222f] hover:from-[#2481cc] hover:to-[#1a6bb0] text-[#2aabee] hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-[#253241] transition-all cursor-pointer shadow-sm group"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#2aabee] group-hover:text-white transition-colors" />
                    <span>Página da Figurinha HD</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
