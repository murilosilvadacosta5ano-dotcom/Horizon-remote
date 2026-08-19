import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { SearchBar } from './components/SearchBar';
import { Toast } from './components/Toast';
import { CategorySelector } from './components/CategorySelector';
import { GifGallery, DisplayGif } from './components/GifGallery';
import { DocumentationModal } from './components/DocumentationModal';
import { DocumentationPage } from './components/DocumentationPage';
import { ApiPortalPage } from './components/ApiPortalPage';
import { GifDetailPage } from './components/GifDetailPage';
import { LoadingScreen } from './components/LoadingScreen';
import { UserProfileModal } from './components/UserProfileModal';
import { LoginPage } from './components/LoginPage';
import { GIF_CATEGORIES } from './data/categoriesData';
import { searchOnlineGifs } from './services/gifSearch';
import { extractTenorGifId } from './services/tenorScraper';
import { getStoredUser } from './services/authService';
import { UserProfile } from './types';
import { BookOpen, ExternalLink, Server, Zap, User } from 'lucide-react';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('geral');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  
  // User Profile & Google Login State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getStoredUser());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  
  // Real-time live GIFs state
  const [liveGifs, setLiveGifs] = useState<DisplayGif[]>([]);
  const [nextPos, setNextPos] = useState<string | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Router Location Listener
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 300);
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
    if (searchQuery.trim() || currentPath !== '/') return;

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

      setIsSearching(true);
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
      } finally {
        if (isMounted) setIsSearching(false);
      }
    };

    fetchCategoryGifs();

    return () => {
      isMounted = false;
    };
  }, [activeCategory, currentCategoryData, searchQuery, currentPath]);

  // 2. Real-Time Direct Search with Fast Debounce
  useEffect(() => {
    if (currentPath !== '/') return;

    const term = searchQuery.trim();
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!term) {
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
      setIsSearching(false);
      return;
    }

    setHasMore(true);
    setIsSearching(true);

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
        } else {
          setLiveGifs([]);
        }
      } catch {
        // Fallback
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, currentCategoryData, currentPath]);

  // Deduplicated Active GIFs strictly by URL and Tenor ID
  const displayGifs = useMemo(() => {
    const rawList = liveGifs.length > 0 ? liveGifs : (searchQuery.trim() ? [] : fallbackList);
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
  }, [liveGifs, fallbackList, searchQuery]);

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
        const existingIds = new Set(base.map(g => extractTenorGifId(g.url)).filter(Boolean));

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
          setNextPos(res.next || `${currentList.length + newItems.length}`);
        } else {
          // Nenhum item novo encontrado (chegou ao fim da busca)
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch {
      // Ignora erro silenciosamente durante scroll automático
    } finally {
      setIsLoadingMore(false);
    }
  };

  // ROUTER CONTROLLER
  if (
    currentPath === '/login' || 
    currentPath === '/login/' || 
    currentPath === '/auth/login' || 
    currentPath === '/auth/google' || 
    currentPath === '/auth/callback' || 
    currentPath === '/auth/redirect' ||
    currentPath === '/entrar'
  ) {
    return (
      <LoginPage 
        onNavigate={handleNavigate} 
        onShowToast={showToast} 
        onUserChange={setCurrentUser} 
      />
    );
  }

  if (currentPath === '/documentacao' || currentPath === '/docs') {
    return <DocumentationPage onNavigate={handleNavigate} onShowToast={showToast} />;
  }

  if (currentPath === '/api' || currentPath === '/api/') {
    return <ApiPortalPage onNavigate={handleNavigate} onShowToast={showToast} />;
  }

  if (currentPath !== '/' && currentPath !== '') {
    return (
      <>
        <GifDetailPage 
          slug={currentPath} 
          onNavigate={handleNavigate} 
          onShowToast={showToast} 
          onOpenAuth={() => setIsProfileModalOpen(true)}
        />
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onShowToast={showToast}
          onUserChange={setCurrentUser}
          onNavigate={handleNavigate}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e1621] text-[#f5f5f5] flex justify-center selection:bg-[#2481cc]/30">
      {/* Loading Splash Screen */}
      <AnimatePresence>
        {isAppLoading && <LoadingScreen isLoading={isAppLoading} />}
      </AnimatePresence>

      {/* Main App Container */}
      <div className="w-full max-w-md min-h-screen bg-[#0e1621] flex flex-col pb-8">
        
        {/* Top Header with Navigation Buttons & User Profile */}
        <header className="pt-5 pb-3 px-4 flex items-center justify-between border-b border-[#1c2733]/70 mb-1">
          <div className="cursor-pointer" onClick={() => handleNavigate('/')}>
            <h1 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-1.5">
              <Zap className="w-5 h-5 text-[#2aabee]" />
              <span>Kaise GIFs</span>
            </h1>
            <p className="text-[10px] text-[#8293a4] font-bold tracking-wide">
              kaise.space • API & Figurinhas em HD
            </p>
          </div>

          {/* Navigation & Profile Action Links */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleNavigate('/api')}
              className="py-2 px-2.5 rounded-2xl bg-[#1c2733] hover:bg-[#22303f] active:bg-[#161f2a] text-[#8293a4] hover:text-white transition-all text-xs font-bold flex items-center gap-1 border border-[#253241] cursor-pointer shadow-sm"
              title="Portal da API"
            >
              <Server className="w-3.5 h-3.5 text-[#2aabee]" />
              <span>API</span>
            </button>

            <button
              onClick={() => handleNavigate('/documentacao')}
              className="py-2 px-2.5 rounded-2xl bg-[#1c2733] hover:bg-[#22303f] text-[#8293a4] hover:text-white transition-all text-xs font-bold flex items-center gap-1 border border-[#253241] cursor-pointer"
              title="Documentação Completa"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Docs</span>
            </button>

            {/* Google Profile / Login Button */}
            {currentUser ? (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="py-1 px-2 rounded-2xl bg-[#1c2733] hover:bg-[#253241] border border-[#253241] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm group"
                title="Meu Perfil"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover border border-[#2aabee]"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#10b981] border border-[#0e1621]" />
                </div>
                <span className="hidden sm:inline text-xs font-bold text-white max-w-[70px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="py-2 px-2.5 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 transition-all text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-white/10 active:scale-95 cursor-pointer"
                title="Fazer Login com Google"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Login</span>
              </button>
            )}
          </div>
        </header>

        {/* Global Search Bar without counter */}
        <SearchBar
          query={searchQuery}
          onQueryChange={setSearchQuery}
          isSearching={isSearching}
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

        {/* GIF Gallery Grid */}
        <GifGallery
          gifs={displayGifs}
          activeCategoryName={searchQuery.trim() ? `Busca: "${searchQuery}"` : currentCategoryData.name}
          onShowToast={showToast}
          onNavigate={handleNavigate}
          onLoadMore={handleLoadMoreGifs}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
        />

        {/* Footer with Clean Tenor Attribution */}
        <footer className="mt-10 pt-4 pb-6 text-center text-[11px] text-[#708499] px-4 space-y-2 border-t border-[#1c2733]/60">
          <p className="font-bold text-white/80">Kaise Space Platform • 2026</p>
          <p className="text-[11px]">
            Agregador multi-provedor de GIFs e Figurinhas. Mídias fornecidas via{' '}
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
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={() => handleNavigate('/documentacao')}
              className="text-[10px] text-[#2481cc] hover:underline font-semibold cursor-pointer"
            >
              Documentação API
            </button>
            <span className="text-[#3a4856]">•</span>
            <button
              onClick={() => handleNavigate('/api')}
              className="text-[10px] text-[#2481cc] hover:underline font-semibold cursor-pointer"
            >
              Portal API
            </button>
          </div>
        </footer>

      </div>

      {/* Complete Documentation & API Modal */}
      <DocumentationModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
        onShowToast={showToast}
      />

      {/* Google User Profile Modal & Saved Favorites */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onShowToast={showToast}
        onUserChange={setCurrentUser}
        onNavigate={handleNavigate}
      />

      {/* Floating Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
}
