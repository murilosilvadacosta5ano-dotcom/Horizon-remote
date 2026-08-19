import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { searchOnlineGifs } from "./src/services/gifSearch";
import { GIF_CATEGORIES } from "./src/data/categoriesData";
import { handleSearch as handleV1Search } from "./api/v1/search";
import handleV1Random from "./api/v1/random";
import handleV1Categories from "./api/v1/categories";
import handleV1Gifs from "./api/v1/gifs";
import { apiRateLimit } from "./src/middleware/rateLimit";

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

  // Apply Rate Limiting to all backend API calls (1000 req/min per IP)
  app.use("/api", (req, res, next) => {
    // If it's a browser request directly visiting /api or /api/ for HTML, pass to SPA router
    if ((req.path === "/" || req.path === "") && req.headers.accept?.includes("text/html")) {
      return next();
    }
    return apiRateLimit(1000)(req, res, next);
  });

  // Root /api endpoint JSON response when requested as JSON
  app.get("/api", (req, res, next) => {
    if (req.headers.accept?.includes("text/html")) {
      return next(); // Pass to SPA router
    }
    res.json({
      service: "Kaise GIF API",
      status: "online",
      version: "1.0.0",
      documentation: "https://kaise.space/documentacao",
      endpoints: [
        "/api/v1/search?q=naruto&limit=20",
        "/api/v1/random?category=anime",
        "/api/v1/categories",
        "/api/v1/gifs/:id",
        "/api/health"
      ]
    });
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "online", 
      service: "Kaise GIF Gateway API", 
      mode: "Multi-Provider Aggregator & Normalizer", 
      version: "1.0.0",
      timestamp: new Date().toISOString()
    });
  });

  // Auth Status & Google OAuth config endpoint
  app.get("/api/auth/status", (req, res) => {
    res.json({
      status: "active",
      provider: "Google OAuth 2.0",
      redirectTarget: "https://www.kaise.space",
      clientConfigured: true,
      authRoutes: ["/login", "/auth/callback", "/auth/google", "/auth/redirect"]
    });
  });

  // Novos Endpoints da Kaise API v1
  app.get("/api/v1/search", (req, res) => handleV1Search(req, res));
  app.post("/api/v1/search", (req, res) => handleV1Search(req, res));
  app.get("/v1/search", (req, res) => handleV1Search(req, res));

  app.get("/api/v1/random", (req, res) => handleV1Random(req, res));
  app.get("/api/v1/categories", (req, res) => handleV1Categories(req, res));
  app.get("/api/v1/categories/:id", (req, res) => {
    req.query.id = req.params.id;
    return handleV1Categories(req, res);
  });
  app.get("/api/v1/gifs/:id", (req, res) => handleV1Gifs(req, res));
  
  // Endpoint principal legado da API
  app.get("/api/gifs", async (req, res) => {
    const searchQuery = (req.query.search as string) || (req.query.q as string) || "geral";
    const forcedCategory = (req.query.category as string) || undefined;
    const limit = Math.min(parseInt((req.query.limit as string) || "20", 10), 50);
    const pos = (req.query.pos as string) || (req.query.next as string) || undefined;

    const result = await searchOnlineGifs(searchQuery, forcedCategory, limit, pos);

    res.json({
      status: 200,
      success: true,
      query: searchQuery,
      category: result.categoryMatched,
      gif_url: result.gifUrl,
      all_gifs: result.allGifs,
      results: result.kaiseResults || result.results,
      tenor_results: result.results,
      next: result.next,
      total_found: result.totalFound,
      search_url: result.tenorSearchUrl,
      tenor_search_url: result.tenorSearchUrl,
      from_cache: result.fromCache,
      source: {
        provider: "tenor",
        attribution: "Tenor via Kaise Aggregator"
      }
    });
  });

  // Endpoint POST para requisições em JSON (Bots / Backend)
  app.post("/api/gifs/search", async (req, res) => {
    const search = req.body.search || req.body.q || "geral";
    const forcedCategory = req.body.category || undefined;
    const limit = Math.min(parseInt(req.body.limit || "20", 10), 50);
    const pos = req.body.pos || req.body.next || undefined;

    const result = await searchOnlineGifs(search, forcedCategory, limit, pos);

    res.json({
      status: 200,
      success: true,
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

  // Lista de categorias ativas
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
    console.log(`Kaise GIF Gateway running on http://localhost:${PORT}`);
  });
}

startServer();
