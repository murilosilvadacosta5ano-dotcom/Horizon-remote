import { GIF_CATEGORIES } from '../src/data/categoriesData';

interface TenorMediaFormat {
  url: string;
  dims?: [number, number];
  duration?: number;
  size?: number;
}

interface TenorResultItem {
  id: string;
  title: string;
  content_description?: string;
  itemurl: string;
  url: string;
  hasaudio: boolean;
  media: Array<{
    gif: TenorMediaFormat;
    tinygif?: TenorMediaFormat;
    mp4?: { url: string };
  }>;
  tags: string[];
}

export function extractTenorGifId(url: string): string {
  if (!url) return '';

  const idMatch = url.match(/\/([a-zA-Z0-9_-]+)AAAA[a-zA-Z0-9_]/i);
  if (idMatch?.[1]) {
    return idMatch[1].replace(/^m\//, '').replace(/^m_/, '');
  }

  const parts = url.split('/');
  const last = parts[parts.length - 1] || '';
  return last.split('.')[0] || url;
}

export function generateTenorSlug(query: string): string {
  const clean = query
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

  return clean.endsWith('-gifs') ? clean : `${clean || 'trending'}-gifs`;
}

function formatCleanTitle(rawTitle: string | undefined, query: string, url: string): string {
  if (rawTitle && rawTitle.trim() && !rawTitle.includes('#') && rawTitle.length > 2) {
    return rawTitle
      .replace(/GIF/gi, '')
      .replace(/[-_]/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
      .substring(0, 50);
  }

  try {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1] || '';
    const slugName = lastPart
      .replace('.gif', '')
      .replace(/AAAA[a-zA-Z0-9_]+/i, '')
      .replace(/[-_]/g, ' ')
      .trim();

    if (slugName && slugName.length > 2 && !/^[0-9a-f]+$/i.test(slugName)) {
      return slugName
        .split(' ')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
        .substring(0, 45);
    }
  } catch {
    // Fallback abaixo.
  }

  return query
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .substring(0, 45) || 'GIF';
}

function extractGifsFromTenorHtml(
  html: string,
  query: string,
  category: string,
): TenorResultItem[] {
  const items: TenorResultItem[] = [];
  const seenGifIds = new Set<string>();

  const mediaRegex = /https:\/\/(?:media[0-9]*|c)\.tenor\.com\/[a-zA-Z0-9_\-\/]+(?:\/)?(?:[a-zA-Z0-9_\-]+)?\.gif/gi;
  const matches = html.match(mediaRegex) || [];

  for (const rawUrl of matches) {
    const cleanUrl = rawUrl
      .replace(/\\u002F/g, '/')
      .replace(/\\/g, '');

    if (
      cleanUrl.includes('badge') ||
      cleanUrl.includes('logo') ||
      cleanUrl.includes('icon') ||
      cleanUrl.includes('avatar')
    ) {
      continue;
    }

    const gifId = extractTenorGifId(cleanUrl);
    if (!gifId || seenGifIds.has(gifId)) continue;

    seenGifIds.add(gifId);

    const title = formatCleanTitle(undefined, query, cleanUrl);

    items.push({
      id: `tenor-${gifId}`,
      title,
      content_description: title,
      itemurl: `https://tenor.com/search/${encodeURIComponent(query)}`,
      url: cleanUrl,
      hasaudio: false,
      media: [
        {
          gif: {
            url: cleanUrl,
            dims: [498, 278],
            duration: 0,
            size: 0,
          },
          tinygif: {
            url: cleanUrl,
            dims: [220, 122],
            duration: 0,
            size: 0,
          },
        },
      ],
      tags: [query, category],
    });

    if (items.length >= 50) break;
  }

  return items;
}

function getFallbackResults(
  category: string,
  query: string,
  limit: number,
  offset: number,
  sourceUrl: string,
): TenorResultItem[] {
  const categoryObject =
    GIF_CATEGORIES.find((c) => c.id === category) || GIF_CATEGORIES[0];

  const gifs = categoryObject?.gifs || [];
  if (!gifs.length) return [];

  const start = offset % gifs.length;
  const ordered = [
    ...gifs.slice(start),
    ...gifs.slice(0, start),
  ];

  return ordered.slice(0, limit).map((gif, index) => ({
    id: `local-${gif.id}-${offset}-${index}`,
    title: gif.title,
    content_description: gif.title,
    itemurl: sourceUrl,
    url: gif.url,
    hasaudio: false,
    media: [
      {
        gif: {
          url: gif.url,
          dims: [498, 278],
          duration: 0,
          size: 0,
        },
        tinygif: {
          url: gif.url,
          dims: [220, 122],
          duration: 0,
          size: 0,
        },
      },
    ],
    tags: gif.tags,
  }));
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
    });
  }

  const rawQuery = String(
    req.query?.search || req.query?.q || 'geral',
  ).trim().slice(0, 100) || 'geral';

  const category = String(
    req.query?.category || 'geral',
  ).trim().toLowerCase();

  const limit = Math.min(
    Math.max(parseInt(String(req.query?.limit || '20'), 10) || 20, 1),
    50,
  );

  const pageOffset = Math.max(
    parseInt(String(req.query?.pos || '0'), 10) || 0,
    0,
  );

  const slug = generateTenorSlug(rawQuery);
  const tenorSearchWebUrl = `https://tenor.com/pt-BR/search/${encodeURIComponent(slug)}`;

  let extractedItems: TenorResultItem[] = [];

  // Keep the live provider request short. A Vercel Function must not wait
  // through several long provider attempts before returning the fallback.
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2200);

    try {
      const response = await fetch(tenorSearchWebUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        },
      });

      if (response.ok) {
        const html = await response.text();
        extractedItems = extractGifsFromTenorHtml(
          html,
          rawQuery,
          category,
        );
      }
    } finally {
      clearTimeout(timeoutId);
    }
  } catch {
    // Provider unavailable or timed out. The local catalog remains available.
  }

  // Strict ID/URL deduplication.
  const seenIds = new Set<string>();
  const filteredItems = extractedItems.filter((item) => {
    const url = item.media[0]?.gif?.url || item.url;
    const id = extractTenorGifId(url);

    if (!id || seenIds.has(id)) return false;
    seenIds.add(id);
    return true;
  });

  let finalResults = filteredItems.slice(
    pageOffset,
    pageOffset + limit,
  );

  let sourceType: 'tenor' | 'kaise-local' = 'tenor';

  if (!finalResults.length) {
    sourceType = 'kaise-local';
    finalResults = getFallbackResults(
      category,
      rawQuery,
      limit,
      pageOffset,
      'https://www.kaise.space/',
    );
  }

  const allGifUrls = finalResults
    .map((result) => result.media[0]?.gif?.url || result.url)
    .filter(Boolean);

  if (!allGifUrls.length) {
    return res.status(404).json({
      success: false,
      error: 'NO_GIFS_FOUND',
      query: rawQuery,
      category,
    });
  }

  const selectedGif =
    allGifUrls[Math.floor(Math.random() * allGifUrls.length)];

  const resultsWithSource = finalResults.map((result) => ({
    ...result,
    source: {
      provider: result.id.startsWith('tenor-') ? 'tenor' : 'kaise-local',
      url: result.itemurl,
    },
  }));

  return res.status(200).json({
    status: 200,
    success: true,
    query: rawQuery,
    category,
    gif_url: selectedGif,
    all_gifs: allGifUrls,
    results: resultsWithSource,
    total_found: allGifUrls.length,
    next: String(pageOffset + finalResults.length),
    search_url: tenorSearchWebUrl,
    tenor_search_url: tenorSearchWebUrl,
    source: sourceType,
    from_cache: false,
  });
}
