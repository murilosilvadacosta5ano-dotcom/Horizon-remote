import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Copy, 
  Check, 
  Share2, 
  Code2, 
  Sparkles, 
  ExternalLink,
  MessageCircle,
  ImageOff,
  Tag,
  Heart,
  User,
  ShieldCheck
} from 'lucide-react';
import { DisplayGif } from './GifGallery';
import { searchOnlineGifs } from '../services/gifSearch';
import { extractTenorGifId } from '../services/tenorScraper';
import { toggleFavorite, checkIsFavorite, getStoredUser } from '../services/authService';

interface GifDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
  onShowToast: (msg: string) => void;
  onOpenAuth?: () => void;
}

export const GifDetailPage: React.FC<GifDetailPageProps> = ({ slug, onNavigate, onShowToast, onOpenAuth }) => {
  const [gif, setGif] = useState<DisplayGif | null>(null);
  const [relatedGifs, setRelatedGifs] = useState<DisplayGif[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [sourceProvider, setSourceProvider] = useState<string>('tenor');
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // Clean slug
  const cleanSlug = decodeURIComponent(slug).replace(/^\/?(figurinha|gif)\//, '').replace(/^\//, '');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchGifDetails = async () => {
      try {
        // Attempt 1: Fetch from /api/v1/gifs/:id
        const directRes = await fetch(`/api/v1/gifs/${encodeURIComponent(cleanSlug)}`);
        if (directRes.ok) {
          const data = await directRes.json();
          if (data.success && data.gif) {
            if (isMounted) {
              setGif({
                id: data.gif.id,
                title: data.gif.title,
                url: data.gif.url,
                category: data.gif.category || 'Geral',
                tags: data.gif.tags || [cleanSlug]
              });
              setSourceProvider(data.gif.source?.provider || 'tenor');
            }
            fetchRelated(data.gif.category || cleanSlug);
            return;
          }
        }

        // Attempt 2: Search searchOnlineGifs using cleanSlug
        const searchRes = await searchOnlineGifs(cleanSlug.replace(/[-_]/g, ' '), undefined, 20);
        if (searchRes.results && searchRes.results.length > 0) {
          const first = searchRes.results[0];
          const gifUrl = first.media?.[0]?.gif?.url || first.url;
          if (isMounted) {
            setGif({
              id: first.id || cleanSlug,
              title: first.title || cleanSlug.replace(/[-_]/g, ' '),
              url: gifUrl,
              category: searchRes.categoryMatched || 'Geral',
              tags: first.tags || [cleanSlug]
            });
            setSourceProvider('tenor');
          }

          // Related
          const relatedList: DisplayGif[] = [];
          for (let i = 1; i < searchRes.results.length; i++) {
            const r = searchRes.results[i];
            const rUrl = r.media?.[0]?.gif?.url || r.url;
            relatedList.push({
              id: r.id || `rel-${i}`,
              title: r.title || `Figurinha #${i}`,
              url: rUrl,
              category: searchRes.categoryMatched || 'Geral',
              tags: r.tags || []
            });
          }
          if (isMounted) setRelatedGifs(relatedList);
        } else {
          // Fallback GIF
          if (isMounted) {
            setGif({
              id: cleanSlug,
              title: cleanSlug.replace(/[-_]/g, ' '),
              url: `https://media.tenor.com/${cleanSlug}/gif.gif`,
              category: 'Geral',
              tags: [cleanSlug]
            });
          }
        }
      } catch (err) {
        // Silent fallback
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchGifDetails();

    return () => { isMounted = false; };
  }, [cleanSlug]);

  const fetchRelated = async (categoryOrTag: string) => {
    try {
      const res = await searchOnlineGifs(categoryOrTag, undefined, 12);
      if (res.results) {
        const formatted: DisplayGif[] = res.results.map((r, i) => ({
          id: r.id || `rel-${i}`,
          title: r.title || `Figurinha #${i + 1}`,
          url: r.media?.[0]?.gif?.url || r.url,
          category: res.categoryMatched || 'Geral',
          tags: r.tags || []
        }));
        setRelatedGifs(formatted);
      }
    } catch {
      // Ignore
    }
  };

  const handleCopyText = (text: string, type: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    onShowToast(`${label} copiado!`);
    setTimeout(() => setCopiedType(null), 1500);
  };

  const handleDownload = async () => {
    if (!gif) return;
    setIsDownloading(true);
    onShowToast('Iniciando download...');
    try {
      const response = await fetch(gif.url, { mode: 'cors' });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${gif.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.gif`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      onShowToast('Download concluído!');
    } catch {
      window.open(gif.url, '_blank');
      onShowToast('GIF aberto no navegador!');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!gif) return;
    const text = encodeURIComponent(`Confira esta figurinha/GIF no Kaise Space: ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTelegram = () => {
    if (!gif) return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(gif.title);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const handleToggleFavorite = () => {
    if (!gif) return;
    const { isFavorite: newFavStatus } = toggleFavorite({
      id: gif.id,
      title: gif.title,
      url: gif.url,
      category: gif.category
    });
    setIsFavorite(newFavStatus);
    onShowToast(newFavStatus ? 'Figurinha salva nos seus favoritos! ❤️' : 'Figurinha removida dos favoritos.');
  };

  const currentUser = getStoredUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0e1621] text-[#f5f5f5] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-[#2aabee]">
          <Sparkles className="w-8 h-8 animate-spin" />
          <p className="text-xs font-bold text-white">Carregando Figurinha / GIF...</p>
        </div>
      </div>
    );
  }

  if (!gif) {
    return (
      <div className="min-h-screen bg-[#0e1621] text-[#f5f5f5] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm bg-[#1c2733] p-6 rounded-3xl border border-[#253241]">
          <ImageOff className="w-10 h-10 text-[#ef4444] mx-auto" />
          <h2 className="text-base font-bold text-white">Figurinha não encontrada</h2>
          <p className="text-xs text-[#8293a4]">Não conseguimos carregar os dados para "{cleanSlug}".</p>
          <button
            onClick={() => onNavigate('/')}
            className="py-2.5 px-4 rounded-xl bg-[#2481cc] text-white text-xs font-bold w-full cursor-pointer"
          >
            Voltar para a Galeria
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e1621] text-[#f5f5f5] flex justify-center selection:bg-[#2481cc]/30">
      <div className="w-full max-w-2xl min-h-screen bg-[#0e1621] flex flex-col p-4 sm:p-6 space-y-6">
        
        {/* Top Header */}
        <header className="flex items-center justify-between pb-4 border-b border-[#1c2733]">
          <button
            onClick={() => onNavigate('/')}
            className="py-2 px-3.5 rounded-xl bg-[#1c2733] hover:bg-[#2481cc] text-[#2aabee] hover:text-white transition-all text-xs font-bold flex items-center gap-2 border border-[#253241] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Galeria</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#2481cc]/15 text-[#2aabee] border border-[#2481cc]/30 font-extrabold text-xs uppercase">
              {gif.category}
            </span>

            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="py-1.5 px-3 rounded-xl bg-[#1c2733] hover:bg-[#253241] text-white text-xs font-bold flex items-center gap-1.5 border border-[#253241] cursor-pointer"
              >
                {currentUser ? (
                  <>
                    <img src={currentUser.avatar} alt="User" className="w-4 h-4 rounded-full object-cover" />
                    <span className="max-w-[70px] truncate">{currentUser.name}</span>
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 text-[#2aabee]" />
                    <span>Entrar</span>
                  </>
                )}
              </button>
            )}
          </div>
        </header>

        {/* Main GIF View Card */}
        <div className="bg-[#1c2733] rounded-3xl overflow-hidden border border-[#253241] shadow-2xl p-4 sm:p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {gif.title}
              </h1>
              <p className="text-[11px] text-[#8293a4] flex items-center gap-1.5 mt-1">
                <span>Provedor:</span>
                <span className="text-[#2aabee] font-bold uppercase">{sourceProvider}</span>
                <span>• HD Animated GIF</span>
              </p>
            </div>

            {/* Favorite button */}
            <button
              onClick={handleToggleFavorite}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                isFavorite
                  ? 'bg-[#ef4444]/20 border-[#ef4444]/50 text-[#ef4444] shadow-md shadow-[#ef4444]/20'
                  : 'bg-[#121922] border-[#253241] text-[#8293a4] hover:text-white hover:bg-[#22303f]'
              }`}
              title={isFavorite ? 'Remover dos Favoritos' : 'Salvar nos Favoritos'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#ef4444] text-[#ef4444]' : ''}`} />
              <span className="hidden sm:inline">{isFavorite ? 'Salvo' : 'Salvar'}</span>
            </button>
          </div>

          {/* Large Image Showcase */}
          <div className="relative w-full aspect-video bg-[#101720] rounded-2xl overflow-hidden flex items-center justify-center border border-[#253241]/60">
            <img
              src={gif.url}
              alt={gif.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Direct URL Box */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#708499] uppercase">Link Direto da Mídia (.gif)</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={gif.url}
                className="w-full px-3 py-2 bg-[#121922] rounded-xl font-mono text-xs text-[#2aabee] border border-[#253241] focus:outline-none select-all"
              />
              <button
                onClick={() => handleCopyText(gif.url, 'url', 'Link direto')}
                className="p-2.5 rounded-xl bg-[#2481cc] hover:bg-[#1f70b2] text-white flex-shrink-0 cursor-pointer"
              >
                {copiedType === 'url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="py-3 px-3 rounded-2xl bg-[#2481cc] hover:bg-[#1f70b2] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#2481cc]/20 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Baixando...' : 'Baixar GIF'}</span>
            </button>

            <button
              onClick={() => handleCopyText(`![${gif.title}](${gif.url})`, 'markdown', 'Markdown')}
              className="py-3 px-3 rounded-2xl bg-[#16202c] hover:bg-[#22303f] text-white font-bold text-xs flex items-center justify-center gap-2 border border-[#253241] cursor-pointer"
            >
              <Code2 className="w-4 h-4 text-[#2aabee]" />
              <span>Markdown</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="py-3 px-3 rounded-2xl bg-[#25d366]/20 hover:bg-[#25d366]/30 text-[#25d366] font-bold text-xs flex items-center justify-center gap-2 border border-[#25d366]/30 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleShareTelegram}
              className="py-3 px-3 rounded-2xl bg-[#0088cc]/20 hover:bg-[#0088cc]/30 text-[#0088cc] font-bold text-xs flex items-center justify-center gap-2 border border-[#0088cc]/30 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Telegram</span>
            </button>
          </div>

          {/* Tags */}
          {gif.tags && gif.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#253241]/60">
              <Tag className="w-3.5 h-3.5 text-[#708499]" />
              {gif.tags.map((tag, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate(`/${encodeURIComponent(tag)}`)}
                  className="px-2.5 py-1 rounded-lg bg-[#121922] hover:bg-[#2481cc]/20 text-[#8293a4] hover:text-[#2aabee] text-[10px] font-bold transition-colors cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Related Stickers & GIFs Grid */}
        {relatedGifs.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Figurinhas & GIFs Relacionados
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {relatedGifs.slice(0, 6).map((rel, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigate(`/${extractTenorGifId(rel.url) || encodeURIComponent(rel.title)}`)}
                  className="bg-[#1c2733] rounded-2xl overflow-hidden border border-[#253241] hover:border-[#2481cc] transition-all cursor-pointer group p-2 space-y-1.5"
                >
                  <div className="aspect-video w-full bg-[#101720] rounded-xl overflow-hidden">
                    <img
                      src={rel.url}
                      alt={rel.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-white truncate px-1">{rel.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="pt-4 text-center text-[11px] text-[#708499]">
          <p>Kaise Space • Figurinhas Animadas & GIFs em HD</p>
        </footer>

      </div>
    </div>
  );
};
