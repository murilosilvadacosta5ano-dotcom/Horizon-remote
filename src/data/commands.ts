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
    searchUrl: 'https://kaise.space/api/gifs?key=raphaelsboting&search=abra%C3%A7o%20anime',
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
    searchUrl: 'https://kaise.space/api/gifs?key=raphaelsboting&search=kiss%20anime',
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
    searchUrl: 'https://kaise.space/api/gifs?key=raphaelsboting&search=soco%20anime',
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
    searchUrl: 'https://kaise.space/api/gifs?key=raphaelsboting&search=tapa%20anime',
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
    searchUrl: 'https://kaise.space/api/gifs?key=raphaelsboting&search=chute%20anime',
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
    searchUrl: 'https://kaise.space/api/gifs?key=raphaelsboting&search=ataque%20anime',
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
    searchUrl: 'https://kaise.space/api/gifs?key=raphaelsboting&search=cafun%C3%A9%20anime',
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
    searchUrl: 'https://kaise.space/api/gifs?key=raphaelsboting&search=beliscar%20anime',
    gifs: ANIME_GIFS_DATABASE.beliscar
  }
];
