import { searchOnlineGifs } from '../../src/services/gifSearch';
import { detectCategoryFromQuery, GIF_CATEGORIES } from '../../src/data/categoriesData';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const categoryParam = req.query?.category || req.body?.category;
  const countParam = Math.min(parseInt((req.query?.limit || req.query?.count || '1').toString(), 10) || 1, 10);

  let category = categoryParam ? categoryParam.toString().toLowerCase() : undefined;
  if (!category) {
    const randomCat = GIF_CATEGORIES[Math.floor(Math.random() * GIF_CATEGORIES.length)];
    category = randomCat.id;
  }

  const searchTerm = category === 'geral' ? 'trending memes' : category;
  const result = await searchOnlineGifs(searchTerm, category, 20);

  const rawResults = result.kaiseResults || [];
  const selectedIndex = Math.floor(Math.random() * (rawResults.length || 1));
  const selectedGif = rawResults[selectedIndex];

  return res.status(200).json({
    success: true,
    status: 200,
    category,
    gif_url: selectedGif?.url || result.gifUrl,
    results: selectedGif ? [selectedGif] : rawResults.slice(0, countParam),
    source: selectedGif?.source || {
      provider: 'tenor',
      id: 'random',
      url: result.gifUrl,
      attribution: 'Tenor'
    }
  });
}
