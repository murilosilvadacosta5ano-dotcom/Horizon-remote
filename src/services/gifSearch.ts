import { scrapeGifsFromSite, generateTenorSlug, getRandomScrapedGif } from './tenorScraper';
import { detectCategoryFromQuery, GIF_CATEGORIES } from '../data/categoriesData';
import { GifSearchResult, TenorResultItem } from '../types';

export { generateTenorSlug as getTenorSlug };

const API_TIMEOUT_MS = 7000;
const MAX_RESULTS = 40;

function createAbortSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timeout };
}

function normalizeResult(data: any, fallbackCategory: string, query: string, offset: number, requestedLimit: number): GifSearchResult | null {
  if (!data?.success || !Array.isArray(data.results)) return null;
  const results = data.results as TenorResultItem[];
  const allGifs = results.map((item) => item?.media?.[0]?.gif?.url || item?.url).filter(Boolean) as string[];
  if (!allGifs.length) return null;
  const rawNext = data.next ?? data.next_offset;
  const parsedNext = typeof rawNext === 'number' ? rawNext : Number.parseInt(String(rawNext ?? ''), 10);
  const candidateNext = Number.isFinite(parsedNext) && parsedNext > offset ? String(parsedNext) : undefined;
  const fallbackNext = results.length >= requestedLimit ? String(offset + results.length) : undefined;
  return {
    gifUrl: allGifs[0], allGifs, results,
    searchUrl: data.search_url || `https://kaise.space/?search=${encodeURIComponent(query)}`,
    tenorSearchUrl: data.tenor_search_url || `https://tenor.com/search/${encodeURIComponent(generateTenorSlug(query))}`,
    totalFound: Number(data.total_found || data.total || results.length),
    fromCache: Boolean(data.from_cache), categoryMatched: data.category || fallbackCategory,
    next: candidateNext || fallbackNext,
  };
}

export async function searchOnlineGifs(rawQuery: string, forcedCategory?: string, limit = 30, pos = '0'): Promise<GifSearchResult> {
  const query = (rawQuery || 'geral').trim() || 'geral';
  const category = forcedCategory || detectCategoryFromQuery(query);
  const offset = Math.max(Number.parseInt(pos, 10) || 0, 0);
  const safeLimit = Math.min(Math.max(Number(limit) || 30, 1), MAX_RESULTS);

  if (typeof window !== 'undefined') {
    try {
      const { controller, timeout } = createAbortSignal(API_TIMEOUT_MS);
      const params = new URLSearchParams({ search: query, q: query, limit: String(safeLimit), offset: String(offset), pos: String(offset) });
      if (forcedCategory) params.set('category', forcedCategory);
      const response = await fetch(`/api/gifs?${params.toString()}`, { signal: controller.signal, headers: { Accept: 'application/json' }, cache: 'no-store' });
      window.clearTimeout(timeout);
      if (response.ok) {
        const data = await response.json();
        const normalized = normalizeResult(data, category, query, offset, safeLimit);
        if (normalized) return normalized;
      }
    } catch {
      // Local catalog keeps the gallery usable when the API is unavailable.
    }
    return createLocalCategoryResult(query, category, offset, safeLimit);
  }

  return scrapeGifsFromSite(query, forcedCategory, safeLimit, String(offset));
}

export async function getRandomGif(category?: string) {
  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      const { controller, timeout } = createAbortSignal(API_TIMEOUT_MS);
      const response = await fetch(`/api/v1/random?${params.toString()}`, { signal: controller.signal, headers: { Accept: 'application/json' }, cache: 'no-store' });
      window.clearTimeout(timeout);
      if (response.ok) {
        const data = await response.json();
        if (data?.success && data?.result) return data.result;
      }
    } catch {
      // Fall back locally.
    }
  }
  return getRandomScrapedGif(category);
}

function createLocalCategoryResult(query: string, category: string, offset: number, limit: number): GifSearchResult {
  const categoryObject = GIF_CATEGORIES.find((item) => item.id === category) || GIF_CATEGORIES[0];
  const source = categoryObject?.gifs || [];
  if (!source.length || offset >= source.length) {
    return { gifUrl: '', allGifs: [], results: [], searchUrl: `https://www.kaise.space/?search=${encodeURIComponent(query)}`, tenorSearchUrl: `https://tenor.com/search/${encodeURIComponent(generateTenorSlug(query))}`, totalFound: source.length, fromCache: false, categoryMatched: category, next: undefined };
  }
  const ordered = source.slice(offset, Math.min(offset + limit, source.length));
  const results: TenorResultItem[] = ordered.map((gif, index) => ({
    id: `local-${gif.id}-${offset}-${index}`, title: gif.title, content_description: gif.title,
    itemurl: 'https://www.kaise.space/', url: gif.url, hasaudio: false,
    media: [{ gif: { url: gif.url, dims: [498, 278] }, tinygif: { url: gif.url, dims: [220, 122] } }],
    tags: gif.tags, source: { provider: 'kaise-local', url: 'https://www.kaise.space/' },
  }));
  const allGifs = results.map((item) => item.url);
  const nextOffset = offset + allGifs.length;
  return {
    gifUrl: allGifs[0] || '', allGifs, results,
    searchUrl: `https://www.kaise.space/?search=${encodeURIComponent(query)}`,
    tenorSearchUrl: `https://tenor.com/search/${encodeURIComponent(generateTenorSlug(query))}`,
    totalFound: source.length, fromCache: false, categoryMatched: category,
    next: nextOffset < source.length ? String(nextOffset) : undefined,
  };
}
