import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Check, Download, Share2, Code2, X, Loader2, ExternalLink } from 'lucide-react';
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
  onLoadMore?: () => Promise<void> | void;
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
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadLockRef = useRef(false);

  const uniqueGifs = useMemo(() => {
    const seenUrls = new Set<string>();
    const seenIds = new Set<string>();
    const list: DisplayGif[] = [];

    for (const gif of gifs) {
      if (!gif?.url || imageErrors.has(gif.url)) continue;
      const tenorId = extractTenorGifId(gif.url);
      if (seenUrls.has(gif.url)) continue;
      if (tenorId && seenIds.has(tenorId)) continue;
      seenUrls.add(gif.url);
      if (tenorId) seenIds.add(tenorId);
      list.push(gif);
    }

    return list;
  }, [gifs, imageErrors]);

  const requestMore = useCallback(async () => {
    if (!onLoadMore || !hasMore || isLoadingMore || loadLockRef.current) return;
    loadLockRef.current = true;
    try {
      await onLoadMore();
    } finally {
      loadLockRef.current = false;
    }
  }, [onLoadMore, hasMore, isLoadingMore]);

  useEffect(() => {
    if (!onLoadMore || !hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void requestMore();
      },
      { rootMargin: '1200px 0px', threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, requestMore, uniqueGifs.length]);

  useEffect(() => {
    if (!selectedGif) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedGif(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedGif]);

  const markImageError = (url: string) => {
    setImageErrors((previous) => {
      const next = new Set(previous);
      next.add(url);
      return next;
    });
  };

  const handleCopyLink = async (gif: DisplayGif, event?: React.MouseEvent) => {
    event?.stopPropagation();
    try {
      await navigator.clipboard.writeText(gif.url);
      setCopiedId(gif.id);
      onShowToast('Link direto copiado!');
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      onShowToast('Não foi possível copiar o link.');
    }
  };

  const handleDownloadGif = async (gif: DisplayGif, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setDownloadingId(gif.id);
    try {
      const response = await fetch(gif.url, { mode: 'cors' });
      if (!response.ok) throw new Error('download failed');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      const cleanName = (gif.title || 'gif').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40) || 'gif';
      anchor.download = `${cleanName}.gif`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      onShowToast('Download iniciado!');
    } catch {
      onShowToast('O provedor bloqueou o download direto. O link foi aberto para você salvar manualmente.');
      window.open(gif.url, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleShareGif = async (gif: DisplayGif, event?: React.MouseEvent) => {
    event?.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({ title: gif.title, text: `Confira este GIF: ${gif.title}`, url: gif.url });
        onShowToast('Compartilhado!');
        return;
      }
    } catch {
      // User cancelled the native share sheet.
    }
    await handleCopyLink(gif);
  };

  const handleCopyCode = async (gif: DisplayGif, event?: React.MouseEvent) => {
    event?.stopPropagation();
    const markdown = `![${gif.title}](${gif.url})`;
    try {
      await navigator.clipboard.writeText(markdown);
      onShowToast('Markdown copiado!');
    } catch {
      onShowToast('Não foi possível copiar o Markdown.');
    }
  };

  return (
    <div className="px-4 py-2 flex flex-col flex-1">
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className="text-xs font-black text-[#8293a4] uppercase tracking-wider">{activeCategoryName}</h3>
        <span className="text-[10px] font-bold text-[#8293a4] bg-[#1c2733] px-2 py-0.5 rounded-full border border-[#253241]/60">{uniqueGifs.length} GIFs</span>
      </div>

      {uniqueGifs.length === 0 ? (
        <div className="py-16 text-center text-[#8293a4] flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin" aria-label="Carregando" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {uniqueGifs.map((gif, index) => {
            const isCopied = copiedId === gif.id;
            return (
              <article
                key={`${gif.id}-${gif.url}-${index}`}
                onClick={() => setSelectedGif(gif)}
                onContextMenu={(event) => event.preventDefault()}
                className="group relative bg-[#161f2a] rounded-2xl overflow-hidden border border-[#253241]/60 hover:border-[#2481cc]/60 transition-colors flex flex-col shadow-sm cursor-pointer select-none"
                role="button"
                tabIndex={0}
                aria-label={`Abrir GIF ${gif.title}`}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedGif(gif);
                  }
                }}
              >
                <div className="relative aspect-video w-full bg-[#101720] overflow-hidden flex items-center justify-center">
                  <img
                    src={gif.url}
                    alt={gif.title}
                    referrerPolicy="no-referrer"
                    loading={index < 8 ? 'eager' : 'lazy'}
                    decoding="async"
                    draggable={false}
                    onDragStart={(event) => event.preventDefault()}
                    onContextMenu={(event) => event.preventDefault()}
                    onError={() => markImageError(gif.url)}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300 pointer-events-none select-none"
                  />
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="px-2.5 py-1.5 rounded-full bg-[#101720]/90 text-white text-[10px] font-bold border border-white/10">Abrir GIF</span>
                  </div>
                </div>
                <div className="p-2.5 flex flex-col gap-2 bg-[#1c2733]">
                  <span className="text-[11px] font-bold text-white line-clamp-1 leading-snug">{gif.title}</span>
                  <div className="flex items-center gap-1 pt-1 border-t border-[#253241]/60">
                    <button onClick={(event) => handleCopyLink(gif, event)} className="flex-1 py-1.5 rounded-lg bg-[#161f2a] hover:bg-[#2481cc] text-[10px] font-bold text-[#8293a4] hover:text-white flex items-center justify-center gap-1 transition-colors cursor-pointer" title="Copiar link">
                      {isCopied ? <Check className="w-3 h-3 text-[#34c759]" /> : <Copy className="w-3 h-3" />}
                      <span>Link</span>
                    </button>
                    <button onClick={(event) => handleShareGif(gif, event)} className="p-1.5 rounded-lg bg-[#161f2a] hover:bg-[#2481cc] text-[#8293a4] hover:text-white flex items-center justify-center transition-colors cursor-pointer" title="Compartilhar">
                      <Share2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div ref={sentinelRef} className="w-full h-14 flex items-center justify-center pointer-events-none" aria-hidden="true">
        {isLoadingMore && <Loader2 className="w-5 h-5 text-[#2aabee] animate-spin" />}
      </div>

      <AnimatePresence>
        {selectedGif && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedGif(null)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`Visualização de ${selectedGif.title}`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              onClick={(event) => event.stopPropagation()}
              className="bg-[#1c2733] rounded-3xl overflow-hidden max-w-sm w-full border border-[#253241] p-4 shadow-2xl"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <h4 className="text-xs font-bold text-white truncate">{selectedGif.title}</h4>
                <button onClick={() => setSelectedGif(null)} className="shrink-0 p-1.5 rounded-full bg-[#161f2a] text-[#8293a4] hover:text-white cursor-pointer" title="Fechar"><X className="w-4 h-4" /></button>
              </div>

              <div className="w-full rounded-2xl overflow-hidden bg-[#101720] aspect-video flex items-center justify-center mb-3">
                <img src={selectedGif.url} alt={selectedGif.title} referrerPolicy="no-referrer" draggable={false} onDragStart={(event) => event.preventDefault()} onContextMenu={(event) => event.preventDefault()} className="w-full h-full object-contain select-none" />
              </div>

              <div className="space-y-1 mb-3">
                <span className="text-[10px] font-bold text-[#708499] uppercase">URL direta do GIF</span>
                <input type="text" readOnly value={selectedGif.url} onFocus={(event) => event.currentTarget.select()} className="w-full px-3 py-2 bg-[#161f2a] rounded-xl text-xs font-mono text-[#2aabee] select-all border border-[#253241] focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={(event) => handleDownloadGif(selectedGif, event)} disabled={downloadingId === selectedGif.id} className="py-2.5 rounded-xl bg-[#2481cc] hover:bg-[#1f70b2] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
                  {downloadingId === selectedGif.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>{downloadingId === selectedGif.id ? 'Baixando...' : 'Baixar GIF'}</span>
                </button>
                <button onClick={(event) => handleCopyLink(selectedGif, event)} className="py-2.5 rounded-xl bg-[#161f2a] text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-[#253241] cursor-pointer"><Copy className="w-4 h-4 text-[#2aabee]" /><span>Copiar Link</span></button>
                <button onClick={(event) => handleShareGif(selectedGif, event)} className="py-2 rounded-xl bg-[#161f2a] text-[#8293a4] hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-[#253241]/70 cursor-pointer"><Share2 className="w-3.5 h-3.5" /><span>Compartilhar</span></button>
                <button onClick={(event) => handleCopyCode(selectedGif, event)} className="py-2 rounded-xl bg-[#161f2a] text-[#8293a4] hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-[#253241]/70 cursor-pointer"><Code2 className="w-3.5 h-3.5" /><span>Copiar Markdown</span></button>
              </div>

              <a href={selectedGif.url} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} className="mt-3 w-full py-2 text-[10px] text-[#2aabee] font-bold flex items-center justify-center gap-1 hover:underline">
                Abrir origem do GIF <ExternalLink className="w-3 h-3" />
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
