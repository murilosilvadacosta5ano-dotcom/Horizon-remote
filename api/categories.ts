import { GIF_CATEGORIES } from '../src/data/categoriesData';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: 200,
    total: GIF_CATEGORIES.length,
    categories: GIF_CATEGORIES.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      total_gifs: c.gifs.length
    }))
  });
}
