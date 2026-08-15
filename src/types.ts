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

export interface TenorResultItem {
  id: string;
  title: string;
  content_description: string;
  itemurl: string;
  url: string;
  hasaudio: boolean;
  media: TenorMediaObject[];
  tags?: string[];
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
  next?: string;
}
