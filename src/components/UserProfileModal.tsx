import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Calendar, 
  Camera, 
  LogOut, 
  Save, 
  X, 
  Check, 
  Heart, 
  Download, 
  Copy, 
  Sparkles, 
  ShieldCheck, 
  Trash2,
  ExternalLink
} from 'lucide-react';
import { UserProfile, SavedFavoriteGif } from '../types';
import { 
  updateUserProfile, 
  logoutUser, 
  performGoogleLogin, 
  toggleFavorite,
  getAutoRedirectPreference,
  setAutoRedirectPreference,
  redirectToAuthorizedDomain,
  DEFAULT_AUTHORIZED_REDIRECT_URL
} from '../services/authService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
  onShowToast: (msg: string) => void;
  onNavigate?: (path: string) => void;
}

const GOOGLE_AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
];

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
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState<string>(currentUser?.name || 'Murilo Silva');
  const [email, setEmail] = useState<string>(currentUser?.email || 'murilosilvadacosta5ano@gmail.com');
  const [avatar, setAvatar] = useState<string>(currentUser?.avatar || GOOGLE_AVATAR_PRESETS[0]);
  const [birthDate, setBirthDate] = useState<string>(currentUser?.birthDate || '2012-05-14');
  const [showAvatarPicker, setShowAvatarPicker] = useState<boolean>(false);
  const [autoRedirect, setAutoRedirect] = useState<boolean>(() => getAutoRedirectPreference());

  // Sync form when currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setAvatar(currentUser.avatar);
      setBirthDate(currentUser.birthDate || '2012-05-14');
    }
  }, [currentUser]);

  if (!isOpen) return null;

  // Calculate age from birthDate
  const calculateAge = (dateString: string) => {
    if (!dateString) return null;
    const today = new Date();
    const birth = new Date(dateString);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return isNaN(age) || age < 0 ? null : age;
  };

  const currentAge = calculateAge(birthDate);

  // Toggle Auto-redirect
  const handleToggleAutoRedirect = (enabled: boolean) => {
    setAutoRedirect(enabled);
    setAutoRedirectPreference(enabled);
  };

  // Google Login Handler
  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const user = await performGoogleLogin({
        name: name.trim() || 'Murilo Silva',
        email: email.trim() || 'murilosilvadacosta5ano@gmail.com',
        avatar: avatar || GOOGLE_AVATAR_PRESETS[0],
        birthDate: birthDate || '2012-05-14'
      });
      onUserChange(user);
      onShowToast(`Conectado com sucesso com a conta Google de ${user.name}! 🎉`);

      if (autoRedirect) {
        setTimeout(() => {
          onShowToast('Redirecionando para www.kaise.space... 🚀');
          redirectToAuthorizedDomain(user);
        }, 1200);
      }
    } catch (e: any) {
      onShowToast('Falha no login com Google. Tente novamente.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Save Profile Handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!name.trim()) {
      onShowToast('Por favor, informe seu nome.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = updateUserProfile({
        name: name.trim(),
        email: email.trim(),
        avatar,
        birthDate
      });
      onUserChange(updated);
      onShowToast('Perfil atualizado com sucesso! ✨');
    } catch {
      onShowToast('Erro ao salvar dados.');
    } finally {
      setIsSaving(false);
    }
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
    onShowToast('Link da figurinha copiado!');
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-[#16222f] rounded-3xl border border-[#253241] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#253241] flex items-center justify-between bg-[#121922]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-md">
                {/* Google "G" Logo */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
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
                  {currentUser ? 'Gerencie seus dados e figurinhas salvas' : 'Faça login com sua conta Google'}
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
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {!currentUser ? (
              /* --- STATE: LOGGED OUT (Google Login Form) --- */
              <div className="space-y-5">
                <div className="text-center space-y-2 py-2">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-[#2481cc]/20 to-[#10b981]/20 border border-[#2481cc]/40 flex items-center justify-center shadow-xl">
                    <Sparkles className="w-8 h-8 text-[#2aabee]" />
                  </div>
                  <h3 className="text-base font-black text-white">
                    Faça login com sua Conta Google
                  </h3>
                  <p className="text-xs text-[#8293a4] max-w-sm mx-auto leading-relaxed">
                    Conecte sua conta para salvar suas figurinhas e GIFs favoritos, sincronizar dados e personalizar seu perfil.
                  </p>
                </div>

                {/* Pre-fill Fields for instant one-tap login */}
                <div className="bg-[#121922] p-4 rounded-2xl border border-[#253241] space-y-3">
                  <span className="text-[10px] font-black text-[#708499] uppercase tracking-wider block">
                    Dados da Conta Google
                  </span>

                  {/* Avatar selection preview */}
                  <div className="flex items-center gap-3">
                    <img
                      src={avatar}
                      alt="Avatar"
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-[#2481cc] shadow-md"
                    />
                    <div className="flex-1">
                      <span className="text-[11px] font-bold text-white block">Foto do Perfil</span>
                      <div className="flex items-center gap-1.5 mt-1 overflow-x-auto no-scrollbar">
                        {GOOGLE_AVATAR_PRESETS.map((preset, idx) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => setAvatar(preset)}
                            className={`w-7 h-7 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                              avatar === preset ? 'border-[#2aabee] scale-110 ring-2 ring-[#2481cc]/50' : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={preset} alt={`Opção ${idx}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Nome */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#708499] uppercase flex items-center gap-1">
                      <User className="w-3 h-3 text-[#2aabee]" /> Nome Completo
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Murilo Silva"
                      className="w-full px-3 py-2.5 bg-[#182330] rounded-xl text-xs font-bold text-white border border-[#253241] focus:outline-none focus:border-[#2481cc]"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#708499] uppercase flex items-center gap-1">
                      <Mail className="w-3 h-3 text-[#2aabee]" /> Email Google
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@gmail.com"
                      className="w-full px-3 py-2.5 bg-[#182330] rounded-xl text-xs font-mono text-white border border-[#253241] focus:outline-none focus:border-[#2481cc]"
                    />
                  </div>

                  {/* Data de Nascimento */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#708499] uppercase flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#2aabee]" /> Data de Nascimento
                      </span>
                      {currentAge !== null && (
                        <span className="text-[#10b981] font-mono font-bold lowercase">
                          {currentAge} anos
                        </span>
                      )}
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#182330] rounded-xl text-xs font-bold text-white border border-[#253241] focus:outline-none focus:border-[#2481cc] [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Redirection Toggle */}
                <div className="flex items-center justify-between bg-[#121922] p-3 rounded-xl border border-[#253241]">
                  <span className="text-[11px] text-[#8293a4]">
                    Redirecionar para <strong className="text-white">www.kaise.space</strong> após login
                  </span>
                  <input
                    type="checkbox"
                    checked={autoRedirect}
                    onChange={(e) => handleToggleAutoRedirect(e.target.checked)}
                    className="rounded border-[#253241] text-[#2481cc] cursor-pointer"
                  />
                </div>

                {/* Big Google Sign-in Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoggingIn}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-[#1f2937] font-extrabold text-sm flex items-center justify-center gap-3 shadow-xl shadow-white/5 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>{isLoggingIn ? 'Conectando ao Google...' : 'Entrar com o Google'}</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onNavigate) onNavigate('/login');
                    }}
                    className="text-xs text-[#2aabee] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Abrir página de Login e Redirecionamento</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              /* --- STATE: LOGGED IN (Profile Management & Favorites) --- */
              <div className="space-y-5">
                {/* Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-[#253241] pb-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      activeTab === 'profile'
                        ? 'bg-[#2481cc] text-white shadow-md shadow-[#2481cc]/25'
                        : 'bg-[#121922] text-[#8293a4] hover:text-white'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Dados do Perfil</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('favorites')}
                    className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      activeTab === 'favorites'
                        ? 'bg-[#2481cc] text-white shadow-md shadow-[#2481cc]/25'
                        : 'bg-[#121922] text-[#8293a4] hover:text-white'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 text-[#ef4444]" />
                    <span>Minhas Figurinhas ({currentUser.favorites?.length || 0})</span>
                  </button>
                </div>

                {activeTab === 'profile' ? (
                  /* Form Tab: Profile Details */
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    {/* User Card Showcase */}
                    <div className="bg-gradient-to-r from-[#1b2b3d] to-[#121b24] p-4 rounded-2xl border border-[#2481cc]/40 flex items-center gap-4 shadow-lg">
                      <div className="relative">
                        <img
                          src={avatar}
                          alt={name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-[#2aabee] shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                          className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#2481cc] text-white border-2 border-[#0e1621] hover:bg-[#1f70b2] transition-colors cursor-pointer"
                          title="Mudar foto"
                        >
                          <Camera className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-white truncate">{name}</h3>
                          <ShieldCheck className="w-4 h-4 text-[#10b981] flex-shrink-0" />
                        </div>
                        <p className="text-xs font-mono text-[#8293a4] truncate">{email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/15 px-2 py-0.5 rounded-md border border-[#10b981]/30">
                            Google Conectado
                          </span>
                          {currentAge !== null && (
                            <span className="text-[10px] font-mono font-bold text-[#2aabee] bg-[#2481cc]/15 px-2 py-0.5 rounded-md">
                              {currentAge} anos
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Avatar Preset Picker Collapsible */}
                    {showAvatarPicker && (
                      <div className="bg-[#121922] p-3 rounded-2xl border border-[#253241] space-y-2">
                        <span className="text-[10px] font-bold text-[#708499] uppercase block">
                          Escolha uma Foto de Perfil:
                        </span>
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                          {GOOGLE_AVATAR_PRESETS.map((pUrl, i) => (
                            <button
                              type="button"
                              key={i}
                              onClick={() => {
                                setAvatar(pUrl);
                                setShowAvatarPicker(false);
                              }}
                              className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-transform cursor-pointer ${
                                avatar === pUrl ? 'border-[#2aabee] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={pUrl} alt="Preset" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Form Inputs */}
                    <div className="bg-[#121922] p-4 rounded-2xl border border-[#253241] space-y-3.5">
                      {/* Name Input */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#708499] uppercase flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#2aabee]" /> Nome de Exibição
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Seu nome"
                          maxLength={40}
                          className="w-full px-3.5 py-2.5 bg-[#182330] rounded-xl text-xs font-bold text-white border border-[#253241] focus:outline-none focus:border-[#2481cc]"
                        />
                      </div>

                      {/* Email Input */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#708499] uppercase flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#2aabee]" /> Email Google
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu.email@gmail.com"
                          className="w-full px-3.5 py-2.5 bg-[#182330] rounded-xl text-xs font-mono text-white border border-[#253241] focus:outline-none focus:border-[#2481cc]"
                        />
                      </div>

                      {/* Birth Date Input */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#708499] uppercase flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#2aabee]" /> Data de Nascimento
                          </span>
                          {currentAge !== null && (
                            <span className="text-[#10b981] font-mono font-bold text-[11px]">
                              {currentAge} anos
                            </span>
                          )}
                        </label>
                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#182330] rounded-xl text-xs font-bold text-white border border-[#253241] focus:outline-none focus:border-[#2481cc] [color-scheme:dark]"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2.5 pt-2">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 py-3 px-4 rounded-2xl bg-[#2481cc] hover:bg-[#1f70b2] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#2481cc]/25 active:scale-95 transition-all cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="py-3 px-4 rounded-2xl bg-[#1c2733] hover:bg-[#ef4444]/20 text-[#ef4444] font-bold text-xs flex items-center justify-center gap-2 border border-[#253241] hover:border-[#ef4444]/40 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Favorites Tab */
                  <div className="space-y-3">
                    {!currentUser.favorites || currentUser.favorites.length === 0 ? (
                      <div className="text-center py-10 bg-[#121922] rounded-2xl border border-[#253241] p-6 space-y-2">
                        <Heart className="w-8 h-8 text-[#708499] mx-auto opacity-50" />
                        <p className="text-xs font-bold text-white">Nenhuma figurinha favoritada ainda.</p>
                        <p className="text-[11px] text-[#8293a4]">
                          Navegue pela galeria e clique no ícone de coração para salvar suas figurinhas preferidas!
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
                        {currentUser.favorites.map((fav) => (
                          <div
                            key={fav.id || fav.url}
                            className="bg-[#121922] p-2.5 rounded-2xl border border-[#253241] flex items-center gap-3 hover:border-[#2481cc]/60 transition-colors"
                          >
                            <div className="w-14 h-14 bg-[#101720] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                              <img
                                src={fav.url}
                                alt={fav.title}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-white truncate">{fav.title}</h4>
                              <span className="text-[10px] text-[#708499] block">{fav.savedAt}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(fav.url)}
                                  className="text-[10px] font-bold text-[#2aabee] hover:underline flex items-center gap-0.5 cursor-pointer"
                                >
                                  <Copy className="w-3 h-3" /> Copiar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFavorite(fav)}
                                  className="text-[10px] font-bold text-[#ef4444] hover:underline flex items-center gap-0.5 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" /> Remover
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
