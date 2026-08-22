import React, { useState, useRef, useEffect } from 'react';
import { logSiteActivity } from '../services/firebaseService';
import { 
  searchWebRecipe, 
  searchWikipediaPt, 
  RecipeData, 
  GenericRecipeCategory 
} from '../services/webSearchService';
import {
  checkCasualGreeting,
  isSummaryQuestion,
  performDeepSearch,
  solveMathExpression,
  generateCodeSolution,
  DeepResearchResult
} from '../services/intelligenceService';
import { TypewriterText } from './TypewriterText';

interface BuscolSearchPageProps {
  onNavigate: (path: string) => void;
  onShowToast: (msg: string) => void;
}

interface ChatSession {
  id: string;
  title: string;
  messages: MessageBubble[];
}

interface MessageBubble {
  id: string;
  type: 'user' | 'buscol';
  content?: string;
  htmlContent?: React.ReactNode;
}

interface ThinkingStatus {
  text: string;
  icon: string;
  theme: 'cooking' | 'stalking' | 'browsing' | 'general';
}

export const BuscolSearchPage: React.FC<BuscolSearchPageProps> = ({ onNavigate, onShowToast }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'session-1',
      title: 'Conversa inicial em português',
      messages: []
    }
  ]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('session-1');

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [thinkingStatus, setThinkingStatus] = useState<ThinkingStatus>({
    text: 'pensando…',
    icon: '💬',
    theme: 'general'
  });

  const stageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  const domain = typeof window !== 'undefined' ? window.location.origin : 'https://kaise.space';

  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.scrollTop = stageRef.current.scrollHeight;
    }
  }, [messages, isLoading, thinkingStatus]);

  const handleNewChat = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'Nova conversa',
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setIsSidebarOpen(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    setIsSidebarOpen(false);
  };

  const detectCategory = (q: string): 'casual' | 'math' | 'code' | 'api' | 'jogo' | 'youtube' | 'video' | 'receita' | 'summary' | 'geral' => {
    const lower = q.toLowerCase();

    // Check 0: Casual conversational greetings ("oi", "tudo bem", "olá")
    if (checkCasualGreeting(q)) {
      return 'casual';
    }

    // Check 1: Math calculation requests ("quanto é...", "calcule", "5 * 10", "15% de 200", "raiz de 144", "154 / 7")
    const mathCheck = solveMathExpression(q);
    if (mathCheck || /^(?:quanto\s+[eé]|calcule|calculadora|conta\s+de)\s*[\d\s().+\-*/%^raizporcentagem]+/i.test(lower)) {
      return 'math';
    }

    // Check 2: Code / Programming requests ("código python", "script js", "função em python", "como programar", etc.)
    const codeWords = ['código', 'codigo', 'python', 'javascript', 'script', 'algoritmo', 'programar', 'função', 'funcao', 'typescript', 'java', 'c++', 'html', 'css', 'sql', 'bot telegram', 'bot discord', 'refatorar'];
    if (codeWords.some(w => lower.includes(w))) {
      return 'code';
    }

    // Check 3: API / Endpoint / Token / Chave
    const apiWords = ['api', 'key', 'chave api', 'endpoint', 'token', 'curl', 'desenvolvedor', 'sdk', 'gifs'];
    if (apiWords.some(w => lower.includes(w))) return 'api';

    // Check 4: Jogos / Futebol
    const gameWords = ['jogo', 'jogos', 'futebol', 'placar', 'partida', 'campeonato', 'copa', 'brasileirão', 'flamengo', 'corinthians', 'palmeiras', 'vasco', 'são paulo', 'grêmio', 'libertadores'];
    if (gameWords.some(w => lower.includes(w))) return 'jogo';

    // Check 5: YouTube
    const youtubeWords = ['youtube', 'yt '];
    if (youtubeWords.some(w => lower.includes(w))) return 'youtube';

    // Check 6: Vídeo
    const videoWords = ['vídeo', 'video', 'assistir', 'clipe'];
    if (videoWords.some(w => lower.includes(w))) return 'video';

    // Check 7: Receitas / Bolos / Doces / Pratos
    const foodWords = ['receita', 'receitas', 'comida', 'comidas', 'lanche', 'lanches', 'prato', 'bolo', 'bolos', 'doce', 'doces', 'salgado', 'salgados', 'janta', 'almoço', 'sobremesa', 'sobremesas', 'chocolate', 'cenoura', 'fuba', 'fubá', 'banana', 'laranja', 'milho', 'brigadeiro', 'pudim', 'strogonoff', 'lasanha', 'carbonara', 'caneca', 'red velvet'];
    if (foodWords.some(w => lower.includes(w))) return 'receita';

    // Check 8: Summary / Biographical ("Quem é", "Quem foi", "O que é", etc.)
    const summaryCheck = isSummaryQuestion(q);
    if (summaryCheck.isSummary) {
      return 'summary';
    }

    return 'geral';
  };

  const executeSearch = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || isLoading) return;

    setInputQuery('');
    const userMsgId = `user_${Date.now()}`;
    const buscolMsgId = `buscol_${Date.now()}`;

    // Add user message to current session
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const newTitle = s.messages.length === 0 ? (q.length > 28 ? q.slice(0, 28) + '...' : q) : s.title;
        return {
          ...s,
          title: newTitle,
          messages: [...s.messages, { id: userMsgId, type: 'user', content: q }]
        };
      }
      return s;
    }));

    setIsLoading(true);
    logSiteActivity(null, 'SEARCH_GIFS', `Buscol: "${q}"`);

    const cat = detectCategory(q);

    // Dynamic 9-second delay sequence with 3-second status updates
    if (cat === 'receita') {
      setThinkingStatus({ text: 'cozinhando…', icon: '🍳', theme: 'cooking' });
      await new Promise(r => setTimeout(r, 3000));
      setThinkingStatus({ text: 'filtrando ingredientes e modo de preparo…', icon: '🥣', theme: 'cooking' });
      await new Promise(r => setTimeout(r, 3000));
      setThinkingStatus({ text: 'testando e ajustando a receita perfeita…', icon: '✨', theme: 'cooking' });
      await new Promise(r => setTimeout(r, 3000));
    } else if (cat === 'summary') {
      const isPerson = isSummaryQuestion(q).type === 'who';
      if (isPerson) {
        setThinkingStatus({ text: 'stalkeando…', icon: '🕵️‍♂️', theme: 'stalking' });
        await new Promise(r => setTimeout(r, 3000));
        setThinkingStatus({ text: 'vasculhando redes e biografias públicas…', icon: '🔍', theme: 'stalking' });
        await new Promise(r => setTimeout(r, 3000));
        setThinkingStatus({ text: 'filtrando dados e veracidade das fontes…', icon: '📝', theme: 'stalking' });
        await new Promise(r => setTimeout(r, 3000));
      } else {
        setThinkingStatus({ text: 'abrindo navegador…', icon: '🌐', theme: 'browsing' });
        await new Promise(r => setTimeout(r, 3000));
        setThinkingStatus({ text: 'pesquisando…', icon: '🧭', theme: 'browsing' });
        await new Promise(r => setTimeout(r, 3000));
        setThinkingStatus({ text: 'pesquisando em site filtrado sobre fontes…', icon: '💡', theme: 'browsing' });
        await new Promise(r => setTimeout(r, 3000));
      }
    } else if (cat === 'code') {
      setThinkingStatus({ text: 'analisando entrada e estrutura de dados…', icon: '💻', theme: 'general' });
      await new Promise(r => setTimeout(r, 3000));
      setThinkingStatus({ text: 'reescrevendo e refatorando o código…', icon: '⚙️', theme: 'general' });
      await new Promise(r => setTimeout(r, 3000));
      setThinkingStatus({ text: 'testando casos de borda e otimizando…', icon: '🚀', theme: 'general' });
      await new Promise(r => setTimeout(r, 3000));
    } else if (cat === 'math') {
      setThinkingStatus({ text: 'abrindo calculadora de precisão…', icon: '🧮', theme: 'general' });
      await new Promise(r => setTimeout(r, 3000));
      setThinkingStatus({ text: 'processando ordem das operações…', icon: '📐', theme: 'general' });
      await new Promise(r => setTimeout(r, 3000));
      setThinkingStatus({ text: 'calculando e montando o passo a passo…', icon: '🔢', theme: 'general' });
      await new Promise(r => setTimeout(r, 3000));
    } else if (cat === 'casual') {
      setThinkingStatus({ text: 'pensando…', icon: '💬', theme: 'general' });
      await new Promise(r => setTimeout(r, 1500));
    } else {
      // General search / video / youtube / juegos / default
      setThinkingStatus({ text: 'abrindo navegador…', icon: '🌐', theme: 'browsing' });
      await new Promise(r => setTimeout(r, 3000));
      setThinkingStatus({ text: 'pesquisando…', icon: '🧭', theme: 'browsing' });
      await new Promise(r => setTimeout(r, 3000));
      setThinkingStatus({ text: 'pesquisando em site filtrado sobre fontes…', icon: '📄', theme: 'browsing' });
      await new Promise(r => setTimeout(r, 3000));
    }

    let buscolContent: React.ReactNode = null;

    if (cat === 'casual') {
      const reply = checkCasualGreeting(q) || 'Olá! Como posso te ajudar hoje?';
      buscolContent = (
        <div className="claude-text-response">
          <div style={{ lineHeight: '1.7', fontSize: '15px', color: '#f3f1ee', whiteSpace: 'pre-wrap' }}>
            <TypewriterText text={reply} speedMs={8} />
          </div>
        </div>
      );
    } else if (cat === 'math') {
      buscolContent = renderMathCategory(q);
    } else if (cat === 'code') {
      buscolContent = renderCodeCategory(q);
    } else if (cat === 'summary') {
      buscolContent = await renderSummaryCategory(q);
    } else if (cat === 'api') {
      buscolContent = renderApiCategory(q);
    } else if (cat === 'jogo') {
      buscolContent = await renderJogosCategory(q);
    } else if (cat === 'youtube') {
      buscolContent = renderYoutubeCategory(q);
    } else if (cat === 'video') {
      buscolContent = renderVideoCategory(q);
    } else if (cat === 'receita') {
      buscolContent = await renderReceitasCategory(q);
    } else {
      buscolContent = await renderGeralCategory(q);
    }

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          messages: [...s.messages, { id: buscolMsgId, type: 'buscol', htmlContent: buscolContent }]
        };
      }
      return s;
    }));

    setIsLoading(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    executeSearch(inputQuery);
  };

  const handleQuickSearch = (text: string) => {
    executeSearch(text);
  };

  /* ---------- CATEGORY RENDERERS (CLEAN TEXT & MARKDOWN FORMAT, NO UGLY BOXES) ---------- */

  // MATH & CALCULATOR CATEGORY
  const renderMathCategory = (q: string) => {
    const mathData = solveMathExpression(q) || {
      expression: q,
      result: 'Calculado',
      steps: ['Processamento de expressão matemática'],
      explanation: 'Cálculo efetuado pela calculadora de alta precisão.',
      sourceUrl: `https://www.google.com/search?q=${encodeURIComponent('calculadora ' + q)}`
    };

    return (
      <div className="claude-text-response">
        <div className="paragraph-with-link-badge">
          <a 
            href={mathData.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-source-badge"
            title="Calculadora Kaise"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>Calculadora Kaise</span>
          </a>
          <span style={{ fontSize: '15.5px', fontWeight: 600, color: '#f3f1ee' }}>
            <TypewriterText text={`Resultado: ${mathData.expression} = ${mathData.result}`} speedMs={8} />
          </span>
        </div>

        <p style={{ marginTop: '10px', fontSize: '14.5px', lineHeight: '1.6', color: '#dedcd7' }}>
          {mathData.explanation}
        </p>

        {/* Step-by-step resolution box */}
        <div className="code-block-container" style={{ marginTop: '14px' }}>
          <div className="code-header">
            <span>Passo a Passo da Resolução</span>
            <button 
              className="copy-text-btn"
              onClick={() => {
                navigator.clipboard.writeText(`${mathData.expression} = ${mathData.result}\n\n${mathData.steps.join('\n')}`);
                onShowToast('Cálculo copiado para a área de transferência!');
              }}
            >
              Copiar Resultado
            </button>
          </div>
          <div className="code-content" style={{ padding: '14px', fontSize: '13.5px', lineHeight: '1.7', color: '#e5e3de' }}>
            {mathData.steps.map((st, idx) => (
              <div key={idx} style={{ marginBottom: idx < mathData.steps.length - 1 ? '6px' : '0' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 600, marginRight: '8px' }}>•</span>
                <span>{st}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Visual representation SVG Card */}
        <div style={{ marginTop: '14px', padding: '16px', borderRadius: '12px', background: '#1c1b1a', border: '1px solid #2d2c2a' }}>
          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Representação Gráfica da Operação
          </div>
          <svg width="100%" height="75" viewBox="0 0 400 75" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="75" rx="8" fill="#141312" />
            <text x="20" y="30" fill="#d97757" fontSize="13" fontWeight="bold">Expressão: {mathData.expression}</text>
            <text x="20" y="58" fill="#ffffff" fontSize="17" fontWeight="bold">➜ Resultado = {mathData.result}</text>
            <circle cx="360" cy="37" r="20" fill="rgba(217, 119, 87, 0.15)" stroke="#d97757" strokeWidth="2" />
            <path d="M353 37L358 42L367 31" stroke="#d97757" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    );
  };

  // CODE & PROGRAMMING CATEGORY
  const renderCodeCategory = (q: string) => {
    const codeData = generateCodeSolution(q);

    return (
      <div className="claude-text-response">
        <div className="paragraph-with-link-badge">
          <a 
            href={codeData.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-source-badge"
            title={`Referência: ${codeData.language}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>{codeData.language} Refatorado</span>
          </a>
          <span style={{ fontSize: '15.5px', fontWeight: 600, color: '#f3f1ee' }}>
            <TypewriterText text={codeData.title} speedMs={8} />
          </span>
        </div>

        <p style={{ marginTop: '10px', fontSize: '14.5px', lineHeight: '1.6', color: '#dedcd7' }}>
          {codeData.description}
        </p>

        {/* Formatted Code Block with Copy Button */}
        <div className="code-block-container" style={{ marginTop: '14px' }}>
          <div className="code-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
              {codeData.language}
            </span>
            <button 
              className="copy-text-btn"
              onClick={() => {
                navigator.clipboard.writeText(codeData.code);
                onShowToast('Código copiado com sucesso!');
              }}
            >
              Copiar código
            </button>
          </div>
          <pre className="code-content">
            <code>
              {codeData.code}
            </code>
          </pre>
        </div>

        {/* Input/Output & How to Run */}
        <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
          <div style={{ color: '#e5e3de', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid #2a2928' }}>
            <strong style={{ color: 'var(--accent)' }}>💡 Entradas & Saídas:</strong> {codeData.inputOutputExplanation}
          </div>

          <div style={{ marginTop: '4px' }}>
            <strong style={{ color: '#ffffff' }}>🚀 Como Executar:</strong>
            <ul style={{ paddingLeft: '20px', marginTop: '6px', color: '#dedcd7', lineHeight: '1.6' }}>
              {codeData.howToRun.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // 0. SUMMARY & DEEP RESEARCH CATEGORY (Summaries for "Quem é", "O que é", "História de", etc.)
  const renderSummaryCategory = async (q: string) => {
    const summaryInfo = isSummaryQuestion(q);
    const deepResult = await performDeepSearch(summaryInfo.subject, summaryInfo.type);
    const primarySource = deepResult.sources[0] || { 
      name: 'Wikipédia', 
      url: `https://pt.wikipedia.org/wiki/${encodeURIComponent(summaryInfo.subject)}` 
    };

    return (
      <div className="claude-text-response">
        {/* Main paragraph with source link icon in front */}
        <div className="paragraph-with-link-badge">
          <a 
            href={primarySource.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-source-badge"
            title={`Fonte: ${primarySource.name}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>{primarySource.name}</span>
          </a>
          <span style={{ lineHeight: '1.65', fontSize: '15px', fontWeight: 500, color: 'var(--text)' }}>
            <TypewriterText text={deepResult.quickSummary || ''} speedMs={8} />
          </span>
        </div>

        {deepResult.deepAnalysis && deepResult.deepAnalysis.keyPoints.length > 0 && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {deepResult.deepAnalysis.keyPoints.map((pt, idx) => {
              const src = deepResult.sources[idx % deepResult.sources.length] || primarySource;
              return (
                <div key={idx} className="paragraph-with-link-badge keypoint-item">
                  <a 
                    href={src.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-source-badge"
                    title={`Consultar: ${src.name}`}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    <span>{src.name}</span>
                  </a>
                  <span style={{ fontSize: '14px', lineHeight: '1.55', color: '#dedcd7' }}>
                    <TypewriterText text={pt} speedMs={6} />
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // 1. API & BOT CATEGORY (Pure clean text message format)
  const renderApiCategory = (q: string) => {
    const apiKey = 'kaise_live_8f39a7e2b109c4d2e8';
    const endpointUrl = `${domain}/api/v1/search?q=termo`;

    return (
      <div className="claude-text-response">
        <p>Aqui estão os dados de integração da <strong>API de GIFs e Bots da Kaise</strong>:</p>
        
        <div className="code-block-container">
          <div className="code-header">
            <span>Credenciais Kaise API</span>
            <button 
              className="copy-text-btn"
              onClick={() => {
                navigator.clipboard.writeText(apiKey);
                onShowToast('API Key copiada com sucesso!');
              }}
            >
              Copiar Chave
            </button>
          </div>
          <pre className="code-content">
            <code>
              {`// API Key Pública:\n${apiKey}\n\n// Endpoint de busca de GIFs:\nGET ${endpointUrl}`}
            </code>
          </pre>
        </div>

        <p style={{ marginTop: '14px' }}>
          <strong>Exemplo de integração em JavaScript (Node.js / Bot):</strong>
        </p>

        <div className="code-block-container">
          <pre className="code-content">
            <code>
{`const response = await fetch("${domain}/api/v1/search?q=meme", {
  headers: { "Authorization": "Bearer ${apiKey}" }
});
const data = await response.json();
console.log(data.results[0].url);`}
            </code>
          </pre>
        </div>

        <p style={{ marginTop: '12px', color: 'var(--sub)' }}>
          A API retorna JSON estruturado com URLs em alta resolução, miniaturas, dimensões e suporte direto para Discord.js, Telegram e WhatsApp Bots.
        </p>
      </div>
    );
  };

  // 2. JOGOS CATEGORY (Clean natural text)
  const renderJogosCategory = async (q: string) => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${today}&s=Soccer`);
      const data = await res.json();
      const events = data.events || [];

      if (events.length === 0) {
        return (
          <div className="claude-text-response">
            <div className="paragraph-with-link-badge">
              <a 
                href={`https://www.google.com/search?q=${encodeURIComponent(q)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-source-badge"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span>Google Esportes</span>
              </a>
              <span>Não encontrei partidas de futebol agendadas para a data de hoje nos registros.</span>
            </div>
          </div>
        );
      }

      return (
        <div className="claude-text-response">
          <div className="paragraph-with-link-badge">
            <a 
              href={`https://www.thesportsdb.com`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-source-badge"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span>TheSportsDB</span>
            </a>
            <span>Confira os principais jogos e placares de futebol de hoje:</span>
          </div>
          
          <div className="scores-list" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {events.slice(0, 6).map((ev: any, idx: number) => {
              const homeScore = ev.intHomeScore ?? '-';
              const awayScore = ev.intAwayScore ?? '-';
              return (
                <div key={idx} className="score-clean-row">
                  <span className="team-name">{ev.strHomeTeam}</span>
                  <span className="score-badge">{homeScore} x {awayScore}</span>
                  <span className="team-name" style={{ textAlign: 'right' }}>{ev.strAwayTeam}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    } catch {
      return (
        <div className="claude-text-response">
          <div className="paragraph-with-link-badge">
            <a 
              href={`https://www.google.com/search?q=${encodeURIComponent(q)}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-source-badge"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span>Google</span>
            </a>
            <span>Pesquisar partidas e resultados no Google Futebol.</span>
          </div>
        </div>
      );
    }
  };

  // 3. YOUTUBE CATEGORY (Clean text format with inline badge)
  const renderYoutubeCategory = (q: string) => {
    const clean = q.replace(/youtube|yt/gi, '').trim() || q;
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(clean)}`;

    return (
      <div className="claude-text-response">
        <div className="paragraph-with-link-badge">
          <a 
            href={ytUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-source-badge"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>YouTube</span>
          </a>
          <span>Você pode assistir vídeos sobre <strong>"{clean}"</strong> diretamente na plataforma do YouTube.</span>
        </div>
      </div>
    );
  };

  // 4. VIDEO CATEGORY (Clean text format with inline badge)
  const renderVideoCategory = (q: string) => {
    const clean = q.replace(/vídeo|video|assistir|clipe/gi, '').trim() || q;
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(clean)}`;

    return (
      <div className="claude-text-response">
        <div className="paragraph-with-link-badge">
          <a 
            href={ytUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-source-badge"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>Assistir</span>
          </a>
          <span>Aqui estão os clipes e vídeos disponíveis para <strong>"{clean}"</strong>.</span>
        </div>
      </div>
    );
  };

  // 5. RECEITAS CATEGORY (Full Recipe Extraction, YouTube Embed & Interactive Choice)
  const renderReceitasCategory = async (q: string) => {
    try {
      const result = await searchWebRecipe(q);

      // Case A: Generic category question (e.g., "receitas de bolos", "tipos de bolos")
      if (result.isGenericCategory && result.categoryData) {
        const catData = result.categoryData;
        const primarySrc = catData.sources[0] || { name: 'TudoGostoso', url: 'https://www.tudogostoso.com.br' };

        return (
          <div className="claude-text-response">
            <div className="paragraph-with-link-badge">
              <a 
                href={primarySrc.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-source-badge"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span>{primarySrc.name}</span>
              </a>
              <span style={{ fontSize: '15.5px', fontWeight: 500, color: '#f3f1ee' }}>
                <TypewriterText text={catData.promptQuestion} speedMs={8} />
              </span>
            </div>

            <p style={{ color: 'var(--sub)', fontSize: '14px', marginTop: '4px' }}>
              {catData.intro}
            </p>

            <div className="recipe-options-grid">
              {catData.options.map((opt, idx) => (
                <button
                  key={idx}
                  className="recipe-option-card"
                  onClick={() => handleQuickSearch(opt.query)}
                  type="button"
                >
                  <span className="option-icon">{opt.icon}</span>
                  <div className="option-info">
                    <span className="option-title">{opt.name}</span>
                    <span className="option-desc">{opt.desc}</span>
                  </div>
                  <span className="option-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        );
      }

      // Case B: Specific recipe with complete instructions, ingredients, photo and YouTube embed
      const recipe = result.recipe;
      if (!recipe) {
        return (
          <div className="claude-text-response">
            <div className="paragraph-with-link-badge">
              <a 
                href={`https://www.google.com/search?q=receita+${encodeURIComponent(q)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-source-badge"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span>Google Receitas</span>
              </a>
              <span>Não encontrei a receita exata para <strong>"{q}"</strong> nos bancos de dados culinários.</span>
            </div>
          </div>
        );
      }

      const recipeSource = recipe.sources[0] || { name: 'Receitas Brasil', url: `https://www.google.com/search?q=${encodeURIComponent(recipe.title)}` };

      return (
        <div className="claude-text-response recipe-full-card">
          <div className="recipe-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="recipe-tag">{recipe.category}</span>
              <a 
                href={recipeSource.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-source-badge"
                title={`Fonte da receita: ${recipeSource.name}`}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span>{recipeSource.name}</span>
              </a>
            </div>
            <h2 className="recipe-title">{recipe.title}</h2>
            <p className="recipe-desc">{recipe.description}</p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="recipe-metrics-row">
            <div className="metric-item">
              <span className="metric-label">⏱️ Tempo</span>
              <span className="metric-val">{recipe.prepTime}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">🍽️ Rendimento</span>
              <span className="metric-val">{recipe.yields}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">📊 Dificuldade</span>
              <span className="metric-val">{recipe.difficulty}</span>
            </div>
          </div>

          {/* Food Photo */}
          {recipe.imageUrl && (
            <div className="recipe-image-wrap">
              <img 
                src={recipe.imageUrl} 
                alt={recipe.title} 
                className="recipe-main-img" 
                loading="lazy" 
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Ingredients Section */}
          <div className="recipe-block">
            <h3 className="recipe-section-title">🛒 Ingredientes</h3>
            {recipe.ingredients.map((sec, sIdx) => (
              <div key={sIdx} style={{ marginBottom: '10px' }}>
                {sec.section && <h4 className="recipe-subsection-title">{sec.section}</h4>}
                <ul className="recipe-ingredients-list">
                  {sec.items.map((item, iIdx) => (
                    <li key={iIdx}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Step-by-Step Instructions */}
          <div className="recipe-block">
            <h3 className="recipe-section-title">👩‍🍳 Modo de Preparo</h3>
            {recipe.instructions.map((sec, sIdx) => (
              <div key={sIdx} style={{ marginBottom: '14px' }}>
                {sec.section && <h4 className="recipe-subsection-title">{sec.section}</h4>}
                <ol className="recipe-steps-list">
                  {sec.steps.map((step, stIdx) => (
                    <li key={stIdx}>
                      <span className="step-num">{stIdx + 1}</span>
                      <span className="step-text">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>

          {/* Chef Tip */}
          {recipe.chefTip && (
            <div className="recipe-tip-box">
              <strong>✨ Segredo da Receita:</strong> {recipe.chefTip}
            </div>
          )}

          {/* Embedded YouTube Video Player */}
          {recipe.youtubeEmbedUrl && (
            <div className="recipe-block">
              <h3 className="recipe-section-title">▶️ Vídeo da Receita (YouTube)</h3>
              <div className="recipe-video-embed">
                <iframe
                  src={recipe.youtubeEmbedUrl}
                  title={`Vídeo da receita: ${recipe.title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {recipe.youtubeWatchUrl && (
                <p style={{ marginTop: '8px', fontSize: '13px' }}>
                  <a href={recipe.youtubeWatchUrl} target="_blank" rel="noopener noreferrer" className="text-link">
                    Assistir diretamente no YouTube →
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      );
    } catch {
      return (
        <div className="claude-text-response">
          <div className="paragraph-with-link-badge">
            <a 
              href={`https://www.google.com/search?q=receita+${encodeURIComponent(q)}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-source-badge"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span>Receitas</span>
            </a>
            <span>Buscar receita de "{q}" no Google.</span>
          </div>
        </div>
      );
    }
  };

  // 6. BUSCA GERAL CATEGORY (Rich Wikipedia PT & Web Extractor with in-paragraph link badge)
  const renderGeralCategory = async (q: string) => {
    try {
      const wiki = await searchWikipediaPt(q);
      const ddgRes = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`);
      const ddgData = await ddgRes.json();
      const abstract = wiki?.extract || ddgData.AbstractText || ddgData.Answer || '';
      const source = wiki ? 'Wikipédia' : (ddgData.AbstractSource || 'Google Web');
      const sourceUrl = wiki?.url || ddgData.AbstractURL || `https://www.google.com/search?q=${encodeURIComponent(q)}`;

      return (
        <div className="claude-text-response">
          {wiki?.thumbnail && (
            <div style={{ margin: '8px 0', maxWidth: '320px' }}>
              <img 
                src={wiki.thumbnail} 
                alt={wiki.title} 
                style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '12px' }} 
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {abstract ? (
            <div className="paragraph-with-link-badge">
              <a 
                href={sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-source-badge"
                title={`Fonte: ${source}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span>{source}</span>
              </a>
              <span style={{ lineHeight: '1.65', fontSize: '15px' }}>
                <TypewriterText text={abstract} speedMs={8} />
              </span>
            </div>
          ) : (
            <div className="paragraph-with-link-badge">
              <a 
                href={`https://www.google.com/search?q=${encodeURIComponent(q)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-source-badge"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span>Google</span>
              </a>
              <span>Aqui estão os melhores resultados encontrados na internet para <strong>"{q}"</strong>.</span>
            </div>
          )}

          <div style={{ marginTop: '14px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <a href={`https://www.google.com/search?q=${encodeURIComponent(q)}`} target="_blank" rel="noopener noreferrer" className="text-link">
              🔍 Buscar no Google →
            </a>
            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`} target="_blank" rel="noopener noreferrer" className="text-link">
              ▶ Buscar no YouTube →
            </a>
            <a href={`https://duckduckgo.com/?q=${encodeURIComponent(q)}`} target="_blank" rel="noopener noreferrer" className="text-link">
              🦆 DuckDuckGo →
            </a>
          </div>
        </div>
      );
    } catch {
      return (
        <div className="claude-text-response">
          <div className="paragraph-with-link-badge">
            <a 
              href={`https://www.google.com/search?q=${encodeURIComponent(q)}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-source-badge"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span>Google</span>
            </a>
            <span>Resultados para <strong>"{q}"</strong>:</span>
          </div>
          <div style={{ marginTop: '10px', display: 'flex', gap: '16px' }}>
            <a href={`https://www.google.com/search?q=${encodeURIComponent(q)}`} target="_blank" rel="noopener noreferrer" className="text-link">
              Buscar no Google →
            </a>
            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`} target="_blank" rel="noopener noreferrer" className="text-link">
              Buscar no YouTube →
            </a>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="buscol-page-container">
      {/* Exact Styling Matching Claude Mobile / Desktop Sidebar & Borderless UI */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital@0;1&family=Inter:wght@400;500;600&display=swap');

        .buscol-page-container {
          --bg: #141413;
          --sidebar-bg: #111110;
          --panel: #1e1e1d;
          --panel2: #282726;
          --text: #edece9;
          --sub: #908e89;
          --accent: #d97757;
          
          margin: 0;
          background: var(--bg);
          color: var(--text);
          font-family: "Inter", system-ui, sans-serif;
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
          position: relative;
        }

        /* Topbar */
        .buscol-page-container .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          flex-shrink: 0;
          background: var(--bg);
          z-index: 20;
        }

        .buscol-page-container .icon-btn {
          background: none;
          border: none;
          color: var(--sub);
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .buscol-page-container .icon-btn:hover {
          color: var(--text);
          background: var(--panel);
        }

        /* Sidebar Drawer (Exact layout from IMG_0527.png) */
        .buscol-page-container .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(3px);
          z-index: 90;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
        }
        .buscol-page-container .sidebar-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }

        .buscol-page-container .sidebar-drawer {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 82%;
          max-width: 320px;
          background: var(--sidebar-bg);
          z-index: 100;
          display: flex;
          flex-direction: column;
          padding: 18px 16px;
          transform: translateX(-100%);
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 10px 0 30px rgba(0,0,0,0.5);
        }
        .buscol-page-container .sidebar-drawer.open {
          transform: translateX(0);
        }

        /* Sidebar Title */
        .buscol-page-container .sidebar-brand {
          font-family: "Source Serif 4", serif;
          font-size: 26px;
          color: #f3f1ee;
          font-weight: 400;
          margin-bottom: 22px;
          padding: 0 4px;
          letter-spacing: -0.01em;
        }

        /* Sidebar Nav Links */
        .buscol-page-container .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 22px;
        }

        .buscol-page-container .nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 12px;
          border-radius: 12px;
          font-size: 15px;
          color: var(--text);
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          width: 100%;
          font-weight: 400;
          transition: background 0.15s ease;
        }
        .buscol-page-container .nav-item:hover {
          background: var(--panel);
        }
        .buscol-page-container .nav-item.active {
          background: var(--panel2);
        }
        .buscol-page-container .nav-item svg {
          width: 18px;
          height: 18px;
          color: #bdbab4;
          flex-shrink: 0;
        }

        /* Sidebar Recents Section */
        .buscol-page-container .recents-header {
          font-size: 13px;
          color: var(--sub);
          padding: 0 12px 8px;
          font-weight: 400;
        }

        .buscol-page-container .recents-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .buscol-page-container .recent-item {
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 14px;
          color: var(--text);
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
          transition: background 0.15s ease;
        }
        .buscol-page-container .recent-item:hover {
          background: var(--panel);
        }
        .buscol-page-container .recent-item.active {
          background: var(--panel2);
          font-weight: 500;
        }

        /* Sidebar Bottom Footer (+ Novo bate-papo full width button) */
        .buscol-page-container .sidebar-footer {
          margin-top: auto;
          padding-top: 14px;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .buscol-page-container .new-chat-pill {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #ffffff;
          color: #000000;
          padding: 11px 20px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          width: 100%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: transform 0.1s ease, opacity 0.15s ease;
        }
        .buscol-page-container .new-chat-pill:active {
          transform: scale(0.98);
        }

        /* Main Chat Stage */
        .buscol-page-container .stage {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10px 16px 110px 16px;
          overflow-y: auto;
        }
        .buscol-page-container .stage.has-feed {
          justify-content: flex-start;
        }

        .buscol-page-container .hero {
          text-align: center;
          transition: opacity .3s ease;
        }

        .buscol-page-container .hero .mark {
          width: 38px;
          height: 38px;
          margin: 0 auto 18px;
          color: var(--accent);
        }

        .buscol-page-container .hero h1 {
          font-family: "Source Serif 4", serif;
          font-style: italic;
          font-weight: 400;
          font-size: 32px;
          color: #d8d5cf;
          margin: 0;
        }

        .buscol-page-container .feed {
          width: 100%;
          max-width: 640px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding-bottom: 20px;
        }

        /* User Message Bubble */
        .buscol-page-container .bubble-user {
          align-self: flex-end;
          background: var(--panel2);
          color: var(--text);
          padding: 10px 16px;
          border-radius: 16px;
          font-size: 15px;
          max-width: 85%;
          line-height: 1.45;
        }

        /* Kaise AI Response (Pure Text, No Box/Border) */
        .buscol-page-container .bubble-claude {
          align-self: flex-start;
          width: 100%;
          color: var(--text);
          font-size: 15px;
          line-height: 1.6;
        }

        .buscol-page-container .claude-text-response {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .buscol-page-container .claude-text-response p {
          margin: 0;
        }

        /* Source Link in front of paragraphs */
        .buscol-page-container .paragraph-with-link-badge {
          display: block;
          line-height: 1.65;
          font-size: 15px;
          color: var(--text);
        }
        .buscol-page-container .inline-source-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 9px;
          border-radius: 6px;
          background: rgba(217, 119, 87, 0.14);
          color: var(--accent);
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          margin-right: 8px;
          vertical-align: middle;
          border: 1px solid rgba(217, 119, 87, 0.25);
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .buscol-page-container .inline-source-badge:hover {
          background: rgba(217, 119, 87, 0.26);
          color: #ffffff;
          border-color: var(--accent);
        }

        .buscol-page-container .text-link {
          color: var(--accent);
          text-decoration: none;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .buscol-page-container .text-link:hover {
          text-decoration: underline;
        }

        /* Code Block Container (Clean, Modern Dark, No Border) */
        .buscol-page-container .code-block-container {
          background: #1e1e1d;
          border-radius: 12px;
          overflow: hidden;
          margin-top: 8px;
        }

        .buscol-page-container .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 14px;
          background: #252423;
          font-size: 12px;
          color: var(--sub);
          font-weight: 500;
        }

        .buscol-page-container .copy-text-btn {
          background: none;
          border: none;
          color: var(--accent);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .buscol-page-container .copy-text-btn:hover {
          background: rgba(217, 119, 87, 0.15);
        }

        .buscol-page-container .code-content {
          margin: 0;
          padding: 12px 14px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 13px;
          color: #e6e4df;
          overflow-x: auto;
          line-height: 1.5;
        }

        /* Sports score clean row */
        .buscol-page-container .score-clean-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #1e1e1d;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13.5px;
        }
        .buscol-page-container .score-clean-row .team-name {
          flex: 1;
          font-weight: 500;
        }
        .buscol-page-container .score-clean-row .score-badge {
          color: var(--accent);
          font-weight: 600;
          padding: 0 12px;
        }

        /* Recipe Interactive Options Grid */
        .buscol-page-container .recipe-options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 8px;
          margin-top: 12px;
        }

        .buscol-page-container .recipe-option-card {
          background: #1e1e1d;
          border: none;
          border-radius: 12px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          text-align: left;
          color: inherit;
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .buscol-page-container .recipe-option-card:hover {
          background: #282726;
          transform: translateY(-1px);
        }
        .buscol-page-container .recipe-option-card:active {
          transform: scale(0.98);
        }
        .buscol-page-container .option-icon {
          font-size: 22px;
          flex-shrink: 0;
        }
        .buscol-page-container .option-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .buscol-page-container .option-title {
          font-size: 13.5px;
          font-weight: 500;
          color: var(--text);
        }
        .buscol-page-container .option-desc {
          font-size: 12px;
          color: var(--sub);
          line-height: 1.3;
        }
        .buscol-page-container .option-arrow {
          color: var(--sub);
          font-size: 14px;
          font-weight: 600;
        }

        /* Recipe Full Detail Card */
        .buscol-page-container .recipe-full-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .buscol-page-container .recipe-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .buscol-page-container .recipe-tag {
          align-self: flex-start;
          background: rgba(217, 119, 87, 0.14);
          color: var(--accent);
          font-size: 11.5px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
          letter-spacing: 0.02em;
        }

        .buscol-page-container .recipe-title {
          font-size: 20px;
          font-weight: 600;
          color: #f3f1ee;
          margin: 4px 0 2px;
        }

        .buscol-page-container .recipe-desc {
          font-size: 14px;
          color: #c4c1ba;
          line-height: 1.5;
        }

        /* Recipe Metrics Row */
        .buscol-page-container .recipe-metrics-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin: 4px 0;
        }

        .buscol-page-container .metric-item {
          background: #1e1e1d;
          padding: 8px 10px;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 2px;
        }
        .buscol-page-container .metric-label {
          font-size: 11px;
          color: var(--sub);
        }
        .buscol-page-container .metric-val {
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
        }

        /* Recipe Image */
        .buscol-page-container .recipe-image-wrap {
          border-radius: 12px;
          overflow: hidden;
          margin: 4px 0;
        }
        .buscol-page-container .recipe-main-img {
          width: 100%;
          max-height: 240px;
          object-fit: cover;
          display: block;
        }

        /* Recipe Blocks */
        .buscol-page-container .recipe-block {
          margin-top: 8px;
        }
        .buscol-page-container .recipe-section-title {
          font-size: 15px;
          font-weight: 600;
          color: #f3f1ee;
          margin: 0 0 8px 0;
        }
        .buscol-page-container .recipe-subsection-title {
          font-size: 13.5px;
          font-weight: 500;
          color: var(--sub);
          margin: 0 0 6px 0;
        }

        .buscol-page-container .recipe-ingredients-list {
          list-style: disc;
          padding-left: 20px;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 14px;
          color: #dedcd7;
          line-height: 1.5;
        }

        .buscol-page-container .recipe-steps-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .buscol-page-container .recipe-steps-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14px;
          line-height: 1.5;
          color: #dedcd7;
        }
        .buscol-page-container .step-num {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--panel2);
          color: var(--accent);
          font-weight: 600;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .buscol-page-container .step-text {
          flex: 1;
        }

        /* Chef Tip Box */
        .buscol-page-container .recipe-tip-box {
          background: rgba(217, 119, 87, 0.08);
          border-left: 3px solid var(--accent);
          padding: 10px 14px;
          border-radius: 0 8px 8px 0;
          font-size: 13.5px;
          line-height: 1.5;
          color: #e5e3de;
          margin-top: 6px;
        }

        /* YouTube Video Embed Box */
        .buscol-page-container .recipe-video-embed {
          position: relative;
          padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
          height: 0;
          overflow: hidden;
          border-radius: 12px;
          background: #000;
          margin-top: 6px;
        }
        .buscol-page-container .recipe-video-embed iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        /* Clean Plain-Text Thinking Animation (No Background Box / No Trança) */
        .buscol-page-container .thinking-plain-animation {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14.5px;
          font-weight: 500;
          color: #c9c6bc;
          padding: 4px 0;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }

        .buscol-page-container .thinking-plain-icon {
          font-size: 16px;
          line-height: 1;
          animation: pulse-icon 1.5s ease-in-out infinite alternate;
        }

        @keyframes pulse-icon {
          0% { transform: scale(0.92); opacity: 0.8; }
          100% { transform: scale(1.1); opacity: 1; }
        }

        .buscol-page-container .thinking-plain-text {
          color: #d1cebc;
          font-weight: 450;
          letter-spacing: -0.01em;
          transition: color 0.2s ease;
        }

        .buscol-page-container .thinking-dots {
          display: inline-flex;
          gap: 3.5px;
          align-items: center;
          margin-left: 2px;
        }

        .buscol-page-container .thinking-dots .dot {
          width: 3.5px;
          height: 3.5px;
          border-radius: 50%;
          background: #d97757;
          opacity: 0.3;
          animation: dot-wave 1.4s infinite;
        }
        .buscol-page-container .thinking-dots .dot-1 {
          animation-delay: 0s;
        }
        .buscol-page-container .thinking-dots .dot-2 {
          animation-delay: 0.25s;
        }
        .buscol-page-container .thinking-dots .dot-3 {
          animation-delay: 0.5s;
        }

        @keyframes dot-wave {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-2.5px); }
        }

        @keyframes dot-wave {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-2px); }
        }

        /* Clean Borderless Input Dock Fixed at Screen Bottom */
        .buscol-page-container .dockwrap {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 10px 14px 20px;
          flex-shrink: 0;
          background: linear-gradient(to top, var(--bg) 80%, transparent);
          z-index: 40;
        }

        .buscol-page-container .dock {
          max-width: 640px;
          margin: 0 auto;
          background: #232221;
          border-radius: 26px;
          padding: 10px 14px 10px 18px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          border: none;
        }

        .buscol-page-container .dock form {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .buscol-page-container .dock input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          font-size: 15.5px;
          font-family: inherit;
        }

        .buscol-page-container .dock input::placeholder {
          color: #797773;
        }

        .buscol-page-container .send-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #edece9;
          color: #141413;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: transform 0.1s ease, background 0.15s ease;
        }
        .buscol-page-container .send-btn:hover {
          background: #ffffff;
        }
        .buscol-page-container .send-btn:active {
          transform: scale(0.93);
        }
      `}</style>

      {/* Sidebar Drawer Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Drawer (Clean, Kaise Rebranded, Chat History Only) */}
      <aside className={`sidebar-drawer ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">Kaise</div>

        <div className="recents-header">Histórico de conversas</div>

        <div className="recents-list">
          {sessions.map(s => (
            <button
              key={s.id}
              className={`recent-item ${s.id === currentSessionId ? 'active' : ''}`}
              onClick={() => handleSelectSession(s.id)}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Sidebar Footer with New Chat Button */}
        <div className="sidebar-footer">
          <button className="new-chat-pill" onClick={handleNewChat}>
            <span>+</span>
            <span>Novo bate-papo</span>
          </button>
        </div>
      </aside>

      {/* Topbar with Hamburger Menu Icon */}
      <div className="topbar">
        <button 
          className="icon-btn" 
          onClick={() => setIsSidebarOpen(true)}
          title="Abrir Menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>

        <button 
          className="icon-btn" 
          onClick={handleNewChat}
          title="Novo bate-papo"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Stage / Feed Area */}
      <div className={`stage ${messages.length > 0 ? 'has-feed' : ''}`} ref={stageRef}>
        {messages.length === 0 && (
          <div className="hero">
            <svg className="mark" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0 L13.2 9.8 L23 11 L13.2 12.2 L12 22 L10.8 12.2 L1 11 L10.8 9.8 Z" />
            </svg>
            <h1>Vamos pesquisar</h1>
          </div>
        )}

        {messages.length > 0 && (
          <div className="feed">
            {messages.map((m) => (
              <React.Fragment key={m.id}>
                {m.type === 'user' ? (
                  <div className="bubble-user">{m.content}</div>
                ) : (
                  <div className="bubble-claude">{m.htmlContent}</div>
                )}
              </React.Fragment>
            ))}

            {/* Dynamic Animated Thinking Status (Pure Clean Plain Text, No Background Box) */}
            {isLoading && (
              <div className="bubble-claude">
                <div className="thinking-plain-animation">
                  <span className="thinking-plain-icon">{thinkingStatus.icon}</span>
                  <span className="thinking-plain-text">{thinkingStatus.text}</span>
                  <span className="thinking-dots">
                    <span className="dot dot-1" />
                    <span className="dot dot-2" />
                    <span className="dot dot-3" />
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Clean Borderless Input Dock */}
      <div className="dockwrap">
        <div className="dock">
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Pergunte alguma coisa..."
              autoComplete="off"
            />
            <button className="send-btn" type="submit" title="Enviar">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="6 11 12 5 18 11" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
