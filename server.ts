import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { searchOnlineGifs, getRandomGif } from "./src/services/gifSearch";
import { GIF_CATEGORIES } from "./src/data/categoriesData";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json());

  // CORS para bots de Telegram, Discord, Python e outros clientes.
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key"
    );

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  });

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "online",
      service: "Kaise GIF API",
      mode: "GIF Aggregation Gateway",
      version: "1.0.0",
    });
  });

  // =========================================================
  // API V1 - SEARCH
  // GET /api/v1/search?q=naruto&limit=20&offset=0
  // =========================================================
  app.get("/api/v1/search", async (req, res) => {
    try {
      const query = String(req.query.q || req.query.search || "geral").trim();
      const category = req.query.category
        ? String(req.query.category).trim()
        : undefined;
      const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
      const offset = Math.max(
        Number(req.query.offset ?? req.query.pos ?? 0) || 0,
        0
      );

      const result = await searchOnlineGifs(
        query,
        category,
        limit,
        String(offset)
      );

      res.json({
        success: true,
        query,
        category: result.categoryMatched,
        results: result.results,
        total: result.totalFound,
        next_offset: result.next,
        from_cache: result.fromCache,
      });
    } catch (error) {
      console.error("GIF search error:", error);
      res.status(500).json({
        success: false,
        error: "GIF_SEARCH_FAILED",
      });
    }
  });

  // =========================================================
  // API V1 - RANDOM
  // GET /api/v1/random
  // GET /api/v1/random?category=animes
  // =========================================================
  app.get("/api/v1/random", async (req, res) => {
    try {
      const category = req.query.category
        ? String(req.query.category).trim()
        : undefined;

      const result = await getRandomGif(category);

      res.json({
        success: true,
        result,
      });
    } catch (error) {
      console.error("Random GIF error:", error);
      res.status(500).json({
        success: false,
        error: "RANDOM_GIF_FAILED",
      });
    }
  });

  // =========================================================
  // API V1 - CATEGORIES
  // =========================================================
  app.get("/api/v1/categories", (_req, res) => {
    res.json({
      success: true,
      categories: GIF_CATEGORIES.map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        total_gifs: category.gifs.length,
      })),
      total_categories: GIF_CATEGORIES.length,
    });
  });

  app.get("/api/v1/categories/:category", async (req, res) => {
    try {
      const category = String(req.params.category).trim();
      const categoryData = GIF_CATEGORIES.find((item) => item.id === category);

      if (!categoryData) {
        return res.status(404).json({
          success: false,
          error: "CATEGORY_NOT_FOUND",
        });
      }

      const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
      const offset = Math.max(Number(req.query.offset) || 0, 0);

      const result = await searchOnlineGifs(
        category,
        category,
        limit,
        String(offset)
      );

      res.json({
        success: true,
        category: {
          id: categoryData.id,
          name: categoryData.name,
          description: categoryData.description,
        },
        results: result.results,
        total: result.totalFound,
        next_offset: result.next,
        from_cache: result.fromCache,
      });
    } catch (error) {
      console.error("Category GIF error:", error);
      res.status(500).json({
        success: false,
        error: "CATEGORY_GIF_SEARCH_FAILED",
      });
    }
  });

  // =========================================================
  // LEGACY API - mantida para não quebrar seus bots atuais
  // GET /api/gifs?search=naruto&category=animes&limit=20&pos=0
  // =========================================================
  app.get("/api/gifs", async (req, res) => {
    try {
      const searchQuery = String(
        req.query.search || req.query.q || "geral"
      ).trim();
      const forcedCategory = req.query.category
        ? String(req.query.category).trim()
        : undefined;
      const limit = Math.min(
        Math.max(parseInt(String(req.query.limit || "20"), 10) || 20, 1),
        50
      );
      const pos = String(req.query.pos ?? req.query.next ?? "0");

      const result = await searchOnlineGifs(
        searchQuery,
        forcedCategory,
        limit,
        pos
      );

      res.json({
        status: 200,
        success: true,
        query: searchQuery,
        category: result.categoryMatched,
        gif_url: result.gifUrl,
        all_gifs: result.allGifs,
        results: result.results,
        next: result.next,
        total_found: result.totalFound,
        search_url: result.searchUrl,
        tenor_search_url: result.tenorSearchUrl,
        from_cache: result.fromCache,
        source: result.results[0]?.source || {
          provider: "kaise",
          url: result.searchUrl,
        },
      });
    } catch (error) {
      console.error("Legacy GIF API error:", error);
      res.status(500).json({
        status: 500,
        success: false,
        error: "GIF_SEARCH_FAILED",
      });
    }
  });

  // POST compatível com bots/backend antigos.
  app.post("/api/gifs/search", async (req, res) => {
    try {
      const search = String(req.body.search || req.body.q || "geral").trim();
      const forcedCategory = req.body.category
        ? String(req.body.category).trim()
        : undefined;
      const limit = Math.min(
        Math.max(parseInt(String(req.body.limit || "20"), 10) || 20, 1),
        50
      );
      const pos = String(req.body.pos ?? req.body.next ?? "0");

      const result = await searchOnlineGifs(
        search,
        forcedCategory,
        limit,
        pos
      );

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
        search_url: result.searchUrl,
        tenor_search_url: result.tenorSearchUrl,
        from_cache: result.fromCache,
        source: result.results[0]?.source || {
          provider: "kaise",
          url: result.searchUrl,
        },
      });
    } catch (error) {
      console.error("POST GIF API error:", error);
      res.status(500).json({
        status: 500,
        success: false,
        error: "GIF_SEARCH_FAILED",
      });
    }
  });

  // Endpoint de categorias antigo.
  app.get("/api/categories", (_req, res) => {
    res.json({
      categories: GIF_CATEGORIES.map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        total_gifs: category.gifs.length,
      })),
      total_categories: GIF_CATEGORIES.length,
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
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Kaise GIF API running on http://localhost:${PORT}`);
  });
}

startServer();
