import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { searchOnlineGifs, getRandomGif } from "./src/services/gifSearch";
import { GIF_CATEGORIES } from "./src/data/categoriesData";
import { apiRateLimit } from "./src/middleware/rateLimit";

const API_RATE_LIMIT = 60;
const MAX_QUERY_LENGTH = 100;

function parseLimit(value: unknown, fallback = 20): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.trunc(parsed), 1), 50);
}

function parseOffset(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(Math.max(Math.trunc(parsed), 0), 100_000);
}

function cleanQuery(value: unknown): string {
  return String(value || "geral")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, MAX_QUERY_LENGTH) || "geral";
}

function cleanCategory(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return String(value).trim().toLowerCase().slice(0, 60) || undefined;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.set("x-powered-by", false);
  app.use(express.json({ limit: "100kb" }));

  // CORS para bots de Telegram, Discord, Python e outros clientes.
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key"
    );
    res.header("Access-Control-Max-Age", "86400");

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    next();
  });

  // API pública: limite por IP para evitar loops/bots acidentais derrubando o scraper.
  app.use("/api", apiRateLimit(API_RATE_LIMIT));

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "online",
      service: "Kaise GIF API",
      mode: "GIF Aggregation Gateway",
      version: "1.1.0",
      endpoints: {
        search: "/api/v1/search?q=naruto",
        random: "/api/v1/random",
        categories: "/api/v1/categories",
      },
    });
  });

  app.get("/api/v1/search", async (req, res) => {
    try {
      const query = cleanQuery(req.query.q || req.query.search);
      const category = cleanCategory(req.query.category);
      const limit = parseLimit(req.query.limit);
      const offset = parseOffset(req.query.offset ?? req.query.pos);

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
      res.status(502).json({
        success: false,
        error: "GIF_SEARCH_FAILED",
      });
    }
  });

  app.get("/api/v1/random", async (req, res) => {
    try {
      const category = cleanCategory(req.query.category);
      const result = await getRandomGif(category);

      res.json({
        success: true,
        result,
      });
    } catch (error) {
      console.error("Random GIF error:", error);
      res.status(502).json({
        success: false,
        error: "RANDOM_GIF_FAILED",
      });
    }
  });

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
      const category = cleanCategory(req.params.category) || "";
      const categoryData = GIF_CATEGORIES.find((item) => item.id === category);

      if (!categoryData) {
        return res.status(404).json({
          success: false,
          error: "CATEGORY_NOT_FOUND",
        });
      }

      const limit = parseLimit(req.query.limit);
      const offset = parseOffset(req.query.offset ?? req.query.pos);
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
      res.status(502).json({
        success: false,
        error: "CATEGORY_GIF_SEARCH_FAILED",
      });
    }
  });

  // Compatibilidade com integrações antigas.
  app.get("/api/gifs", async (req, res) => {
    try {
      const searchQuery = cleanQuery(req.query.search || req.query.q);
      const forcedCategory = cleanCategory(req.query.category);
      const limit = parseLimit(req.query.limit);
      const pos = parseOffset(req.query.pos ?? req.query.next);

      const result = await searchOnlineGifs(
        searchQuery,
        forcedCategory,
        limit,
        String(pos)
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
      res.status(502).json({
        status: 502,
        success: false,
        error: "GIF_SEARCH_FAILED",
      });
    }
  });

  app.post("/api/gifs/search", async (req, res) => {
    try {
      const search = cleanQuery(req.body?.search || req.body?.q);
      const forcedCategory = cleanCategory(req.body?.category);
      const limit = parseLimit(req.body?.limit);
      const pos = parseOffset(req.body?.pos ?? req.body?.next);

      const result = await searchOnlineGifs(
        search,
        forcedCategory,
        limit,
        String(pos)
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
      res.status(502).json({
        status: 502,
        success: false,
        error: "GIF_SEARCH_FAILED",
      });
    }
  });

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
