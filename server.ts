import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { searchOnlineGifs } from "./src/services/gifSearch";
import { GIF_CATEGORIES } from "./src/data/categoriesData";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS middleware para permitir bots de Telegram, Discord, Python, etc.
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "online", 
      service: "Raphael GIF Gateway", 
      mode: "Direct Web Scraper Engine", 
      version: "5.0" 
    });
  });

  // 1. Endpoint principal da API para desenvolvedores e bots (GET)
  // Exemplo: /api/gifs?key=raphaelsboting&search=naruto&category=animes&limit=20
  app.get("/api/gifs", async (req, res) => {
    const key = (req.query.key as string) || (req.headers["x-api-key"] as string) || "raphaelsboting";
    const searchQuery = (req.query.search as string) || (req.query.q as string) || "geral";
    const forcedCategory = (req.query.category as string) || undefined;
    const limit = Math.min(parseInt((req.query.limit as string) || "20", 10), 50);
    const pos = (req.query.pos as string) || (req.query.next as string) || undefined;

    const result = await searchOnlineGifs(searchQuery, forcedCategory, limit, pos);

    res.json({
      status: 200,
      success: true,
      key_used: key,
      query: searchQuery,
      category: result.categoryMatched,
      gif_url: result.gifUrl,
      all_gifs: result.allGifs,
      results: result.results,
      next: result.next,
      total_found: result.totalFound,
      search_url: result.tenorSearchUrl,
      tenor_search_url: result.tenorSearchUrl,
      from_cache: result.fromCache,
      source: "Tenor Web Scraper (Live Direct)"
    });
  });

  // 2. Endpoint POST para requisições em JSON (Bots / Backend)
  app.post("/api/gifs/search", async (req, res) => {
    const key = req.body.key || "raphaelsboting";
    const search = req.body.search || req.body.q || "geral";
    const forcedCategory = req.body.category || undefined;
    const limit = Math.min(parseInt(req.body.limit || "20", 10), 50);
    const pos = req.body.pos || req.body.next || undefined;

    const result = await searchOnlineGifs(search, forcedCategory, limit, pos);

    res.json({
      status: 200,
      success: true,
      key_used: key,
      query: search,
      category: result.categoryMatched,
      gif_url: result.gifUrl,
      all_gifs: result.allGifs,
      results: result.results,
      next: result.next,
      total_found: result.totalFound,
      search_url: result.tenorSearchUrl,
      tenor_search_url: result.tenorSearchUrl,
      from_cache: result.fromCache,
      source: "Tenor Web Scraper (Live Direct)"
    });
  });

  // 3. Lista de categorias ativas
  app.get("/api/categories", (req, res) => {
    res.json({
      categories: GIF_CATEGORIES.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        total_gifs: c.gifs.length
      })),
      total_categories: GIF_CATEGORIES.length
    });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Raphael GIF Gateway running on http://localhost:${PORT}`);
  });
}

startServer();
