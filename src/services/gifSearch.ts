import { getRandomGif, ANIME_GIFS_DATABASE } from "../data/animeGifs";

// Cache in-memory com limite fixo para evitar sobrecarga e quedas
interface CacheEntry {
  gifs: string[];
  lastUsedIndex: number;
  timestamp: number;
  tenorUrl: string;
}

const GIF_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutos de persistência na memória
const MAX_CACHE_ENTRIES = 100; // Limite fixo de consultas armazenadas

function sanitizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function getTenorSlug(query: string): string {
  const clean = query
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  return clean.endsWith("-gifs") ? clean : `${clean}-gifs`;
}

export async function searchOnlineGifs(query: string): Promise<{
  gifUrl: string;
  allGifs: string[];
  searchUrl: string;
  tenorSearchUrl: string;
  totalFound: number;
  fromCache: boolean;
}> {
  const cleanQuery = sanitizeQuery(query || "anime abraco");
  const slug = getTenorSlug(cleanQuery);
  const tenorSearchUrl = `https://tenor.com/pt-BR/search/${encodeURIComponent(slug)}`;
  const apiEndpointUrl = `https://kaise.space/api/gifs?key=raphaelsboting&search=${encodeURIComponent(cleanQuery)}`;

  // 1. Verifica se já está pré-carregado no cache na memória
  const cached = GIF_CACHE.get(cleanQuery);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL && cached.gifs.length > 0) {
    // Rotaciona para o próximo GIF pré-carregado sem fazer requisição externa
    cached.lastUsedIndex = (cached.lastUsedIndex + 1) % cached.gifs.length;
    const nextGif = cached.gifs[cached.lastUsedIndex];

    return {
      gifUrl: nextGif,
      allGifs: cached.gifs,
      searchUrl: tenorSearchUrl,
      tenorSearchUrl,
      totalFound: cached.gifs.length,
      fromCache: true,
    };
  }

  // 2. Busca uma lista fixa de até 50 GIFs da pesquisa de uma única vez
  let fetchedGifs: string[] = [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout anti-crash

    const remoteUrl = `https://g.tenor.com/v1/search?q=${encodeURIComponent(cleanQuery)}&key=LIVDSRZULELA&limit=50`;
    const apiRes = await fetch(remoteUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (apiRes.ok) {
      const data: any = await apiRes.json();
      if (data.results && data.results.length > 0) {
        fetchedGifs = data.results
          .map((r: any) => {
            return (
              r.media?.[0]?.gif?.url ||
              r.media?.[0]?.mediumgif?.url ||
              r.url
            );
          })
          .filter(Boolean);
      }
    }
  } catch (err) {
    console.error("Cache fetch timeout/error, usando banco local seguro:", err);
  }

  // 3. Se não encontrou ou falhou, junta com a base de anime local
  const fallback = getRandomGif(cleanQuery);
  const localCategoryGifs = ANIME_GIFS_DATABASE[fallback.category] || ANIME_GIFS_DATABASE.abraco;

  const finalPool = Array.from(new Set([...fetchedGifs, ...localCategoryGifs]));

  // 4. Salva no cache com controle de tamanho para não estourar a memória
  if (GIF_CACHE.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = GIF_CACHE.keys().next().value;
    if (oldestKey) GIF_CACHE.delete(oldestKey);
  }

  const selectedIdx = Math.floor(Math.random() * finalPool.length);
  const selectedGif = finalPool[selectedIdx] || fallback.url;

  GIF_CACHE.set(cleanQuery, {
    gifs: finalPool,
    lastUsedIndex: selectedIdx,
    timestamp: now,
    tenorUrl: tenorSearchUrl,
  });

  return {
    gifUrl: selectedGif,
    allGifs: finalPool,
    searchUrl: tenorSearchUrl,
    tenorSearchUrl,
    totalFound: finalPool.length,
    fromCache: false,
  };
}
