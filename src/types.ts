export interface TenorMediaFormat {
  url: string;
  dims?: [number, number];
  duration?: number;
  size?: number;
}

export interface TenorMediaObject {
  gif: TenorMediaFormat;
  mediumgif?: TenorMediaFormat;
  tinygif?: TenorMediaFormat;
  nanogif?: TenorMediaFormat;
  mp4?: TenorMediaFormat;
  tinymp4?: TenorMediaFormat;
}

export interface GifSource {
  provider: string; // ex: 'tenor', 'giphy', 'kaise_local'
  id: string;
  url: string;
  attribution: string;
}

export interface TenorResultItem {
  id: string;
  title: string;
  content_description: string;
  itemurl: string;
  url: string;
  hasaudio: boolean;
  media: TenorMediaObject[];
  tags?: string[];
  source?: GifSource;
}

export interface KaiseGifItem {
  id: string;
  title: string;
  url: string;
  preview: string;
  width?: number;
  height?: number;
  category: string;
  tags: string[];
  source: GifSource;
}

export interface KaiseApiResponse {
  success: boolean;
  status: number;
  query: string;
  category: string;
  gif_url?: string;
  results: KaiseGifItem[];
  pagination: {
    limit: number;
    offset: number;
    next?: string;
    total: number;
  };
  tenor_results?: TenorResultItem[];
}

export interface GifCategory {
  id: string;
  name: string;
  subcategories: string[];
  description: string;
  gifs: {
    id: string;
    title: string;
    url: string;
    tags: string[];
  }[];
}

export interface GifSearchResult {
  gifUrl: string;
  allGifs: string[];
  searchUrl: string;
  tenorSearchUrl: string;
  totalFound: number;
  fromCache: boolean;
  categoryMatched: string;
  results: TenorResultItem[];
  kaiseResults?: KaiseGifItem[];
  next?: string;
}

export interface SavedFavoriteGif {
  id: string;
  title: string;
  url: string;
  category?: string;
  savedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  username: string; // Ex: @murilodev (público)
  nickname: string; // Ex: Murilo (apelido exibido nos comentários)
  avatar: string; // Foto de perfil escolhida (upload ou Google)
  bio?: string; // Descrição / status do perfil
  birthDate?: string; // Formato: AAAA-MM-DD
  provider: 'google' | 'guest';
  createdAt: string;
  termsAccepted?: boolean;
  termsAcceptedAt?: string;
  isBanned?: boolean;
  banReason?: string;
  favorites: SavedFavoriteGif[];
}

export interface GifComment {
  id: string;
  gifId: string;
  userId: string;
  username: string;
  nickname: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  isEdited?: boolean;
  editedAt?: string;
  isReported?: boolean;
  isRemoved?: boolean;
  removalReason?: string;
  parentId?: string | null;
  replies?: GifComment[];
}

export interface CommentReport {
  id: string;
  commentId: string;
  gifId: string;
  reportedUserId: string;
  reportedUsername: string;
  commentContent: string;
  reportedByUserId: string;
  reportedByUsername: string;
  reason: 'difamacao' | 'ofensa' | 'spam' | 'inadequado' | 'outro';
  details: string;
  createdAt: string;
  status: 'pending' | 'removed_content' | 'user_banned' | 'dismissed';
}
