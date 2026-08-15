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

  // Tenta extrair do URL
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

function extractGifsFromTenorHtml(html: string, query: string, category: string): TenorResultItem[] {
  const items: TenorResultItem[] = [];
  const seenGifIds = new Set<string>();

  // 1. Extração via Regex no HTML (pegando todas as mídias do Tenor)
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
  const cleanQuery = (rawQuery || "geral").trim();
  const isDirectSearch = Boolean(rawQuery && rawQuery.trim() && rawQuery.trim().toLowerCase() !== "geral");
  
  // Se for busca direta do usuário, NÃO forçar categoria; manter a query exata
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

  // 2. Extração online no Tenor com a query exata
  try {
    const urlsToScrape = [
      `https://tenor.com/pt-BR/search/${encodeURIComponent(slug)}`,
      `https://tenor.com/search/${encodeURIComponent(slug)}`
    ];

    for (const url of urlsToScrape) {
      if (extractedItems.length >= 36) break;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

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

  // 3. Deduplicação estrita baseada em ID do Tenor
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

  // 4. Paginação / Fatiamento dos resultados encontrados
  let finalResults: TenorResultItem[] = [];
  if (filteredItems.length > 0) {
    if (pageOffset >= filteredItems.length) {
      // Se já rolou além do primeiro lote, entrega do início com nova rotação para nunca parar de exibir
      const rotatedIndex = pageOffset % filteredItems.length;
      finalResults = [
        ...filteredItems.slice(rotatedIndex),
        ...filteredItems.slice(0, rotatedIndex)
      ].slice(0, limit);
    } else {
      finalResults = filteredItems.slice(pageOffset, pageOffset + limit);
      if (finalResults.length === 0) {
        finalResults = filteredItems.slice(0, limit);
      }
    }
  }

  let allGifUrls = finalResults.map(r => r.media[0]?.gif?.url || r.url);

  // 5. Fallback estruturado com o repositório se a extração online falhar
  if (finalResults.length === 0) {
    const catObj = GIF_CATEGORIES.find(c => c.id === matchedCategory) || GIF_CATEGORIES[0];
    const startIndex = pageOffset % catObj.gifs.length;
    const sliceGifs = [
      ...catObj.gifs.slice(startIndex),
      ...catObj.gifs.slice(0, startIndex)
    ].slice(0, limit);

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
