import React, { useState, useMemo, useEffect, useRef } from 'react';
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

export default function App() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('geral');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);
  
  // Real-time live GIFs state
  const [liveGifs, setLiveGifs] = useState<DisplayGif[]>([]);
  const [nextPos, setNextPos] = useState<string | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  // Current category data
  const currentCategoryData = useMemo(() => {
    return GIF_CATEGORIES.find((c) => c.id === activeCategory) || GIF_CATEGORIES[0];
  }, [activeCategory]);

  // Initial seed fallback GIFs strictly from the selected category
  const fallbackList = useMemo(() => {
    return currentCategoryData.gifs.map((g) => ({
      ...g,
      category: currentCategoryData.name,
    }));
  }, [currentCategoryData]);

  // 1. Fetch category GIFs when activeCategory changes
  useEffect(() => {
    if (searchQuery.trim()) return;

    let isMounted = true;
    setHasMore(true);
    const fetchCategoryGifs = async () => {
      let queryTerm = currentCategoryData.name;
      if (activeCategory === 'geral') queryTerm = 'trending gifs';
      if (activeCategory === 'animes') queryTerm = 'anime';
      if (activeCategory === 'jogos') queryTerm = 'gaming games';
      if (activeCategory === 'desenhos') queryTerm = 'cartoons animation';
      if (activeCategory === 'reacoes') queryTerm = 'reaction memes';
      if (activeCategory === 'filmes') queryTerm = 'cinema movies';
      if (activeCategory === 'series') queryTerm = 'tv shows series';

      try {
        const result = await searchOnlineGifs(queryTerm, currentCategoryData.id, 30);
        if (isMounted && result.results && result.results.length > 0) {
          const seenIds = new Set<string>();
          const formatted: DisplayGif[] = [];

          for (let i = 0; i < result.results.length; i++) {
            const r = result.results[i];
            const gifUrl = r.media[0]?.gif?.url || r.media[0]?.tinygif?.url || r.url;
            const gifId = extractTenorGifId(gifUrl) || r.id || `${i}`;

            if (gifUrl && !seenIds.has(gifId)) {
              seenIds.add(gifId);
              formatted.push({
                id: r.id || `${activeCategory}-${gifId}-${i}`,
                title: r.title || `${currentCategoryData.name} #${i + 1}`,
                url: gifUrl,
                category: currentCategoryData.name,
                tags: r.tags || [activeCategory],
              });
            }
          }

          if (formatted.length > 0) {
            setLiveGifs(formatted);
            setNextPos(result.next);
          }
        }
      } catch {
        // Fallback silencioso usando a lista estrita da categoria
      }
    };

    fetchCategoryGifs();

    return () => {
      isMounted = false;
    };
  }, [activeCategory, currentCategoryData, searchQuery]);

  // 2. Real-Time Direct Search with Debounce
  useEffect(() => {
    const term = searchQuery.trim();
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!term) {
      // Restaura os GIFs da categoria ativa se a busca for limpa
      const catGifs = currentCategoryData.gifs.map((g) => ({
        id: g.id,
        title: g.title,
        url: g.url,
        category: currentCategoryData.name,
        tags: g.tags,
      }));
      setLiveGifs(catGifs);
      setNextPos(undefined);
      setHasMore(true);
      return;
    }

    setHasMore(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await searchOnlineGifs(term, undefined, 30);
        if (result.results && result.results.length > 0) {
          const seenIds = new Set<string>();
          const formatted: DisplayGif[] = [];

          for (let i = 0; i < result.results.length; i++) {
            const r = result.results[i];
            const gifUrl = r.media[0]?.gif?.url || r.media[0]?.tinygif?.url || r.url;
            const gifId = extractTenorGifId(gifUrl) || r.id || `${i}`;
            
            if (gifUrl && !seenIds.has(gifId)) {
              seenIds.add(gifId);
              formatted.push({
                id: r.id || `search-${gifId}-${i}`,
                title: r.title || `${term} #${i + 1}`,
                url: gifUrl,
                category: result.categoryMatched || 'Geral',
                tags: r.tags || [term],
              });
            }
          }

          setLiveGifs(formatted);
          setNextPos(result.next);
        }
      } catch {
        // Ignora
      }
    }, 250);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, currentCategoryData]);

  // Deduplicated Active GIFs strictly by URL and Tenor ID
  const displayGifs = useMemo(() => {
    const rawList = liveGifs.length > 0 ? liveGifs : fallbackList;
    const seenUrls = new Set<string>();
    const seenIds = new Set<string>();
    const unique: DisplayGif[] = [];

    for (const item of rawList) {
      if (!item.url) continue;
      const tenorId = extractTenorGifId(item.url);
      
      if (!seenUrls.has(item.url) && !seenIds.has(tenorId)) {
        seenUrls.add(item.url);
        if (tenorId) seenIds.add(tenorId);
        unique.push(item);
      }
    }
    return unique;
  }, [liveGifs, fallbackList]);

  // Infinite scroll loader
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Load More Handler (Triggered on Scroll)
  const handleLoadMoreGifs = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const term = searchQuery.trim() || currentCategoryData.name;
      const forcedCat = searchQuery.trim() ? undefined : currentCategoryData.id;
      
      const currentList = liveGifs.length > 0 ? liveGifs : fallbackList;
      const currentPos = nextPos || `${currentList.length}`;
      
      const res = await searchOnlineGifs(term, forcedCat, 20, currentPos);

      if (res.results && res.results.length > 0) {
        const base = liveGifs.length > 0 ? liveGifs : fallbackList;
        const existingUrls = new Set(base.map(g => g.url));
        const existingIds = new Set(base.map(g => extractTenorGifId(g.url)));

        const newItems: DisplayGif[] = [];
        for (let i = 0; i < res.results.length; i++) {
          const r = res.results[i];
          const gifUrl = r.media[0]?.gif?.url || r.media[0]?.tinygif?.url || r.url;
          const tenorId = extractTenorGifId(gifUrl);

          if (gifUrl && !existingUrls.has(gifUrl) && (!tenorId || !existingIds.has(tenorId))) {
            existingUrls.add(gifUrl);
            if (tenorId) existingIds.add(tenorId);
            newItems.push({
              id: `${r.id || 'extra'}-${tenorId || i}-${Date.now()}`,
              title: r.title || `${term} #${base.length + newItems.length + 1}`,
              url: gifUrl,
              category: currentCategoryData.name,
              tags: r.tags || [term],
            });
          }
        }

        if (newItems.length > 0) {
          setLiveGifs((prev) => {
            const current = prev.length > 0 ? prev : fallbackList;
            return [...current, ...newItems];
          });
        }

        setNextPos(res.next || `${currentList.length + res.results.length}`);
      }
    } catch {
      // Ignora erro silenciosamente durante scroll automático
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1621] text-[#f5f5f5] flex justify-center selection:bg-[#2481cc]/30">
      {/* Loading Splash Screen */}
      <AnimatePresence>
        {isAppLoading && <LoadingScreen isLoading={isAppLoading} />}
      </AnimatePresence>

      {/* Main App Container */}
      <div className="w-full max-w-md min-h-screen bg-[#0e1621] flex flex-col pb-8">
        
        {/* Top Header with Documentation Button */}
        <header className="pt-6 pb-2 px-4 flex items-center justify-between border-b border-[#1c2733]/70 mb-1">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-1.5">
              <span>Raphael GIFs</span>
            </h1>
            <p className="text-[10px] text-[#8293a4] font-bold tracking-wide">
              @raphaelsboting • Tenor Gateway
            </p>
          </div>

          {/* Documentation & API Button */}
          <button
            onClick={() => setIsDocsOpen(true)}
            className="py-2 px-3 rounded-xl bg-[#1c2733] hover:bg-[#2481cc] text-[#2aabee] hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 border border-[#253241] shadow-sm active:scale-95 cursor-pointer"
            title="Abrir Documentação e API"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Documentação</span>
          </button>
        </header>

        {/* Global Search Bar */}
        <SearchBar
          query={searchQuery}
          onQueryChange={setSearchQuery}
          resultCount={displayGifs.length}
        />

        {/* Clean Category Bar with Horizontal Scroll Only */}
        {!searchQuery.trim() && (
          <CategorySelector
            activeCategory={activeCategory}
            onSelectCategory={(catId) => {
              setActiveCategory(catId);
              setLiveGifs([]);
            }}
          />
        )}

        {/* GIF Gallery Grid with Real Titles & Actions (Download, Copy, Share, Code) */}
        <GifGallery
          gifs={displayGifs}
          activeCategoryName={searchQuery.trim() ? `Busca: "${searchQuery}"` : currentCategoryData.name}
          onShowToast={showToast}
          onLoadMore={handleLoadMoreGifs}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
        />

        {/* Footer with Clean Tenor Attribution */}
        <footer className="mt-10 pt-4 pb-6 text-center text-[11px] text-[#708499] px-4 space-y-2 border-t border-[#1c2733]/60">
          <p className="font-bold text-white/80">Raphael GIF Platform • 2026</p>
          <p className="text-[11px]">
            Desenvolvido para Bots e Desenvolvedores. Mídias fornecidas via{' '}
            <a 
              href="https://tenor.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#2aabee] hover:underline font-bold inline-flex items-center gap-0.5"
            >
              <span>Tenor</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </p>
          <button
            onClick={() => setIsDocsOpen(true)}
            className="text-[10px] text-[#2481cc] hover:underline font-semibold cursor-pointer"
          >
            Ver Termos, Políticas & Endpoints da API
          </button>
        </footer>

      </div>

      {/* Complete Documentation & API Modal */}
      <DocumentationModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
        onShowToast={showToast}
      />

      {/* Floating Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
}
