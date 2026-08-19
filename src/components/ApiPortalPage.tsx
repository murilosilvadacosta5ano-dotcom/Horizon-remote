import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Terminal, 
  Play, 
  BookOpen, 
  Activity, 
  Zap, 
  CheckCircle2, 
  Copy, 
  Check, 
  Server,
  Layers,
  Database
} from 'lucide-react';

interface ApiPortalPageProps {
  onNavigate: (path: string) => void;
  onShowToast: (msg: string) => void;
}

export const ApiPortalPage: React.FC<ApiPortalPageProps> = ({ onNavigate, onShowToast }) => {
  const [searchQuery, setSearchQuery] = useState<string>('naruto');
  const [apiResult, setApiResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  const domain = typeof window !== 'undefined' ? window.location.origin : 'https://kaise.space';

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealthStatus(data))
      .catch(() => setHealthStatus({ status: 'online', service: 'Kaise GIF Gateway API' }));

    executeSearch('naruto');
  }, []);

  const executeSearch = async (term: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(term)}&limit=5`);
      const data = await res.json();
      setApiResult(data);
    } catch (e: any) {
      setApiResult({ error: e.message || 'Erro na requisição' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyEndpoint = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    onShowToast('Endpoint copiado!');
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#0e1621] text-[#f5f5f5] flex justify-center selection:bg-[#2481cc]/30">
      <div className="w-full max-w-2xl min-h-screen bg-[#0e1621] flex flex-col p-4 sm:p-6 space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-4 border-b border-[#1c2733]">
          <button
            onClick={() => onNavigate('/')}
            className="py-2 px-3.5 rounded-xl bg-[#1c2733] hover:bg-[#2481cc] text-[#2aabee] hover:text-white transition-all text-xs font-bold flex items-center gap-2 border border-[#253241] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Galeria</span>
          </button>

          <button
            onClick={() => onNavigate('/documentacao')}
            className="py-2 px-3.5 rounded-xl bg-[#2481cc] hover:bg-[#1f70b2] text-white transition-all text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Ver Documentação Completa</span>
          </button>
        </header>

        {/* Status Dashboard Banner */}
        <section className="bg-gradient-to-br from-[#16222f] to-[#111923] p-5 sm:p-6 rounded-3xl border border-[#253241] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-[#2aabee]" />
              <h1 className="text-lg font-black text-white uppercase tracking-tight">
                Portal do Desenvolvedor & Status da API
              </h1>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 text-xs font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              API Operacional
            </span>
          </div>

          <p className="text-xs text-[#8293a4]">
            Gateway de agregação de alta performance para mídias animadas, GIFs e Figurinhas.
          </p>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
            <div className="bg-[#121922] p-3 rounded-2xl border border-[#253241] space-y-1">
              <span className="text-[10px] text-[#708499] uppercase font-bold flex items-center gap-1">
                <Activity className="w-3 h-3 text-[#2aabee]" /> Status
              </span>
              <p className="text-xs font-bold text-white uppercase">{healthStatus?.status || 'Online'}</p>
            </div>

            <div className="bg-[#121922] p-3 rounded-2xl border border-[#253241] space-y-1">
              <span className="text-[10px] text-[#708499] uppercase font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#eab308]" /> Rate Limit
              </span>
              <p className="text-xs font-bold text-white">1000 req / min</p>
            </div>

            <div className="bg-[#121922] p-3 rounded-2xl border border-[#253241] space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-[#708499] uppercase font-bold flex items-center gap-1">
                <Database className="w-3 h-3 text-[#10b981]" /> Provedores
              </span>
              <p className="text-xs font-bold text-white">Tenor & Local Kaise</p>
            </div>
          </div>
        </section>

        {/* Live Playground */}
        <section className="bg-[#1c2733] p-5 rounded-3xl border border-[#253241] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#2aabee]" />
              <span>Console de Teste ao Vivo</span>
            </h2>
            <button
              onClick={() => handleCopyEndpoint(`${domain}/api/v1/search?q=${searchQuery}`)}
              className="text-[11px] font-bold text-[#2aabee] hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3" />}
              <span>Copiar URL</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1.5 rounded-xl bg-[#2481cc] text-white font-mono text-xs font-bold">
              GET
            </span>
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeSearch(searchQuery)}
                className="w-full px-3 py-2 bg-[#121922] rounded-xl font-mono text-xs text-[#2aabee] border border-[#253241] focus:outline-none"
                placeholder="digite o termo de busca..."
              />
            </div>
            <button
              onClick={() => executeSearch(searchQuery)}
              disabled={isLoading}
              className="py-2 px-4 rounded-xl bg-[#2481cc] hover:bg-[#1f70b2] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isLoading ? '...' : 'Buscar'}</span>
            </button>
          </div>

          {/* Response Box */}
          <div className="bg-[#101720] p-3.5 rounded-2xl font-mono text-[11px] text-[#cbd5e1] max-h-80 overflow-y-auto border border-[#253241]">
            {isLoading ? (
              <div className="text-[#8293a4] text-center py-6">Requisitando Kaise Gateway API...</div>
            ) : (
              <pre>{JSON.stringify(apiResult, null, 2)}</pre>
            )}
          </div>
        </section>

        {/* Quick Endpoints Directory */}
        <section className="bg-[#1c2733] p-5 rounded-3xl border border-[#253241] space-y-3">
          <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#10b981]" />
            <span>Principais Endpoints Ativos</span>
          </h2>

          <div className="space-y-2 text-xs font-mono">
            {[
              { path: '/api/v1/search?q=naruto&limit=20', desc: 'Busca normalizada com atribuição de fonte' },
              { path: '/api/v1/random?category=animes', desc: 'Sorteio aleatório de GIFs por categoria' },
              { path: '/api/v1/categories', desc: 'Lista de categorias e aliases oficiais' },
              { path: '/api/v1/gifs/mIirbFHFViY', desc: 'Detalhamento de GIF por ID' },
              { path: '/api/health', desc: 'Checagem de saúde e latência' },
            ].map((item, idx) => (
              <div key={idx} className="bg-[#121922] p-2.5 rounded-xl border border-[#253241] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-[#2aabee] font-bold truncate">{item.path}</span>
                <span className="text-[10px] text-[#708499]">{item.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-4 text-center text-[11px] text-[#708499]">
          <p>Kaise GIF API Portal • 2026</p>
        </footer>

      </div>
    </div>
  );
};
