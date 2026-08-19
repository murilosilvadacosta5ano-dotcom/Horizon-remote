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
const MAX_CACHE_ENTRIES = 300;

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
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  return clean.endsWith("-gifs") ? clean : `${clean}-gifs`;
}

function formatCleanTitle(rawTitle: string | undefined, query: string, url: string): string {
  if (rawTitle && rawTitle.trim() && !rawTitle.includes('#') && rawTitle.length > 2) {
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

/**
 * 1. Busca no Tenor V1 Public API
 */
async function fetchFromTenorPublicApi(
  query: string, 
  limit: number, 
  pos?: string
): Promise<{ items: TenorResultItem[]; nextPos?: string }> {
  try {
    const apiKey = 'LIVDSRZULELA';
    const params = new URLSearchParams({
      q: query,
      key: apiKey,
      limit: Math.min(limit, 50).toString(),
      locale: 'pt_BR',
      media_filter: 'minimal',
    });
    if (pos && pos !== "0") {
      params.append('pos', pos);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

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
        const mappedItems: TenorResultItem[] = data.results.map((r: any) => {
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

        return {
          items: mappedItems,
          nextPos: data.next ? String(data.next) : undefined
        };
      }
    }
  } catch {
    // Failover silencioso
  }
  return { items: [] };
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
    if (cleanUrl.includes('badge') || cleanUrl.includes('logo') || cleanUrl.includes('icon') || cleanUrl.includes('avatar')) {
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
            mp4: { url: '' }
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
  const cleanQuery = (rawQuery || "geral").trim();
  const isDirectSearch = Boolean(rawQuery && rawQuery.trim() && rawQuery.trim().toLowerCase() !== "geral");
  
  const matchedCategory = forcedCategory || (isDirectSearch ? 'geral' : detectCategoryFromQuery(cleanQuery));
  const pageOffset = parseInt(pos || "0", 10) || 0;
  const cacheKey = `scrape:${cleanQuery.toLowerCase()}:${pageOffset}`;

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
      categoryMatched: matchedCategory,
      next: `${pageOffset + cached.results.length}`
    };
  }

  let extractedItems: TenorResultItem[] = [];
  let nextPosToken: string | undefined = undefined;

  // Tentar 1: API Pública
  const publicApiRes = await fetchFromTenorPublicApi(cleanQuery, limit * 2, pos);
  extractedItems = publicApiRes.items;
  nextPosToken = publicApiRes.nextPos;

  // Tentar 2: Scraping
  if (extractedItems.length === 0) {
    try {
      const urlsToScrape = [
        `https://tenor.com/pt-BR/search/${encodeURIComponent(slug)}`,
        `https://tenor.com/search/${encodeURIComponent(slug)}`
      ];

      for (const url of urlsToScrape) {
        if (extractedItems.length >= 36) break;

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
          // Ignora
        }
      }
    } catch {
      // Ignora
    }
  }

  // Deduplicação estrita baseada em ID do Tenor e URL limpa
  const uniqueSeenIds = new Set<string>();
  const uniqueSeenUrls = new Set<string>();
  const filteredItems: TenorResultItem[] = [];
  for (const item of extractedItems) {
    const url = item.media[0]?.gif?.url || item.url;
    const gifId = extractTenorGifId(url);
    if (url && !uniqueSeenUrls.has(url) && (!gifId || !uniqueSeenIds.has(gifId))) {
      uniqueSeenUrls.add(url);
      if (gifId) uniqueSeenIds.add(gifId);
      filteredItems.push(item);
    }
  }

  // Paginação / Fatiamento dos resultados
  let finalResults: TenorResultItem[] = [];
  if (filteredItems.length > 0) {
    // Se veio da API direta com token pos, pega os primeiros 'limit' itens
    if (nextPosToken) {
      finalResults = filteredItems.slice(0, limit);
    } else if (pageOffset > 0) {
      finalResults = filteredItems.slice(pageOffset, pageOffset + limit);
    } else {
      finalResults = filteredItems.slice(0, limit);
    }
  }

  let allGifUrls = finalResults.map(r => r.media[0]?.gif?.url || r.url);

  // Fallback 3: local (somente se nada foi retornado e não é rolagem avançada)
  if (finalResults.length === 0 && (!pos || pos === "0")) {
    const catObj = GIF_CATEGORIES.find(c => c.id === matchedCategory) || GIF_CATEGORIES[0];
    finalResults = catObj.gifs.slice(0, limit).map((g, idx) => ({
      id: `${g.id}-${idx}`,
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

  if (SCRAPE_CACHE.size >= MAX_CACHE_ENTRIES) {
    const oldest = SCRAPE_CACHE.keys().next().value;
    if (oldest) SCRAPE_CACHE.delete(oldest);
  }

  const selectedIdx = Math.floor(Math.random() * (allGifUrls.length || 1));
  const selectedGif = allGifUrls[selectedIdx] || allGifUrls[0];
  const nextToken = nextPosToken || (pageOffset + finalResults.length).toString();

  // Gerar o formato padronizado Kaise API
  const kaiseResults = finalResults.map((r) => {
    const mainGif = r.media[0]?.gif;
    const tinyGif = r.media[0]?.tinygif;
    const gifUrl = mainGif?.url || r.url;
    const previewUrl = tinyGif?.url || gifUrl;
    const rawId = extractTenorGifId(gifUrl);

    return {
      id: `kaise_${rawId || Math.random().toString(36).substring(2, 8)}`,
      title: r.title || 'GIF',
      url: gifUrl,
      preview: previewUrl,
      width: mainGif?.dims?.[0] || 498,
      height: mainGif?.dims?.[1] || 278,
      category: matchedCategory,
      tags: r.tags || [cleanQuery],
      source: {
        provider: 'tenor',
        id: rawId,
        url: r.itemurl || `https://tenor.com/view/${rawId}`,
        attribution: 'Tenor'
      }
    };
  });

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
    kaiseResults,
    searchUrl: tenorSearchWebUrl,
    tenorSearchUrl: tenorSearchWebUrl,
    totalFound: allGifUrls.length,
    fromCache: false,
    categoryMatched: matchedCategory,
    next: nextToken
  };
}

export async function getRandomScrapedGif(category?: string) {
  const query = category || "geral";
  const result = await scrapeGifsFromSite(query, category, 30, "0");
  if (!result.results || result.results.length === 0) {
    throw new Error("Nenhum GIF encontrado para seleção aleatória.");
  }
  const index = Math.floor(Math.random() * result.results.length);
  const gif = result.results[index];
  const url = gif.media?.[0]?.gif?.url || gif.url;
  const isTenor = gif.id ? gif.id.startsWith("tenor-") : true;

  return {
    id: gif.id || `kaise-random-${Math.random().toString(36).substring(2, 8)}`,
    url,
    preview: gif.media?.[0]?.tinygif?.url || url,
    title: gif.title || "Random GIF",
    category: result.categoryMatched,
    source: {
      provider: isTenor ? "tenor" : "kaise-local",
      url: gif.itemurl || url,
      attribution: isTenor ? "Tenor" : "Kaise Local Library"
    }
  };
}

