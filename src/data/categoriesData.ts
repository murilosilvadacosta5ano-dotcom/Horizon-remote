import { GifCategory } from '../types';

export const GIF_CATEGORIES: GifCategory[] = [
  {
    id: 'geral',
    name: 'Geral',
    description: 'Trending e GIFs mais populares da internet',
    subcategories: ['Todos'],
    gifs: [
      {
        id: 'geral-1',
        title: 'Gato Dançando Animado',
        url: 'https://media.tenor.com/2b_M4a2Q7yAAAAAC/cat-dance.gif',
        tags: ['geral', 'gato', 'dança', 'fofo', 'popular']
      },
      {
        id: 'geral-2',
        title: 'Cachorro Esperto Sorrindo',
        url: 'https://media.tenor.com/V71_n-e_N9cAAAAC/dog-smile.gif',
        tags: ['geral', 'cachorro', 'sorriso', 'fofo', 'viral']
      },
      {
        id: 'geral-3',
        title: 'Aplausos de Pé Celebrando',
        url: 'https://media.tenor.com/9b97bW2w8WAAAAAC/clapping-applause.gif',
        tags: ['geral', 'aplausos', 'palmas', 'parabens', 'festa']
      },
      {
        id: 'geral-4',
        title: 'Show de Fogos de Artifício',
        url: 'https://media.tenor.com/Z4N3n1LwT1QAAAAC/fireworks-celebrate.gif',
        tags: ['geral', 'fogos', 'comemorar', 'festa', 'alegria']
      },
      {
        id: 'geral-5',
        title: 'Joinha de Aprovação Positivo',
        url: 'https://media.tenor.com/gK9J2L1oP4cAAAAC/thumbs-up-cool.gif',
        tags: ['geral', 'joinha', 'ok', 'positivo', 'aprovado']
      },
      {
        id: 'geral-6',
        title: 'Dancinha Comemorando Sucesso',
        url: 'https://media.tenor.com/39bN7W9v0yEAAAAC/happy-dance.gif',
        tags: ['geral', 'danca', 'comemoracao', 'vitoria']
      }
    ]
  },
  {
    id: 'memes',
    name: 'Memes',
    description: 'Memes virais, engraçados e clássicos da internet',
    subcategories: ['Todos'],
    gifs: [
      {
        id: 'meme-1',
        title: 'John Travolta Confuso Pulp Fiction',
        url: 'https://media.tenor.com/4c8M3Q7x91AAAAAC/travolta-confused.gif',
        tags: ['meme', 'travolta', 'confuso', 'perdido', 'pulp fiction']
      },
      {
        id: 'meme-2',
        title: 'Homem Pensativo Cabeça Inteligente',
        url: 'https://media.tenor.com/bC8w5_k7fVMAAAAC/roll-safe-think.gif',
        tags: ['meme', 'pensando', 'esperto', 'ideia', 'cerebro']
      },
      {
        id: 'meme-3',
        title: 'Cachorro Doge Olhando Desconfiado',
        url: 'https://media.tenor.com/vH9Z1xW6pLkAAAAC/doge-look.gif',
        tags: ['meme', 'doge', 'cachorro', 'shiba', 'desconfiado']
      },
      {
        id: 'meme-4',
        title: 'Criança Comemorando com Punho de Vitória',
        url: 'https://media.tenor.com/P4w8k2M9n1QAAAAC/success-kid-yes.gif',
        tags: ['meme', 'vitoria', 'consegui', 'success kid', 'comemorar']
      },
      {
        id: 'meme-5',
        title: 'Nazaré Confusa Fazendo Cálculos',
        url: 'https://media.tenor.com/X4b8w1N2k6cAAAAC/nazare-confusa.gif',
        tags: ['meme', 'nazare', 'calculos', 'matematica', 'duvida']
      },
      {
        id: 'meme-6',
        title: 'Rindo Alto de Gargalhada',
        url: 'https://media.tenor.com/L1M4w7P2n8cAAAAC/laughing-meme.gif',
        tags: ['meme', 'risada', 'engracado', 'lol', 'haha']
      }
    ]
  },
  {
    id: 'jogos',
    name: 'Jogos',
    description: 'Games, Minecraft, GTA, Roblox, Mario e consoles',
    subcategories: ['Todos'],
    gifs: [
      {
        id: 'jogos-1',
        title: 'Steve e Aldeão Dançando Minecraft',
        url: 'https://media.tenor.com/N7w1K3b8M9cAAAAC/minecraft-dance.gif',
        tags: ['jogos', 'games', 'minecraft', 'steve', 'dança']
      },
      {
        id: 'jogos-2',
        title: 'Super Mario Pulando no Bloco',
        url: 'https://media.tenor.com/bK9P4w7m1nQAAAAC/mario-jump-nintendo.gif',
        tags: ['jogos', 'games', 'mario', 'nintendo', 'pulo']
      },
      {
        id: 'jogos-3',
        title: 'CJ GTA San Andreas Andando na Rua',
        url: 'https://media.tenor.com/H1m4W8v3n7cAAAAC/gta-sa-cj.gif',
        tags: ['jogos', 'games', 'gta', 'san andreas', 'cj', 'rockstar']
      },
      {
        id: 'jogos-4',
        title: 'Sonic Correndo em Alta Velocidade',
        url: 'https://media.tenor.com/V2m7N9w1b4cAAAAC/sonic-running-fast.gif',
        tags: ['jogos', 'games', 'sonic', 'sega', 'correndo']
      },
      {
        id: 'jogos-5',
        title: 'Roblox Personagem Fazendo Emote',
        url: 'https://media.tenor.com/C3m8W1b9n4cAAAAC/roblox-dance-emote.gif',
        tags: ['jogos', 'games', 'roblox', 'emote', 'danca']
      },
      {
        id: 'jogos-6',
        title: 'Pikachu Lançando Choque do Trovão',
        url: 'https://media.tenor.com/K8w3M1v7n4cAAAAC/pikachu-thunderbolt-pokemon.gif',
        tags: ['jogos', 'games', 'pokemon', 'pikachu', 'raio']
      }
    ]
  },
  {
    id: 'animes',
    name: 'Animes',
    description: 'Animes, mangás, cenas épicas e reações clássicas',
    subcategories: ['Todos'],
    gifs: [
      {
        id: 'anime-1',
        title: 'Naruto Correndo com Determinação',
        url: 'https://media.tenor.com/uR2sXlTfW-4AAAAC/naruto-run.gif',
        tags: ['animes', 'anime', 'naruto', 'ninja', 'shippuden']
      },
      {
        id: 'anime-2',
        title: 'Goku Transformando em Super Saiyajin',
        url: 'https://media.tenor.com/N1tQxT4w5-UAAAAC/goku-super-saiyan.gif',
        tags: ['animes', 'anime', 'dragon ball', 'goku', 'saiyajin']
      },
      {
        id: 'anime-3',
        title: 'Abraço Carinhoso de Anime',
        url: 'https://media.tenor.com/kCZycPBFHGwAAAAC/hug-anime.gif',
        tags: ['animes', 'anime', 'abraco', 'hug', 'fofo', 'amor']
      },
      {
        id: 'anime-4',
        title: 'Luffy Sorrindo Feliz One Piece',
        url: 'https://media.tenor.com/9wVzTqC5sB4AAAAC/luffy-smile.gif',
        tags: ['animes', 'anime', 'one piece', 'luffy', 'sorriso']
      },
      {
        id: 'anime-5',
        title: 'Luta Épica com Espadas Anime',
        url: 'https://media.tenor.com/Ws6Dm1ZW_vMAAAAC/anime-sword-fight.gif',
        tags: ['animes', 'anime', 'luta', 'espada', 'combate']
      },
      {
        id: 'anime-6',
        title: 'Cafuné Fofo na Cabeça Anime',
        url: 'https://media.tenor.com/Y7x9kUqW12IAAAAC/headpat-anime.gif',
        tags: ['animes', 'anime', 'cafune', 'headpat', 'fofo']
      }
    ]
  },
  {
    id: 'desenhos',
    name: 'Desenhos',
    description: 'Cartoons clássicos, Bob Esponja, Tom & Jerry e Disney',
    subcategories: ['Todos'],
    gifs: [
      {
        id: 'desenho-1',
        title: 'Bob Esponja Fazendo Mágica com Arco-Íris',
        url: 'https://media.tenor.com/D4n8W1b9m3cAAAAC/spongebob-imagination.gif',
        tags: ['desenhos', 'cartoons', 'bob esponja', 'imaginacao', 'arco iris']
      },
      {
        id: 'desenho-2',
        title: 'Tom e Jerry Perseguição Engraçada',
        url: 'https://media.tenor.com/V9m1K3w8n4cAAAAC/tom-and-jerry-chase.gif',
        tags: ['desenhos', 'cartoons', 'tom e jerry', 'correndo', 'classico']
      },
      {
        id: 'desenho-3',
        title: 'Pernalonga Mastigando Cenoura O Que Há Velhinho',
        url: 'https://media.tenor.com/B7w1N4m8k3cAAAAC/bugs-bunny-carrot.gif',
        tags: ['desenhos', 'cartoons', 'looney tunes', 'pernalonga', 'cenoura']
      },
      {
        id: 'desenho-4',
        title: 'Patrick Estrela Dançando Feliz',
        url: 'https://media.tenor.com/M2w8N1k7b4cAAAAC/patrick-star-dance.gif',
        tags: ['desenhos', 'cartoons', 'patrick', 'bob esponja', 'danca']
      },
      {
        id: 'desenho-5',
        title: 'Pica-Pau Rindo com Risada Clássica',
        url: 'https://media.tenor.com/H8m3K1w9n4cAAAAC/woody-woodpecker-laugh.gif',
        tags: ['desenhos', 'cartoons', 'pica pau', 'risada', 'nostalgia']
      },
      {
        id: 'desenho-6',
        title: 'Scooby-Doo e Salsicha com Medo Tremer',
        url: 'https://media.tenor.com/P1m7W8b4n3cAAAAC/scooby-doo-scared.gif',
        tags: ['desenhos', 'cartoons', 'scooby doo', 'salsicha', 'medo']
      }
    ]
  },
  {
    id: 'reacoes',
    name: 'Reações',
    description: 'Expressões faciais, risos, palmas, surpresa e emoções',
    subcategories: ['Todos'],
    gifs: [
      {
        id: 'reacao-1',
        title: 'Leonardo DiCaprio Brindando Champanhe',
        url: 'https://media.tenor.com/G3b8W1n9m4cAAAAC/dicaprio-cheers.gif',
        tags: ['reacoes', 'reacao', 'brinde', 'champanhe', 'elegante', 'celebrar']
      },
      {
        id: 'reacao-2',
        title: 'Rindo Muito Chorando de Rir',
        url: 'https://media.tenor.com/V7w1M4b9n3cAAAAC/laughing-hard-crying.gif',
        tags: ['reacoes', 'reacao', 'risada', 'gargalhada', 'engracado']
      },
      {
        id: 'reacao-3',
        title: 'Olhos Arregalados de Choque e Espanto',
        url: 'https://media.tenor.com/K1m8W3b9n4cAAAAC/shocked-eyes-wide.gif',
        tags: ['reacoes', 'reacao', 'choque', 'surpresa', 'inacreditavel']
      },
      {
        id: 'reacao-4',
        title: 'Chorando em Prantos Tristeza',
        url: 'https://media.tenor.com/N4w1K8b9m3cAAAAC/crying-sad-tears.gif',
        tags: ['reacoes', 'reacao', 'choro', 'triste', 'lagrimas', 'emocionado']
      },
      {
        id: 'reacao-5',
        title: 'Palmas Lentas Sarcásticas de Ironia',
        url: 'https://media.tenor.com/H9m3W1b8n4cAAAAC/slow-clap-sarcastic.gif',
        tags: ['reacoes', 'reacao', 'palmas', 'ironia', 'sarcastico']
      },
      {
        id: 'reacao-6',
        title: 'Balançando a Cabeça em Sinal de Não',
        url: 'https://media.tenor.com/B1m8W4b9n3cAAAAC/shaking-head-no.gif',
        tags: ['reacoes', 'reacao', 'nao', 'negando', 'recusar']
      }
    ]
  },
  {
    id: 'filmes',
    name: 'Filmes',
    description: 'Cenas clássicas de cinema, Hollywood, Marvel e ficção',
    subcategories: ['Todos'],
    gifs: [
      {
        id: 'filme-1',
        title: 'Homem de Ferro Estalando os Dedos Vingadores',
        url: 'https://media.tenor.com/I1m8W4b9n3cAAAAC/iron-man-snap.gif',
        tags: ['filmes', 'cinema', 'homem de ferro', 'marvel', 'vingadores']
      },
      {
        id: 'filme-2',
        title: 'Darth Vader Respirando Star Wars',
        url: 'https://media.tenor.com/D1m7W8b4n3cAAAAC/darth-vader-star-wars.gif',
        tags: ['filmes', 'cinema', 'star wars', 'darth vader', 'vilao']
      },
      {
        id: 'filme-3',
        title: 'Coringa Descendo a Escada Dançando',
        url: 'https://media.tenor.com/J1m8W4b9n3cAAAAC/joker-stairs-dance.gif',
        tags: ['filmes', 'cinema', 'coringa', 'joker', 'dança', 'dc']
      },
      {
        id: 'filme-4',
        title: 'Harry Potter Lançando Feitiço com Varinha',
        url: 'https://media.tenor.com/H1m8W4b9n3cAAAAC/harry-potter-wand-spell.gif',
        tags: ['filmes', 'cinema', 'harry potter', 'magia', 'bruxo']
      },
      {
        id: 'filme-5',
        title: 'Matrix Neo Desviando das Balas em Câmera Lenta',
        url: 'https://media.tenor.com/M1m8W4b9n3cAAAAC/matrix-bullet-dodge-neo.gif',
        tags: ['filmes', 'cinema', 'matrix', 'neo', 'acao', 'ficcao']
      },
      {
        id: 'filme-6',
        title: 'Jack Sparrow Correndo Desesperado Piratas do Caribe',
        url: 'https://media.tenor.com/P1m8W4b9n3cAAAAC/jack-sparrow-running.gif',
        tags: ['filmes', 'cinema', 'jack sparrow', 'piratas do caribe', 'correndo']
      }
    ]
  },
  {
    id: 'series',
    name: 'Séries',
    description: 'The Office, Friends, Breaking Bad, Stranger Things e streaming',
    subcategories: ['Todos'],
    gifs: [
      {
        id: 'serie-1',
        title: 'Michael Scott Gritando No God Please No The Office',
        url: 'https://media.tenor.com/M1m7W8b4n3cAAAAC/michael-scott-no-god-the-office.gif',
        tags: ['series', 'tv', 'the office', 'michael scott', 'desespero']
      },
      {
        id: 'serie-2',
        title: 'Walter White Dizendo Youre Goddamn Right Breaking Bad',
        url: 'https://media.tenor.com/W1m8W4b9n3cAAAAC/walter-white-breaking-bad.gif',
        tags: ['series', 'tv', 'breaking bad', 'walter white', 'heisenberg']
      },
      {
        id: 'serie-3',
        title: 'Eleven Usando Poderes Telecinéticos Stranger Things',
        url: 'https://media.tenor.com/E1m8W4b9n3cAAAAC/eleven-stranger-things-powers.gif',
        tags: ['series', 'tv', 'stranger things', 'eleven', 'poderes']
      },
      {
        id: 'serie-4',
        title: 'Joey Tribbiani Dizendo How You Doin Friends',
        url: 'https://media.tenor.com/F1m8W4b9n3cAAAAC/joey-how-you-doin-friends.gif',
        tags: ['series', 'tv', 'friends', 'joey', 'cantada']
      },
      {
        id: 'serie-5',
        title: 'Dwight Schrute Comemorando Vitória The Office',
        url: 'https://media.tenor.com/D1m8W4b9n3cAAAAC/dwight-schrute-the-office-yes.gif',
        tags: ['series', 'tv', 'the office', 'dwight', 'comemorar']
      },
      {
        id: 'serie-6',
        title: 'Thomas Shelby Fumando com Olhar Sério Peaky Blinders',
        url: 'https://media.tenor.com/T1m8W4b9n3cAAAAC/thomas-shelby-peaky-blinders.gif',
        tags: ['series', 'tv', 'peaky blinders', 'thomas shelby', 'frio']
      }
    ]
  }
];

export function detectCategoryFromQuery(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('meme') || q.includes('engracad') || q.includes('risada') || q.includes('zueira') || q.includes('lol') || q.includes('travolta')) {
    return 'memes';
  }
  if (q.includes('game') || q.includes('jogo') || q.includes('minecraft') || q.includes('mario') || q.includes('gta') || q.includes('sonic') || q.includes('roblox') || q.includes('pokemon')) {
    return 'jogos';
  }
  if (q.includes('anime') || q.includes('manga') || q.includes('naruto') || q.includes('goku') || q.includes('dragon ball') || q.includes('luffy') || q.includes('one piece') || q.includes('bleach') || q.includes('otaku')) {
    return 'animes';
  }
  if (q.includes('desenho') || q.includes('cartoon') || q.includes('spongebob') || q.includes('bob esponja') || q.includes('tom e jerry') || q.includes('disney') || q.includes('pernalonga')) {
    return 'desenhos';
  }
  if (q.includes('reacao') || q.includes('reacao') || q.includes('triste') || q.includes('feliz') || q.includes('chorando') || q.includes('palmas') || q.includes('aplausos') || q.includes('choque') || q.includes('surpresa') || q.includes('raiva')) {
    return 'reacoes';
  }
  if (q.includes('filme') || q.includes('movie') || q.includes('cinema') || q.includes('marvel') || q.includes('vingadores') || q.includes('star wars') || q.includes('coringa') || q.includes('harry potter') || q.includes('matrix')) {
    return 'filmes';
  }
  if (q.includes('serie') || q.includes('series') || q.includes('the office') || q.includes('breaking bad') || q.includes('stranger things') || q.includes('friends') || q.includes('peaky blinders')) {
    return 'series';
  }

  return 'geral';
}

export function getCategoryGifs(categoryId: string): string[] {
  const category = GIF_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return GIF_CATEGORIES[0].gifs.map((g) => g.url);
  return category.gifs.map((g) => g.url);
}
