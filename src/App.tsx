import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { BookOpen, ExternalLink } from 'lucide-react';

const CATEGORY_QUERY: Record<string, string> = {
  geral: 'trending gifs',
  memes: 'meme',
  jogos: 'gaming games',
  animes: 'anime',
  desenhos: 'cartoons animation',
  reacoes: 'reaction memes',
  filmes: 'cinema movies',
  series: 'tv shows series',
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
    seenUrls.add(url);
    if (id) seenIds.add(id);
    output.push({
      id: result?.id || `${fallbackTag}-${id}-${index}`,
      title: result?.title || `${categoryName} #${index + 1}`,
      url,
      category: categoryName,
      tags: Array.isArray(result?.tags) ? result.tags : [fallbackTag],
    });
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
  const [nextPos, setNextPos] = useState<string | undefined>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const requestIdRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const toastTimerRef = useRef<number | null>(null);

  const currentCategoryData = useMemo(
    () => GIF_CATEGORIES.find((category) => category.id === activeCategory) || GIF_CATEGORIES[0],
    [activeCategory]
  );

  const fallbackList = useMemo<DisplayGif[]>(
    () => currentCategoryData.gifs.map((gif) => ({ ...gif, category: currentCategoryData.name })),
    [currentCategoryData]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setIsAppLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const term = searchQuery.trim();
    const requestId = ++requestIdRef.current;
    const controller = new AbortController();

    setIsLoadingMore(false);
    loadingMoreRef.current = false;
    setHasMore(true);
    setNextPos(undefined);
    setLiveGifs([]);

    const query = term || CATEGORY_QUERY[activeCategory] || currentCategoryData.name;
    const category = term ? undefined : currentCategoryData.id;

    const timer = window.setTimeout(async () => {
      try {
        const result = await searchOnlineGifs(query, category, 30, 0);
        if (controller.signal.aborted || requestId !== requestIdRef.current) return;

        const formatted = toDisplayGifs(result.results || [], currentCategoryData.name, term || activeCategory);
        if (formatted.length) {
          setLiveGifs(formatted);
          setNextPos(result.next);
          setHasMore(Boolean(result.next) && formatted.length >= 10);
        } else {
          setLiveGifs(fallbackList);
          setNextPos(undefined);
          setHasMore(false);
        }
      } catch {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return;
        setLiveGifs(fallbackList);
        setNextPos(undefined);
        setHasMore(false);
      }
    }, term ? 250 : 60);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [searchQuery, activeCategory, currentCategoryData, fallbackList]);

  const displayGifs = useMemo(() => {
    const source = liveGifs.length ? liveGifs : fallbackList;
    const urls = new Set<string>();
    const ids = new Set<string>();
    return source.filter((gif) => {
      if (!gif?.url || urls.has(gif.url)) return false;
      const id = extractTenorGifId(gif.url);
      if (id && ids.has(id)) return false;
      urls.add(gif.url);
      if (id) ids.add(id);
      return true;
    });
  }, [liveGifs, fallbackList]);

  const showToast = (text: string) => {
    setToastMessage(text);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMessage(null), 2200);
  };

  const handleLoadMoreGifs = async () => {
    if (loadingMoreRef.current || isLoadingMore || !hasMore) return;

    loadingMoreRef.current = true;
    setIsLoadingMore(true);

    try {
      const requestId = requestIdRef.current;
      const term = searchQuery.trim();
      const query = term || CATEGORY_QUERY[activeCategory] || currentCategoryData.name;
      const category = term ? undefined : currentCategoryData.id;
      const parsedOffset = Number.parseInt(nextPos || '', 10);
      const offset = Number.isFinite(parsedOffset) ? Math.max(parsedOffset, liveGifs.length) : liveGifs.length;

      const result = await searchOnlineGifs(query, category, 20, offset);
      if (requestId !== requestIdRef.current) return;

      const incoming = toDisplayGifs(result.results || [], currentCategoryData.name, term || activeCategory);
      const existingUrls = new Set(liveGifs.map((gif) => gif.url));
      const existingIds = new Set(liveGifs.map((gif) => extractTenorGifId(gif.url)).filter(Boolean));

      const uniqueIncoming = incoming.filter((gif) => {
        const id = extractTenorGifId(gif.url);
        if (existingUrls.has(gif.url)) return false;
        if (id && existingIds.has(id)) return false;
        existingUrls.add(gif.url);
        if (id) existingIds.add(id);
        return true;
      });

      if (uniqueIncoming.length) {
        setLiveGifs((previous) => [...previous, ...uniqueIncoming]);
      }

      const reachedEnd = !result.next || uniqueIncoming.length === 0;
      setNextPos(result.next);
      setHasMore(!reachedEnd);
    } catch {
      showToast('Não foi possível carregar mais GIFs agora.');
    } finally {
      loadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1621] text-[#f5f5f5] flex justify-center selection:bg-[#2481cc]/30">
      <AnimatePresence>{isAppLoading && <LoadingScreen isLoading={isAppLoading} />}</AnimatePresence>

      <div className="w-full max-w-md min-h-screen bg-[#0e1621] flex flex-col pb-8">
        <header className="pt-6 pb-2 px-4 flex items-center justify-between border-b border-[#1c2733]/70 mb-1">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase">Kaise GIFs</h1>
            <p className="text-[10px] text-[#8293a4] font-bold tracking-wide">Kaise GIF API • Busca • Categorias</p>
          </div>
          <button onClick={() => setIsDocsOpen(true)} className="py-2 px-3 rounded-xl bg-[#1c2733] hover:bg-[#2481cc] text-[#2aabee] hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 border border-[#253241] cursor-pointer">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Documentação</span>
          </button>
        </header>

        <SearchBar query={searchQuery} onQueryChange={setSearchQuery} resultCount={displayGifs.length} />

        {!searchQuery.trim() && (
          <CategorySelector
            activeCategory={activeCategory}
            onSelectCategory={(category) => {
              if (category === activeCategory) return;
              setActiveCategory(category);
              setSearchQuery('');
            }}
          />
        )}

        <GifGallery
          gifs={displayGifs}
          activeCategoryName={searchQuery.trim() ? `Busca: "${searchQuery}"` : currentCategoryData.name}
          onShowToast={showToast}
          onLoadMore={handleLoadMoreGifs}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
        />

        <footer className="mt-10 pt-4 pb-6 text-center text-[11px] text-[#708499] px-4 space-y-2 border-t border-[#1c2733]/60">
          <p className="font-bold text-white/80">Kaise GIF Platform • 2026</p>
          <p>
            Resultados podem apontar para fontes externas, incluindo{' '}
            <a href="https://tenor.com" target="_blank" rel="noopener noreferrer" className="text-[#2aabee] hover:underline font-bold inline-flex items-center gap-0.5">
              <span>Tenor</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            .
          </p>
          <button onClick={() => setIsDocsOpen(true)} className="text-[10px] text-[#2481cc] hover:underline font-semibold cursor-pointer">
            Ver documentação, termos e endpoints da API
          </button>
        </footer>
      </div>

      <DocumentationModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} onShowToast={showToast} />
      <Toast message={toastMessage} />
    </div>
  );
}
