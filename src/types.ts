export interface Command {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  usage: string;
  example: string;
  searchQuery: string;
  searchUrl: string;
  gifs: string[];
}
