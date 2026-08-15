type GifRecord = {
  id: string;
  title: string;
  url: string;
  tags: string[];
};

type CategoryRecord = {
  id: string;
  name: string;
  description: string;
  gifs: GifRecord[];
};

type ApiResult = GifRecord & {
  itemurl: string;
  source: {
    provider: string;
    url: string;
  };
};

// The Vercel function is intentionally self-contained. Importing the large
// TypeScript catalog from a serverless function caused runtime module-resolution
// failures in production, even though the application build itself succeeded.
const GIF_CATEGORIES: CategoryRecord[] = [
  {
    id: 'geral',
    name: 'Geral',
    description: 'GIFs gerais e populares',
    gifs: [
      { id: 'geral-1', title: 'Cat Kedi', url: 'https://media1.tenor.com/m/cbvieHoVQYoAAAAC/cat-kedi.gif', tags: ['geral', 'cat', 'gif'] },
      { id: 'geral-2', title: 'Son Tung Sahur', url: 'https://media.tenor.com/UDVQyWxkf5EAAAAM/son-tung-tung-sahur.gif', tags: ['geral', 'dance', 'gif'] },
      { id: 'geral-3', title: 'Dog Awkward', url: 'https://media.tenor.com/mIirbFHFViYAAAAM/dog-awkward.gif', tags: ['geral', 'dog', 'humor'] },
      { id: 'geral-4', title: 'Shoulder Dance', url: 'https://media.tenor.com/yQ9ayIA75ugAAAAM/shoulder.gif', tags: ['geral', 'dance'] },
      { id: 'geral-5', title: 'Discord Party', url: 'https://media.tenor.com/7tJUSF03SpQAAAAM/discord.gif', tags: ['geral', 'discord'] },
    ],
  },
  {
    id: 'memes',
    name: 'Memes',
    description: 'Memes e reações engraçadas',
    gifs: [
      { id: 'meme-1', title: 'TikTok Memes', url: 'https://media1.tenor.com/m/2IpkXtn0KAAAAAAC/tiktok-tiktok-memes.gif', tags: ['memes', 'viral'] },
      { id: 'meme-2', title: 'Funny Laugh Meme', url: 'https://media.tenor.com/slcy8zh87u0AAAAM/funny-memes.gif', tags: ['memes', 'laugh', 'funny'] },
      { id: 'meme-3', title: 'Spinning Rat', url: 'https://media.tenor.com/rvdvCpXlGRQAAAAM/rat-mouse.gif', tags: ['memes', 'rat'] },
      { id: 'meme-4', title: 'Absolute Cinema', url: 'https://media.tenor.com/qYaKTu5EdVAAAAAM/absolute-cinema-cinema.gif', tags: ['memes', 'cinema', 'reaction'] },
      { id: 'meme-5', title: 'Sad Crying Cat', url: 'https://media.tenor.com/Bi_k08IY4DkAAAAM/sad-crying.gif', tags: ['memes', 'sad', 'cat'] },
    ],
  },
  {
    id: 'jogos',
    name: 'Jogos',
    description: 'Minecraft, jogos e memes gamer',
    gifs: [
      { id: 'jogo-1', title: 'Minecraft Cat', url: 'https://media1.tenor.com/m/0zKz1ByCRK8AAAAC/minecraft-cat.gif', tags: ['jogos', 'minecraft', 'cat'] },
      { id: 'jogo-2', title: 'Flight Steve Flying', url: 'https://media.tenor.com/vqTW_q3nXSIAAAAM/flight-steve-flight.gif', tags: ['jogos', 'minecraft', 'steve'] },
      { id: 'jogo-3', title: 'Sword Cat', url: 'https://media.tenor.com/pu4Y9EVRRRoAAAAM/swordcat.gif', tags: ['jogos', 'minecraft', 'sword'] },
      { id: 'jogo-4', title: 'Herobrine', url: 'https://media.tenor.com/l8pdLFgsLSMAAAAM/fat-herobine.gif', tags: ['jogos', 'minecraft', 'herobrine'] },
      { id: 'jogo-5', title: 'Minecraft Bed', url: 'https://media.tenor.com/z4eyR7hhEg8AAAAM/minecraft-bed.gif', tags: ['jogos', 'minecraft'] },
    ],
  },
  {
    id: 'animes',
    name: 'Animes',
    description: 'Anime, manga e personagens',
    gifs: [
      { id: 'anime-1', title: 'Jujutsu Kaisen Higuruma', url: 'https://media1.tenor.com/m/j-tn9FNz2DQAAAAC/higuruma-hiromi-higuruma.gif', tags: ['animes', 'jujutsu kaisen', 'higuruma', 'jjk'] },
      { id: 'anime-2', title: 'Yuji Itadori Stare', url: 'https://media.tenor.com/I50TI2DmFXIAAAAM/yuji-stare-yuji-itadori.gif', tags: ['animes', 'jujutsu kaisen', 'yuji', 'itadori'] },
      { id: 'anime-3', title: 'Goku Super Saiyan', url: 'https://media1.tenor.com/m/V2Sp5EUpDLQAAAAC/goku-mad.gif', tags: ['animes', 'dragon ball', 'goku'] },
      { id: 'anime-4', title: 'Vegeta Saiyan', url: 'https://media.tenor.com/xuW-7Bco5qYAAAAM/vegeta-saiyan.gif', tags: ['animes', 'dragon ball', 'vegeta'] },
      { id: 'anime-5', title: 'One Piece Gear 5', url: 'https://media1.tenor.com/m/klq1P9CWBPAAAAAC/one-piece.gif', tags: ['animes', 'one piece', 'luffy'] },
      { id: 'anime-6', title: 'Luffy Laugh', url: 'https://media.tenor.com/Nt6Zju-KjTsAAAAM/luffy-one-piece.gif', tags: ['animes', 'one piece', 'luffy'] },
      { id: 'anime-7', title: 'Tanjiro Hinokami', url: 'https://media1.tenor.com/m/JbvHLMRtOKUAAAAC/demon-slayer.gif', tags: ['animes', 'demon slayer', 'tanjiro'] },
      { id: 'anime-8', title: 'Rengoku', url: 'https://media.tenor.com/VgSV28ZodEoAAAAM/oso-set-yourself-ablaze-oso.gif', tags: ['animes', 'demon slayer', 'rengoku'] },
      { id: 'anime-9', title: 'Eren Yeager', url: 'https://media1.tenor.com/m/W2w99DnqhIwAAAAC/eren-yeager-eren.gif', tags: ['animes', 'attack on titan', 'eren'] },
      { id: 'anime-10', title: 'Light Yagami', url: 'https://media1.tenor.com/m/S8CEO_VpVxIAAAAC/light-death-note.gif', tags: ['animes', 'death note', 'light'] },
      { id: 'anime-11', title: 'Anya Forger', url: 'https://media.tenor.com/_FlsCYMzaDEAAAAM/spy-x-family-anya-forger.gif', tags: ['animes', 'spy x family', 'anya'] },
      { id: 'anime-12', title: 'Ichigo Bankai', url: 'https://media1.tenor.com/m/Sg3s3AGAM6MAAAAC/kill-me.gif', tags: ['animes', 'bleach', 'ichigo'] },
      { id: 'anime-13', title: 'Deku', url: 'https://media.tenor.com/SH_u4G_adZYAAAAM/izuku-midoriya-my-hero-academia.gif', tags: ['animes', 'my hero academia', 'deku'] },
      { id: 'anime-14', title: 'Chainsaw Man Dance', url: 'https://media1.tenor.com/m/kiTCQ9dkCfMAAAAC/chainsaw-man-chainsaw-man-dance.gif', tags: ['animes', 'chainsaw man'] },
      { id: 'anime-15', title: 'Solo Leveling Arise', url: 'https://media1.tenor.com/m/HMlYHYdk2SMAAAAC/solo-leveling-statue-smile-solo-leveling.gif', tags: ['animes', 'solo leveling'] },
    ],
  },
  {
    id: 'desenhos',
    name: 'Desenhos',
    description: 'Cartoons e personagens animados',
    gifs: [
      { id: 'desenho-1', title: 'Bob Esponja Detetive', url: 'https://media1.tenor.com/m/FlNf1oY95AYAAAAC/detective.gif', tags: ['desenhos', 'spongebob'] },
      { id: 'desenho-2', title: 'Bob Esponja Dançando', url: 'https://media.tenor.com/36l-ZPOtTUIAAAAM/eje.gif', tags: ['desenhos', 'spongebob', 'dance'] },
      { id: 'desenho-3', title: 'Patrick Rindo', url: 'https://media.tenor.com/ZJDVVffIueQAAAAM/spongebob-spongebob-meme.gif', tags: ['desenhos', 'patrick'] },
      { id: 'desenho-4', title: 'Lula Molusco Cansado', url: 'https://media.tenor.com/-dIUayC6MjEAAAAM/spongebob.gif', tags: ['desenhos', 'squidward'] },
      { id: 'desenho-5', title: 'Bob Esponja Rainbow', url: 'https://media.tenor.com/WLeCMaEwOzoAAAAM/spongebob-spongebob-meme.gif', tags: ['desenhos', 'spongebob'] },
    ],
  },
  {
    id: 'reacoes',
    name: 'Reações',
    description: 'Choque, tristeza, risos e reações',
    gifs: [
      { id: 'reacao-1', title: 'Shocked Meme', url: 'https://media.tenor.com/z3V7DJO9dfwAAAAM/shocked-meme.gif', tags: ['reacoes', 'reaction', 'shocked'] },
      { id: 'reacao-2', title: 'Skull React', url: 'https://media.tenor.com/jc6uJ-f5jocAAAAM/skull-reacts-skull.gif', tags: ['reacoes', 'reaction', 'skull'] },
      { id: 'reacao-3', title: 'Honest Reaction Cat', url: 'https://media.tenor.com/zgZDIkBz7e0AAAAM/my-honest-reaction-hd-my-honest-reaction-cat-hd.gif', tags: ['reacoes', 'reaction', 'cat'] },
      { id: 'reacao-4', title: 'Big Eyes Yippee', url: 'https://media.tenor.com/5s2c6vxhbDsAAAAM/big-eyes-yippee.gif', tags: ['reacoes', 'reaction'] },
      { id: 'reacao-5', title: 'Triste', url: 'https://media.tenor.com/Y1LH3wcUcQsAAAAM/triste.gif', tags: ['reacoes', 'triste'] },
    ],
  },
  {
    id: 'filmes',
    name: 'Filmes',
    description: 'Cinema e cenas de filmes',
    gifs: [
      { id: 'filme-1', title: 'Popcorn Movie', url: 'https://media1.tenor.com/m/4FVPGc4HuVEAAAAC/pop-corn-movie.gif', tags: ['filmes', 'movie', 'popcorn'] },
      { id: 'filme-2', title: 'Movie Time', url: 'https://media.tenor.com/lxftMq3V-zIAAAAM/movie-time-movie.gif', tags: ['filmes', 'movie', 'cinema'] },
      { id: 'filme-3', title: 'Minions Shh', url: 'https://media.tenor.com/relXqYLaV98AAAAM/minions-shh.gif', tags: ['filmes', 'minions'] },
      { id: 'filme-4', title: 'Scary Movie Scream', url: 'https://media.tenor.com/usngMBhQGU0AAAAM/scary-movie-sasimi.gif', tags: ['filmes', 'scary movie'] },
      { id: 'filme-5', title: 'Minions Popcorn', url: 'https://media.tenor.com/zDZRlH-tT1sAAAAM/despicable-me-minions.gif', tags: ['filmes', 'minions'] },
    ],
  },
  {
    id: 'series',
    name: 'Séries',
    description: 'Séries e cenas famosas',
    gifs: [
      { id: 'serie-1', title: 'Michael Scott', url: 'https://media1.tenor.com/m/khfqoC8f_ZcAAAAC/office-humor.gif', tags: ['series', 'the office', 'michael scott'] },
      { id: 'serie-2', title: 'Michael Scott Smile', url: 'https://media.tenor.com/gH8YEHtt0akAAAAM/michael-scott-the-office.gif', tags: ['series', 'the office'] },
      { id: 'serie-3', title: 'No God Please No', url: 'https://media.tenor.com/sn57dYxN8gIAAAAM/ugh-no-michael-scott-no.gif', tags: ['series', 'the office'] },
      { id: 'serie-4', title: 'Jim Camera Stare', url: 'https://media.tenor.com/y3KQAkKCHYEAAAAM/the-office-office.gif', tags: ['series', 'the office', 'jim'] },
      { id: 'serie-5', title: 'Dwight', url: 'https://media.tenor.com/5lE7fLiEPmIAAAAM/the-office.gif', tags: ['series', 'the office', 'dwight'] },
    ],
  },
];

const ALLOWED_CATEGORIES = new Set(GIF_CATEGORIES.map((category) => category.id));
const MAX_LIMIT = 50;
const MAX_QUERY_LENGTH = 100;

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function safeInteger(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function scoreGif(gif: GifRecord, query: string): number {
  const q = normalize(query);
  if (!q || q === 'geral' || q === 'trending') return 1;

  const title = normalize(gif.title);
  const tags = gif.tags.map(normalize);
  let score = 0;

  if (title === q) score += 100;
  if (title.includes(q)) score += 50;

  for (const tag of tags) {
    if (tag === q) score += 80;
    else if (tag.includes(q) || q.includes(tag)) score += 20;
  }

  for (const word of q.split(/\s+/).filter(Boolean)) {
    if (title.includes(word)) score += 10;
    if (tags.some((tag) => tag.includes(word))) score += 8;
  }

  return score;
}

function searchCatalog(query: string, category: string, limit: number, offset: number): ApiResult[] {
  const selected = category === 'geral'
    ? GIF_CATEGORIES
    : GIF_CATEGORIES.filter((item) => item.id === category);

  const unique = new Map<string, GifRecord>();
  for (const gif of selected.flatMap((item) => item.gifs)) {
    if (gif.url && !unique.has(gif.url)) unique.set(gif.url, gif);
  }

  const all = Array.from(unique.values());
  all.sort((a, b) => scoreGif(b, query) - scoreGif(a, query));

  const q = normalize(query);
  const matching = q && q !== 'geral'
    ? all.filter((gif) => scoreGif(gif, q) > 0)
    : all;
  const sourceList = matching.length ? matching : all;

  return sourceList.slice(offset, offset + limit).map((gif) => ({
    ...gif,
    itemurl: gif.url,
    source: {
      provider: gif.url.includes('tenor.com') ? 'tenor' : 'kaise-local',
      url: gif.url,
    },
  }));
}

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.setHeader('X-Powered-By', '');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const rawQuery = String(req.query?.search || req.query?.q || 'geral')
      .trim()
      .slice(0, MAX_QUERY_LENGTH) || 'geral';

    let category = normalize(String(req.query?.category || 'geral'));
    if (!ALLOWED_CATEGORIES.has(category)) category = 'geral';

    const limit = safeInteger(req.query?.limit, 20, 1, MAX_LIMIT);
    const offset = safeInteger(req.query?.pos ?? req.query?.offset, 0, 0, 10000);
    const results = searchCatalog(rawQuery, category, limit, offset);

    if (!results.length) {
      return res.status(404).json({
        success: false,
        error: 'NO_GIFS_FOUND',
        query: rawQuery,
        category,
        results: [],
      });
    }

    const allGifs = results.map((gif) => gif.url);
    const selectedGif = allGifs[Math.floor(Math.random() * allGifs.length)];

    return res.status(200).json({
      status: 200,
      success: true,
      query: rawQuery,
      category,
      gif_url: selectedGif,
      all_gifs: allGifs,
      results,
      total_found: results.length,
      next: String(offset + results.length),
      search_url: `https://www.kaise.space/?search=${encodeURIComponent(rawQuery)}`,
      tenor_search_url: `https://tenor.com/search/${encodeURIComponent(rawQuery)}`,
      source: results[0]?.source.provider || 'kaise-local',
      from_cache: false,
    });
  } catch (error) {
    console.error('Kaise GIF API failed:', error);
    return res.status(500).json({
      success: false,
      error: 'GIF_API_FAILED',
      message: 'Unable to load the GIF catalog right now.',
    });
  }
}
