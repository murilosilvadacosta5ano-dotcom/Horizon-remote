import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Terminal, 
  Check, 
  Copy, 
  Play, 
  BookOpen, 
  ShieldCheck, 
  ExternalLink,
  Code2,
  Zap,
  Globe,
  Layers,
  Cpu
} from 'lucide-react';

interface DocumentationPageProps {
  onNavigate: (path: string) => void;
  onShowToast: (msg: string) => void;
}

export const DocumentationPage: React.FC<DocumentationPageProps> = ({ onNavigate, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'endpoints' | 'examples' | 'ratelimit'>('quickstart');
  const [activeLang, setActiveLang] = useState<'js' | 'python' | 'curl' | 'php'>('js');
  const [testEndpoint, setTestEndpoint] = useState<string>('/api/v1/search?q=naruto&limit=3');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const domain = typeof window !== 'undefined' ? window.location.origin : 'https://kaise.space';

  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    onShowToast(`${label} copiado!`);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleRunTest = async (endpoint: string) => {
    setIsLoading(true);
    setTestResponse(null);
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));
      onShowToast('Requisição executada com sucesso!');
    } catch (err: any) {
      setTestResponse(JSON.stringify({ error: err.message || 'Falha na requisição' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1621] text-[#f5f5f5] flex justify-center selection:bg-[#2481cc]/30">
      <div className="w-full max-w-2xl min-h-screen bg-[#0e1621] flex flex-col p-4 sm:p-6 space-y-6">
        
        {/* Top Header Bar */}
        <header className="flex items-center justify-between pb-4 border-b border-[#1c2733]">
          <button
            onClick={() => onNavigate('/')}
            className="py-2 px-3.5 rounded-xl bg-[#1c2733] hover:bg-[#2481cc] text-[#2aabee] hover:text-white transition-all text-xs font-bold flex items-center gap-2 border border-[#253241] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Galeria</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('/api')}
              className="py-2 px-3 rounded-xl bg-[#1c2733] hover:bg-[#22303f] text-[#8293a4] hover:text-white transition-colors text-xs font-bold border border-[#253241] cursor-pointer"
            >
              Status API
            </button>
            <span className="px-2.5 py-1 rounded-full bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 font-mono font-bold text-[10px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              v1.0 Online
            </span>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#16222f] to-[#111923] p-5 sm:p-6 rounded-3xl border border-[#253241] shadow-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2481cc]/15 text-[#2aabee] text-xs font-extrabold border border-[#2481cc]/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Documentação Oficial Kaise Space</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
            Kaise GIF & Sticker API v1
          </h1>
          <p className="text-xs text-[#8293a4] leading-relaxed">
            API pública e de alta velocidade para buscar e entregar GIFs e Figurinhas animadas em HD para Bots do Discord, Telegram, WhatsApp e aplicações Web.
          </p>
        </section>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-[#1c2733]">
          {[
            { id: 'quickstart', label: 'Início Rápido', icon: Zap },
            { id: 'endpoints', label: 'Endpoints v1', icon: Layers },
            { id: 'examples', label: 'Exemplos de Código', icon: Code2 },
            { id: 'ratelimit', label: 'Rate Limits & Regras', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#2481cc] text-white shadow-md shadow-[#2481cc]/25'
                    : 'bg-[#1c2733] text-[#8293a4] hover:text-white hover:bg-[#22303f] border border-[#253241]/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* TAB 1: QUICKSTART */}
        {activeTab === 'quickstart' && (
          <div className="space-y-4">
            <div className="bg-[#1c2733] p-4 rounded-2xl border border-[#253241] space-y-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#2aabee]" />
                <span>Base URL da API</span>
              </h3>
              <div className="flex items-center gap-2 bg-[#121922] p-2.5 rounded-xl font-mono text-xs text-[#2aabee] border border-[#253241]">
                <span className="flex-1 truncate">{domain}/api/v1</span>
                <button
                  onClick={() => handleCopy(`${domain}/api/v1`, 'baseurl', 'Base URL')}
                  className="p-1.5 rounded-lg bg-[#2481cc] hover:bg-[#1f70b2] text-white transition-colors cursor-pointer"
                >
                  {copiedKey === 'baseurl' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[11px] text-[#8293a4]">
                A API não exige chave de autenticação privada por padrão. Toda requisição retorna resultados normalizados e informativos sobre a fonte do conteúdo.
              </p>
            </div>

            {/* Response Standard Structure */}
            <div className="bg-[#1c2733] p-4 rounded-2xl border border-[#253241] space-y-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#10b981]" />
                <span>Estrutura de Resposta Padrão (JSON)</span>
              </h3>
              <div className="bg-[#101720] p-3 rounded-xl font-mono text-[11px] text-[#cbd5e1] overflow-x-auto border border-[#253241]">
                <pre>{`{
  "success": true,
  "status": 200,
  "query": "naruto",
  "category": "animes",
  "results": [
    {
      "id": "kaise_mIirbFHFViY",
      "title": "Naruto Run GIF",
      "url": "https://media.tenor.com/mIirbFHFViYAAAAC/naruto-run.gif",
      "preview": "https://media.tenor.com/mIirbFHFViYAAAAM/naruto-run.gif",
      "width": 498,
      "height": 278,
      "category": "animes",
      "tags": ["naruto", "run", "anime"],
      "source": {
        "provider": "tenor",
        "url": "https://tenor.com/view/naruto-run-123456",
        "attribution": "Tenor"
      }
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "next": "20",
    "total": 120
  }
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ENDPOINTS */}
        {activeTab === 'endpoints' && (
          <div className="space-y-4">
            {/* Live Interactive Tester */}
            <div className="bg-[#1c2733] p-4 rounded-2xl border border-[#253241] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#2aabee]" />
                  <span>Testador Interativo de Endpoints</span>
                </h3>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <input
                  type="text"
                  value={testEndpoint}
                  onChange={(e) => setTestEndpoint(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#121922] rounded-xl font-mono text-xs text-[#2aabee] border border-[#253241] focus:outline-none"
                  placeholder="/api/v1/search?q=goku"
                />
                <button
                  onClick={() => handleRunTest(testEndpoint)}
                  disabled={isLoading}
                  className="py-2 px-4 rounded-xl bg-[#2481cc] hover:bg-[#1f70b2] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Executando...' : 'Testar'}</span>
                </button>
              </div>

              {testResponse && (
                <div className="bg-[#101720] p-3 rounded-xl font-mono text-[10px] text-[#cbd5e1] max-h-60 overflow-y-auto border border-[#253241]">
                  <pre>{testResponse}</pre>
                </div>
              )}
            </div>

            {/* List of Endpoints */}
            <div className="space-y-3">
              {[
                {
                  method: 'GET',
                  path: '/api/v1/search',
                  desc: 'Busca GIFs e figurinhas animadas por palavra-chave e categoria.',
                  params: 'q (string), category (string), limit (1-50), offset (number)'
                },
                {
                  method: 'GET',
                  path: '/api/v1/random',
                  desc: 'Retorna um GIF aleatório filtrado por categoria.',
                  params: 'category (opcional: animes, memes, jogos, desenhos, reacoes, filmes, series)'
                },
                {
                  method: 'GET',
                  path: '/api/v1/categories',
                  desc: 'Lista todas as categorias oficiais e tabela de aliases.',
                  params: 'nenhum'
                },
                {
                  method: 'GET',
                  path: '/api/v1/gifs/:id',
                  desc: 'Busca metadados completos de um GIF específico por ID.',
                  params: 'id (string de ID da Kaise ou Tenor)'
                },
                {
                  method: 'GET',
                  path: '/api/health',
                  desc: 'Verifica o status e latência dos serviços da API Gateway.',
                  params: 'nenhum'
                }
              ].map((ep, idx) => (
                <div key={idx} className="bg-[#1c2733] p-3.5 rounded-2xl border border-[#253241] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-[#2481cc] text-white font-mono font-bold text-[10px]">
                      {ep.method} {ep.path}
                    </span>
                    <button
                      onClick={() => {
                        const url = `${domain}${ep.path.replace(':id', 'mIirbFHFViY')}`;
                        setTestEndpoint(ep.path.replace(':id', 'mIirbFHFViY'));
                        handleRunTest(url);
                      }}
                      className="text-[10px] font-bold text-[#2aabee] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Executar</span>
                      <Play className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-[#8293a4]">{ep.desc}</p>
                  <div className="text-[10px] font-mono text-[#708499] bg-[#121922] p-2 rounded-lg">
                    Parâmetros: <span className="text-[#2aabee]">{ep.params}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: EXAMPLES */}
        {activeTab === 'examples' && (
          <div className="space-y-4">
            {/* Code Language Selector */}
            <div className="flex items-center gap-2">
              {[
                { id: 'js', label: 'Node.js / JS' },
                { id: 'python', label: 'Python' },
                { id: 'curl', label: 'cURL' },
                { id: 'php', label: 'PHP' }
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setActiveLang(lang.id as any)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeLang === lang.id
                      ? 'bg-[#2481cc] text-white'
                      : 'bg-[#1c2733] text-[#8293a4] hover:text-white'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <div className="bg-[#1c2733] p-4 rounded-2xl border border-[#253241] space-y-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center justify-between">
                <span>Exemplo em {activeLang.toUpperCase()}</span>
                <button
                  onClick={() => {
                    const snippet = getSnippetCode(activeLang, domain);
                    handleCopy(snippet, 'snippet', 'Código');
                  }}
                  className="p-1.5 rounded-lg bg-[#2481cc] text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'snippet' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>Copiar</span>
                </button>
              </h3>

              <div className="bg-[#101720] p-3 rounded-xl font-mono text-[11px] text-[#cbd5e1] overflow-x-auto border border-[#253241]">
                <pre>{getSnippetCode(activeLang, domain)}</pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RATE LIMITS */}
        {activeTab === 'ratelimit' && (
          <div className="space-y-4">
            <div className="bg-[#1c2733] p-4 rounded-2xl border border-[#253241] space-y-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                <span>Políticas de Uso & Rate Limits</span>
              </h3>
              <p className="text-xs text-[#8293a4] leading-relaxed">
                Para garantir alta performance para bots e desenvolvedores, a API pública possui um limite liberado de <strong className="text-white">1.000 requisições por minuto por IP</strong>.
              </p>

              <div className="bg-[#121922] p-3 rounded-xl space-y-2 border border-[#253241] text-xs">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#8293a4]">Limite Liberado:</span>
                  <span className="font-mono text-[#10b981] font-bold">1.000 req / min</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#8293a4]">Header X-RateLimit-Limit:</span>
                  <span className="font-mono text-[#2aabee]">1000</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#8293a4]">Header X-RateLimit-Remaining:</span>
                  <span className="font-mono text-[#10b981]">999..0</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#8293a4]">Resposta ao Exceder (HTTP 429):</span>
                  <span className="font-mono text-[#ef4444]">Retry-After: seconds</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="pt-6 border-t border-[#1c2733] text-center text-[11px] text-[#708499] space-y-1">
          <p>Kaise Space GIF API • Documentação Oficial</p>
        </footer>

      </div>
    </div>
  );
};

function getSnippetCode(lang: string, domain: string): string {
  if (lang === 'js') {
    return `// Node.js / Browser (Fetch API)
const res = await fetch("${domain}/api/v1/search?q=naruto&limit=10");
const data = await res.json();

if (data.success && data.results.length > 0) {
  const firstGif = data.results[0];
  console.log("GIF URL:", firstGif.url);
  console.log("Fonte:", firstGif.source.attribution);
}`;
  }
  if (lang === 'python') {
    return `# Python 3 (Requests)
import requests

url = "${domain}/api/v1/search"
params = {
    "q": "naruto",
    "limit": 10
}

response = requests.get(url, params=params).json()
if response.get("success"):
    gifs = response.get("results", [])
    print("Encontrados:", len(gifs))
    print("Primeiro GIF:", gifs[0]["url"])`;
  }
  if (lang === 'curl') {
    return `# cURL Request
curl -X GET "${domain}/api/v1/search?q=naruto&limit=5" \\
  -H "Accept: application/json"`;
  }
  if (lang === 'php') {
    return `<?php
// PHP cURL
$ch = curl_init("${domain}/api/v1/search?q=naruto&limit=10");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
echo $data['results'][0]['url'];
?>`;
  }
  return '';
}
