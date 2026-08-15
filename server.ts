import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { searchOnlineGifs } from "./src/services/gifSearch";
import { ANIME_GIFS_DATABASE } from "./src/data/animeGifs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS middleware for external bot access (Telegram/Discord bots)
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // API Route: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "online", bot: "Raphael", version: "2.5" });
  });

  // API Route: Real-time search endpoint for Discord, Telegram & Web
  // Example: /api/gifs?key=raphaelsboting&search=anime abraço
  app.get("/api/gifs", async (req, res) => {
    const key = (req.query.key as string) || (req.headers["x-api-key"] as string) || "raphaelsboting";
    const searchQuery = (req.query.search as string) || (req.query.category as string) || (req.query.q as string) || "anime abraço";

    const result = await searchOnlineGifs(searchQuery);

    res.json({
      status: 200,
      success: true,
      key_used: key,
      query: searchQuery,
      search_url: result.tenorSearchUrl,
      tenor_search_url: result.tenorSearchUrl,
      gif_url: result.gifUrl,
      total_found: result.totalFound,
      from_cache: result.fromCache,
      source: "Tenor Direct Engine"
    });
  });

  // API Route: Search via POST for bots
  app.post("/api/gifs/search", async (req, res) => {
    const key = req.body.key || "raphaelsboting";
    const search = req.body.search || req.body.category || req.body.q || "anime abraço";

    const result = await searchOnlineGifs(search);

    res.json({
      status: 200,
      success: true,
      key_used: key,
      query: search,
      search_url: result.tenorSearchUrl,
      tenor_search_url: result.tenorSearchUrl,
      gif_url: result.gifUrl,
      total_found: result.totalFound,
      from_cache: result.fromCache,
      source: "Tenor Direct Engine"
    });
  });

  // API Route: List available categories
  app.get("/api/categories", (req, res) => {
    res.json({
      categories: Object.keys(ANIME_GIFS_DATABASE),
      total_categories: Object.keys(ANIME_GIFS_DATABASE).length
    });
  });

  // Vite middleware for development vs static build
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
    console.log(`Raphael Bot API & Web server running on http://localhost:${PORT}`);
  });
}

startServer();
