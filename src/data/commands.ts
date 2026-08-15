import { Command } from '../types';
import { ANIME_GIFS_DATABASE } from './animeGifs';

export const ONLY_COMMANDS: Command[] = [
  {
    id: 'abraco',
    name: 'abraco',
    aliases: ['abraço', 'hug'],
    description: 'Dar um abraço em alguém',
    usage: '/abraco @usuario',
    example: '/abraco @Mariana',
    searchQuery: 'abraço anime',
    searchUrl: 'https://cdn.raphaelbot.com/search/abraco-anime',
    gifs: ANIME_GIFS_DATABASE.abraco
  },
  {
    id: 'kiss',
    name: 'kiss',
    aliases: ['beijo', 'beijar'],
    description: 'Dar um beijo em alguém',
    usage: '/kiss @usuario',
    example: '/kiss @Lucas',
    searchQuery: 'kiss anime',
    searchUrl: 'https://cdn.raphaelbot.com/search/kiss-anime',
    gifs: ANIME_GIFS_DATABASE.kiss
  },
  {
    id: 'socar',
    name: 'socar',
    aliases: ['soco', 'punch'],
    description: 'Dar um soco em alguém',
    usage: '/socar @usuario',
    example: '/socar @Thiago',
    searchQuery: 'soco anime',
    searchUrl: 'https://cdn.raphaelbot.com/search/soco-anime',
    gifs: ANIME_GIFS_DATABASE.socar
  },
  {
    id: 'tapa',
    name: 'tapa',
    aliases: ['slap'],
    description: 'Dar um tapa em alguém',
    usage: '/tapa @usuario',
    example: '/tapa @Pedro',
    searchQuery: 'tapa anime',
    searchUrl: 'https://cdn.raphaelbot.com/search/tapa-anime',
    gifs: ANIME_GIFS_DATABASE.tapa
  },
  {
    id: 'chutar',
    name: 'chutar',
    aliases: ['chute', 'kick'],
    description: 'Dar um chute em alguém',
    usage: '/chutar @usuario',
    example: '/chutar @Felipe',
    searchQuery: 'chute anime',
    searchUrl: 'https://cdn.raphaelbot.com/search/chute-anime',
    gifs: ANIME_GIFS_DATABASE.chutar
  },
  {
    id: 'atacar',
    name: 'atacar',
    aliases: ['attack', 'ataque'],
    description: 'Atacar alguém',
    usage: '/atacar @usuario',
    example: '/atacar @Bruno',
    searchQuery: 'ataque anime',
    searchUrl: 'https://cdn.raphaelbot.com/search/ataque-anime',
    gifs: ANIME_GIFS_DATABASE.atacar
  },
  {
    id: 'cafune',
    name: 'cafune',
    aliases: ['cafuné', 'pat', 'headpat'],
    description: 'Fazer cafuné em alguém',
    usage: '/cafune @usuario',
    example: '/cafune @Gabriel',
    searchQuery: 'cafuné anime',
    searchUrl: 'https://cdn.raphaelbot.com/search/cafune-anime',
    gifs: ANIME_GIFS_DATABASE.cafune
  },
  {
    id: 'beliscar',
    name: 'beliscar',
    aliases: ['pinch', 'poke'],
    description: 'Beliscar alguém',
    usage: '/beliscar @usuario',
    example: '/beliscar @Carla',
    searchQuery: 'beliscar anime',
    searchUrl: 'https://cdn.raphaelbot.com/search/beliscar-anime',
    gifs: ANIME_GIFS_DATABASE.beliscar
  }
];
