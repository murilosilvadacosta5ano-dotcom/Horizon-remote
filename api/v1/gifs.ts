import { searchOnlineGifs } from '../../src/services/gifSearch';
import { GIF_CATEGORIES } from '../../src/data/categoriesData';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawId = (req.query?.id || req.body?.id || '').toString();

  if (!rawId) {
    return res.status(400).json({
      success: false,
      error: 'ID do GIF é obrigatório.'
    });
  }

  // Tenta extrair ID numérico do Tenor (ex: tenor-123456 ou kaise_123456)
  const cleanId = rawId.replace(/^kaise_/, '').replace(/^tenor-/, '');

  // Busca no banco local primeiro
  for (const cat of GIF_CATEGORIES) {
    const found = cat.gifs.find(g => g.id === rawId || g.id.includes(cleanId));
    if (found) {
      return res.status(200).json({
        success: true,
        gif: {
          id: `kaise_${found.id}`,
          title: found.title,
          url: found.url,
          preview: found.url,
          category: cat.id,
          tags: found.tags,
          source: {
            provider: 'kaise_local',
            id: found.id,
            url: found.url,
            attribution: 'Kaise Local Library'
          }
        }
      });
    }
  }

  // Busca no Tenor via ID
  const directTenorUrl = `https://media.tenor.com/${cleanId}/gif.gif`;
  
  return res.status(200).json({
    success: true,
    gif: {
      id: `kaise_${cleanId}`,
      title: `GIF #${cleanId}`,
      url: directTenorUrl,
      preview: directTenorUrl,
      category: 'geral',
      tags: [cleanId],
      source: {
        provider: 'tenor',
        id: cleanId,
        url: `https://tenor.com/view/${cleanId}`,
        attribution: 'Tenor'
      }
    }
  });
}
