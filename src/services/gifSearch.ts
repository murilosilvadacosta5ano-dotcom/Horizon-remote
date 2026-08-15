import { scrapeGifsFromSite, generateTenorSlug } from "./tenorScraper";
import { detectCategoryFromQuery, getCategoryGifs, GIF_CATEGORIES } from "../data/categoriesData";
import { GifSearchResult, TenorResultItem } from "../types";

export { generateTenorSlug as getTenorSlug };

/**
 * Puxa GIFs: no navegador consulta a nossa API (/api/gifs); no backend Node faz a extração direta do site
 */
export async function searchOnlineGifs(
  rawQuery: string,
  forcedCategory?: string,
  limit: number = 30,
  pos?: string
): Promise<GifSearchResult> {
  const cleanQuery = (rawQuery || "geral").trim();
  const matchedCategory = forcedCategory || detectCategoryFromQuery(cleanQuery);
  const slug = generateTenorSlug(cleanQuery);
  const tenorSearchWebUrl = `https://tenor.com/pt-BR/search/${encodeURIComponent(slug)}`;

  // Se estiver rodando no navegador do cliente (React)
  if (typeof window !== "undefined") {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const params = new URLSearchParams({
        search: cleanQuery,
        key: "raphaelsboting",
        limit: limit.toString(),
      });
      if (forcedCategory) params.append("category", forcedCategory);
      if (pos) params.append("pos", pos);

      const response = await fetch(`/api/gifs?${params.toString()}`, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          return {
            gifUrl: data.gif_url || data.all_gifs?.[0] || data.results[0]?.media?.[0]?.gif?.url,
            allGifs: data.all_gifs || data.results.map((r: any) => r.media?.[0]?.gif?.url || r.url),
            results: data.results,
            searchUrl: data.search_url || tenorSearchWebUrl,
            tenorSearchUrl: data.tenor_search_url || tenorSearchWebUrl,
            totalFound: data.total_found || data.results.length,
            fromCache: Boolean(data.from_cache),
            categoryMatched: data.category || matchedCategory,
            next: data.next || "20",
          };
        }
      }
    } catch {
      // Fallback local seguro no navegador
    }

    return createLocalCategoryResult(cleanQuery, matchedCategory, tenorSearchWebUrl, pos);
  }

  // Se estiver rodando no servidor Node.js (Express backend)
  return await scrapeGifsFromSite(cleanQuery, forcedCategory, limit, pos);
}

function createLocalCategoryResult(
  query: string,
  category: string,
  tenorUrl: string,
  pos?: string
): GifSearchResult {
  const catObj = GIF_CATEGORIES.find(c => c.id === category) || GIF_CATEGORIES[0];
  const offset = parseInt(pos || "0", 10) || 0;
  
  // Rotação dos GIFs locais se o usuário rolar repetidamente
  const startIndex = offset % catObj.gifs.length;
  const orderedGifs = [
    ...catObj.gifs.slice(startIndex),
    ...catObj.gifs.slice(0, startIndex)
  ];

  const results: TenorResultItem[] = orderedGifs.map((g, idx) => ({
    id: `${g.id}-p${offset}-${idx}`,
    title: g.title,
    content_description: g.title,
    itemurl: tenorUrl,
    url: g.url,
    hasaudio: false,
    media: [
      {
        gif: { url: g.url, dims: [498, 278], duration: 0, size: 0 },
        tinygif: { url: g.url, dims: [220, 122], duration: 0, size: 0 },
        mp4: { url: "" },
      },
    ],
    tags: g.tags,
  }));

  const allGifs = results.map(r => r.url);
  const selectedIdx = Math.floor(Math.random() * allGifs.length);

  return {
    gifUrl: allGifs[selectedIdx] || allGifs[0],
    allGifs,
    results,
    searchUrl: tenorUrl,
    tenorSearchUrl: tenorUrl,
    totalFound: allGifs.length,
    fromCache: false,
    categoryMatched: category,
    next: `${offset + results.length}`,
  };
}
