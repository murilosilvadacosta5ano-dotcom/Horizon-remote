import { getRandomGif, ANIME_GIFS_DATABASE } from "../data/animeGifs";

export async function searchOnlineGifs(query: string): Promise<{
  gifUrl: string;
  allGifs: string[];
  searchUrl: string;
  totalFound: number;
}> {
  const cleanQuery = query.trim().replace(/\s+/g, '-').toLowerCase();
  const slug = cleanQuery.endsWith('-gifs') ? cleanQuery : `${cleanQuery}-gifs`;
  const searchUrl = `https://cdn.raphaelbot.com/search/${encodeURIComponent(slug)}`;

  // Direct retrieval from our rich anime gifs database according to the command query
  const fallback = getRandomGif(query);

  try {
    // Check public CDN search
    const remoteUrl = `https://g.tenor.com/v1/search?q=${encodeURIComponent(query)}&key=LIVDSRZULELA&limit=25`;
    const apiRes = await fetch(remoteUrl);
    if (apiRes.ok) {
      const data: any = await apiRes.json();
      if (data.results && data.results.length > 0) {
        const urls: string[] = data.results.map((r: any) => {
          return r.media?.[0]?.gif?.url || r.media?.[0]?.mediumgif?.url || r.url;
        }).filter(Boolean);

        if (urls.length > 0) {
          const picked = urls[Math.floor(Math.random() * urls.length)];
          return {
            gifUrl: picked,
            allGifs: urls,
            searchUrl,
            totalFound: urls.length,
          };
        }
      }
    }
  } catch (err) {
    console.error("Error in gif search:", err);
  }

  // Guaranteed fallback using the exact anime command GIF database
  const categoryGifs = ANIME_GIFS_DATABASE[fallback.category] || ANIME_GIFS_DATABASE.abraco;
  return {
    gifUrl: fallback.url,
    allGifs: categoryGifs,
    searchUrl,
    totalFound: categoryGifs.length,
  };
}
