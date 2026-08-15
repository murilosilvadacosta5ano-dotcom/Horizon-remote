import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Code2, 
  Key, 
  Link2, 
  ShieldCheck, 
  Terminal, 
  Check, 
  Copy, 
  Play,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

const UNIVERSAL_KEY = 'raphaelsboting';

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'endpoints' | 'bots' | 'terms'>('overview');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const domain = typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
    ? (window.location.origin.includes('kaise.space') ? 'https://www.kaise.space' : window.location.origin)
    : 'https://www.kaise.space';

  const getApiEndpoint = `${domain}/api/gifs?key=${UNIVERSAL_KEY}&search=naruto&category=animes&limit=10`;
  const postApiEndpoint = `${domain}/api/gifs/search`;
  const categoriesEndpoint = `${domain}/api/categories`;

  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    onShowToast(`${label} copiado!`);
    setTimeout(() => setCopiedField(null), 1500);
  };

  // Live Test of API endpoint
  const handleTestEndpoint = async () => {
    setIsTesting(true);
    setTestResponse(null);
    try {
      const res = await fetch(`/api/gifs?key=${UNIVERSAL_KEY}&search=naruto&category=animes&limit=3`);
      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));
      onShowToast('Endpoint testado com sucesso!');
    } catch (err: any) {
      setTestResponse(JSON.stringify({ error: err.message || 'Falha na requisição' }, null, 2));
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#161f2a] rounded-3xl max-w-lg w-full border border-[#253241] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 bg-[#1c2733] border-b border-[#253241] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#2481cc]/20 text-[#2aabee]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider">
                  Documentação da API
                </h2>
                <p className="text-[10px] font-semibold text-[#8293a4]">
                  Endpoints oficiais, integração de Bots & Termos
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#161f2a] text-[#8293a4] hover:text-white transition-colors"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 p-2 bg-[#121922] border-b border-[#253241]/70 overflow-x-auto no-scrollbar flex-shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === 'overview' ? 'bg-[#2481cc] text-white shadow-sm' : 'text-[#8293a4] hover:text-white'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('endpoints')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === 'endpoints' ? 'bg-[#2481cc] text-white shadow-sm' : 'text-[#8293a4] hover:text-white'
              }`}
            >
              Endpoints Ativos
            </button>
            <button
              onClick={() => setActiveTab('bots')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === 'bots' ? 'bg-[#2481cc] text-white shadow-sm' : 'text-[#8293a4] hover:text-white'
              }`}
            >
              Exemplos Bots
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === 'terms' ? 'bg-[#2481cc] text-white shadow-sm' : 'text-[#8293a4] hover:text-white'
              }`}
            >
              Termos & Políticas
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 overflow-y-auto space-y-4 text-xs text-[#cbd5e1] leading-relaxed">
            
            {/* 1. VISÃO GERAL */}
            {activeTab === 'overview' && (
              <div className="space-y-3.5">
                <div className="bg-[#1c2733] p-3.5 rounded-2xl border border-[#253241] space-y-2">
                  <h3 className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-4 h-4 text-[#2aabee]" />
                    <span>Como a API Opera</span>
                  </h3>
                  <p className="text-[11px] text-[#8293a4]">
                    Nossa API fornece GIFs extraídos diretamente e organizados por categorias estritas (<code className="text-[#2aabee]">geral</code>, <code className="text-[#2aabee]">memes</code>, <code className="text-[#2aabee]">jogos</code>, <code className="text-[#2aabee]">animes</code>, <code className="text-[#2aabee]">desenhos</code>, <code className="text-[#2aabee]">reacoes</code>, <code className="text-[#2aabee]">filmes</code>, <code className="text-[#2aabee]">series</code>).
                  </p>
                  <p className="text-[11px] text-[#8293a4]">
                    Cada requisição retorna o link direto pronto para uso no campo <strong className="text-white">gif_url</strong>, ideal para bots de Discord, Telegram e automações.
                  </p>
                </div>

                <div className="bg-[#1c2733] p-3.5 rounded-2xl border border-[#253241] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-xs">Domínio Base da API</h4>
                    <span className="px-2 py-0.5 rounded-md bg-[#2481cc]/20 text-[#2aabee] text-[10px] font-bold">Oficial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value="https://www.kaise.space"
                      className="w-full px-3 py-2 bg-[#121922] rounded-xl font-mono font-bold text-[#2aabee] text-xs border-0 select-all"
                    />
                    <button
                      onClick={() => handleCopy('https://www.kaise.space', 'domain', 'Domínio')}
                      className="p-2 rounded-xl bg-[#2481cc] text-white flex-shrink-0"
                    >
                      {copiedField === 'domain' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-[#708499]">
                    Você pode fazer requisições diretas via <code className="text-[#2aabee]">https://www.kaise.space/api/gifs</code>
                  </p>
                </div>

                <div className="bg-[#1c2733] p-3.5 rounded-2xl border border-[#253241] space-y-2.5">
                  <h4 className="font-bold text-white text-xs">Chave Pública de Acesso (Key)</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={UNIVERSAL_KEY}
                      className="w-full px-3 py-2 bg-[#121922] rounded-xl font-mono font-bold text-[#2aabee] text-xs border-0 select-all"
                    />
                    <button
                      onClick={() => handleCopy(UNIVERSAL_KEY, 'key', 'Chave')}
                      className="p-2 rounded-xl bg-[#2481cc] text-white flex-shrink-0"
                    >
                      {copiedField === 'key' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-[#708499]">
                    Envie como parâmetro na URL (<code className="text-[#2aabee]">?key=raphaelsboting</code>) ou no header <code className="text-[#2aabee]">x-api-key</code>.
                  </p>
                </div>
              </div>
            )}

            {/* 2. ENDPOINTS */}
            {activeTab === 'endpoints' && (
              <div className="space-y-3.5">
                {/* GET /api/gifs */}
                <div className="bg-[#1c2733] p-3.5 rounded-2xl border border-[#253241] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-[#2481cc] text-white font-mono font-bold text-[10px]">
                      GET /api/gifs
                    </span>
                    <span className="text-[10px] text-[#34c759] font-bold">Principal (Online)</span>
                  </div>
                  <p className="text-[11px] text-[#8293a4]">
                    Busca GIFs por termo e categoria específica.
                  </p>
                  
                  <div className="bg-[#121922] p-2.5 rounded-xl space-y-1 text-[10px] font-mono text-[#8293a4]">
                    <div><span className="text-[#2aabee]">search</span>: termo de busca (ex: naruto, travolta, gta)</div>
                    <div><span className="text-[#2aabee]">category</span>: geral, memes, jogos, animes, desenhos, reacoes, filmes, series</div>
                    <div><span className="text-[#2aabee]">limit</span>: número de resultados (padrão: 20)</div>
                    <div><span className="text-[#2aabee]">key</span>: raphaelsboting</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getApiEndpoint}
                      className="w-full px-2.5 py-1.5 bg-[#121922] rounded-xl font-mono text-[10px] text-[#2aabee] border-0 select-all"
                    />
                    <button
                      onClick={() => handleCopy(getApiEndpoint, 'ep1', 'URL')}
                      className="p-1.5 rounded-lg bg-[#2481cc] text-white flex-shrink-0"
                    >
                      {copiedField === 'ep1' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Live Test Button */}
                  <div className="pt-1">
                    <button
                      onClick={handleTestEndpoint}
                      disabled={isTesting}
                      className="w-full py-2 bg-[#2481cc]/20 hover:bg-[#2481cc]/30 border border-[#2481cc]/40 rounded-xl text-xs font-bold text-[#2aabee] flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{isTesting ? 'Testando endpoint...' : 'Testar Resposta da API ao Vivo'}</span>
                    </button>

                    {testResponse && (
                      <div className="mt-2 p-2.5 bg-[#101720] rounded-xl max-h-40 overflow-y-auto border border-[#253241]">
                        <pre className="text-[9px] font-mono text-[#34c759] whitespace-pre-wrap">{testResponse}</pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* POST /api/gifs/search */}
                <div className="bg-[#1c2733] p-3.5 rounded-2xl border border-[#253241] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-[#2aabee] text-[#0e1621] font-mono font-bold text-[10px]">
                      POST /api/gifs/search
                    </span>
                    <span className="text-[10px] text-[#8293a4] font-bold">JSON Body</span>
                  </div>
                  <p className="text-[11px] text-[#8293a4]">
                    Aceita corpo em JSON com <code className="text-[#2aabee]">{`{"search": "goku", "category": "animes"}`}</code>.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={postApiEndpoint}
                      className="w-full px-2.5 py-1.5 bg-[#121922] rounded-xl font-mono text-[10px] text-[#2aabee] border-0 select-all"
                    />
                    <button
                      onClick={() => handleCopy(postApiEndpoint, 'ep2', 'URL POST')}
                      className="p-1.5 rounded-lg bg-[#2481cc] text-white flex-shrink-0"
                    >
                      {copiedField === 'ep2' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* GET /api/categories */}
                <div className="bg-[#1c2733] p-3.5 rounded-2xl border border-[#253241] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-[#161f2a] text-[#8293a4] font-mono font-bold text-[10px]">
                      GET /api/categories
                    </span>
                    <span className="text-[10px] text-[#8293a4] font-bold">Categorias</span>
                  </div>
                  <p className="text-[11px] text-[#8293a4]">
                    Lista todas as 8 categorias oficiais do sistema.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={categoriesEndpoint}
                      className="w-full px-2.5 py-1.5 bg-[#121922] rounded-xl font-mono text-[10px] text-[#2aabee] border-0 select-all"
                    />
                    <button
                      onClick={() => handleCopy(categoriesEndpoint, 'ep3', 'URL Categorias')}
                      className="p-1.5 rounded-lg bg-[#2481cc] text-white flex-shrink-0"
                    >
                      {copiedField === 'ep3' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. BOTS */}
            {activeTab === 'bots' && (
              <div className="space-y-3">
                <div className="bg-[#1c2733] p-3.5 rounded-2xl border border-[#253241] space-y-2">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#2aabee]" />
                    <span>Python (Discord.py / Telegram Bot)</span>
                  </span>
                  <div className="bg-[#101720] p-2.5 rounded-xl font-mono text-[10px] text-[#cbd5e1] overflow-x-auto">
                    <pre className="select-all">{`import requests

url = "${domain}/api/gifs"
params = {
    "key": "raphaelsboting",
    "search": "naruto",
    "category": "animes",
    "limit": 10
}

response = requests.get(url, params=params).json()
gif_direto = response["gif_url"]
print("Link do GIF:", gif_direto)`}</pre>
                  </div>
                </div>

                <div className="bg-[#1c2733] p-3.5 rounded-2xl border border-[#253241] space-y-2">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-[#2aabee]" />
                    <span>Node.js / Discord.js</span>
                  </span>
                  <div className="bg-[#101720] p-2.5 rounded-xl font-mono text-[10px] text-[#cbd5e1] overflow-x-auto">
                    <pre className="select-all">{`const res = await fetch("${domain}/api/gifs?key=raphaelsboting&search=naruto&category=animes");
const data = await res.json();
const gifUrl = data.gif_url;
// Enviar gifUrl no canal do Discord ou Telegram`}</pre>
                  </div>
                </div>

                <div className="bg-[#1c2733] p-3.5 rounded-2xl border border-[#253241] space-y-2">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#2aabee]" />
                    <span>cURL</span>
                  </span>
                  <div className="bg-[#101720] p-2.5 rounded-xl font-mono text-[10px] text-[#cbd5e1] overflow-x-auto">
                    <pre className="select-all">{`curl "${domain}/api/gifs?key=raphaelsboting&search=minecraft&category=jogos"`}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* 4. TERMOS & POLÍTICAS */}
            {activeTab === 'terms' && (
              <div className="space-y-3 text-[11px] text-[#8293a4]">
                <div className="bg-[#1c2733] p-3.5 rounded-2xl border border-[#253241] space-y-2">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#34c759]" />
                    <span>Termos de Uso e Política de Conteúdo</span>
                  </h4>
                  <p>
                    1. <strong>Uso Gratuito para Bots:</strong> A API foi projetada para bots de chat, automações de comunidade e uso pessoal.
                  </p>
                  <p>
                    2. <strong>Isolamento de Categorias:</strong> Todas as categorias realizam filtragem dedicada para garantir conteúdo apropriado ao contexto solicitado.
                  </p>
                  <p>
                    3. <strong>Propriedade Intelectual:</strong> Todos os GIFs pertencem aos seus respectivos criadores e estúdios originais, indexados publicamente através da rede do Tenor.
                  </p>
                  <p>
                    4. <strong>Link Oficial Tenor:</strong> Para pesquisar no site oficial ou registrar novos conteúdos, visite{' '}
                    <a 
                      href="https://tenor.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#2aabee] hover:underline font-bold"
                    >
                      tenor.com
                    </a>.
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-3 bg-[#1c2733] border-t border-[#253241] flex items-center justify-between flex-shrink-0">
            <span className="text-[10px] text-[#708499]">
              Raphael GIF Platform • 2026
            </span>
            <button
              onClick={onClose}
              className="py-1.5 px-4 rounded-xl bg-[#2481cc] hover:bg-[#1f70b2] text-white text-xs font-bold transition-colors"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
