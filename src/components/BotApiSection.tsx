import React, { useState } from 'react';
import { 
  Link2,
  Key, 
  Search, 
  Send, 
  Copy, 
  Loader2,
  RefreshCw,
  Sparkles,
  Check,
  Code2,
  Terminal
} from 'lucide-react';
import { searchOnlineGifs } from '../services/gifSearch';

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
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'python' | 'node' | 'tenor_v1'>('curl');
  
  const [apiResult, setApiResult] = useState<{
    query: string;
    gif_url: string;
    tenor_search_url: string;
    total_found: number;
    results_count: number;
  } | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentOrigin(window.location.origin);
    }
  }, []);

  const detectedDomain = currentOrigin || (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost') ? window.location.origin : 'https://kaise.space');
  const currentQueryTerm = searchQuery.trim() || 'anime abraço';
  const encodedQuery = encodeURIComponent(currentQueryTerm);
  const directApiLink = `${detectedDomain}/api/gifs?key=${UNIVERSAL_API_KEY}&search=${encodedQuery}&limit=20`;
  const tenorV1ApiLink = `${detectedDomain}/v1/search?q=${encodedQuery}&limit=20`;

  const handleCopy = (text: string, fieldName: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    onShowToast(`${label} copiado!`);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const getCodeSnippet = () => {
    switch (activeCodeTab) {
      case 'curl':
        return `# cURL simples para Bots
curl -X GET "${directApiLink}"`;
      case 'python':
        return `# Python (Telegram Bot ou Discord.py)
import requests

url = "${detectedDomain}/api/gifs"
params = {
    "key": "${UNIVERSAL_API_KEY}",
    "search": "${currentQueryTerm}",
    "limit": 20
}

response = requests.get(url, params=params).json()
gif_url = response["gif_url"]  # Link direto do GIF do Tenor
all_results = response["results"]  # Formato completo Tenor v1`;
      case 'node':
        return `// Node.js (Discord.js ou Telegram Bot)
const res = await fetch("${directApiLink}");
const data = await res.json();

const gifUrl = data.gif_url; // Link direto do GIF
const tenorResults = data.results; // Array no formato do Tenor API`;
      case 'tenor_v1':
        return `// Endpoint 100% compatível com Tenor v1 API
// Substitua "https://g.tenor.com/v1/search" por:
GET "${tenorV1ApiLink}"

// Retorno JSON idêntico ao Tenor v1:
{
  "results": [
    {
      "id": "123456",
      "title": "${currentQueryTerm}",
      "media": [
        {
          "gif": { "url": "https://media.tenor.com/...", "dims": [498, 278] },
          "tinygif": { "url": "https://media.tenor.com/...", "dims": [220, 122] },
          "mp4": { "url": "https://media.tenor.com/..." }
        }
      ]
    }
  ],
  "next": "20"
}`;
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
      const result = await searchOnlineGifs(term, undefined, 25);

      setApiResult({
        query: term,
        gif_url: result.gifUrl,
        tenor_search_url: result.tenorSearchUrl || tenorSearchUrl,
        total_found: result.totalFound,
        results_count: result.results?.length || result.allGifs.length,
      });

      setCachedPool(result.allGifs);
      setPoolIndex(0);

      onShowToast(`GIFs de "${term}" puxados do Tenor!`);
    } catch {
      onShowToast(`Erro ao carregar GIF do Tenor`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextGif = () => {
    if (!apiResult || cachedPool.length === 0) return;

    const nextIdx = (poolIndex + 1) % cachedPool.length;
    setPoolIndex(nextIdx);
    setApiResult(prev => prev ? {
      ...prev,
      gif_url: cachedPool[nextIdx]
    } : null);
    onShowToast('Outro GIF do Tenor carregado!');
  };

  return (
    <div className="px-4 mt-6 space-y-3">
      {/* Header with strong letters and no robot icon */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-black text-[#8293a4] uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#2aabee]" />
          <span>API Tenor para Devs</span>
        </h2>
        <span className="text-[10px] font-bold text-[#34c759] bg-[#162a1c] px-2 py-0.5 rounded-md">
          Tenor v1 Engine
        </span>
      </div>

      {/* Main Solid Container */}
      <div className="bg-[#1c2733] rounded-2xl p-4 space-y-3.5 border border-[#253241]/70">
        
        {/* 1. LINK */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#8293a4] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-[#2aabee]" />
              <span>Link do Endpoint</span>
            </span>
            <span className="text-[10px] font-semibold text-[#708499]">API Tenor Gateway</span>
          </label>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={directApiLink}
              className="w-full px-3 py-2.5 bg-[#161f2a] rounded-xl text-xs font-mono text-[#2aabee] font-medium border-0 select-all focus:outline-none"
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
          <label className="text-xs font-bold text-[#8293a4] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#2aabee]" />
              <span>Key</span>
            </span>
            <span className="text-[10px] font-semibold text-[#708499]">Chave de Acesso</span>
          </label>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={UNIVERSAL_API_KEY}
              className="w-full px-3 py-2.5 bg-[#161f2a] rounded-xl text-xs font-mono text-[#2aabee] font-bold border-0 select-all focus:outline-none"
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
          <label className="text-xs font-bold text-[#8293a4] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-[#2aabee]" />
              <span>Nome de pesquisar</span>
            </span>
            <span className="text-[10px] font-semibold text-[#708499]">Busca no Tenor</span>
          </label>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFetchGif();
              }}
              placeholder="Digite o que pesquisar no Tenor (ex: naruto, abraço, minecraft)..."
              className="w-full px-3 py-2.5 bg-[#161f2a] rounded-xl text-xs font-medium text-white placeholder-[#708499] focus:outline-none focus:bg-[#1f2b3a] border-0 transition-colors"
            />

            <button
              onClick={handleFetchGif}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-[#2481cc] active:bg-[#1f70b2] text-white text-xs font-bold flex items-center gap-1.5 flex-shrink-0 transition-colors disabled:opacity-50"
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

        {/* RESULTADO DO GIF PUXADO */}
        {apiResult && (
          <div className="pt-2 space-y-2.5 border-t border-[#253241]/60 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8293a4] flex items-center gap-1.5 truncate">
                <span className="truncate">GIF Tenor: <strong className="text-white">{apiResult.query}</strong></span>
              </span>
              <button
                onClick={() => handleCopy(apiResult.tenor_search_url, 'tenor', 'Link da busca Tenor')}
                className="text-[11px] font-bold text-[#2aabee] hover:underline flex items-center gap-1"
              >
                <span>Ver no Tenor</span>
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
                className="flex-1 py-2 px-3 rounded-xl bg-[#2481cc] active:bg-[#1f70b2] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Puxar outro do Tenor</span>
              </button>

              <button
                onClick={() => handleCopy(apiResult.gif_url, 'gif', 'Link direto do GIF')}
                className="py-2 px-3 rounded-xl bg-[#161f2a] active:bg-[#1f2b3a] text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-[#253241]/70"
              >
                {copiedField === 'gif' ? (
                  <Check className="w-3.5 h-3.5 text-[#34c759]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#2aabee]" />
                )}
                <span>Copiar Link</span>
              </button>
            </div>
          </div>
        )}

        {/* CÓDIGOS PARA DEVS & BOTS (CURL / PYTHON / NODEJS / TENOR V1) */}
        <div className="pt-2 border-t border-[#253241]/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8293a4] flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-[#2aabee]" />
              <span>Para Desenvolvedores:</span>
            </span>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-[#101720] p-0.5 rounded-lg">
              <button
                onClick={() => setActiveCodeTab('curl')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  activeCodeTab === 'curl' ? 'bg-[#2481cc] text-white' : 'text-[#8293a4]'
                }`}
              >
                cURL
              </button>
              <button
                onClick={() => setActiveCodeTab('python')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  activeCodeTab === 'python' ? 'bg-[#2481cc] text-white' : 'text-[#8293a4]'
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setActiveCodeTab('node')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  activeCodeTab === 'node' ? 'bg-[#2481cc] text-white' : 'text-[#8293a4]'
                }`}
              >
                Node.js
              </button>
              <button
                onClick={() => setActiveCodeTab('tenor_v1')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  activeCodeTab === 'tenor_v1' ? 'bg-[#2481cc] text-white' : 'text-[#8293a4]'
                }`}
              >
                Tenor v1
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
            <pre className="whitespace-pre pr-8 select-all leading-relaxed">{getCodeSnippet()}</pre>
          </div>
        </div>

      </div>
    </div>
  );
};
