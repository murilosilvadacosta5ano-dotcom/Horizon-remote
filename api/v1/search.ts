import { searchOnlineGifs } from '../../src/services/gifSearch';
import { GIF_CATEGORIES } from '../../src/data/categoriesData';

export async function handleSearch(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = (req.query?.q || req.query?.search || req.body?.q || req.body?.search || 'geral').toString().trim();
  const forcedCategory = (req.query?.category || req.body?.category || undefined)?.toString();
  const limit = Math.min(parseInt((req.query?.limit || req.body?.limit || '20').toString(), 10) || 20, 50);
  const pos = (req.query?.pos || req.query?.offset || req.query?.next || req.body?.pos || req.body?.offset || req.body?.next || '0').toString();

  const result = await searchOnlineGifs(query, forcedCategory, limit, pos);

  // Formato Kaise v1
  const response = {
    success: true,
    status: 200,
    query,
    category: result.categoryMatched,
    gif_url: result.gifUrl,
    results: result.kaiseResults || result.results.map((r, idx) => {
      const gifUrl = r.media[0]?.gif?.url || r.url;
      return {
        id: `kaise_${r.id || idx}`,
        title: r.title || 'GIF',
        url: gifUrl,
        preview: r.media[0]?.tinygif?.url || gifUrl,
        width: r.media[0]?.gif?.dims?.[0] || 498,
        height: r.media[0]?.gif?.dims?.[1] || 278,
        category: result.categoryMatched,
        tags: r.tags || [query],
        source: {
          provider: 'tenor',
          id: r.id,
          url: r.itemurl || gifUrl,
          attribution: 'Tenor'
        }
      };
    }),
    pagination: {
      limit,
      offset: pos,
      next: result.next || pos,
      total: result.totalFound || result.results.length
    },
    // Compatibilidade com v1/v2 Tenor
    tenor_results: result.results
  };

  return res.status(200).json(response);
}

export default async function handler(req: any, res: any) {
  return handleSearch(req, res);
}
