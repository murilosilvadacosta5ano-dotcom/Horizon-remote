import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { SearchBar } from './components/SearchBar';
import { Toast } from './components/Toast';
import { CategorySelector } from './components/CategorySelector';
import { GifGallery, DisplayGif } from './components/GifGallery';
import { DocumentationModal } from './components/DocumentationModal';
import { LoadingScreen } from './components/LoadingScreen';
import { GIF_CATEGORIES } from './data/categoriesData';
import { searchOnlineGifs } from './services/gifSearch';
import { extractTenorGifId } from './services/tenorScraper';
import { BookOpen, ExternalLink, Sparkles } from 'lucide-react';

const CATEGORY_QUERY: Record<string, string> = {
  geral: 'trending gifs', memes: 'meme', jogos: 'gaming games', animes: 'anime',
  desenhos: 'cartoons animation', reacoes: 'reaction memes', filmes: 'cinema movies', series: 'tv shows series',
};

function toDisplayGifs(results: any[], categoryName: string, fallbackTag: string): DisplayGif[] {
  const seenUrls = new Set<string>();
  const seenIds = new Set<string>();
  const output: DisplayGif[] = [];
  for (const [index, result] of results.entries()) {
    const url = result?.media?.[0]?.gif?.url || result?.media?.[0]?.tinygif?.url || result?.url;
    if (!url || seenUrls.has(url)) continue;
    const id = extractTenorGifId(url) || result?.id || `${fallbackTag}-${index}`;
    if (id && seenIds.has(id)) continue;
    seenUrls.add(url); if (id) seenIds.add(id);
    output.push({ id: result?.id || `${fallbackTag}-${id}-${index}`, title: result?.title || `${categoryName} #${index + 1}`, url, category: categoryName, tags: Array.isArray(result?.tags) ? result.tags : [fallbackTag] });
  }
  return output;
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('geral');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [liveGifs, setLiveGifs] = useState<DisplayGif[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const requestIdRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const nextPosRef = useRef<string | undefined>();
  const lastRequestedOffsetRef = useRef<string | undefined>();
  const toastTimerRef = useRef<number | null>(null);
  const currentCategoryData = useMemo(() => GIF_CATEGORIES.find((category) => category.id === activeCategory) || GIF_CATEGORIES[0], [activeCategory]);
  const fallbackList = useMemo<DisplayGif[]>(() => currentCategoryData.gifs.map((gif) => ({ ...gif, category: currentCategoryData.name })), [currentCategoryData]);

  useEffect(() => { const timer = window.setTimeout(() => setIsAppLoading(false), 350); return () => window.clearTimeout(timer); }, []);

  useEffect(() => {
    const term = searchQuery.trim(); const requestId = ++requestIdRef.current; const controller = new AbortController();
    loadingMoreRef.current = false; nextPosRef.current = undefined; lastRequestedOffsetRef.current = undefined;
    setIsLoadingMore(false); setHasMore(false); setLiveGifs([]);
    const query = term || CATEGORY_QUERY[activeCategory] || currentCategoryData.name;
    const category = term ? undefined : currentCategoryData.id;
    const timer = window.setTimeout(async () => {
      try {
        const result = await searchOnlineGifs(query, category, 30, '0');
        if (controller.signal.aborted || requestId !== requestIdRef.current) return;
        const formatted = toDisplayGifs(result.results || [], currentCategoryData.name, term || activeCategory);
        if (!formatted.length) { setLiveGifs(fallbackList); nextPosRef.current = undefined; setHasMore(false); return; }
        setLiveGifs(formatted); nextPosRef.current = result.next; setHasMore(Boolean(result.next));
      } catch {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return;
        setLiveGifs(fallbackList); nextPosRef.current = undefined; setHasMore(false);
      }
    }, term ? 280 : 80);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [searchQuery, activeCategory, currentCategoryData, fallbackList]);

  const displayGifs = useMemo(() => {
    const source = liveGifs.length ? liveGifs : fallbackList; const urls = new Set<string>(); const ids = new Set<string>();
    return source.filter((gif) => { if (!gif?.url || urls.has(gif.url)) return false; const id = extractTenorGifId(gif.url); if (id && ids.has(id)) return false; urls.add(gif.url); if (id) ids.add(id); return true; });
  }, [liveGifs, fallbackList]);

  const showToast = useCallback((text: string) => { setToastMessage(text); if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current); toastTimerRef.current = window.setTimeout(() => setToastMessage(null), 2200); }, []);
  useEffect(() => () => { if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current); }, []);

  const handleLoadMoreGifs = useCallback(async () => {
    const cursor = nextPosRef.current; if (loadingMoreRef.current || !hasMore || !cursor || lastRequestedOffsetRef.current === cursor) return;
    const requestId = requestIdRef.current; const term = searchQuery.trim(); const query = term || CATEGORY_QUERY[activeCategory] || currentCategoryData.name; const category = term ? undefined : currentCategoryData.id; const offset = Math.max(Number.parseInt(cursor, 10) || 0, 0);
    loadingMoreRef.current = true; lastRequestedOffsetRef.current = cursor; setIsLoadingMore(true);
    try {
      const result = await searchOnlineGifs(query, category, 20, String(offset)); if (requestId !== requestIdRef.current) return;
      const incoming = toDisplayGifs(result.results || [], currentCategoryData.name, term || activeCategory);
      if (!incoming.length) { nextPosRef.current = undefined; setHasMore(false); return; }
      setLiveGifs((previous) => { const existingUrls = new Set(previous.map((gif) => gif.url)); const existingIds = new Set(previous.map((gif) => extractTenorGifId(gif.url)).filter(Boolean)); const uniqueIncoming = incoming.filter((gif) => { const id = extractTenorGifId(gif.url); if (existingUrls.has(gif.url) || (id && existingIds.has(id))) return false; existingUrls.add(gif.url); if (id) existingIds.add(id); return true; }); return uniqueIncoming.length ? [...previous, ...uniqueIncoming] : previous; });
      const next = result.next; const nextNumber = next ? Number.parseInt(next, 10) : NaN;
      if (!next || !Number.isFinite(nextNumber) || nextNumber <= offset) { nextPosRef.current = undefined; setHasMore(false); } else { nextPosRef.current = next; setHasMore(true); }
    } catch { lastRequestedOffsetRef.current = undefined; showToast('Não foi possível carregar mais GIFs agora.'); }
    finally { loadingMoreRef.current = false; setIsLoadingMore(false); }
  }, [activeCategory, currentCategoryData, hasMore, searchQuery, showToast]);

  return (
    <div className="min-h-screen bg-[#07090c] text-white flex justify-center selection:bg-[#2f8cff]/30">
      <AnimatePresence>{isAppLoading && <LoadingScreen isLoading={isAppLoading} />}</AnimatePresence>
      <div className="w-full max-w-md min-h-screen bg-[#0b0e12] flex flex-col pb-8 shadow-[0_0_80px_rgba(0,0,0,.45)]">
        <header className="sticky top-0 z-30 px-4 pt-5 pb-3 bg-[#0b0e12]/90 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-[#147df5] flex items-center justify-center shadow-lg shadow-[#147df5]/20"><Sparkles className="w-3.5 h-3.5 text-white" /></div><h1 className="text-lg font-black tracking-tight">Kaise <span className="text-[#4da3ff]">GIFs</span></h1></div>
              <p className="text-[9px] text-[#7d8794] font-semibold mt-1 ml-9">GIFs rápidos. API simples. Sem complicação.</p>
            </div>
            <button onClick={() => setIsDocsOpen(true)} className="shrink-0 py-2 px-3 rounded-xl bg-[#151a21] hover:bg-[#1d242d] text-[#aab4c0] hover:text-white transition-colors text-[10px] font-bold flex items-center gap-1.5 border border-white/[0.07] cursor-pointer"><BookOpen className="w-3.5 h-3.5" />Documentação</button>
          </div>
        </header>
        <div className="pt-2"><SearchBar query={searchQuery} onQueryChange={setSearchQuery} resultCount={displayGifs.length} /></div>
        {!searchQuery.trim() && <CategorySelector activeCategory={activeCategory} onSelectCategory={(category) => { if (category !== activeCategory) { setActiveCategory(category); setSearchQuery(''); } }} />}
        <GifGallery gifs={displayGifs} activeCategoryName={searchQuery.trim() ? `Busca: "${searchQuery}"` : currentCategoryData.name} onShowToast={showToast} onLoadMore={handleLoadMoreGifs} isLoadingMore={isLoadingMore} hasMore={hasMore} />
        <footer className="mt-10 pt-5 pb-6 text-center text-[10px] text-[#66717f] px-4 space-y-2 border-t border-white/[0.06]"><p className="font-bold text-[#aeb7c2]">Kaise GIF Platform · 2026</p><p>Resultados podem apontar para fontes externas, incluindo <a href="https://tenor.com" target="_blank" rel="noopener noreferrer" className="text-[#4da3ff] hover:underline font-bold inline-flex items-center gap-0.5"><span>Tenor</span><ExternalLink className="w-2.5 h-2.5" /></a>.</p><button onClick={() => setIsDocsOpen(true)} className="text-[10px] text-[#4da3ff] hover:text-white hover:underline font-semibold cursor-pointer">Documentação, termos e endpoints da API</button></footer>
      </div>
      <DocumentationModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} onShowToast={showToast} /><Toast message={toastMessage} />
    </div>
  );
}
