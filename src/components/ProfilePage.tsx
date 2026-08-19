import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Settings, 
  Heart, 
  MessageSquare, 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Download, 
  Trash2, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  Globe, 
  AtSign, 
  Smile,
  Edit3
} from 'lucide-react';
import { UserProfile, SavedFavoriteGif } from '../types';
import { toggleFavorite, redirectToAuthorizedDomain } from '../services/authService';
import { getAllStoredComments } from '../services/commentsService';

interface ProfilePageProps {
  currentUser: UserProfile | null;
  onNavigate: (path: string) => void;
  onShowToast: (msg: string) => void;
  onUserChange: (user: UserProfile | null) => void;
  onSelectGif?: (gifUrl: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onNavigate,
  onShowToast,
  onUserChange,
  onSelectGif
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'comments'>('favorites');

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0e1621] text-[#f5f5f5] flex flex-col items-center justify-center p-4">
        <div className="bg-[#17212b] border border-[#232e3c] rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <Lock className="w-12 h-12 text-[#8293a4] mx-auto opacity-50" />
          <h2 className="text-lg font-black text-white">Perfil do Usuário</h2>
          <p className="text-xs text-[#8293a4] leading-relaxed">
            Faça login com sua conta Google para visualizar seu perfil, figurinhas favoritas e histórico de comentários.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => onNavigate('/login')}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl cursor-pointer"
            >
              <span>Fazer Login com Google</span>
            </button>
            <button
              onClick={() => onNavigate('/')}
              className="py-2 text-xs font-bold text-[#8293a4] hover:text-white"
            >
              Voltar para o Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get user's comments
  const allComments = getAllStoredComments();
  const userComments = allComments.filter(c => c.userId === currentUser.id);

  const handleRemoveFavorite = (fav: SavedFavoriteGif) => {
    const { favorites } = toggleFavorite(fav);
    onUserChange({ ...currentUser, favorites });
    onShowToast('Figurinha removida dos favoritos.');
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    onShowToast('Link da figurinha copiado! 📋');
  };

  return (
    <div className="min-h-screen bg-[#0e1621] text-[#f5f5f5] flex flex-col items-center py-6 px-4 selection:bg-[#2481cc]/30">
      
      {/* Top Bar Navigation */}
      <header className="w-full max-w-4xl flex items-center justify-between pb-5 border-b border-[#1c2733] mb-6">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2 py-2 px-3.5 rounded-2xl bg-[#1c2733] hover:bg-[#253241] text-xs font-bold text-[#8293a4] hover:text-white transition-all cursor-pointer border border-[#253241]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à Galeria</span>
        </button>

        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#2aabee]" />
          <span className="text-base font-extrabold text-white uppercase tracking-tight">
            Meu Perfil
          </span>
        </div>

        <button
          onClick={() => onNavigate('/config')}
          className="flex items-center gap-1.5 py-2 px-3.5 rounded-2xl bg-[#2481cc]/20 hover:bg-[#2481cc]/30 text-[#2aabee] text-xs font-extrabold border border-[#2481cc]/40 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          <span>Configurações</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl space-y-6">
        
        {/* User Hero Profile Card (2016-era sleek styling) */}
        <div className="bg-[#17212b] border border-[#232e3c] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#2481cc]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            
            {/* Custom Avatar from Smartphone or Google */}
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.nickname || currentUser.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.nickname || currentUser.name)}&background=2481cc&color=fff&size=200`;
                }}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-[#2481cc] shadow-2xl shadow-[#2481cc]/30"
              />
              <span className="absolute -bottom-1 -right-1 bg-[#10b981] text-white p-1 rounded-xl shadow border-2 border-[#17212b]" title="Conta Conectada e Ativa">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>

            {/* User Details */}
            <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white truncate">
                  {currentUser.nickname || currentUser.name}
                </h1>
                <span className="text-xs font-mono font-bold text-[#2aabee] bg-[#2481cc]/15 px-2.5 py-1 rounded-xl border border-[#2481cc]/30">
                  {currentUser.username.startsWith('@') ? currentUser.username : `@${currentUser.username}`}
                </span>
                <span className="text-[11px] font-bold text-[#10b981] bg-[#10b981]/15 px-2.5 py-1 rounded-xl border border-[#10b981]/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Google Verificado</span>
                </span>
              </div>

              {/* Bio */}
              <p className="text-xs sm:text-sm text-[#8293a4] leading-relaxed max-w-xl">
                {currentUser.bio || 'Colecionador de figurinhas e memes animados em alta resolução.'}
              </p>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-[#708499]">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-[#ef4444]" />
                  <span className="font-bold text-white">{currentUser.favorites?.length || 0}</span>
                  <span>Figurinhas Favoritas</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#2aabee]" />
                  <span className="font-bold text-white">{userComments.length}</span>
                  <span>Comentários</span>
                </div>
                <span>•</span>
                <div className="text-[11px]">
                  Membro desde {new Date(currentUser.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>

            {/* Edit / Actions */}
            <div className="shrink-0 flex sm:flex-col gap-2">
              <button
                onClick={() => onNavigate('/config')}
                className="py-2.5 px-4 rounded-xl bg-[#2481cc] hover:bg-[#1f70b0] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-[#2481cc]/25 transition-transform active:scale-95 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Perfil</span>
              </button>

              <button
                onClick={() => redirectToAuthorizedDomain(currentUser)}
                className="py-2.5 px-3 rounded-xl bg-[#1c2733] hover:bg-[#253241] text-[#8293a4] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Acessar Kaise Space"
              >
                <Globe className="w-3.5 h-3.5 text-[#2aabee]" />
                <span className="hidden sm:inline">Kaise.space</span>
              </button>
            </div>

          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-[#1c2733] pb-3">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-[#2481cc] text-white shadow-md'
                : 'text-[#8293a4] hover:text-white hover:bg-[#1c2733]'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Figurinhas Favoritas ({currentUser.favorites?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'comments'
                ? 'bg-[#2481cc] text-white shadow-md'
                : 'text-[#8293a4] hover:text-white hover:bg-[#1c2733]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Meus Comentários ({userComments.length})</span>
          </button>
        </div>

        {/* Tab Content: Favorites */}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            {(!currentUser.favorites || currentUser.favorites.length === 0) ? (
              <div className="bg-[#17212b] border border-[#232e3c] rounded-3xl p-10 text-center space-y-3">
                <Heart className="w-10 h-10 text-[#708499] mx-auto opacity-40" />
                <h3 className="text-sm font-bold text-white">Nenhuma figurinha favoritada</h3>
                <p className="text-xs text-[#8293a4] max-w-sm mx-auto">
                  Explore a galeria e clique no coração em qualquer figurinha para salvá-la aqui no seu perfil!
                </p>
                <button
                  onClick={() => onNavigate('/')}
                  className="py-2.5 px-5 rounded-xl bg-[#2481cc] text-white text-xs font-extrabold hover:bg-[#1f70b0] inline-block shadow cursor-pointer"
                >
                  Explorar Galeria
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {currentUser.favorites.map((fav) => (
                  <div
                    key={fav.id || fav.url}
                    className="bg-[#17212b] border border-[#232e3c] rounded-2xl overflow-hidden shadow-lg group hover:border-[#2481cc]/50 transition-all flex flex-col"
                  >
                    <div 
                      className="w-full aspect-square bg-[#0e1621] relative overflow-hidden flex items-center justify-center cursor-pointer"
                      onClick={() => onSelectGif && onSelectGif(fav.url)}
                    >
                      <img
                        src={fav.url}
                        alt={fav.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-extrabold text-white truncate" title={fav.title}>
                          {fav.title || 'Figurinha Sem Título'}
                        </h4>
                        <span className="text-[10px] text-[#708499] block">
                          Salvo em {fav.savedAt}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#232e3c]">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(fav.url)}
                          className="text-[11px] font-bold text-[#2aabee] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveFavorite(fav)}
                          className="text-[11px] font-bold text-[#ef4444] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remover</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Comments */}
        {activeTab === 'comments' && (
          <div className="space-y-4">
            {userComments.length === 0 ? (
              <div className="bg-[#17212b] border border-[#232e3c] rounded-3xl p-10 text-center space-y-3">
                <MessageSquare className="w-10 h-10 text-[#708499] mx-auto opacity-40" />
                <h3 className="text-sm font-bold text-white">Você ainda não fez nenhum comentário</h3>
                <p className="text-xs text-[#8293a4] max-w-sm mx-auto">
                  Abra qualquer GIF na galeria para conversar, responder amigos e compartilhar opiniões!
                </p>
                <button
                  onClick={() => onNavigate('/')}
                  className="py-2.5 px-5 rounded-xl bg-[#2481cc] text-white text-xs font-extrabold hover:bg-[#1f70b0] inline-block shadow cursor-pointer"
                >
                  Ver Figurinhas
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {userComments.map((comm) => (
                  <div
                    key={comm.id}
                    className="bg-[#17212b] border border-[#232e3c] rounded-2xl p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#2aabee]">{currentUser.nickname}</span>
                        <span className="text-[#708499]">• {new Date(comm.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <span className="text-[10px] text-[#8293a4] bg-[#0e1621] px-2 py-0.5 rounded-md border border-[#253241]">
                        GIF ID: {comm.gifId}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-200 leading-relaxed font-medium">
                      "{comm.content}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};
