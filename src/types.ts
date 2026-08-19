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
  provider: string;
  url: string;
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

export interface GifSource {
  provider: string; // ex: 'tenor', 'giphy', 'kaise_local'
  id: string;
  url: string;
  attribution: string;
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
  tenor_results?: TenorResultItem[]; // Para compatibilidade reversa Tenor API
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
  avatar: string;
  birthDate?: string; // Formato: AAAA-MM-DD
  provider: 'google' | 'guest';
  createdAt: string;
  favorites: SavedFavoriteGif[];
}
