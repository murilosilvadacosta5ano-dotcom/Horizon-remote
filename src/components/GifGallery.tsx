import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Copy, Check, Download, Share2, Code2, X, Loader2 } from 'lucide-react';
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
  const loadingLockRef = useRef(false);

  const uniqueGifs = useMemo(() => {
    const seenUrls = new Set<string>();
    const seenIds = new Set<string>();
    const list: DisplayGif[] = [];

    for (const gif of gifs) {
      if (!gif.url) continue;
      const tenorId = extractTenorGifId(gif.url);
      if (seenUrls.has(gif.url)) continue;
      if (tenorId && seenIds.has(tenorId)) continue;
      seenUrls.add(gif.url);
      if (tenorId) seenIds.add(tenorId);
      list.push(gif);
    }

    return list;
  }, [gifs]);

  useEffect(() => {
    if (!onLoadMore || !hasMore) return;

    const triggerLoad = () => {
      if (loadingLockRef.current || isLoadingMore || !hasMore) return;
      loadingLockRef.current = true;
      onLoadMore();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) triggerLoad();
      },
      { rootMargin: '300px', threshold: 0.01 }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) observer.observe(currentSentinel);

    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
      observer.disconnect();
    };
  }, [onLoadMore, isLoadingMore, hasMore, uniqueGifs.length]);

  useEffect(() => {
    if (!isLoadingMore) loadingLockRef.current = false;
  }, [isLoadingMore]);

  const handleCopyLink = async (gif: DisplayGif, event?: React.MouseEvent) => {
    event?.stopPropagation();
    try {
      await navigator.clipboard.writeText(gif.url);
      setCopiedId(gif.id);
      onShowToast('Link direto copiado!');
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      onShowToast('Não foi possível copiar o link.');
    }
  };

  const handleDownloadGif = async (gif: DisplayGif, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setDownloadingId(gif.id);
    onShowToast('Iniciando download do GIF...');

    try {
      const response = await fetch(gif.url, { mode: 'cors' });
      if (!response.ok) throw new Error('Falha ao baixar imagem');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      const cleanName = (gif.title || 'gif')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '')
        .slice(0, 40) || 'gif';
      anchor.download = `${cleanName}.gif`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(blobUrl);
      onShowToast('Download iniciado!');
    } catch {
      onShowToast('O download direto foi bloqueado pelo provedor. Use o link do GIF para salvar manualmente.');
      window.open(gif.url, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleShareGif = async (gif: DisplayGif, event?: React.MouseEvent) => {
    event?.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: gif.title,
          text: `Confira este GIF: ${gif.title}`,
          url: gif.url,
        });
        onShowToast('Compartilhado com sucesso!');
        return;
      } catch {
        // Cancelado ou não disponível, copia o link abaixo.
      }
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
        <h3 className="text-xs font-black text-[#8293a4] uppercase tracking-wider">
          {activeCategoryName}
        </h3>
        <span className="text-[10px] font-bold text-[#8293a4] bg-[#1c2733] px-2 py-0.5 rounded-full border border-[#253241]/60">
          {uniqueGifs.length} GIFs
        </span>
      </div>

      {uniqueGifs.length === 0 ? (
        <div className="py-16 text-center text-[#8293a4] flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p className="text-xs font-semibold">Carregando GIFs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {uniqueGifs.map((gif, index) => {
            const isCopied = copiedId === gif.id;
            const isDownloading = downloadingId === gif.id;

            return (
              <motion.article
                key={`${gif.id}-${gif.url}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedGif(gif)}
                onContextMenu={(event) => event.preventDefault()}
                className="group relative bg-[#161f2a] rounded-2xl overflow-hidden border border-[#253241]/60 hover:border-[#2481cc]/60 transition-all flex flex-col shadow-sm cursor-pointer select-none"
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
                    loading="lazy"
                    draggable={false}
                    onDragStart={(event) => event.preventDefault()}
                    onContextMenu={(event) => event.preventDefault()}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
                  />

                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 backdrop-blur-[2px] pointer-events-none">
                    <span className="px-2.5 py-1.5 rounded-full bg-[#101720]/85 text-white text-[10px] font-bold border border-white/10">
                      Abrir GIF
                    </span>
                  </div>
                </div>

                <div className="p-2.5 flex flex-col justify-between gap-2 bg-[#1c2733] flex-1">
                  <span className="text-[11px] font-bold text-white line-clamp-1 leading-snug">
                    {gif.title}
                  </span>

                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#253241]/60">
                    <button
                      onClick={(event) => handleCopyLink(gif, event)}
                      className="flex-1 py-1.5 px-1.5 rounded-lg bg-[#161f2a] hover:bg-[#2481cc] text-[10px] font-bold text-[#8293a4] hover:text-white flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Copiar link"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-[#34c759]" /> : <Copy className="w-3 h-3" />}
                      <span>Link</span>
                    </button>

                    <button
                      onClick={(event) => handleShareGif(gif, event)}
                      className="p-1.5 rounded-lg bg-[#161f2a] hover:bg-[#2481cc] text-[#8293a4] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Compartilhar"
                    >
                      <Share2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      <div ref={sentinelRef} className="w-full py-5 flex items-center justify-center min-h-[50px]">
        {isLoadingMore ? (
          <div className="flex items-center gap-2 text-xs font-bold text-[#2aabee] bg-[#1c2733]/80 px-4 py-2 rounded-full border border-[#253241]/70">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Carregando mais GIFs...</span>
          </div>
        ) : (
          <div className="h-2" />
        )}
      </div>

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
              onClick={(event) => event.stopPropagation()}
              className="bg-[#1c2733] rounded-3xl overflow-hidden max-w-sm w-full border border-[#253241] space-y-3.5 p-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white truncate pr-2">{selectedGif.title}</h4>
                <button
                  onClick={() => setSelectedGif(null)}
                  className="p-1.5 rounded-full bg-[#161f2a] text-[#8293a4] hover:text-white transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="w-full rounded-2xl overflow-hidden bg-[#101720] aspect-video flex items-center justify-center">
                <img
                  src={selectedGif.url}
                  alt={selectedGif.title}
                  referrerPolicy="no-referrer"
                  draggable={false}
                  onDragStart={(event) => event.preventDefault()}
                  onContextMenu={(event) => event.preventDefault()}
                  className="w-full h-full object-contain select-none"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#708499] uppercase">URL direta do GIF</span>
                <input
                  type="text"
                  readOnly
                  value={selectedGif.url}
                  onFocus={(event) => event.currentTarget.select()}
                  className="w-full px-3 py-2 bg-[#161f2a] rounded-xl text-xs font-mono text-[#2aabee] select-all border-0 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={(event) => handleDownloadGif(selectedGif, event)}
                  disabled={isDownloading}
                  className="py-2.5 px-3 rounded-xl bg-[#2481cc] hover:bg-[#1f70b2] active:bg-[#165a91] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-[#2481cc]/20 cursor-pointer disabled:opacity-50"
                >
                  {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>{isDownloading ? 'Baixando...' : 'Baixar GIF'}</span>
                </button>

                <button
                  onClick={(event) => handleCopyLink(selectedGif, event)}
                  className="py-2.5 px-3 rounded-xl bg-[#161f2a] hover:bg-[#22303f] text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-[#253241] transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-[#2aabee]" />
                  <span>Copiar Link</span>
                </button>

                <button
                  onClick={(event) => handleShareGif(selectedGif, event)}
                  className="py-2 px-3 rounded-xl bg-[#161f2a] hover:bg-[#22303f] text-[#8293a4] hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-[#253241]/70 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartilhar</span>
                </button>

                <button
                  onClick={(event) => handleCopyCode(selectedGif, event)}
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
