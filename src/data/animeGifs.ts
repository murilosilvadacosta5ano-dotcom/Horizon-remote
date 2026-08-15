export interface CategoryGifCollection {
  [category: string]: string[];
}

export const ANIME_GIFS_DATABASE: CategoryGifCollection = {
  abraco: [
    'https://media.tenor.com/kCZycPBFHGwAAAAC/hug-anime.gif',
    'https://media.tenor.com/7bK6kU06FVoAAAAC/anime-hug.gif',
    'https://media.tenor.com/gqO4Vw4k0V8AAAAC/anime-hug.gif',
    'https://media.tenor.com/4q6kL7w0zQEAAAAC/hug-sweet.gif',
    'https://media.tenor.com/1m3nL5w0zQEAAAAC/anime-couple-hug.gif',
  ],
  kiss: [
    'https://media.tenor.com/9wVzTqC5sB4AAAAC/anime-kiss.gif',
    'https://media.tenor.com/d_j4oK0i3wYAAAAC/kiss-anime.gif',
    'https://media.tenor.com/5w8q3_W1w9wAAAAC/anime-kiss-love.gif',
    'https://media.tenor.com/7j9kL2w0zQEAAAAC/kiss-romance.gif',
  ],
  socar: [
    'https://media.tenor.com/o2K8l7oQ9m0AAAAC/anime-punch.gif',
    'https://media.tenor.com/uR2sXlTfW-4AAAAC/goku-dragon-ball.gif',
    'https://media.tenor.com/N1tQxT4w5-UAAAAC/anime-fight.gif',
    'https://media.tenor.com/3h7kL9w0zQEAAAAC/punch-power.gif',
  ],
  tapa: [
    'https://media.tenor.com/Ws6Dm1ZW_vMAAAAC/anime-slap.gif',
    'https://media.tenor.com/2h4L6n_y7wQAAAAC/anime-slap-angry.gif',
    'https://media.tenor.com/4h7_yL0w2zEAAAAC/slap-funny.gif',
  ],
  chutar: [
    'https://media.tenor.com/e7qA_k6UeN8AAAAC/anime-kick.gif',
    'https://media.tenor.com/6jL5qW8kU0EAAAAC/kick-anime.gif',
    'https://media.tenor.com/8k1mL0w0zQEAAAAC/fight-kick.gif',
  ],
  atacar: [
    'https://media.tenor.com/N1tQxT4w5-UAAAAC/anime-fight.gif',
    'https://media.tenor.com/uR2sXlTfW-4AAAAC/goku-dragon-ball.gif',
    'https://media.tenor.com/0z3nL2w0zQEAAAAC/anime-attack.gif',
  ],
  cafune: [
    'https://media.tenor.com/Y7x9kUqW12IAAAAC/headpat-anime.gif',
    'https://media.tenor.com/2hK5O0Fj2nEAAAAC/anime-pat.gif',
    'https://media.tenor.com/qL8q5b9s1-4AAAAC/headpat-cute.gif',
  ],
  beliscar: [
    'https://media.tenor.com/T0bSg1kZqGkAAAAC/anime-pinch.gif',
    'https://media.tenor.com/8q5kL7y2XwEAAAAC/anime-cheek-pinch.gif',
    'https://media.tenor.com/1n5b8kL0wzEAAAAC/pinch-cute.gif',
  ],
};

export function getRandomGif(categoryOrSearch: string): { url: string; category: string; total: number } {
  const clean = categoryOrSearch.toLowerCase().trim();
  
  let targetCat = 'abraco';
  if (clean.includes('kiss') || clean.includes('beijo') || clean.includes('beijar')) targetCat = 'kiss';
  else if (clean.includes('soco') || clean.includes('socar') || clean.includes('punch')) targetCat = 'socar';
  else if (clean.includes('tapa') || clean.includes('slap')) targetCat = 'tapa';
  else if (clean.includes('chute') || clean.includes('chutar') || clean.includes('kick')) targetCat = 'chutar';
  else if (clean.includes('atacar') || clean.includes('ataque') || clean.includes('fight') || clean.includes('attack')) targetCat = 'atacar';
  else if (clean.includes('cafune') || clean.includes('cafuné') || clean.includes('pat') || clean.includes('headpat')) targetCat = 'cafune';
  else if (clean.includes('belisc') || clean.includes('pinch') || clean.includes('poke')) targetCat = 'beliscar';
  else if (clean.includes('abrac') || clean.includes('abraço') || clean.includes('hug')) targetCat = 'abraco';
  else {
    const keys = Object.keys(ANIME_GIFS_DATABASE);
    targetCat = keys[Math.floor(Math.random() * keys.length)];
  }

  const list = ANIME_GIFS_DATABASE[targetCat] || ANIME_GIFS_DATABASE.abraco;
  const randomIndex = Math.floor(Math.random() * list.length);
  return {
    url: list[randomIndex],
    category: targetCat,
    total: list.length,
  };
}
