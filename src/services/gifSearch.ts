import {
  scrapeGifsFromSite,
  generateTenorSlug,
  getRandomScrapedGif,
} from "./tenorScraper";
import {
  detectCategoryFromQuery,
  GIF_CATEGORIES,
} from "../data/categoriesData";
import { GifSearchResult, TenorResultItem } from "../types";

export { generateTenorSlug as getTenorSlug };

/**
 * Serviço central de GIFs.
 * No navegador consulta a Kaise API; no backend usa o provider/scraper.
 */
export async function searchOnlineGifs(
  rawQuery: string,
  forcedCategory?: string,
  limit = 30,
  pos = "0"
): Promise<GifSearchResult> {
  const cleanQuery = (rawQuery || "geral").trim() || "geral";
  const matchedCategory =
    forcedCategory || detectCategoryFromQuery(cleanQuery);
  const offset = Math.max(parseInt(pos || "0", 10) || 0, 0);
  const slug = generateTenorSlug(cleanQuery);
  const tenorSearchWebUrl = `https://tenor.com/pt-BR/search/${encodeURIComponent(slug)}`;

  if (typeof window !== "undefined") {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const params = new URLSearchParams({
        q: cleanQuery,
        limit: String(limit),
        offset: String(offset),
      });

      if (forcedCategory) {
        params.set("category", forcedCategory);
      }

      const response = await fetch(`/api/v1/search?${params.toString()}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.results) && data.results.length) {
          const allGifs = data.results.map(
            (item: TenorResultItem) => item.media?.[0]?.gif?.url || item.url
          );

          return {
            gifUrl: allGifs[0],
            allGifs,
            results: data.results,
            searchUrl: data.results[0]?.source?.url || tenorSearchWebUrl,
            tenorSearchUrl:
              data.results[0]?.source?.url || tenorSearchWebUrl,
            totalFound: data.total || data.results.length,
            fromCache: Boolean(data.from_cache),
            categoryMatched: data.category || matchedCategory,
            next: data.next_offset || String(offset + data.results.length),
          };
        }
      }
    } catch {
      // Fallback local seguro no navegador.
    }

    return createLocalCategoryResult(cleanQuery, matchedCategory, offset, limit);
  }

  return scrapeGifsFromSite(
    cleanQuery,
    forcedCategory,
    limit,
    String(offset)
  );
}

export async function getRandomGif(category?: string) {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams();
    if (category) params.set("category", category);

    const response = await fetch(`/api/v1/random?${params.toString()}`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error("Random GIF request failed");
    }

    const data = await response.json();
    return data.result;
  }

  return getRandomScrapedGif(category);
}

function createLocalCategoryResult(
  query: string,
  category: string,
  offset: number,
  limit: number
): GifSearchResult {
  const catObj =
    GIF_CATEGORIES.find((categoryItem) => categoryItem.id === category) ||
    GIF_CATEGORIES[0];

  if (!catObj || catObj.gifs.length === 0) {
    throw new Error(`Category "${category}" has no GIFs`);
  }

  const startIndex = offset % catObj.gifs.length;
  const orderedGifs = [
    ...catObj.gifs.slice(startIndex),
    ...catObj.gifs.slice(0, startIndex),
  ].slice(0, limit);

  const results: TenorResultItem[] = orderedGifs.map((gif, index) => ({
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
    tags: gif.tags,
    source: {
      provider: "kaise-local",
      url: "https://kaise.space/",
    },
  }));

  const allGifs = results.map((result) => result.url);
  const selectedIdx = Math.floor(Math.random() * allGifs.length);

  return {
    gifUrl: allGifs[selectedIdx] || allGifs[0],
    allGifs,
    results,
    searchUrl: "https://kaise.space/",
    tenorSearchUrl: "https://kaise.space/",
    totalFound: allGifs.length,
    fromCache: false,
    categoryMatched: category,
    next: String(offset + results.length),
  };
}
