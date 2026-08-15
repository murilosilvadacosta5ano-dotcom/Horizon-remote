import { detectCategoryFromQuery, GIF_CATEGORIES } from "../data/categoriesData";
import { GifSearchResult, TenorResultItem } from "../types";

interface ScrapedCacheEntry {
  gifs: string[];
  results: TenorResultItem[];
  lastUsedIndex: number;
  timestamp: number;
  provider: "tenor" | "kaise-local";
  category: string;
  query: string;
}

const SCRAPE_CACHE = new Map<string, ScrapedCacheEntry>();
const CACHE_TTL = 1000 * 60 * 30;
const MAX_CACHE_ENTRIES = 300;
const PROVIDER_TIMEOUT = 5000;

export function extractTenorGifId(url: string): string {
  if (!url) return "";

  const mediaMatch = url.match(/\/([a-zA-Z0-9_-]+)AAA[A-Z0-9_-]*/i);
  if (mediaMatch?.[1]) return mediaMatch[1];

  const parts = url.split("/");
  const last = parts[parts.length - 1] || "";
  return last.replace(/\.(gif|webp|mp4)$/i, "") || url;
}

export function generateTenorSlug(query: string): string {
  const clean = query
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return clean.endsWith("-gifs") ? clean : `${clean || "geral"}-gifs`;
}

function formatCleanTitle(
  rawTitle: string | undefined,
  query: string,
  url: string
): string {
  if (
    rawTitle &&
    rawTitle.trim() &&
    !rawTitle.includes("#") &&
    rawTitle.length > 2
  ) {
    return rawTitle
      .replace(/GIF/gi, "")
      .replace(/[-_]/g, " ")
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
      .substring(0, 50);
  }

  try {
    const lastPart = url.split("/").pop() || "";
    const slugName = lastPart
      .replace(/\.(gif|webp)$/i, "")
      .replace(/AAA[A-Za-z0-9_-]*/i, "")
      .replace(/[-_]/g, " ")
      .trim();

    if (slugName && slugName.length > 2 && !/^[0-9a-f]+$/i.test(slugName)) {
      return slugName
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
        .substring(0, 45);
    }
  } catch {
    // Fallback para a query.
  }

  return query
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .substring(0, 45);
}

function createTenorResult(
  url: string,
  query: string,
  category: string,
  index: number
): TenorResultItem {
  const id = extractTenorGifId(url);
  const title = formatCleanTitle(undefined, query, url);
  const sourceUrl = `https://tenor.com/pt-BR/search/${encodeURIComponent(
    generateTenorSlug(query)
  )}`;

  return {
    id: `tenor-${id || index}`,
    title,
    content_description: title,
    itemurl: sourceUrl,
    url,
    hasaudio: false,
    media: [
      {
        gif: { url, dims: [498, 278] },
        tinygif: { url, dims: [220, 122] },
      },
    ],
    tags: [query, category],
    source: {
      provider: "tenor",
      url: sourceUrl,
    },
  };
}

function extractGifsFromTenorHtml(
  html: string,
  query: string,
  category: string
): TenorResultItem[] {
  const items: TenorResultItem[] = [];
  const seen = new Set<string>();

  // Extrai somente URLs GIF do domínio de mídia do Tenor.
  const mediaRegex =
    /https?:\\?\/\\?\/(?:media[0-9]*|c)\.tenor\.com\\?\/[^"'<>\\s\\]+?\.gif/gi;

  const matches = html.match(mediaRegex) || [];

  for (const rawUrl of matches) {
    const cleanUrl = rawUrl
      .replace(/\\u002F/g, "/")
      .replace(/\\\//g, "/")
      .replace(/\\/g, "");

    if (
      !cleanUrl.startsWith("https://") ||
      !cleanUrl.includes(".tenor.com/") ||
      /(?:badge|logo|icon|avatar)/i.test(cleanUrl)
    ) {
      continue;
    }

    const gifId = extractTenorGifId(cleanUrl);
    if (!gifId || seen.has(gifId)) continue;

    seen.add(gifId);
    items.push(createTenorResult(cleanUrl, query, category, items.length));

    if (items.length >= 100) break;
  }

  return items;
}

function localFallback(
  query: string,
  category: string,
  limit: number,
  offset: number
): TenorResultItem[] {
  const categoryData =
    GIF_CATEGORIES.find((item) => item.id === category) || GIF_CATEGORIES[0];

  if (!categoryData || categoryData.gifs.length === 0) return [];

  const start = offset % categoryData.gifs.length;
  const ordered = [
    ...categoryData.gifs.slice(start),
    ...categoryData.gifs.slice(0, start),
  ].slice(0, limit);

  return ordered.map((gif, index) => ({
    id: `local-${gif.id}-${offset}-${index}`,
    title: gif.title,
    content_description: gif.title,
    itemurl: "https://kaise.space/",
    url: gif.url,
    hasaudio: false,
    media: [
      {
        gif: { url: gif.url, dims: [498, 278] },
        tinygif: { url: gif.url, dims: [220, 122] },
      },
    ],
    tags: [...gif.tags, query].filter(Boolean),
    source: {
      provider: "kaise-local",
      url: "https://kaise.space/",
    },
  }));
}

function setCache(key: string, entry: ScrapedCacheEntry) {
  if (SCRAPE_CACHE.size >= MAX_CACHE_ENTRIES && !SCRAPE_CACHE.has(key)) {
    const oldest = SCRAPE_CACHE.keys().next().value;
    if (oldest) SCRAPE_CACHE.delete(oldest);
  }

  SCRAPE_CACHE.set(key, entry);
}

export async function scrapeGifsFromSite(
  rawQuery: string,
  forcedCategory?: string,
  limit = 30,
  pos = "0"
): Promise<GifSearchResult> {
  const query = (rawQuery || "geral").trim() || "geral";
  const offset = Math.max(parseInt(pos || "0", 10) || 0, 0);
  const category = forcedCategory || detectCategoryFromQuery(query);
  const cacheKey = `search:${query.toLowerCase()}:${category}:${offset}:${limit}`;
  const now = Date.now();
  const searchUrl = `https://tenor.com/pt-BR/search/${encodeURIComponent(
    generateTenorSlug(query)
  )}`;

  const cached = SCRAPE_CACHE.get(cacheKey);
  if (
    cached &&
    now - cached.timestamp < CACHE_TTL &&
    cached.results.length > 0
  ) {
    cached.lastUsedIndex =
      (cached.lastUsedIndex + 1) % cached.results.length;

    return {
      gifUrl: cached.gifs[cached.lastUsedIndex],
      allGifs: cached.gifs,
      results: cached.results,
      searchUrl,
      tenorSearchUrl: searchUrl,
      totalFound: cached.results.length,
      fromCache: true,
      categoryMatched: cached.category,
      next: String(offset + cached.results.length),
    };
  }

  let extracted: TenorResultItem[] = [];

  const urls = [
    searchUrl,
    `https://tenor.com/search/${encodeURIComponent(generateTenorSlug(query))}`,
  ];

  for (const url of urls) {
    if (extracted.length >= 100) break;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        PROVIDER_TIMEOUT
      );

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Kaise-GIF-API/1.0",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const html = await response.text();
      extracted = [...extracted, ...extractGifsFromTenorHtml(html, query, category)];
    } catch {
      // Um provider indisponível não deve derrubar a API inteira.
    }
  }

  const unique = new Map<string, TenorResultItem>();
  for (const item of extracted) {
    const url = item.media?.[0]?.gif?.url || item.url;
    const id = extractTenorGifId(url);
    if (id && !unique.has(id)) unique.set(id, item);
  }

  let results = Array.from(unique.values()).slice(offset, offset + limit);

  if (results.length === 0) {
    results = localFallback(query, category, limit, offset);
  }

  if (results.length === 0) {
    throw new Error("No GIFs found");
  }

  const allGifs = results.map(
    (item) => item.media?.[0]?.gif?.url || item.url
  );
  const selectedIndex = Math.floor(Math.random() * allGifs.length);

  const provider = results.every(
    (item) => item.source?.provider === "kaise-local"
  )
    ? "kaise-local"
    : "tenor";

  setCache(cacheKey, {
    gifs: allGifs,
    results,
    lastUsedIndex: selectedIndex,
    timestamp: now,
    provider,
    category,
    query,
  });

  return {
    gifUrl: allGifs[selectedIndex] || allGifs[0],
    allGifs,
    results,
    searchUrl,
    tenorSearchUrl: searchUrl,
    totalFound: results.length,
    fromCache: false,
    categoryMatched: category,
    next: String(offset + results.length),
  };
}

export async function getRandomScrapedGif(category?: string) {
  const query = category || "geral";
  const result = await scrapeGifsFromSite(query, category, 30, "0");
  const index = Math.floor(Math.random() * result.results.length);
  const item = result.results[index];
  const url = item.media?.[0]?.gif?.url || item.url;

  return {
    id: item.id,
    url,
    title: item.title,
    category: result.categoryMatched,
    source: item.source || {
      provider: "kaise",
      url: result.searchUrl,
    },
  };
}
