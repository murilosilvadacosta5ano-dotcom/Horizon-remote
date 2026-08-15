import React, { useState } from 'react';
import { 
  Link2,
  Key, 
  Search, 
  Send, 
  Copy, 
  Bot,
  Loader2,
  RefreshCw,
  Sparkles,
  Check,
  Code2
} from 'lucide-react';
import { getRandomGif, ANIME_GIFS_DATABASE } from '../data/animeGifs';

interface BotApiSectionProps {
  onShowToast: (msg: string) => void;
}

const UNIVERSAL_API_KEY = 'raphaelsboting';

function getTenorSlug(query: string): string {
  const clean = query
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  return clean.endsWith("-gifs") ? clean : `${clean}-gifs`;
}

export const BotApiSection: React.FC<BotApiSectionProps> = ({ onShowToast }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentOrigin, setCurrentOrigin] = useState<string>('');
  const [cachedPool, setCachedPool] = useState<string[]>([]);
  const [poolIndex, setPoolIndex] = useState<number>(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'python' | 'node'>('curl');
  
  const [apiResult, setApiResult] = useState<{
    query: string;
    gif_url: string;
    tenor_search_url: string;
  } | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentOrigin(window.location.origin);
    }
  }, []);

  const detectedDomain = currentOrigin || (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost') ? window.location.origin : 'https://kaise.space');
  const currentQueryTerm = searchQuery.trim() || 'anime abraço';
  const encodedQuery = encodeURIComponent(currentQueryTerm);
  const directApiLink = `${detectedDomain}/api/gifs?key=${UNIVERSAL_API_KEY}&search=${encodedQuery}`;

  const handleCopy = (text: string, fieldName: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    onShowToast(`${label} copiado!`);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const getCodeSnippet = () => {
    switch (activeCodeTab) {
      case 'curl':
        return `curl -X GET "${directApiLink}"`;
      case 'python':
        return `# Python (Telegram Bot ou Discord.py)
import requests

url = "${detectedDomain}/api/gifs"
params = {"key": "${UNIVERSAL_API_KEY}", "search": "${currentQueryTerm}"}

res = requests.get(url, params=params).json()
gif_url = res["gif_url"] # Link direto do GIF`;
      case 'node':
        return `// Node.js (Discord.js ou Telegram Bot)
const res = await fetch("${detectedDomain}/api/gifs?key=${UNIVERSAL_API_KEY}&search=${encodedQuery}");
const data = await res.json();
const gifUrl = data.gif_url; // Link direto do GIF`;
    }
  };

  const handleFetchGif = async () => {
    if (!searchQuery.trim()) {
      onShowToast('Digite o nome da pesquisa');
      return;
    }

    setIsLoading(true);
    const term = searchQuery.trim();
    const slug = getTenorSlug(term);
    const tenorSearchUrl = `https://tenor.com/pt-BR/search/${encodeURIComponent(slug)}`;

    try {
      const apiUrl = `/api/gifs?key=${UNIVERSAL_API_KEY}&search=${encodeURIComponent(term)}`;
      const res = await fetch(apiUrl);
      
      if (!res.ok) throw new Error('Erro na requisição');
      const data = await res.json();

      setApiResult({
        query: data.query || term,
        gif_url: data.gif_url,
        tenor_search_url: data.tenor_search_url || tenorSearchUrl
      });

      const local = getRandomGif(term);
      const list = ANIME_GIFS_DATABASE[local.category] || [data.gif_url];
      setCachedPool(list);
      setPoolIndex(0);

      onShowToast(`GIF de "${term}" puxado com sucesso!`);
    } catch {
      const fallback = getRandomGif(term);
      const pool = ANIME_GIFS_DATABASE[fallback.category] || [fallback.url];
      setCachedPool(pool);
      setPoolIndex(0);

      setApiResult({
        query: term,
        gif_url: fallback.url,
        tenor_search_url: tenorSearchUrl
      });
      onShowToast(`GIF de "${term}" pronto!`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextGif = async () => {
    if (!apiResult) return;

    if (cachedPool.length > 1) {
      const nextIdx = (poolIndex + 1) % cachedPool.length;
      setPoolIndex(nextIdx);
      setApiResult(prev => prev ? {
        ...prev,
        gif_url: cachedPool[nextIdx]
      } : null);
      onShowToast('Outro GIF puxado!');
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = `/api/gifs?key=${UNIVERSAL_API_KEY}&search=${encodeURIComponent(apiResult.query)}`;
      const res = await fetch(apiUrl);
      if (res.ok) {
        const data = await res.json();
        setApiResult(prev => prev ? { ...prev, gif_url: data.gif_url } : null);
        onShowToast('Outro GIF puxado!');
      }
    } catch {
      // no-op
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 mt-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Bot className="w-4 h-4 text-[#2aabee]" />
          <h2 className="text-xs font-semibold text-[#8293a4] uppercase tracking-wider">
            Puxar GIF (API)
          </h2>
        </div>
        <span className="text-[10px] text-[#34c759] font-medium bg-[#34c759]/10 px-2 py-0.5 rounded-full">
          Pronto para Bot
        </span>
      </div>

      {/* Main Clean Card */}
      <div className="bg-[#1c2733] rounded-2xl p-4 space-y-3.5">
        
        {/* 1. LINK */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#8293a4] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-[#2aabee]" />
              <span>Link</span>
            </span>
            <span className="text-[10px] text-[#708499]">URL do Endpoint</span>
          </label>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={directApiLink}
              className="w-full px-3 py-2.5 bg-[#161f2a] rounded-xl text-xs font-mono text-[#2aabee] border-0 select-all focus:outline-none"
            />
            <button
              onClick={() => handleCopy(directApiLink, 'link', 'Link')}
              className="p-2.5 rounded-xl bg-[#2481cc] active:bg-[#1f70b2] text-white flex-shrink-0 transition-colors"
              title="Copiar Link"
            >
              {copiedField === 'link' ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* 2. KEY */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#8293a4] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#2aabee]" />
              <span>Key</span>
            </span>
            <span className="text-[10px] text-[#708499]">Chave de Acesso</span>
          </label>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={UNIVERSAL_API_KEY}
              className="w-full px-3 py-2.5 bg-[#161f2a] rounded-xl text-xs font-mono text-[#2aabee] font-semibold border-0 select-all focus:outline-none"
            />
            <button
              onClick={() => handleCopy(UNIVERSAL_API_KEY, 'key', 'Key')}
              className="p-2.5 rounded-xl bg-[#2481cc] active:bg-[#1f70b2] text-white flex-shrink-0 transition-colors"
              title="Copiar Key"
            >
              {copiedField === 'key' ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* 3. NOME DE PESQUISAR */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#8293a4] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-[#2aabee]" />
              <span>Nome de pesquisar</span>
            </span>
            <span className="text-[10px] text-[#708499]">Termo / Ação</span>
          </label>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFetchGif();
              }}
              placeholder="Digite o que pesquisar (ex: abraço, kiss, soco)..."
              className="w-full px-3 py-2.5 bg-[#161f2a] rounded-xl text-xs text-white placeholder-[#708499] focus:outline-none focus:bg-[#1f2b3a] border-0 transition-colors"
            />

            <button
              onClick={handleFetchGif}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-[#2481cc] active:bg-[#1f70b2] text-white text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{isLoading ? 'Puxando...' : 'Puxar'}</span>
            </button>
          </div>
        </div>

        {/* RESULTADO DO GIF */}
        {apiResult && (
          <div className="pt-2 space-y-2.5 border-t border-[#253241]/60 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8293a4] flex items-center gap-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 text-[#2aabee]" />
                <span className="truncate">GIF de: <strong className="text-white">{apiResult.query}</strong></span>
              </span>
              <button
                onClick={() => handleCopy(apiResult.tenor_search_url, 'tenor', 'Link da busca')}
                className="text-[11px] text-[#2aabee] hover:underline flex items-center gap-1"
              >
                <span>Ver busca</span>
              </button>
            </div>

            {/* Imagem do GIF */}
            <div className="relative w-full h-48 rounded-xl overflow-hidden bg-[#101720]">
              <img
                key={apiResult.gif_url}
                src={apiResult.gif_url}
                alt={`GIF de ${apiResult.query}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            {/* Botões de Ação Direta */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleNextGif}
                disabled={isLoading}
                className="flex-1 py-2 px-3 rounded-xl bg-[#2481cc] active:bg-[#1f70b2] text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Puxar outro</span>
              </button>

              <button
                onClick={() => handleCopy(apiResult.gif_url, 'gif', 'Link direto do GIF')}
                className="py-2 px-3 rounded-xl bg-[#161f2a] active:bg-[#1f2b3a] text-white text-xs font-medium flex items-center justify-center gap-1.5 border border-[#253241]/70"
              >
                {copiedField === 'gif' ? (
                  <Check className="w-3.5 h-3.5 text-[#34c759]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#2aabee]" />
                )}
                <span>Copiar GIF</span>
              </button>
            </div>
          </div>
        )}

        {/* CÓDIGO DIRETO E RÁPIDO PARA BOT (CURL / PYTHON / NODEJS) */}
        <div className="pt-2 border-t border-[#253241]/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8293a4] flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-[#2aabee]" />
              <span>Código rápido:</span>
            </span>

            {/* Tabs para trocar entre cURL, Python e Node.js */}
            <div className="flex items-center gap-1 bg-[#101720] p-0.5 rounded-lg">
              <button
                onClick={() => setActiveCodeTab('curl')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  activeCodeTab === 'curl' ? 'bg-[#2481cc] text-white' : 'text-[#8293a4]'
                }`}
              >
                cURL
              </button>
              <button
                onClick={() => setActiveCodeTab('python')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  activeCodeTab === 'python' ? 'bg-[#2481cc] text-white' : 'text-[#8293a4]'
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setActiveCodeTab('node')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  activeCodeTab === 'node' ? 'bg-[#2481cc] text-white' : 'text-[#8293a4]'
                }`}
              >
                Node.js
              </button>
            </div>
          </div>

          {/* Snippet box */}
          <div className="relative bg-[#101720] rounded-xl p-3 font-mono text-[10px] text-[#cbd5e1] overflow-x-auto">
            <button
              onClick={() => handleCopy(getCodeSnippet(), 'code', 'Código')}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#1c2733] text-[#8293a4] hover:text-white transition-colors"
              title="Copiar código"
            >
              {copiedField === 'code' ? (
                <Check className="w-3.5 h-3.5 text-[#34c759]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            <pre className="whitespace-pre pr-8 select-all">{getCodeSnippet()}</pre>
          </div>
        </div>

      </div>
    </div>
  );
};
