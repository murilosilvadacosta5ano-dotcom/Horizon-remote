import { GIF_CATEGORIES } from '../src/data/categoriesData';

type GifRecord = {
  id: string;
  title: string;
  url: string;
  tags: string[];
};

type CategoryRecord = {
  id: string;
  name: string;
  description: string;
  gifs: GifRecord[];
};

type ApiResult = GifRecord & {
  itemurl: string;
  source: {
    provider: string;
    url: string;
  };
};

const ALLOWED_CATEGORIES = new Set([
  'geral',
  'memes',
  'jogos',
  'animes',
  'desenhos',
  'reacoes',
  'filmes',
  'series',
]);

const MAX_LIMIT = 50;
const MAX_QUERY_LENGTH = 100;

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function safeInteger(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function scoreGif(gif: GifRecord, query: string): number {
  const q = normalize(query);
  if (!q || q === 'geral' || q === 'trending') return 1;

  const title = normalize(gif.title);
  const tags = gif.tags.map(normalize);
  let score = 0;

  if (title === q) score += 100;
  if (title.includes(q)) score += 50;

  for (const tag of tags) {
    if (tag === q) score += 80;
    else if (tag.includes(q) || q.includes(tag)) score += 20;
  }

  const words = q.split(/\s+/).filter(Boolean);
  for (const word of words) {
    if (title.includes(word)) score += 10;
    if (tags.some((tag) => tag.includes(word))) score += 8;
  }

  return score;
}

function loadCatalog(): CategoryRecord[] {
  return GIF_CATEGORIES as CategoryRecord[];
}

function searchCatalog(
  query: string,
  category: string,
  limit: number,
  offset: number,
): ApiResult[] {
  const categories = loadCatalog();
  const selected = category === 'geral'
    ? categories
    : categories.filter((item) => item.id === category);

  const pool = selected.flatMap((item) => item.gifs || []);
  const unique = new Map<string, GifRecord>();

  for (const gif of pool) {
    if (gif?.url && !unique.has(gif.url)) unique.set(gif.url, gif);
  }

  const all = Array.from(unique.values());
  const q = normalize(query);

  all.sort((a, b) => scoreGif(b, q) - scoreGif(a, q));

  const matching = q && q !== 'geral'
    ? all.filter((gif) => scoreGif(gif, q) > 0)
    : all;

  const sourceList = matching.length ? matching : all;
  const page = sourceList.slice(offset, offset + limit);

  return page.map((gif) => ({
    ...gif,
    itemurl: gif.url.includes('tenor.com')
      ? gif.url
      : 'https://www.kaise.space/',
    source: {
      provider: gif.url.includes('tenor.com') ? 'tenor' : 'kaise-local',
      url: gif.url.includes('tenor.com')
        ? gif.url
        : 'https://www.kaise.space/',
    },
  }));
}

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.setHeader('X-Powered-By', '');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
    });
  }

  try {
    const rawQuery = String(
      req.query?.search || req.query?.q || 'geral',
    ).trim().slice(0, MAX_QUERY_LENGTH) || 'geral';

    let category = normalize(String(req.query?.category || 'geral'));
    if (!ALLOWED_CATEGORIES.has(category)) category = 'geral';

    const limit = safeInteger(req.query?.limit, 20, 1, MAX_LIMIT);
    const offset = safeInteger(req.query?.pos ?? req.query?.offset, 0, 0, 10000);

    const results = searchCatalog(
      rawQuery,
      category,
      limit,
      offset,
    );

    if (!results.length) {
      return res.status(404).json({
        success: false,
        error: 'NO_GIFS_FOUND',
        query: rawQuery,
        category,
        results: [],
      });
    }

    const allGifs = results.map((gif) => gif.url);
    const selectedGif = allGifs[Math.floor(Math.random() * allGifs.length)];

    return res.status(200).json({
      status: 200,
      success: true,
      query: rawQuery,
      category,
      gif_url: selectedGif,
      all_gifs: allGifs,
      results,
      total_found: results.length,
      next: String(offset + results.length),
      search_url: `https://www.kaise.space/?search=${encodeURIComponent(rawQuery)}`,
      tenor_search_url: `https://tenor.com/search/${encodeURIComponent(rawQuery)}`,
      source: results[0].source.provider,
      from_cache: true,
    });
  } catch (error) {
    console.error('Kaise GIF API failed:', error);

    return res.status(500).json({
      success: false,
      error: 'GIF_API_FAILED',
      message: 'Unable to load the GIF catalog right now.',
    });
  }
}
