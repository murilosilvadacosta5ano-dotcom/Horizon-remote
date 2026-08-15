import { scrapeGifsFromSite } from '../src/services/tenorScraper';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const search = req.query?.search || req.query?.q || 'geral';
  const category = req.query?.category;
  const limit = parseInt(req.query?.limit || '24', 10);
  const pos = req.query?.pos;

  try {
    const data = await scrapeGifsFromSite(
      search.toString(),
      category ? category.toString() : undefined,
      limit,
      pos ? pos.toString() : undefined
    );

    return res.status(200).json({
      status: 200,
      query: search,
      category: data.categoryMatched,
      gif_url: data.gifUrl,
      all_gifs: data.allGifs,
      results: data.results,
      total_found: data.totalFound,
      next: data.next,
      search_url: data.searchUrl,
      tenor_search_url: data.tenorSearchUrl,
      from_cache: data.fromCache,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Erro interno ao buscar GIFs no Tenor',
      message: error?.message || 'Falha na requisição'
    });
  }
}
