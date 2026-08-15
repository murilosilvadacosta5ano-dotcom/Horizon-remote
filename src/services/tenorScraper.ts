import { detectCategoryFromQuery, getCategoryGifs, GIF_CATEGORIES } from "../data/categoriesData";
import { GifSearchResult, TenorResultItem } from "../types";

interface ScrapedCacheEntry {
  gifs: string[];
  results: TenorResultItem[];
  lastUsedIndex: number;
  timestamp: number;
  tenorUrl: string;
  category: string;
}

const SCRAPE_CACHE = new Map<string, ScrapedCacheEntry>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutos
const MAX_CACHE_ENTRIES = 250;

export function generateTenorSlug(query: string): string {
  const clean = query
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  return clean.endsWith("-gifs") ? clean : `${clean}-gifs`;
}

function formatCleanTitle(rawTitle: string | undefined, query: string, url: string): string {
  if (rawTitle && rawTitle.trim() && !rawTitle.includes('#') && rawTitle.length > 3) {
    return rawTitle
      .replace(/GIF/gi, '')
      .replace(/[-_]/g, ' ')
      .trim()
      .split(' ')
      .filter(w => w.length > 0)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
      .substring(0, 50);
  }

  // Tenta extrair do URL
  try {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1] || '';
    const slugName = lastPart.replace('.gif', '').replace(/[-_]/g, ' ').trim();
    if (slugName && slugName.length > 2 && !/^[0-9a-f]+$/i.test(slugName)) {
      return slugName
        .split(' ')
        .filter(w => w.length > 0)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
        .substring(0, 45);
    }
  } catch {
    // Ignora
  }

  return query
    .split(' ')
    .filter(w => w.length > 0)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .substring(0, 45);
}

function extractGifsFromTenorHtml(html: string, query: string, category: string): TenorResultItem[] {
  const items: TenorResultItem[] = [];
  const seenUrls = new Set<string>();

  // 1. Extração de __NEXT_DATA__
  try {
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
    if (nextDataMatch && nextDataMatch[1]) {
      const json = JSON.parse(nextDataMatch[1]);
      const results = json?.props?.pageProps?.results || json?.props?.pageProps?.initialResults || [];
      if (Array.isArray(results) && results.length > 0) {
        for (const item of results) {
          const gifUrl = item.mediaFormats?.gif?.url || item.media_formats?.gif?.url || item.url;
          if (gifUrl && !seenUrls.has(gifUrl)) {
            seenUrls.add(gifUrl);
            const title = formatCleanTitle(item.contentDescription || item.title, query, gifUrl);
            items.push({
              id: item.id || `scraped-${items.length}-${Math.random().toString(36).substring(2, 6)}`,
              title,
              content_description: title,
              itemurl: item.itemUrl || `https://tenor.com/view/${item.id || ''}`,
              url: gifUrl,
              hasaudio: Boolean(item.hasAudio),
              media: [
                {
                  gif: { url: gifUrl, dims: [498, 278], duration: 0, size: 0 },
                  tinygif: { url: item.mediaFormats?.tinygif?.url || gifUrl, dims: [220, 122] },
                  mp4: { url: item.mediaFormats?.mp4?.url || '' }
                }
              ],
              tags: item.tags || [query, category]
            });
          }
        }
      }
    }
  } catch {
    // Continua
  }

  // 2. Extração via Regex no HTML
  const mediaRegex = /https:\/\/media[0-9]*\.tenor\.com\/[a-zA-Z0-9_\-\/]+(?:\/)?(?:[a-zA-Z0-9_\-]+)?\.gif/gi;
  const matches = html.match(mediaRegex) || [];

  for (const rawUrl of matches) {
    const cleanUrl = rawUrl.replace(/\\u002F/g, '/').replace(/\\/g, '');
    if (!cleanUrl.includes('badge') && !cleanUrl.includes('logo') && !seenUrls.has(cleanUrl)) {
      seenUrls.add(cleanUrl);
      const title = formatCleanTitle(undefined, query, cleanUrl);
      items.push({
        id: `tenor-web-${items.length}-${Math.random().toString(36).substring(2, 6)}`,
        title,
        content_description: title,
        itemurl: `https://tenor.com/search/${encodeURIComponent(query)}`,
        url: cleanUrl,
        hasaudio: false,
        media: [
          {
            gif: { url: cleanUrl, dims: [498, 278], duration: 0, size: 0 },
            tinygif: { url: cleanUrl, dims: [220, 122], duration: 0, size: 0 },
            mp4: { url: cleanUrl.replace('.gif', '.mp4') }
          }
        ],
        tags: [query, category]
      });
    }
  }

  return items;
}

export async function scrapeGifsFromSite(
  rawQuery: string,
  forcedCategory?: string,
  limit: number = 30,
  pos?: string
): Promise<GifSearchResult> {
  const cleanQuery = (rawQuery || "geral").trim().toLowerCase();
  const matchedCategory = forcedCategory || detectCategoryFromQuery(cleanQuery);
  const cacheKey = `scrape:${matchedCategory}:${cleanQuery}:${pos || '0'}`;

  const slug = generateTenorSlug(cleanQuery);
  const tenorSearchWebUrl = `https://tenor.com/pt-BR/search/${encodeURIComponent(slug)}`;

  // 1. Cache
  const cached = SCRAPE_CACHE.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL && cached.gifs.length > 0) {
    cached.lastUsedIndex = (cached.lastUsedIndex + 1) % cached.gifs.length;
    return {
      gifUrl: cached.gifs[cached.lastUsedIndex],
      allGifs: cached.gifs,
      results: cached.results,
      searchUrl: tenorSearchWebUrl,
      tenorSearchUrl: tenorSearchWebUrl,
      totalFound: cached.gifs.length,
      fromCache: true,
      categoryMatched: cached.category,
      next: `${(parseInt(pos || "0", 10) || 0) + cached.results.length}`
    };
  }

  // 2. Termos de busca otimizados por categoria com variações para paginação
  const pageOffset = parseInt(pos || "0", 10) || 0;
  
  let targetSearchTerm = cleanQuery;
  const categoryVariations: Record<string, string[]> = {
    animes: ['anime', 'manga scenes', 'anime fighting', 'anime funny', 'otaku epic', 'anime cute'],
    jogos: ['game', 'gaming highlights', 'minecraft gameplay', 'nintendo gaming', 'game funny', 'gamer win'],
    desenhos: ['cartoon', 'classic animation', 'spongebob cartoon', 'looney tunes', 'disney scenes'],
    memes: ['meme', 'funny viral', 'reaction meme', 'comedy gif', 'internet humor', 'laugh meme'],
    reacoes: ['reaction', 'funny reaction', 'emotional reaction', 'shocked reaction', 'happy reaction'],
    filmes: ['movie scene', 'cinema moment', 'action movie', 'classic film', 'hollywood movie'],
    series: ['series scene', 'tv show moment', 'the office scene', 'friends series', 'breaking bad tv'],
    geral: ['trending popular', 'viral gifs', 'celebration happy', 'epic moment', 'fun dancing']
  };

  const variations = categoryVariations[matchedCategory] || [matchedCategory];
  const variationIndex = Math.floor(pageOffset / 12) % variations.length;
  const currentModifier = variations[variationIndex];

  if (cleanQuery === 'geral' || cleanQuery === matchedCategory) {
    targetSearchTerm = currentModifier;
  } else if (!cleanQuery.includes(currentModifier)) {
    targetSearchTerm = `${cleanQuery} ${currentModifier}`;
  }

  const searchSlug = generateTenorSlug(targetSearchTerm);
  let extractedItems: TenorResultItem[] = [];

  // 3. Extração online no Tenor
  try {
    const urlsToScrape = [
      `https://tenor.com/pt-BR/search/${encodeURIComponent(searchSlug)}`,
      `https://tenor.com/search/${encodeURIComponent(searchSlug)}`,
      `https://tenor.com/pt-BR/search/${encodeURIComponent(slug)}`
    ];

    for (const url of urlsToScrape) {
      if (extractedItems.length >= 24) break;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          }
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const html = await response.text();
          const found = extractGifsFromTenorHtml(html, cleanQuery, matchedCategory);
          if (found.length > 0) {
            extractedItems = [...extractedItems, ...found];
          }
        }
      } catch {
        // Ignora timeouts
      }
    }
  } catch {
    // Silencia qualquer exceção
  }

  // 4. Filtragem e Deduplicação estrita de URLs
  const uniqueUrls = new Set<string>();
  const filteredItems: TenorResultItem[] = [];
  for (const item of extractedItems) {
    const url = item.media[0]?.gif?.url || item.url;
    if (url && !uniqueUrls.has(url)) {
      uniqueUrls.add(url);
      filteredItems.push(item);
    }
  }

  // 5. Fallback estruturado com o repositório de categorias
  let finalResults = filteredItems.slice(0, limit);
  let allGifUrls = finalResults.map(r => r.media[0]?.gif?.url || r.url);

  if (finalResults.length === 0) {
    const catObj = GIF_CATEGORIES.find(c => c.id === matchedCategory) || GIF_CATEGORIES[0];
    const startIndex = pageOffset % catObj.gifs.length;
    // Rotação de GIFs da categoria para nunca faltar ao rolar
    const sliceGifs = [
      ...catObj.gifs.slice(startIndex),
      ...catObj.gifs.slice(0, startIndex)
    ];

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
          mp4: { url: '' }
        }
      ],
      tags: g.tags
    }));
    allGifUrls = finalResults.map(r => r.url);
  }

  // Salva no cache
  if (SCRAPE_CACHE.size >= MAX_CACHE_ENTRIES) {
    const oldest = SCRAPE_CACHE.keys().next().value;
    if (oldest) SCRAPE_CACHE.delete(oldest);
  }

  const selectedIdx = Math.floor(Math.random() * allGifUrls.length);
  const selectedGif = allGifUrls[selectedIdx] || allGifUrls[0];
  const nextNumber = pageOffset + finalResults.length;

  SCRAPE_CACHE.set(cacheKey, {
    gifs: allGifUrls,
    results: finalResults,
    lastUsedIndex: selectedIdx,
    timestamp: now,
    tenorUrl: tenorSearchWebUrl,
    category: matchedCategory
  });

  return {
    gifUrl: selectedGif,
    allGifs: allGifUrls,
    results: finalResults,
    searchUrl: tenorSearchWebUrl,
    tenorSearchUrl: tenorSearchWebUrl,
    totalFound: allGifUrls.length,
    fromCache: false,
    categoryMatched: matchedCategory,
    next: nextNumber.toString()
  };
}
