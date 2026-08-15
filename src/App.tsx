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
  animes: 'anime',
  jogos: 'gaming games',
  desenhos: 'cartoons animation',
  reacoes: 'reaction memes',
  filmes: 'cinema movies',
  series: 'tv shows series',
};

function toDisplayGifs(results: any[], categoryName: string, fallbackTag: string): DisplayGif[] {
  const seen = new Set<string>();
  const output: DisplayGif[] = [];
  for (const [index, result] of results.entries()) {
    const url = result?.media?.[0]?.gif?.url || result?.media?.[0]?.tinygif?.url || result?.url;
    if (!url) continue;
    const id = extractTenorGifId(url) || result?.id || `${fallbackTag}-${index}`;
    if (seen.has(id) || seen.has(url)) continue;
    seen.add(id);
    seen.add(url);
    output.push({
      id: result?.id || `${fallbackTag}-${id}-${index}`,
      title: result?.title || `${categoryName} #${index + 1}`,
      url,
      category: categoryName,
      tags: result?.tags || [fallbackTag],
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

  useEffect(() => {
    const timer = window.setTimeout(() => setIsAppLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  const currentCategoryData = useMemo(
    () => GIF_CATEGORIES.find((category) => category.id === activeCategory) || GIF_CATEGORIES[0],
    [activeCategory]
  );

  const fallbackList = useMemo<DisplayGif[]>(
    () => currentCategoryData.gifs.map((gif) => ({ ...gif, category: currentCategoryData.name })),
    [currentCategoryData]
  );

  const showToast = (text: string) => {
    setToastMessage(text);
    window.setTimeout(() => setToastMessage(null), 2200);
  };

  useEffect(() => {
    const term = searchQuery.trim();
    const requestId = ++requestIdRef.current;
    const controller = new AbortController();

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
          setHasMore(formatted.length >= 10 && Boolean(result.next));
        } else {
          setLiveGifs(fallbackList);
          setHasMore(false);
        }
      } catch {
        if (!controller.signal.aborted && requestId === requestIdRef.current) {
          setLiveGifs(fallbackList);
          setHasMore(false);
        }
      }
    }, term ? 250 : 80);

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

  const handleLoadMoreGifs = async () => {
    if (loadingMoreRef.current || isLoadingMore || !hasMore) return;
    loadingMoreRef.current = true;
    setIsLoadingMore(true);

    try {
      const term = searchQuery.trim();
      const query = term || CATEGORY_QUERY[activeCategory] || currentCategoryData.name;
      const category = term ? undefined : currentCategoryData.id;
      const offset = Number.parseInt(nextPos || `${liveGifs.length}`, 10);
      const safeOffset = Number.isFinite(offset) ? Math.max(offset, liveGifs.length) : liveGifs.length;
      const result = await searchOnlineGifs(query, category, 20, safeOffset);
      const newItems = toDisplayGifs(result.results || [], currentCategoryData.name, `${activeCategory}-more`);

      const existingUrls = new Set(liveGifs.map((gif) => gif.url));
      const existingIds = new Set(liveGifs.map((gif) => extractTenorGifId(gif.url)).filter(Boolean));
      const uniqueNew = newItems.filter((gif) => {
        const id = extractTenorGifId(gif.url);
        if (existingUrls.has(gif.url) || (id && existingIds.has(id))) return false;
        existingUrls.add(gif.url);
        if (id) existingIds.add(id);
        return true;
      });

      if (uniqueNew.length) {
        setLiveGifs((previous) => [...previous, ...uniqueNew]);
        setNextPos(result.next || `${safeOffset + uniqueNew.length}`);
      } else {
        setHasMore(false);
      }
    } catch {
      // Do not blank the existing gallery when a later page fails.
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
            <h1 className="text-xl font-black text-white tracking-tight uppercase">Raphael GIFs</h1>
            <p className="text-[10px] text-[#8293a4] font-bold tracking-wide">@raphaelsboting • Kaise GIF API</p>
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
          <p>Mídias fornecidas via <a href="https://tenor.com" target="_blank" rel="noopener noreferrer" className="text-[#2aabee] hover:underline font-bold inline-flex items-center gap-0.5">Tenor <ExternalLink className="w-2.5 h-2.5" /></a></p>
          <button onClick={() => setIsDocsOpen(true)} className="text-[10px] text-[#2481cc] hover:underline font-semibold cursor-pointer">Ver Termos, Políticas & Endpoints da API</button>
        </footer>
      </div>

      <DocumentationModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} onShowToast={showToast} />
      <Toast message={toastMessage} />
    </div>
  );
}
