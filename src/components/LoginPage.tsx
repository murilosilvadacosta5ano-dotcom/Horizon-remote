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
  LogOut, 
  Sparkles, 
  AlertCircle, 
  XCircle, 
  FileCheck,
  Settings,
  Heart
} from 'lucide-react';
import { UserProfile } from '../types';
import { 
  performRealGoogleSignIn, 
  getStoredUser, 
  logoutUser, 
  redirectToAuthorizedDomain, 
  getAutoRedirectPreference, 
  setAutoRedirectPreference,
  acceptTermsForUser,
  DEFAULT_AUTHORIZED_REDIRECT_URL
} from '../services/authService';
import { TermsConsentModal } from './TermsConsentModal';

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
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Pending user awaiting terms agreement
  const [pendingTermsUser, setPendingTermsUser] = useState<UserProfile | null>(null);
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);

  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [autoRedirect, setAutoRedirect] = useState<boolean>(() => getAutoRedirectPreference());
  const [redirectTarget, setRedirectTarget] = useState<string>(DEFAULT_AUTHORIZED_REDIRECT_URL);

  // Handle countdown if logged in, accepted terms, and autoRedirect is enabled
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentUser && currentUser.termsAccepted && autoRedirect && redirectCountdown !== null && redirectCountdown > 0) {
      timer = setTimeout(() => {
        setRedirectCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (currentUser && currentUser.termsAccepted && autoRedirect && redirectCountdown === 0) {
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
    } else if (currentUser && currentUser.termsAccepted) {
      setRedirectCountdown(3);
    }
  };

  const handlePerformRedirect = () => {
    onShowToast(`Redirecionando login autorizado para ${redirectTarget}... 🚀`);
    setTimeout(() => {
      redirectToAuthorizedDomain(currentUser, redirectTarget);
    }, 400);
  };

  // Real Google Login execution
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const user = await performRealGoogleSignIn();

      // Se o usuário ainda não aceitou os termos nesta sessão, abre a Tela de Termos de Uso
      if (!user.termsAccepted) {
        setPendingTermsUser(user);
        setIsTermsOpen(true);
        onShowToast('Conta Google verificada! Revise e confirme os termos de uso.');
      } else {
        setCurrentUser(user);
        if (onUserChange) onUserChange(user);
        onShowToast(`Autenticado com sucesso como ${user.name}! 🎉`);
        if (autoRedirect) {
          setRedirectCountdown(3);
        }
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Erro ao realizar login com o Google. Tente novamente.';
      setLoginError(errorMsg);
      onShowToast('Erro ao realizar login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Terms Acceptance
  const handleAcceptTerms = (user: UserProfile) => {
    const verifiedUser = acceptTermsForUser(user);
    setCurrentUser(verifiedUser);
    setPendingTermsUser(null);
    setIsTermsOpen(false);
    if (onUserChange) onUserChange(verifiedUser);
    onShowToast(`Termos aceitos com sucesso! Bem-vindo(a), ${verifiedUser.name}! 🎉`);

    if (autoRedirect) {
      setRedirectCountdown(3);
    }
  };

  const handleDeclineTerms = () => {
    setIsTermsOpen(false);
    setPendingTermsUser(null);
    setLoginError('O login foi cancelado porque os Termos de Uso não foram aceitos.');
    onShowToast('Login cancelado.');
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setPendingTermsUser(null);
    setRedirectCountdown(null);
    setLoginError(null);
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
          <span>Google OAuth 2.0</span>
        </div>
      </header>

      {/* Main Login / Redirect Card */}
      <main className="w-full max-w-xl space-y-6">
        
        {/* Error Alert Banner when login fails */}
        {loginError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#ef4444]/10 border border-[#ef4444]/40 rounded-2xl p-4 flex items-start gap-3 text-white shadow-lg shadow-[#ef4444]/10"
          >
            <XCircle className="w-5 h-5 text-[#ef4444] shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <h4 className="font-extrabold text-[#ef4444] text-sm">
                Erro ao realizar login
              </h4>
              <p className="text-[#fca5a5] mt-0.5 leading-relaxed">
                {loginError}
              </p>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="mt-2.5 text-xs font-bold text-white bg-[#ef4444] hover:bg-[#dc2626] px-3.5 py-1.5 rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Tentar Novamente</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Status Card (2016-era sleek style) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#17212b] border border-[#232e3c] rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between pb-5 border-b border-[#232e3c]">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-md shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">
                  Login com a Conta Google
                </h2>
                <p className="text-xs text-[#8293a4]">
                  Acesso seguro oficial com privacidade garantida
                </p>
              </div>
            </div>

            {currentUser ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#10b981] bg-[#10b981]/15 border border-[#10b981]/30 py-1.5 px-3 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Conectado</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#8293a4] bg-[#1c2733] border border-[#253241] py-1.5 px-3 rounded-xl">
                <Lock className="w-3.5 h-3.5" />
                <span>Desconectado</span>
              </span>
            )}
          </div>

          {/* Conditional Body */}
          {currentUser ? (
            /* Logged In State with Authentic Google Photo */
            <div className="space-y-5 pt-5">
              <div className="flex items-center gap-4 bg-[#0e1621] p-4 rounded-2xl border border-[#253241]">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.nickname || currentUser.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.nickname || currentUser.name)}&background=2481cc&color=fff&size=150`;
                  }}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#2481cc] shadow-lg shadow-[#2481cc]/20 shrink-0"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white truncate">
                      {currentUser.nickname || currentUser.name}
                    </h3>
                    <span className="text-[10px] font-bold text-[#2481cc] bg-[#2481cc]/20 px-2 py-0.5 rounded-md border border-[#2481cc]/30 shrink-0">
                      Google Verificado
                    </span>
                  </div>
                  <p className="text-xs text-[#2aabee] font-mono font-bold">
                    {currentUser.username}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-[#708499] pt-0.5">
                    <span className="flex items-center gap-1 text-[#10b981] font-semibold">
                      <FileCheck className="w-3 h-3" /> Termos Aceitos
                    </span>
                    <span>•</span>
                    <span>Favoritos: {currentUser.favorites?.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Action Links */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => onNavigate('/perfil')}
                  className="py-3 px-3 rounded-2xl bg-[#2481cc] hover:bg-[#1f70b0] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#2481cc]/20 cursor-pointer transition-transform active:scale-95"
                >
                  <User className="w-4 h-4" />
                  <span>Acessar Meu Perfil</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/config')}
                  className="py-3 px-3 rounded-2xl bg-[#1c2733] hover:bg-[#253241] text-white text-xs font-bold flex items-center justify-center gap-2 border border-[#253241] cursor-pointer transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#2aabee]" />
                  <span>Configurar Perfil / Foto</span>
                </button>
              </div>

              {/* Logout & Terms */}
              <div className="flex items-center justify-between pt-2 border-t border-[#232e3c]">
                <button
                  type="button"
                  onClick={() => {
                    setPendingTermsUser(currentUser);
                    setIsTermsOpen(true);
                  }}
                  className="text-xs font-bold text-[#8293a4] hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5 text-[#2aabee]" />
                  <span>Ver Termos de Uso</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="py-1.5 px-3 rounded-xl bg-[#ef4444]/15 hover:bg-[#ef4444]/25 text-xs font-bold text-[#ef4444] flex items-center gap-1.5 cursor-pointer border border-[#ef4444]/30"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair da Conta</span>
                </button>
              </div>
            </div>
          ) : (
            /* If Not Logged In - Clean Google Login */
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <p className="text-xs text-[#8293a4] leading-relaxed">
                  Conecte sua conta do Google de forma oficial e segura para salvar figurinhas favoritas, participar dos comentários nos GIFs e personalizar seu perfil público.
                </p>
                <div className="p-3 bg-[#0e1621] rounded-2xl border border-[#253241] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                    <span>Privacidade 100% Protegida</span>
                  </div>
                  <p className="text-[11px] text-[#708499] leading-relaxed">
                    Seu endereço de e-mail <strong>nunca</strong> é compartilhado ou exibido publicamente para outros usuários no site. Apenas seu apelido, @username e foto escolhida serão visíveis.
                  </p>
                </div>
              </div>

              {/* Google Login CTA Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="w-full py-4 px-5 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-white/10 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#4285F4]" />
                    <span>Abrindo autenticação oficial do Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Fazer Login com o Google</span>
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="bg-[#17212b] border border-[#232e3c] rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Heart className="w-4 h-4 text-[#ef4444]" />
              <span>Salvar Favoritos</span>
            </div>
            <p className="text-[11px] text-[#8293a4]">
              Guarde suas figurinhas e GIFs prediletos para acessar rapidamente em qualquer dispositivo.
            </p>
          </div>

          <div className="bg-[#17212b] border border-[#232e3c] rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Sparkles className="w-4 h-4 text-[#2aabee]" />
              <span>Comentar nos GIFs</span>
            </div>
            <p className="text-[11px] text-[#8293a4]">
              Interaja na comunidade nos GIFs, edite ou apague seus próprios comentários a qualquer momento.
            </p>
          </div>
        </div>

      </main>

      {/* Terms of Use Consent Modal */}
      {pendingTermsUser && (
        <TermsConsentModal
          isOpen={isTermsOpen}
          user={pendingTermsUser}
          onAccept={() => handleAcceptTerms(pendingTermsUser)}
          onDecline={handleDeclineTerms}
        />
      )}
    </div>
  );
};
