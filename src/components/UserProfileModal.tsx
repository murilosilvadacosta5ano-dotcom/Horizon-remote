import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  LogOut, 
  X, 
  Check, 
  Heart, 
  Download, 
  Copy, 
  Sparkles, 
  ShieldCheck, 
  Trash2,
  ExternalLink,
  Settings,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { UserProfile, SavedFavoriteGif } from '../types';
import { 
  logoutUser, 
  performRealGoogleSignIn, 
  acceptTermsForUser,
  toggleFavorite,
  getAutoRedirectPreference,
  setAutoRedirectPreference,
  redirectToAuthorizedDomain
} from '../services/authService';
import { TermsConsentModal } from './TermsConsentModal';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
  onShowToast: (msg: string) => void;
  onNavigate?: (path: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  onShowToast,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites'>('profile');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [pendingTermsUser, setPendingTermsUser] = useState<UserProfile | null>(null);
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  // Real Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const user = await performRealGoogleSignIn();

      if (!user.termsAccepted) {
        setPendingTermsUser(user);
        setIsTermsOpen(true);
        onShowToast('Conta Google verificada! Revise e confirme os termos de uso.');
      } else {
        onUserChange(user);
        onShowToast(`Conectado com sucesso com a conta Google de ${user.name}! 🎉`);
        onClose();
      }
    } catch (err: any) {
      const msg = err?.message || 'Erro ao realizar login com o Google. Tente novamente.';
      setLoginError(msg);
      onShowToast('Erro ao realizar login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAcceptTerms = (user: UserProfile) => {
    const verifiedUser = acceptTermsForUser(user);
    onUserChange(verifiedUser);
    setPendingTermsUser(null);
    setIsTermsOpen(false);
    onShowToast(`Termos aceitos! Bem-vindo(a), ${verifiedUser.name}! 🎉`);
    onClose();
  };

  const handleDeclineTerms = () => {
    setIsTermsOpen(false);
    setPendingTermsUser(null);
    setLoginError('Login cancelado: os termos de uso não foram aceitos.');
    onShowToast('Login cancelado.');
  };

  // Logout Handler
  const handleLogout = () => {
    logoutUser();
    onUserChange(null);
    onShowToast('Você saiu da sua conta Google.');
    onClose();
  };

  // Remove Favorite
  const handleRemoveFavorite = (fav: SavedFavoriteGif) => {
    const { favorites } = toggleFavorite(fav);
    if (currentUser) {
      onUserChange({ ...currentUser, favorites });
    }
    onShowToast('Figurinha removida dos favoritos.');
  };

  // Copy link
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    onShowToast('Link da figurinha copiado! 📋');
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-[#16222f] rounded-3xl border border-[#253241] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#253241] flex items-center justify-between bg-[#121922]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-md">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                  <span>{currentUser ? 'Perfil do Usuário' : 'Conta Google'}</span>
                  {currentUser && (
                    <span className="px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#10b981] text-[10px] font-bold border border-[#10b981]/30">
                      Conectado
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-[#8293a4]">
                  {currentUser ? 'Gerencie seu perfil e figurinhas salvas' : 'Faça login com sua conta Google'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#1c2733] hover:bg-[#253241] text-[#8293a4] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
            {loginError && (
              <div className="bg-[#ef4444]/15 border border-[#ef4444]/40 rounded-2xl p-3.5 text-xs text-white flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#ef4444] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">!</div>
                <div>
                  <h4 className="font-extrabold text-[#ef4444]">Erro ao realizar login</h4>
                  <p className="text-[#fca5a5] mt-0.5 text-[11px] leading-tight">{loginError}</p>
                </div>
              </div>
            )}

            {!currentUser ? (
              /* --- STATE: LOGGED OUT --- */
              <div className="space-y-4 py-2">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-[#2481cc]/20 to-[#10b981]/20 border border-[#2481cc]/40 flex items-center justify-center shadow-xl">
                    <Sparkles className="w-7 h-7 text-[#2aabee]" />
                  </div>
                  <h3 className="text-base font-black text-white">
                    Login Seguro com o Google
                  </h3>
                  <p className="text-xs text-[#8293a4] leading-relaxed">
                    Entre com sua conta Google para salvar figurinhas favoritas, comentar nos GIFs e acessar seu perfil.
                  </p>
                </div>

                <div className="p-3 bg-[#0e1621] rounded-2xl border border-[#253241] text-[11px] text-[#708499] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#10b981] shrink-0" />
                  <span>Seu e-mail é estritamente confidencial e nunca é exposto a ninguém.</span>
                </div>

                {/* Google Sign In CTA */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoggingIn}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-white/10 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#4285F4]" />
                      <span>Abrindo Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                      </svg>
                      <span>Entrar com a Conta Google</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* --- STATE: LOGGED IN --- */
              <div className="space-y-4">
                {/* User Info Header */}
                <div className="bg-[#0e1621] p-3.5 rounded-2xl border border-[#253241] flex items-center gap-3.5">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.nickname || currentUser.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.nickname || currentUser.name)}&background=2481cc&color=fff&size=150`;
                    }}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#2481cc] shadow-md shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-white truncate">
                      {currentUser.nickname || currentUser.name}
                    </h3>
                    <p className="text-xs text-[#2aabee] font-mono font-bold">
                      {currentUser.username}
                    </p>
                    <p className="text-[11px] text-[#708499] truncate mt-0.5">
                      {currentUser.bio || 'Membro verificado'}
                    </p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 border-b border-[#253241] pb-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      activeTab === 'profile'
                        ? 'bg-[#2481cc] text-white'
                        : 'text-[#8293a4] hover:text-white'
                    }`}
                  >
                    Opções
                  </button>
                  <button
                    onClick={() => setActiveTab('favorites')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'favorites'
                        ? 'bg-[#2481cc] text-white'
                        : 'text-[#8293a4] hover:text-white'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 text-[#ef4444]" />
                    <span>Favoritos ({currentUser.favorites?.length || 0})</span>
                  </button>
                </div>

                {activeTab === 'profile' ? (
                  <div className="space-y-2.5">
                    <button
                      onClick={() => {
                        onClose();
                        if (onNavigate) onNavigate('/perfil');
                      }}
                      className="w-full py-2.5 px-3.5 rounded-xl bg-[#1c2733] hover:bg-[#253241] text-white text-xs font-bold flex items-center justify-between border border-[#253241] cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#2aabee]" />
                        <span>Ver Página Completa de Perfil</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#708499]" />
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        if (onNavigate) onNavigate('/config');
                      }}
                      className="w-full py-2.5 px-3.5 rounded-xl bg-[#1c2733] hover:bg-[#253241] text-white text-xs font-bold flex items-center justify-between border border-[#253241] cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-[#2aabee]" />
                        <span>Mudar Apelido ou Foto do Smartphone</span>
                      </span>
                      <Edit3 className="w-3.5 h-3.5 text-[#708499]" />
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 px-3.5 rounded-xl bg-[#ef4444]/15 hover:bg-[#ef4444]/25 text-[#ef4444] text-xs font-bold flex items-center justify-center gap-2 border border-[#ef4444]/30 cursor-pointer pt-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair da Conta Google</span>
                    </button>
                  </div>
                ) : (
                  /* Favorites List */
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {currentUser.favorites && currentUser.favorites.length > 0 ? (
                      currentUser.favorites.map((fav) => (
                        <div
                          key={fav.id}
                          className="flex items-center gap-3 bg-[#0e1621] p-2 rounded-xl border border-[#253241]"
                        >
                          <img
                            src={fav.url}
                            alt={fav.title}
                            className="w-12 h-12 rounded-lg object-cover bg-black shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{fav.title}</h4>
                            <span className="text-[10px] text-[#2aabee] font-semibold">{fav.category}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleCopyLink(fav.url)}
                              className="p-1.5 rounded-lg bg-[#1c2733] hover:bg-[#253241] text-[#8293a4] hover:text-white"
                              title="Copiar Link"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveFavorite(fav)}
                              className="p-1.5 rounded-lg bg-[#ef4444]/20 hover:bg-[#ef4444]/40 text-[#ef4444]"
                              title="Remover"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#708499] text-center py-6">
                        Nenhuma figurinha salva como favorita ainda.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Terms of Use Consent Modal */}
      {pendingTermsUser && (
        <TermsConsentModal
          isOpen={isTermsOpen}
          user={pendingTermsUser}
          onAccept={() => handleAcceptTerms(pendingTermsUser)}
          onDecline={handleDeclineTerms}
        />
      )}
    </AnimatePresence>
  );
};
