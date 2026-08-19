import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  ArrowLeft, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Globe, 
  ArrowRight, 
  RefreshCw, 
  User, 
  Mail, 
  Calendar, 
  KeyRound,
  LogOut,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';
import { 
  performGoogleLogin, 
  getStoredUser, 
  logoutUser, 
  redirectToAuthorizedDomain, 
  getAutoRedirectPreference, 
  setAutoRedirectPreference,
  DEFAULT_AUTHORIZED_REDIRECT_URL,
  AUTH_API_KEY
} from '../services/authService';

interface LoginPageProps {
  onNavigate: (path: string) => void;
  onShowToast: (msg: string) => void;
  onUserChange?: (user: UserProfile | null) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigate,
  onShowToast,
  onUserChange
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getStoredUser());
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [autoRedirect, setAutoRedirect] = useState<boolean>(() => getAutoRedirectPreference());
  const [redirectTarget, setRedirectTarget] = useState<string>(DEFAULT_AUTHORIZED_REDIRECT_URL);
  
  // Custom account form state for Google Profile preview
  const [name, setName] = useState<string>('Murilo Silva');
  const [email, setEmail] = useState<string>('murilosilvadacosta5ano@gmail.com');
  const [birthDate, setBirthDate] = useState<string>('2012-05-14');
  const [avatar, setAvatar] = useState<string>('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');

  // Handle countdown if logged in and autoRedirect is enabled
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentUser && autoRedirect && redirectCountdown !== null && redirectCountdown > 0) {
      timer = setTimeout(() => {
        setRedirectCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (currentUser && autoRedirect && redirectCountdown === 0) {
      handlePerformRedirect();
    }
    return () => clearTimeout(timer);
  }, [currentUser, autoRedirect, redirectCountdown]);

  // When autoRedirect preference changes
  const handleToggleAutoRedirect = (enabled: boolean) => {
    setAutoRedirect(enabled);
    setAutoRedirectPreference(enabled);
    if (!enabled) {
      setRedirectCountdown(null);
    } else if (currentUser) {
      setRedirectCountdown(3);
    }
  };

  const handlePerformRedirect = () => {
    onShowToast(`Redirecionando login autorizado para ${redirectTarget}... 🚀`);
    setTimeout(() => {
      redirectToAuthorizedDomain(currentUser, redirectTarget);
    }, 400);
  };

  // Google Login execution
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const user = await performGoogleLogin({
        name: name.trim() || 'Murilo Silva',
        email: email.trim() || 'murilosilvadacosta5ano@gmail.com',
        avatar: avatar,
        birthDate: birthDate || '2012-05-14'
      });
      
      setCurrentUser(user);
      if (onUserChange) onUserChange(user);
      onShowToast(`Autenticado com sucesso como ${user.name}! 🎉`);

      if (autoRedirect) {
        setRedirectCountdown(3);
      }
    } catch {
      onShowToast('Erro ao autenticar com o Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setRedirectCountdown(null);
    if (onUserChange) onUserChange(null);
    onShowToast('Sessão Google encerrada.');
  };

  return (
    <div className="min-h-screen bg-[#0e1621] text-[#f5f5f5] flex flex-col items-center selection:bg-[#2481cc]/30 py-6 px-4">
      {/* Top Header */}
      <header className="w-full max-w-xl flex items-center justify-between pb-6 border-b border-[#1c2733]/80 mb-6">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2 py-2 px-3 rounded-2xl bg-[#1c2733] hover:bg-[#253241] text-xs font-bold text-[#8293a4] hover:text-white transition-all cursor-pointer border border-[#253241]"
          title="Voltar para a Galeria"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </button>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('/')}>
          <Zap className="w-5 h-5 text-[#2aabee]" />
          <span className="text-base font-black text-white uppercase tracking-tight">Kaise Auth</span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#10b981]/10 border border-[#10b981]/30 py-1.5 px-3 rounded-full text-[11px] font-bold text-[#10b981]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>OAuth 2.0</span>
        </div>
      </header>

      {/* Main Login / Redirect Card */}
      <main className="w-full max-w-xl space-y-6">
        
        {/* Status Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#17212b] border border-[#232e3c] rounded-3xl p-6 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#2481cc]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Google Login & Redirecionamento</h2>
              <p className="text-xs text-[#8293a4]">
                Autorização com destino para <span className="text-[#2aabee] font-bold">www.kaise.space</span>
              </p>
            </div>
          </div>

          {/* If Logged In */}
          {currentUser ? (
            <div className="space-y-4 pt-2">
              <div className="bg-[#0e1621] border border-[#232e3c] rounded-2xl p-4 flex items-center gap-3.5">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#2aabee]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-white truncate">{currentUser.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#10b981] text-[10px] font-bold">
                      Autorizado
                    </span>
                  </div>
                  <p className="text-xs text-[#8293a4] truncate">{currentUser.email}</p>
                  {currentUser.birthDate && (
                    <p className="text-[11px] text-[#708499] mt-0.5">
                      Nascimento: {new Date(currentUser.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>

              {/* Redirection Alert / Action */}
              <div className="bg-[#2481cc]/10 border border-[#2481cc]/30 rounded-2xl p-4 text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#2aabee]">
                  <Globe className="w-4 h-4" />
                  <span>Destino Autorizado: {redirectTarget}</span>
                </div>

                {autoRedirect && redirectCountdown !== null ? (
                  <div className="space-y-2">
                    <p className="text-xs text-white font-medium">
                      Redirecionando automaticamente em <span className="font-black text-[#2aabee] text-base">{redirectCountdown}s</span>...
                    </p>
                    <div className="w-full bg-[#1c2733] h-1.5 rounded-full overflow-hidden">
                      <motion.div 
                        className="bg-[#2aabee] h-full"
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: 3, ease: 'linear' }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#8293a4]">
                    Sessão autorizada e sincronizada com sucesso.
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={handlePerformRedirect}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#2481cc] hover:bg-[#2074b7] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#2481cc]/20 cursor-pointer transition-all active:scale-95"
                  >
                    <span>Ir para www.kaise.space agora</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onNavigate('/')}
                    className="py-3 px-4 rounded-xl bg-[#1c2733] hover:bg-[#253241] text-[#8293a4] hover:text-white font-bold text-xs cursor-pointer transition-all border border-[#253241]"
                  >
                    Explorar Figurinhas
                  </button>
                </div>
              </div>

              {/* Logout Option */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleLogout}
                  className="text-xs text-[#ef4444] hover:underline font-bold flex items-center gap-1.5 cursor-pointer py-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Trocar ou sair da conta</span>
                </button>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoRedirectCheckbox"
                    checked={autoRedirect}
                    onChange={(e) => handleToggleAutoRedirect(e.target.checked)}
                    className="rounded border-[#253241] text-[#2481cc] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="autoRedirectCheckbox" className="text-xs text-[#8293a4] cursor-pointer">
                    Redirecionar automaticamente
                  </label>
                </div>
              </div>
            </div>
          ) : (
            /* If Not Logged In */
            <div className="space-y-5 pt-2">
              <p className="text-xs text-[#8293a4] leading-relaxed">
                Clique no botão abaixo para fazer login com a sua conta Google. Ao autorizar, você será autenticado e redirecionado para <strong className="text-white">www.kaise.space</strong>.
              </p>

              {/* Quick Account Profile Customizer */}
              <div className="bg-[#0e1621] border border-[#232e3c] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#8293a4]">
                  <span>Perfil do Google</span>
                  <span className="text-[10px] text-[#2aabee]">Dados da Sessão</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] text-[#708499] block mb-1">Nome Completo</label>
                    <div className="flex items-center gap-2 bg-[#17212b] border border-[#253241] rounded-xl px-3 py-2">
                      <User className="w-3.5 h-3.5 text-[#8293a4]" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-transparent text-xs text-white outline-none w-full font-medium"
                        placeholder="Seu Nome"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#708499] block mb-1">E-mail Google</label>
                    <div className="flex items-center gap-2 bg-[#17212b] border border-[#253241] rounded-xl px-3 py-2">
                      <Mail className="w-3.5 h-3.5 text-[#8293a4]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-transparent text-xs text-white outline-none w-full font-medium"
                        placeholder="seuemail@gmail.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#708499] block mb-1">Data de Nascimento</label>
                    <div className="flex items-center gap-2 bg-[#17212b] border border-[#253241] rounded-xl px-3 py-2">
                      <Calendar className="w-3.5 h-3.5 text-[#8293a4]" />
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="bg-transparent text-xs text-white outline-none w-full font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Redirection Options */}
              <div className="flex items-center justify-between bg-[#1c2733]/50 border border-[#253241] rounded-xl px-3.5 py-2.5">
                <div className="flex items-center gap-2 text-xs text-[#8293a4]">
                  <Globe className="w-4 h-4 text-[#2aabee]" />
                  <span>Redirecionar para <strong>www.kaise.space</strong> após login</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoRedirect}
                  onChange={(e) => handleToggleAutoRedirect(e.target.checked)}
                  className="rounded border-[#253241] text-[#2481cc] cursor-pointer"
                />
              </div>

              {/* Google Login CTA Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-white/10 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#4285F4]" />
                    <span>Conectando com o Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Fazer Login com Google</span>
                  </>
                )}
              </button>
            </div>
          )}

        </motion.div>

        {/* Security & API Info Card */}
        <div className="bg-[#17212b] border border-[#232e3c] rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <KeyRound className="w-4 h-4 text-[#2aabee]" />
            <span>Configurações de Autenticação Ativas</span>
          </div>

          <div className="space-y-2 text-xs text-[#8293a4]">
            <div className="flex items-center justify-between bg-[#0e1621] p-3 rounded-xl border border-[#232e3c]">
              <span className="font-mono text-[11px] text-[#708499]">Auth Key</span>
              <span className="font-mono text-[11px] text-[#10b981] font-bold">
                {AUTH_API_KEY.substring(0, 10)}...{AUTH_API_KEY.slice(-6)}
              </span>
            </div>

            <div className="flex items-center justify-between bg-[#0e1621] p-3 rounded-xl border border-[#232e3c]">
              <span className="text-[11px] text-[#708499]">Destino Redirecionamento</span>
              <span className="text-[11px] text-[#2aabee] font-bold">{redirectTarget}</span>
            </div>

            <div className="flex items-center justify-between bg-[#0e1621] p-3 rounded-xl border border-[#232e3c]">
              <span className="text-[11px] text-[#708499]">Rotas Disponíveis</span>
              <span className="text-[11px] text-white font-mono font-medium">/login, /auth/callback, /auth/google</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};
