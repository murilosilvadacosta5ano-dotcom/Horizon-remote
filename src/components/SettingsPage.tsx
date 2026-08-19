import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Settings, 
  Camera, 
  Upload, 
  User, 
  AtSign, 
  Smile, 
  FileText, 
  Lock, 
  Globe, 
  Save, 
  Check, 
  ShieldCheck, 
  LogOut,
  RefreshCw,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';
import { 
  updateUserProfile, 
  logoutUser, 
  fileToDataUrl, 
  getAutoRedirectPreference, 
  setAutoRedirectPreference,
  DEFAULT_AUTHORIZED_REDIRECT_URL 
} from '../services/authService';

interface SettingsPageProps {
  currentUser: UserProfile | null;
  onNavigate: (path: string) => void;
  onShowToast: (msg: string) => void;
  onUserChange: (user: UserProfile | null) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  onNavigate,
  onShowToast,
  onUserChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState<string>(currentUser?.name || '');
  const [username, setUsername] = useState<string>(currentUser?.username?.replace(/^@/, '') || '');
  const [nickname, setNickname] = useState<string>(currentUser?.nickname || '');
  const [bio, setBio] = useState<string>(currentUser?.bio || 'Colecionador de figurinhas e memes HD 🚀');
  const [avatar, setAvatar] = useState<string>(currentUser?.avatar || 'https://ui-avatars.com/api/?name=User&background=2481cc&color=fff');
  const [autoRedirect, setAutoRedirect] = useState<boolean>(() => getAutoRedirectPreference());
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Handle Smartphone/Device Photo Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onShowToast('A imagem deve ter no máximo 5MB.');
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setAvatar(dataUrl);
      onShowToast('Foto do smartphone carregada! Clique em Salvar Alterações.');
    } catch {
      onShowToast('Erro ao processar imagem do dispositivo.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onShowToast('Faça login primeiro para salvar configurações.');
      return;
    }

    if (!nickname.trim()) {
      onShowToast('O apelido não pode estar vazio.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername) {
      onShowToast('Insira um nome de usuário válido (apenas letras, números e underline).');
      return;
    }

    setIsSaving(true);
    try {
      const updated = updateUserProfile({
        name: name.trim() || currentUser.name,
        username: `@${cleanUsername}`,
        nickname: nickname.trim(),
        bio: bio.trim(),
        avatar: avatar
      });

      setAutoRedirectPreference(autoRedirect);
      onUserChange(updated);
      onShowToast('Configurações do perfil salvas com sucesso! ✨');
    } catch (err: any) {
      onShowToast(err?.message || 'Erro ao salvar perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    onUserChange(null);
    onShowToast('Sessão encerrada.');
    onNavigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0e1621] text-[#f5f5f5] flex flex-col items-center py-6 px-4 selection:bg-[#2481cc]/30">
      
      {/* Header */}
      <header className="w-full max-w-2xl flex items-center justify-between pb-5 border-b border-[#1c2733] mb-6">
        <button
          onClick={() => onNavigate('/perfil')}
          className="flex items-center gap-2 py-2 px-3.5 rounded-2xl bg-[#1c2733] hover:bg-[#253241] text-xs font-bold text-[#8293a4] hover:text-white transition-all cursor-pointer border border-[#253241]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Perfil</span>
        </button>

        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#2aabee]" />
          <h1 className="text-base font-extrabold text-white uppercase tracking-tight">
            Configurações da Conta
          </h1>
        </div>

        <button
          onClick={() => onNavigate('/')}
          className="text-xs font-bold text-[#2aabee] hover:underline"
        >
          Galeria
        </button>
      </header>

      {/* Main Settings Form */}
      <main className="w-full max-w-2xl space-y-6">
        
        {!currentUser ? (
          <div className="bg-[#17212b] border border-[#232e3c] rounded-3xl p-8 text-center space-y-4">
            <Lock className="w-12 h-12 text-[#8293a4] mx-auto opacity-50" />
            <h2 className="text-base font-extrabold text-white">Você não está conectado</h2>
            <p className="text-xs text-[#8293a4] max-w-sm mx-auto">
              Faça login com sua conta Google para gerenciar sua foto do smartphone, nome de usuário e apelido.
            </p>
            <button
              onClick={() => onNavigate('/login')}
              className="py-3 px-6 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-extrabold text-xs inline-flex items-center gap-2 shadow-xl cursor-pointer"
            >
              <span>Fazer Login com Google</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Avatar Selection Card */}
            <div className="bg-[#17212b] border border-[#232e3c] rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#232e3c]">
                <div className="flex items-center gap-2 text-sm font-extrabold text-white">
                  <Camera className="w-4 h-4 text-[#2aabee]" />
                  <span>Foto de Perfil</span>
                </div>
                <span className="text-[11px] text-[#8293a4]">
                  Use a foto do Google ou escolha do smartphone
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Profile image preview */}
                <div className="relative group">
                  <img
                    src={avatar}
                    alt={nickname || 'Perfil'}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nickname || 'User')}&background=2481cc&color=fff&size=200`;
                    }}
                    className="w-24 h-24 rounded-3xl object-cover border-2 border-[#2481cc] shadow-xl shadow-[#2481cc]/20"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mb-1" />
                    <span>Alterar</span>
                  </button>
                </div>

                {/* Upload action buttons */}
                <div className="flex-1 space-y-2.5 text-center sm:text-left">
                  <div>
                    <h3 className="text-xs font-black text-white">Escolha sua foto pessoal</h3>
                    <p className="text-[11px] text-[#8293a4]">
                      Selecione uma foto da galeria do seu celular ou arquivo no computador (PNG, JPG, WebP até 5MB).
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-2 px-3.5 rounded-xl bg-[#2481cc] hover:bg-[#1f70b0] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload do Smartphone</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAvatar(`https://ui-avatars.com/api/?name=${encodeURIComponent(nickname || name)}&background=2481cc&color=fff&size=200`);
                        onShowToast('Avatar padrão com iniciais selecionado.');
                      }}
                      className="py-2 px-3 rounded-xl bg-[#1c2733] hover:bg-[#253241] text-[#8293a4] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span>Usar Iniciais</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Public Identity Information Card */}
            <div className="bg-[#17212b] border border-[#232e3c] rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#232e3c]">
                <div className="flex items-center gap-2 text-sm font-extrabold text-white">
                  <User className="w-4 h-4 text-[#2aabee]" />
                  <span>Identidade Pública (Comentários e Perfil)</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#10b981] font-bold">
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>E-mail Oculto</span>
                </div>
              </div>

              {/* Nickname / Apelido */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#8293a4] flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-[#2aabee]" />
                  <span>Apelido de Exibição (Como você aparece nos comentários)</span>
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Ex: Murilo, Mariazinha, DevMaster..."
                  className="w-full px-3.5 py-2.5 bg-[#0e1621] rounded-xl text-xs font-bold text-white border border-[#253241] focus:outline-none focus:border-[#2481cc]"
                />
                <span className="text-[10px] text-[#708499] block">
                  Este é o nome que todo mundo verá quando você comentar ou responder.
                </span>
              </div>

              {/* Username (@handle) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#8293a4] flex items-center gap-1.5">
                  <AtSign className="w-3.5 h-3.5 text-[#2aabee]" />
                  <span>Nome de Usuário (@handle único)</span>
                </label>
                <div className="flex items-center bg-[#0e1621] border border-[#253241] rounded-xl px-3 focus-within:border-[#2481cc]">
                  <span className="text-xs font-mono font-bold text-[#2aabee]">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="seunome"
                    className="w-full px-2 py-2.5 bg-transparent text-xs font-mono font-bold text-white outline-none"
                  />
                </div>
                <span className="text-[10px] text-[#708499] block">
                  Usado para marcações e identificador da sua conta.
                </span>
              </div>

              {/* Bio / Status */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#8293a4] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#2aabee]" />
                  <span>Bio / Mensagem do Perfil</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  placeholder="Escreva uma frase sobre você..."
                  className="w-full px-3.5 py-2.5 bg-[#0e1621] rounded-xl text-xs text-white border border-[#253241] focus:outline-none focus:border-[#2481cc] resize-none"
                />
              </div>

              {/* Private Email (Protected Notice) */}
              <div className="p-3.5 bg-[#0e1621] rounded-xl border border-[#232e3c] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[#708499] uppercase block">
                    Conta Google Vinculada
                  </span>
                  <span className="text-[#8293a4] font-medium text-xs flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>Autenticação ativa com Google</span>
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/15 px-2.5 py-1 rounded-lg border border-[#10b981]/30">
                  100% Oculto do Público
                </span>
              </div>

            </div>

            {/* Platform Integration Settings */}
            <div className="bg-[#17212b] border border-[#232e3c] rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-sm font-extrabold text-white pb-3 border-b border-[#232e3c]">
                <Globe className="w-4 h-4 text-[#2aabee]" />
                <span>Integração e Redirecionamento</span>
              </div>

              <div className="flex items-center justify-between bg-[#0e1621] p-3.5 rounded-xl border border-[#232e3c]">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">
                    Redirecionamento Automático para www.kaise.space
                  </h4>
                  <p className="text-[11px] text-[#8293a4]">
                    Redireciona sua sessão autorizada para o ecossistema principal Kaise
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoRedirect}
                  onChange={(e) => setAutoRedirect(e.target.checked)}
                  className="rounded border-[#253241] text-[#2481cc] cursor-pointer"
                />
              </div>
            </div>

            {/* Submit & Save Footer */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="py-3 px-4 rounded-2xl bg-[#1c2733] hover:bg-[#ef4444]/20 text-[#ef4444] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#ef4444]/20"
              >
                <LogOut className="w-4 h-4" />
                <span>Encerrar Sessão</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="py-3.5 px-6 rounded-2xl bg-[#2481cc] hover:bg-[#1f70b0] disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-[#2481cc]/25 transition-transform active:scale-95 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </main>
    </div>
  );
};
