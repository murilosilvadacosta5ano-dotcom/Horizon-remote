import { GifComment, CommentReport, UserProfile } from '../types';
import { getStoredUser, saveStoredUser } from './authService';

const COMMENTS_STORAGE_KEY = 'kaise_gif_comments_v2';
const REPORTS_STORAGE_KEY = 'kaise_comment_reports_v2';

// Seed initial sample comments for rich 2016-era community feeling
const INITIAL_SAMPLE_COMMENTS: GifComment[] = [
  {
    id: 'c_seed_1',
    gifId: 'naruto-run',
    userId: 'user_naruto_fan',
    username: 'narutobr',
    nickname: 'Naruto Fan BR',
    userAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=120&auto=format&fit=crop&q=80',
    content: 'Melhor corrida dos animes kkkkk uso direto no Discord!',
    createdAt: '2026-08-18T14:20:00.000Z',
    parentId: null,
    replies: [
      {
        id: 'c_seed_1_1',
        gifId: 'naruto-run',
        userId: 'user_hinata',
        username: 'hinata_hyuga',
        nickname: 'Hinata',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        content: 'OIII amiga! Como vai? Esse gif é clássico demais ❤️',
        createdAt: '2026-08-18T15:10:00.000Z',
        parentId: 'c_seed_1',
        replies: [
          {
            id: 'c_seed_1_1_1',
            gifId: 'naruto-run',
            userId: 'user_naruto_fan',
            username: 'narutobr',
            nickname: 'Naruto Fan BR',
            userAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=120&auto=format&fit=crop&q=80',
            content: 'Tô bem e vc? O que achou dessa figurinha HD?',
            createdAt: '2026-08-18T15:45:00.000Z',
            parentId: 'c_seed_1_1'
          }
        ]
      }
    ]
  },
  {
    id: 'c_seed_2',
    gifId: 'general',
    userId: 'user_meme_king',
    username: 'memelord',
    nickname: 'Rei dos Memes',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    content: 'Qualidade 10/10 da API Kaise! Carrega super rápido.',
    createdAt: '2026-08-19T08:12:00.000Z',
    parentId: null,
    replies: []
  }
];

export function getAllStoredComments(): GifComment[] {
  if (typeof window === 'undefined') return INITIAL_SAMPLE_COMMENTS;
  try {
    const raw = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_COMMENTS));
      return INITIAL_SAMPLE_COMMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SAMPLE_COMMENTS;
  }
}

export function saveAllComments(comments: GifComment[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
}

export function getAllReports(): CommentReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAllReports(reports: CommentReport[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
}

/**
 * Obtém os comentários vinculados a um GIF específico
 */
export function getCommentsForGif(gifId: string): GifComment[] {
  const all = getAllStoredComments();
  // Retorna comentários daquele gif ou genéricos se for lista vazia
  const filtered = all.filter(c => c.gifId === gifId || c.gifId === 'general' || gifId.includes(c.gifId));
  return filtered;
}

/**
 * Adiciona um novo comentário ou resposta
 */
export function addComment(
  gifId: string,
  user: UserProfile,
  content: string,
  parentId: string | null = null
): GifComment {
  if (user.isBanned) {
    throw new Error('Sua conta está suspensa devido a violações das diretrizes.');
  }

  const all = getAllStoredComments();
  const newComment: GifComment = {
    id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    gifId,
    userId: user.id,
    username: user.username || `@${user.name.toLowerCase().replace(/\s+/g, '')}`,
    nickname: user.nickname || user.name,
    userAvatar: user.avatar,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    parentId,
    replies: []
  };

  if (!parentId) {
    all.unshift(newComment);
  } else {
    // Insere como resposta na árvore
    const addReplyRecursive = (list: GifComment[]): boolean => {
      for (const item of list) {
        if (item.id === parentId) {
          if (!item.replies) item.replies = [];
          item.replies.push(newComment);
          return true;
        }
        if (item.replies && item.replies.length > 0) {
          if (addReplyRecursive(item.replies)) return true;
        }
      }
      return false;
    };

    const inserted = addReplyRecursive(all);
    if (!inserted) {
      all.unshift(newComment);
    }
  }

  saveAllComments(all);
  return newComment;
}

/**
 * Edita um comentário existente (apenas o autor pode editar)
 */
export function editComment(commentId: string, userId: string, newContent: string): boolean {
  const all = getAllStoredComments();

  const editRecursive = (list: GifComment[]): boolean => {
    for (const item of list) {
      if (item.id === commentId) {
        if (item.userId !== userId) {
          throw new Error('Você só pode editar seus próprios comentários.');
        }
        item.content = newContent.trim();
        item.isEdited = true;
        item.editedAt = new Date().toISOString();
        return true;
      }
      if (item.replies && item.replies.length > 0) {
        if (editRecursive(item.replies)) return true;
      }
    }
    return false;
  };

  const success = editRecursive(all);
  if (success) {
    saveAllComments(all);
  }
  return success;
}

/**
 * Apaga um comentário (apenas o autor pode apagar)
 */
export function deleteComment(commentId: string, userId: string): boolean {
  let all = getAllStoredComments();

  const deleteRecursive = (list: GifComment[]): GifComment[] => {
    return list
      .filter(item => {
        if (item.id === commentId) {
          if (item.userId !== userId) {
            throw new Error('Você só pode apagar seus próprios comentários.');
          }
          return false;
        }
        return true;
      })
      .map(item => {
        if (item.replies && item.replies.length > 0) {
          item.replies = deleteRecursive(item.replies);
        }
        return item;
      });
  };

  all = deleteRecursive(all);
  saveAllComments(all);
  return true;
}

/**
 * Denuncia um comentário com motivo
 * Se for difamação ou ofensa grave, remove o comentário imediatamente ou bane o usuário
 */
export function reportComment(
  commentId: string,
  gifId: string,
  commentAuthorId: string,
  commentAuthorUsername: string,
  commentContent: string,
  reporter: UserProfile,
  reason: 'difamacao' | 'ofensa' | 'spam' | 'inadequado' | 'outro',
  details: string
): { report: CommentReport; commentRemoved: boolean; userBanned: boolean } {
  const reports = getAllReports();
  const allComments = getAllStoredComments();

  const newReport: CommentReport = {
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    commentId,
    gifId,
    reportedUserId: commentAuthorId,
    reportedUsername: commentAuthorUsername,
    commentContent,
    reportedByUserId: reporter.id,
    reportedByUsername: reporter.username || reporter.name,
    reason,
    details: details.trim() || 'Sem detalhes adicionais',
    createdAt: new Date().toISOString(),
    status: 'pending'
  };

  let commentRemoved = false;
  let userBanned = false;

  // Regra de moderação estrita: Difamação ou Ofensa Pessoal causa remoção imediata
  if (reason === 'difamacao' || reason === 'ofensa') {
    const markRemovedRecursive = (list: GifComment[]): boolean => {
      for (const item of list) {
        if (item.id === commentId) {
          item.isRemoved = true;
          item.removalReason = 'Comentário removido por violação das diretrizes da comunidade (Difamação/Ofensa).';
          item.content = '[Este comentário foi removido por violação das regras de convivência]';
          return true;
        }
        if (item.replies && item.replies.length > 0) {
          if (markRemovedRecursive(item.replies)) return true;
        }
      }
      return false;
    };

    markRemovedRecursive(allComments);
    saveAllComments(allComments);
    commentRemoved = true;
    newReport.status = 'removed_content';

    // Se o usuário atual for o infrator (teste local), penaliza/suspende conta
    const currentUser = getStoredUser();
    if (currentUser && currentUser.id === commentAuthorId) {
      currentUser.isBanned = true;
      currentUser.banReason = 'Conta suspensa por difamação ou comentários ofensivos reiterados.';
      saveStoredUser(currentUser);
      userBanned = true;
      newReport.status = 'user_banned';
    }
  }

  reports.unshift(newReport);
  saveAllReports(reports);

  return { report: newReport, commentRemoved, userBanned };
}
