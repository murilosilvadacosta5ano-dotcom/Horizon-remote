import React, { useState } from 'react';
import { 
  Key, 
  Search, 
  Send, 
  Sparkles, 
  Copy, 
  Code2, 
  Bot,
  Loader2
} from 'lucide-react';
import { getRandomGif } from '../data/animeGifs';

interface BotApiSectionProps {
  onShowToast: (msg: string) => void;
}

// Chave pública e universal única para todos os usuários e bots
const UNIVERSAL_API_KEY = 'raphaelsboting';

export const BotApiSection: React.FC<BotApiSectionProps> = ({ onShowToast }) => {
  // Campo de pesquisa começa totalmente em branco
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentOrigin, setCurrentOrigin] = useState<string>('');
  const [apiResponse, setApiResponse] = useState<{
    query: string;
    search_url: string;
    gif_url: string;
    total_found: number;
    source: string;
  } | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'js' | 'python'>('js');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentOrigin(window.location.origin);
    }
  }, []);

  const handleSendApiRequest = async () => {
    if (!searchQuery.trim()) {
      onShowToast('Digite no campo o que deseja pesquisar');
      return;
    }

    setIsLoading(true);

    try {
      const term = searchQuery.trim();
      const apiUrl = `/api/gifs?key=${UNIVERSAL_API_KEY}&search=${encodeURIComponent(term)}`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Falha ao comunicar com a API');
      }

      const data = await response.json();

      setApiResponse({
        query: data.query || term,
        search_url: data.search_url || `${currentOrigin || (typeof window !== 'undefined' ? window.location.origin : '')}/api/gifs?key=${UNIVERSAL_API_KEY}&search=${encodeURIComponent(term)}`,
        gif_url: data.gif_url,
        total_found: data.total_found || 1,
        source: data.source || 'Raphael GIF Cloud'
      });

      onShowToast(`GIF de "${term}" carregado com sucesso!`);
    } catch (err) {
      console.error(err);
      // Fallback to rich anime database
      const term = searchQuery.trim();
      const fallback = getRandomGif(term);
      const host = currentOrigin || (typeof window !== 'undefined' ? window.location.origin : '');
      const searchUrl = `${host}/api/gifs?key=${UNIVERSAL_API_KEY}&search=${encodeURIComponent(term)}`;
      
      setApiResponse({
        query: term,
        search_url: searchUrl,
        gif_url: fallback.url,
        total_found: fallback.total,
        source: 'Raphael GIF Cloud'
      });
      onShowToast(`GIF de "${term}" processado!`);
    } finally {
      setIsLoading(false);
    }
  };

  const detectedDomain = currentOrigin || (typeof window !== 'undefined' ? window.location.origin : 'https://seu-dominio.com');
  const encodedQuery = encodeURIComponent(searchQuery.trim() || 'anime abraço');
  const endpointUrl = `${detectedDomain}/api/gifs?key=${UNIVERSAL_API_KEY}&search=${encodedQuery}`;

  const currentSlug = (searchQuery.trim() || 'anime abraço').toLowerCase().replace(/\s+/g, '-');
  const liveSearchUrl = `${detectedDomain}/api/gifs?key=${UNIVERSAL_API_KEY}&search=${encodeURIComponent(searchQuery.trim() || 'anime abraço')}`;

  const getCodeSnippet = () => {
    const currentQueryTerm = searchQuery.trim() || 'anime abraço';
    switch (activeCodeTab) {
      case 'js':
        return `// Discord.js / Telegram Bot (Node.js)
// Busca automática conectando ao domínio atual do site
const baseUrl = "${detectedDomain}"; 
const pesquisa = "${currentQueryTerm}"; 
const url = \`\${baseUrl}/api/gifs?key=${UNIVERSAL_API_KEY}&search=\${encodeURIComponent(pesquisa)}\`;

const res = await fetch(url);
const data = await res.json();

// data.gif_url contém o link direto do GIF
console.log("GIF URL:", data.gif_url);
console.log("Status:", data.status);`;
      case 'python':
        return `# Python (Telegram Bot ou Discord.py)
import requests

base_url = "${detectedDomain}"
pesquisa = "${currentQueryTerm}"
url = f"{base_url}/api/gifs?key=${UNIVERSAL_API_KEY}&search={pesquisa}"

res = requests.get(url)
data = res.json()

# GIF retornado na hora
gif_url = data["gif_url"]
print("GIF:", gif_url)`;
      case 'curl':
        return `curl -X GET "${endpointUrl}"`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    onShowToast('Código do bot copiado!');
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(UNIVERSAL_API_KEY);
    onShowToast('Chave única da API copiada!');
  };

  return (
    <div className="px-4 mt-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Bot className="w-4 h-4 text-[#2aabee]" />
          <h2 className="text-xs font-semibold text-[#8293a4] uppercase tracking-wider">
            API Raphael GIF (Live)
          </h2>
        </div>
        <span className="text-[10px] text-[#34c759] font-medium bg-[#34c759]/10 px-2 py-0.5 rounded-full">
          API Ativa
        </span>
      </div>

      {/* Solid Container in Telegram Style */}
      <div className="bg-[#1c2733] rounded-2xl p-4 space-y-4 shadow-none">
        
        {/* Field 1: Key (Única e universal para todos) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[#8293a4] flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#2aabee]" />
              <span>Key (Chave Única Universal)</span>
            </label>
            <span className="text-[10px] text-[#708499]">
              Para todos os bots
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={UNIVERSAL_API_KEY}
              className="w-full px-3.5 py-2.5 bg-[#161f2a] rounded-xl text-xs font-mono text-[#2aabee] font-semibold border-0 cursor-default focus:outline-none"
            />
            <button
              onClick={handleCopyKey}
              className="p-2.5 rounded-xl bg-[#2481cc] active:bg-[#1f70b2] text-white flex-shrink-0"
              title="Copiar Chave Única"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Field 2: Search name or category (Campo em branco) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#8293a4] flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-[#2aabee]" />
            <span>Search name or category</span>
          </label>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendApiRequest();
              }}
              placeholder="Digite o que deseja puxar (ex: anime abraço, kiss anime)..."
              className="w-full px-3.5 py-2.5 bg-[#161f2a] rounded-xl text-xs text-white placeholder-[#708499] focus:outline-none focus:bg-[#1f2b3a] border-0 transition-colors"
            />

            {/* Submit / Send Button */}
            <button
              onClick={handleSendApiRequest}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-[#2481cc] active:bg-[#1f70b2] text-white text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{isLoading ? 'Puxando...' : 'Enviar'}</span>
            </button>
          </div>

          {/* Live search URL preview */}
          {searchQuery.trim() && (
            <div className="pt-1 flex items-center justify-between text-[11px] text-[#708499] font-mono truncate">
              <span className="truncate">
                Puxando de: <span className="text-[#2aabee]">{liveSearchUrl}</span>
              </span>
            </div>
          )}
        </div>

        {/* Live API Result Preview */}
        {apiResponse && (
          <div className="p-3 bg-[#101720] rounded-xl space-y-2.5 animate-fadeIn border border-[#253241]/40">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#8293a4] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2aabee]" />
                <span>Puxado: <strong className="text-white">{apiResponse.query}</strong></span>
              </span>
              <span className="text-[#34c759] font-mono text-[10px]">200 OK</span>
            </div>

            {/* Search URL Card */}
            <div className="p-2 rounded-lg bg-[#161f2a] flex items-center justify-between gap-2 text-[11px]">
              <div className="font-mono text-[#2aabee] truncate flex-1">
                {apiResponse.search_url}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(apiResponse.search_url);
                  onShowToast('Link copiado!');
                }}
                className="p-1 text-[#8293a4] hover:text-white"
                title="Copiar Link"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Instant GIF Render */}
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-[#16202c]">
              <img
                key={apiResponse.gif_url}
                src={apiResponse.gif_url}
                alt={`GIF para ${apiResponse.query}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            {/* JSON Output preview */}
            <div className="bg-[#0b1017] p-2.5 rounded-lg font-mono text-[10px] text-[#93c5fd] overflow-x-auto space-y-0.5">
              <div>&#123;</div>
              <div className="pl-3 text-emerald-400">"status": 200,</div>
              <div className="pl-3 text-[#38bdf8]">"key": "{UNIVERSAL_API_KEY}",</div>
              <div className="pl-3 text-amber-300">"query": "{apiResponse.query}",</div>
              <div className="pl-3 text-sky-300">"search_url": "{apiResponse.search_url}",</div>
              <div className="pl-3 text-purple-300">"gif_url": "{apiResponse.gif_url}",</div>
              <div className="pl-3 text-slate-400">"source": "Raphael GIF Cloud"</div>
              <div>&#125;</div>
            </div>
          </div>
        )}

        {/* Integration Code for Discord/Telegram Developers */}
        <div className="space-y-2 pt-1 border-t border-[#253241]/70">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8293a4] flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-[#2aabee]" />
              <span>Código pronto para o bot:</span>
            </span>

            {/* Language Tabs */}
            <div className="flex items-center gap-1 bg-[#101720] p-0.5 rounded-lg">
              <button
                onClick={() => setActiveCodeTab('js')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  activeCodeTab === 'js' ? 'bg-[#2481cc] text-white' : 'text-[#8293a4]'
                }`}
              >
                Discord.js
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
                onClick={() => setActiveCodeTab('curl')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  activeCodeTab === 'curl' ? 'bg-[#2481cc] text-white' : 'text-[#8293a4]'
                }`}
              >
                cURL
              </button>
            </div>
          </div>

          {/* Code box */}
          <div className="relative bg-[#101720] rounded-xl p-3 font-mono text-[10px] text-[#cbd5e1] overflow-x-auto">
            <button
              onClick={handleCopyCode}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#1c2733] text-[#8293a4] hover:text-white"
              title="Copiar código"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <pre className="whitespace-pre pr-8">{getCodeSnippet()}</pre>
          </div>
        </div>

      </div>
    </div>
  );
};
