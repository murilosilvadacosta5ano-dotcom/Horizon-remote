import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  CornerDownRight, 
  Edit3, 
  Trash2, 
  ShieldAlert, 
  Check, 
  X, 
  Sparkles,
  User,
  Heart,
  AlertCircle
} from 'lucide-react';
import { GifComment, UserProfile } from '../types';
import { 
  getCommentsForGif, 
  addComment, 
  editComment, 
  deleteComment 
} from '../services/commentsService';
import { ReportModal } from './ReportModal';

interface GifCommentsSectionProps {
  gifId: string;
  gifTitle?: string;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onShowToast: (msg: string) => void;
}

export const GifCommentsSection: React.FC<GifCommentsSectionProps> = ({
  gifId,
  gifTitle,
  currentUser,
  onOpenAuth,
  onShowToast
}) => {
  const [comments, setComments] = useState<GifComment[]>(() => getCommentsForGif(gifId));
  const [newCommentText, setNewCommentText] = useState<string>('');
  
  // Reply state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  // Edit state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  // Report modal state
  const [reportingComment, setReportingComment] = useState<GifComment | null>(null);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // Refresh list
  const refreshList = () => {
    setComments(getCommentsForGif(gifId));
  };

  // Submit main comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onShowToast('Faça login com sua conta Google para comentar.');
      onOpenAuth();
      return;
    }
    if (!newCommentText.trim()) return;

    try {
      addComment(gifId, currentUser, newCommentText);
      setNewCommentText('');
      refreshList();
      onShowToast('Comentário publicado! 💬');
    } catch (err: any) {
      onShowToast(err?.message || 'Erro ao publicar comentário.');
    }
  };

  // Submit reply
  const handleAddReply = (parentId: string) => {
    if (!currentUser) {
      onShowToast('Faça login com o Google para responder.');
      onOpenAuth();
      return;
    }
    if (!replyText.trim()) return;

    try {
      addComment(gifId, currentUser, replyText, parentId);
      setReplyText('');
      setReplyingToId(null);
      refreshList();
      onShowToast('Resposta enviada! 🚀');
    } catch (err: any) {
      onShowToast(err?.message || 'Erro ao enviar resposta.');
    }
  };

  // Save edit
  const handleSaveEdit = (commentId: string) => {
    if (!currentUser) return;
    if (!editingText.trim()) return;

    try {
      editComment(commentId, currentUser.id, editingText);
      setEditingCommentId(null);
      setEditingText('');
      refreshList();
      onShowToast('Comentário atualizado com sucesso! ✨');
    } catch (err: any) {
      onShowToast(err?.message || 'Erro ao editar comentário.');
    }
  };

  // Delete comment
  const handleDeleteComment = (commentId: string) => {
    if (!currentUser) return;
    if (!window.confirm('Tem certeza que deseja apagar este comentário?')) return;

    try {
      deleteComment(commentId, currentUser.id);
      refreshList();
      onShowToast('Comentário apagado.');
    } catch (err: any) {
      onShowToast(err?.message || 'Erro ao apagar comentário.');
    }
  };

  // Format date nicely
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Agora';
    }
  };

  // Recursive Comment Node Component
  const renderCommentItem = (item: GifComment, isNested: boolean = false) => {
    const isOwner = currentUser && currentUser.id === item.userId;
    const isEditing = editingCommentId === item.id;
    const isReplying = replyingToId === item.id;

    return (
      <div 
        key={item.id} 
        className={`relative ${isNested ? 'ml-4 sm:ml-8 mt-3 border-l-2 border-[#2481cc]/30 pl-3 sm:pl-4' : 'mt-4'}`}
      >
        <div className={`p-3.5 rounded-2xl border transition-all ${
          item.isRemoved 
            ? 'bg-[#121922]/60 border-[#ef4444]/30' 
            : isOwner 
            ? 'bg-[#17212b] border-[#2481cc]/40 shadow-sm' 
            : 'bg-[#121922] border-[#232e3c]'
        }`}>
          
          {/* Header of comment: Avatar, Name, Handle, Date, Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={item.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.nickname)}&background=2481cc&color=fff`}
                alt={item.nickname}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.nickname)}&background=2481cc&color=fff`;
                }}
                className="w-7 h-7 rounded-full object-cover border border-[#2481cc]/50 shrink-0"
              />
              <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-extrabold text-white truncate">
                  {item.nickname}
                </span>
                <span className="text-[10px] text-[#2aabee] font-mono font-medium truncate">
                  {item.username.startsWith('@') ? item.username : `@${item.username}`}
                </span>
                <span className="text-[10px] text-[#708499]">
                  • {formatDate(item.createdAt)}
                </span>
                {item.isEdited && (
                  <span className="text-[9px] text-[#10b981] font-semibold">
                    (editado)
                  </span>
                )}
              </div>
            </div>

            {/* Comment Action Icons */}
            {!item.isRemoved && (
              <div className="flex items-center gap-1 shrink-0">
                {isOwner ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCommentId(item.id);
                        setEditingText(item.content);
                      }}
                      title="Editar comentário"
                      className="p-1 text-[#8293a4] hover:text-[#2aabee] rounded-lg hover:bg-[#1c2733] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(item.id)}
                      title="Apagar comentário"
                      className="p-1 text-[#8293a4] hover:text-[#ef4444] rounded-lg hover:bg-[#1c2733] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setReportingComment(item);
                      setIsReportOpen(true);
                    }}
                    title="Denunciar comentário (difamação, ofensa ou spam)"
                    className="p-1 text-[#8293a4] hover:text-[#ef4444] rounded-lg hover:bg-[#1c2733] transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Denunciar</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Comment Content or Edit Form */}
          <div className="mt-2 text-xs">
            {isEditing ? (
              <div className="space-y-2 pt-1">
                <textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-[#0e1621] rounded-xl text-xs text-white border border-[#2481cc] focus:outline-none resize-none font-medium"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCommentId(null);
                      setEditingText('');
                    }}
                    className="py-1 px-2.5 rounded-lg text-[11px] font-bold text-[#8293a4] hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(item.id)}
                    className="py-1 px-3 rounded-lg bg-[#2481cc] hover:bg-[#1f70b0] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow"
                  >
                    <Check className="w-3 h-3" />
                    <span>Salvar</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className={`leading-relaxed ${item.isRemoved ? 'text-[#ef4444] italic font-semibold' : 'text-neutral-200'}`}>
                {item.content}
              </p>
            )}
          </div>

          {/* Reply trigger button */}
          {!item.isRemoved && !isEditing && (
            <div className="mt-2.5 flex items-center gap-3 pt-1 border-t border-[#232e3c]/50">
              <button
                type="button"
                onClick={() => {
                  setReplyingToId(isReplying ? null : item.id);
                  setReplyText('');
                }}
                className="text-[11px] font-bold text-[#2aabee] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CornerDownRight className="w-3 h-3" />
                <span>{isReplying ? 'Cancelar resposta' : 'Responder'}</span>
              </button>
            </div>
          )}

          {/* Reply Form Box */}
          {isReplying && (
            <div className="mt-3 p-3 bg-[#0e1621] rounded-xl border border-[#2481cc]/40 space-y-2">
              <div className="flex items-center gap-2">
                <CornerDownRight className="w-3 h-3 text-[#2aabee]" />
                <span className="text-[10px] text-[#8293a4] font-bold">
                  Respondendo a <strong className="text-white">{item.nickname}</strong> ({item.username})
                </span>
              </div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escreva sua resposta..."
                rows={2}
                className="w-full p-2 bg-[#17212b] rounded-lg text-xs text-white border border-[#253241] focus:outline-none focus:border-[#2481cc] resize-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyingToId(null)}
                  className="py-1 px-2.5 rounded-lg text-[10px] font-bold text-[#8293a4] hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleAddReply(item.id)}
                  disabled={!replyText.trim()}
                  className="py-1 px-3 rounded-lg bg-[#2481cc] hover:bg-[#1f70b0] disabled:opacity-50 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow"
                >
                  <Send className="w-3 h-3" />
                  <span>Enviar Resposta</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Nested Replies */}
        {item.replies && item.replies.length > 0 && (
          <div className="space-y-2">
            {item.replies.map(reply => renderCommentItem(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#17212b] border border-[#232e3c] rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
      
      {/* Comments Header */}
      <div className="flex items-center justify-between border-b border-[#232e3c] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#2481cc]/20 border border-[#2481cc]/40 flex items-center justify-center text-[#2aabee]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">
              Comentários e Respostas
            </h3>
            <p className="text-[11px] text-[#8293a4]">
              {comments.length} {comments.length === 1 ? 'comentário nesta figurinha' : 'comentários nesta figurinha'}
            </p>
          </div>
        </div>

        {!currentUser && (
          <button
            type="button"
            onClick={onOpenAuth}
            className="py-1.5 px-3 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
          >
            <span>Fazer Login</span>
          </button>
        )}
      </div>

      {/* New Comment Input Form */}
      <form onSubmit={handleAddComment} className="space-y-3">
        <div className="flex items-start gap-3">
          <img
            src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.nickname || 'Eu')}&background=2481cc&color=fff`}
            alt={currentUser?.nickname || 'Meu Perfil'}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=Eu&background=2481cc&color=fff`;
            }}
            className="w-9 h-9 rounded-full object-cover border border-[#2481cc] shrink-0 mt-0.5"
          />

          <div className="flex-1 min-w-0 space-y-2">
            <div className="relative">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={currentUser ? `Comentar como ${currentUser.nickname} (@${currentUser.username})...` : "Faça login com o Google para participar da conversa..."}
                rows={2}
                className="w-full p-3 bg-[#0e1621] rounded-2xl text-xs text-white border border-[#253241] focus:outline-none focus:border-[#2481cc] transition-colors placeholder:text-[#708499] resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#708499]">
                Pressione enviar para publicar no GIF
              </span>

              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="py-2 px-4 rounded-xl bg-[#2481cc] hover:bg-[#1f70b0] disabled:opacity-40 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-[#2481cc]/20 transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Comentar</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3 pt-2">
        {comments.length === 0 ? (
          <div className="text-center py-8 bg-[#0e1621]/60 rounded-2xl border border-dashed border-[#232e3c] space-y-2">
            <MessageSquare className="w-8 h-8 text-[#708499] mx-auto opacity-50" />
            <p className="text-xs text-[#8293a4] font-medium">
              Nenhum comentário neste GIF ainda. Seja o primeiro a comentar!
            </p>
          </div>
        ) : (
          comments.map(comment => renderCommentItem(comment, false))
        )}
      </div>

      {/* Report Abuse Modal */}
      <ReportModal
        isOpen={isReportOpen}
        comment={reportingComment}
        currentUser={currentUser}
        onClose={() => {
          setIsReportOpen(false);
          setReportingComment(null);
        }}
        onReportSubmitted={(msg) => {
          onShowToast(msg);
          refreshList();
        }}
      />
    </div>
  );
};
