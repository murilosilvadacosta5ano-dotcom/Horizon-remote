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
  if (idMatch && idMatch[1]) {
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
  return clean.endsWith('-gifs') ? clean : `${clean}-gifs`;
}

function formatCleanTitle(rawTitle: string | undefined, query: string, url: string): string {
  if (rawTitle && rawTitle.trim() && !rawTitle.includes('#') && rawTitle.length > 2) {
    return rawTitle
      .replace(/GIF/gi, '')
      .replace(/[-_]/g, ' ')
      .trim()
      .split(' ')
      .filter((w) => w.length > 0)
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
        .filter((w) => w.length > 0)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
        .substring(0, 45);
    }
  } catch {
    // Ignora
  }

  return query
    .split(' ')
    .filter((w) => w.length > 0)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .substring(0, 45);
}

/**
 * 1. Busca via Tenor Public API v1
 */
async function fetchFromTenorPublicApi(query: string, limit: number, pos?: string): Promise<TenorResultItem[]> {
  try {
    const apiKey = 'LIVDSRZULELA'; // Chave pública anônima oficial do Tenor v1
    const params = new URLSearchParams({
      q: query,
      key: apiKey,
      limit: limit.toString(),
      locale: 'pt_BR',
      media_filter: 'minimal',
    });
    if (pos) params.append('pos', pos);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`https://g.tenor.com/v1/search?${params.toString()}`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        return data.results.map((r: any) => {
          const gifObj = r.media?.[0]?.gif || r.media?.[0]?.mediumgif || {};
          const tinyObj = r.media?.[0]?.tinygif || gifObj;
          const mp4Obj = r.media?.[0]?.mp4 || {};
          const gifUrl = gifObj.url || r.url || '';
          const cleanTitle = formatCleanTitle(r.title || r.content_description, query, gifUrl);

          return {
            id: r.id ? `tenor-${r.id}` : `tenor-${extractTenorGifId(gifUrl)}`,
            title: cleanTitle,
            content_description: cleanTitle,
            itemurl: r.itemurl || `https://tenor.com/search/${encodeURIComponent(query)}`,
            url: gifUrl,
            hasaudio: Boolean(r.hasaudio),
            media: [
              {
                gif: { url: gifUrl, dims: gifObj.dims || [498, 278], duration: 0, size: 0 },
                tinygif: { url: tinyObj.url || gifUrl, dims: tinyObj.dims || [220, 122], duration: 0, size: 0 },
                mp4: { url: mp4Obj.url || '' },
              },
            ],
            tags: r.tags || [query],
          };
        });
      }
    }
  } catch {
    // Failover para scraping
  }
  return [];
}

/**
 * 2. Extração via Regex no HTML do Tenor
 */
function extractGifsFromTenorHtml(html: string, query: string, category: string): TenorResultItem[] {
  const items: TenorResultItem[] = [];
  const seenGifIds = new Set<string>();

  const mediaRegex = /https:\/\/(?:media[0-9]*|c)\.tenor\.com\/[a-zA-Z0-9_\-\/]+(?:\/)?(?:[a-zA-Z0-9_\-]+)?\.gif/gi;
  const matches = html.match(mediaRegex) || [];

  for (const rawUrl of matches) {
    const cleanUrl = rawUrl.replace(/\\u002F/g, '/').replace(/\\/g, '');
    if (
      cleanUrl.includes('badge') ||
      cleanUrl.includes('logo') ||
      cleanUrl.includes('icon') ||
      cleanUrl.includes('avatar')
    ) {
      continue;
    }

    const gifId = extractTenorGifId(cleanUrl);
    if (!seenGifIds.has(gifId)) {
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
            gif: { url: cleanUrl, dims: [498, 278], duration: 0, size: 0 },
            tinygif: { url: cleanUrl, dims: [220, 122], duration: 0, size: 0 },
            mp4: { url: cleanUrl.replace('.gif', '.mp4') },
          },
        ],
        tags: [query, category],
      });
    }
  }

  return items;
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let searchParam = req.query?.search || req.query?.q || req.body?.search || req.body?.q || 'geral';
  let categoryParam = req.query?.category || req.body?.category || 'geral';
  const limitParam = Math.min(parseInt(req.query?.limit || req.body?.limit || '24', 10) || 24, 50);
  const posParam = req.query?.pos || req.body?.pos;

  const rawQuery = searchParam.toString().trim();
  const category = categoryParam.toString();
  const pageOffset = parseInt(posParam || '0', 10) || 0;

  const slug = generateTenorSlug(rawQuery);
  const tenorSearchWebUrl = `https://tenor.com/pt-BR/search/${encodeURIComponent(slug)}`;

  let extractedItems: TenorResultItem[] = [];

  // Tentar 1: Tenor Public API v1
  extractedItems = await fetchFromTenorPublicApi(rawQuery, limitParam * 2, posParam);

  // Tentar 2: Scraping se a API pública não retornar
  if (extractedItems.length === 0) {
    try {
      const urlsToScrape = [
        `https://tenor.com/pt-BR/search/${encodeURIComponent(slug)}`,
        `https://tenor.com/search/${encodeURIComponent(slug)}`
      ];

      for (const url of urlsToScrape) {
        if (extractedItems.length >= 30) break;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);

          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            },
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const html = await response.text();
            const found = extractGifsFromTenorHtml(html, rawQuery, category);
            if (found.length > 0) {
              extractedItems = [...extractedItems, ...found];
            }
          }
        } catch {
          // Ignora timeout
        }
      }
    } catch {
      // Ignora erro
    }
  }

  // Deduplicação estrita de IDs do Tenor
  const uniqueSeenIds = new Set<string>();
  const filteredItems: TenorResultItem[] = [];
  for (const item of extractedItems) {
    const url = item.media[0]?.gif?.url || item.url;
    const gifId = extractTenorGifId(url);
    if (gifId && !uniqueSeenIds.has(gifId)) {
      uniqueSeenIds.add(gifId);
      filteredItems.push(item);
    }
  }

  let finalResults: TenorResultItem[] = [];
  if (filteredItems.length > 0) {
    if (pageOffset >= filteredItems.length) {
      const rotatedIndex = pageOffset % filteredItems.length;
      finalResults = [
        ...filteredItems.slice(rotatedIndex),
        ...filteredItems.slice(0, rotatedIndex),
      ].slice(0, limitParam);
    } else {
      finalResults = filteredItems.slice(pageOffset, pageOffset + limitParam);
      if (finalResults.length === 0) {
        finalResults = filteredItems.slice(0, limitParam);
      }
    }
  }

  let allGifUrls = finalResults.map((r) => r.media[0]?.gif?.url || r.url);

  // Fallback 3: Tentar encontrar termo no banco local se nada for retornado
  if (finalResults.length === 0) {
    const queryLower = rawQuery.toLowerCase();
    
    // Tenta encontrar em todas as categorias por palavras-chave
    let matchingGifs: { id: string; title: string; url: string; tags: string[] }[] = [];
    for (const cat of GIF_CATEGORIES) {
      for (const g of cat.gifs) {
        if (
          g.title.toLowerCase().includes(queryLower) ||
          g.tags.some(t => t.toLowerCase().includes(queryLower)) ||
          cat.id === category
        ) {
          matchingGifs.push(g);
        }
      }
    }

    if (matchingGifs.length === 0) {
      const catObj = GIF_CATEGORIES.find((c) => c.id === category) || GIF_CATEGORIES[0];
      matchingGifs = catObj.gifs;
    }

    const startIndex = pageOffset % matchingGifs.length;
    const sliceGifs = [
      ...matchingGifs.slice(startIndex),
      ...matchingGifs.slice(0, startIndex),
    ].slice(0, limitParam);

    finalResults = sliceGifs.map((g, idx) => ({
      id: `${g.id}-p${pageOffset}-${idx}`,
      title: g.title,
      content_description: g.title,
      itemurl: tenorSearchWebUrl,
      url: g.url,
      hasaudio: false,
      media: [
        {
          gif: { url: g.url, dims: [498, 278], duration: 0, size: 0 },
          tinygif: { url: g.url, dims: [220, 122], duration: 0, size: 0 },
          mp4: { url: '' },
        },
      ],
      tags: g.tags,
    }));
    allGifUrls = finalResults.map((r) => r.url);
  }

  const selectedIdx = Math.floor(Math.random() * allGifUrls.length);
  const selectedGif = allGifUrls[selectedIdx] || allGifUrls[0];
  const nextNumber = pageOffset + finalResults.length;

  return res.status(200).json({
    status: 200,
    query: rawQuery,
    category,
    gif_url: selectedGif,
    all_gifs: allGifUrls,
    results: finalResults,
    total_found: allGifUrls.length,
    next: nextNumber.toString(),
    search_url: tenorSearchWebUrl,
    tenorSearchUrl: tenorSearchWebUrl,
    from_cache: false,
  });
}
