import { GIF_CATEGORIES } from '../../src/data/categoriesData';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Se o caminho tiver id de categoria (ex: /api/v1/categories?id=anime)
  const catId = req.query?.id || req.query?.category;

  if (catId) {
    const found = GIF_CATEGORIES.find(c => c.id === catId.toString().toLowerCase());
    if (!found) {
      return res.status(404).json({
        success: false,
        error: `Categoria "${catId}" não encontrada.`
      });
    }

    return res.status(200).json({
      success: true,
      category: {
        id: found.id,
        name: found.name,
        description: found.description,
        subcategories: found.subcategories,
        total_gifs: found.gifs.length,
        gifs: found.gifs.map(g => ({
          id: g.id,
          title: g.title,
          url: g.url,
          tags: g.tags,
          source: {
            provider: 'tenor',
            id: g.id,
            url: g.url,
            attribution: 'Tenor'
          }
        }))
      }
    });
  }

  return res.status(200).json({
    success: true,
    total: GIF_CATEGORIES.length,
    categories: GIF_CATEGORIES.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      total_gifs: c.gifs.length
    })),
    aliases: {
      "naruto": "animes",
      "goku": "animes",
      "one piece": "animes",
      "gato": "geral",
      "minecraft": "jogos",
      "risada": "memes",
      "kkkk": "memes",
      "the office": "series",
      "cinema": "filmes"
    }
  });
}
