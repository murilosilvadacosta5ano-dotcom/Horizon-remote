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
import { processQueryApi } from "./src/services/intelligenceService";

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

  app.get("/api/auth/google/config", (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "867223583700-u5lteb4ihfhpdw5rhezwjp.apps.googleusercontent.com";
    res.json({
      clientId: clientId,
      projectId: "gen-lang-client-0658878038",
      projectNumber: "867223583700",
      scopes: ["openid", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"]
    });
  });

  // Google OAuth Popup Callback Handler
  app.get(["/auth/google/callback", "/api/auth/google/callback"], (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Kaise - Autenticação Google</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0e1621; color: #f5f5f5; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
    .card { background: #17212b; padding: 28px; border-radius: 20px; border: 1px solid #232e3c; max-width: 360px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .spinner { border: 3px solid #232e3c; border-top: 3px solid #2481cc; border-radius: 50%; width: 32px; height: 32px; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h3 style="margin: 0 0 8px; font-size: 16px;">Concluindo Login Google...</h3>
    <p style="font-size: 12px; color: #8293a4; margin: 0;">Sua sessão está sendo sincronizada. Esta janela fechará automaticamente.</p>
  </div>
  <script>
    (async function() {
      try {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash || window.location.search);
        const accessToken = params.get('access_token');
        const idToken = params.get('id_token');
        const error = params.get('error');

        if (error) {
          if (window.opener) {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: error }, '*');
          }
          setTimeout(function() { window.close(); }, 1200);
          return;
        }

        if (accessToken) {
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { 'Authorization': 'Bearer ' + accessToken }
          });
          if (res.ok) {
            const userinfo = await res.json();
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_SUCCESS',
                userinfo: userinfo,
                token: accessToken
              }, '*');
            }
          }
        }
      } catch (e) {
        console.error('OAuth Callback Error:', e);
      } finally {
        setTimeout(function() { window.close(); }, 600);
      }
    })();
  </script>
</body>
</html>`);
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

  // =========================================================================
  // RAW TEXT RESPONSE ENDPOINT FOR EXTERNAL SITES / BOTS / WEBSITES
  // Format: /API/query:pergunta or /api/query:pergunta or /query:pergunta
  // Returns ONLY the pure plain text answer without JSON, HTML, or metadata!
  // =========================================================================
  const handleRawTextQueryRequest = async (req: express.Request, res: express.Response) => {
    try {
      // Extract raw query from path parameter or query string
      let rawQuery = 
        (req.params.query as string) || 
        (req.query.query as string) || 
        (req.query.q as string) || 
        '';

      // Clean leading colon or quotes if present (e.g., query:"pergunta" or query:pergunta)
      rawQuery = rawQuery.replace(/^[:"'\s]+|["'\s]+$/g, '').trim();

      if (!rawQuery) {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        return res.status(400).send("Por favor, forneça uma pergunta após query: ou no parâmetro q.");
      }

      const decodedQuery = decodeURIComponent(rawQuery).trim();

      // Process with Kaise AI
      const result = await processQueryApi(decodedQuery);

      // Return ONLY raw text response
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.status(200).send(result.answer);
    } catch (error: any) {
      console.error("Erro no endpoint de texto puro:", error);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.status(500).send("Erro ao processar resposta da IA.");
    }
  };

  // Plain Text Direct Routes (Support both uppercase /API/ and lowercase /api/ and direct /query:)
  app.get(["/API/query::query", "/api/query::query", "/API/query*", "/api/query*", "/query::query"], handleRawTextQueryRequest);
  app.post(["/API/query", "/api/query"], handleRawTextQueryRequest);

  // JSON API Endpoints for /api/ask
  const handleJsonQueryRequest = async (req: express.Request, res: express.Response) => {
    try {
      const rawQuery = 
        (req.query.query as string) || 
        (req.query.q as string) || 
        (req.body?.query as string) || 
        (req.body?.q as string) || 
        '';

      const decodedQuery = decodeURIComponent(rawQuery).trim();
      if (!decodedQuery) {
        return res.status(400).json({ status: "error", message: "Envie o parâmetro 'query' ou 'q'." });
      }

      const result = await processQueryApi(decodedQuery);
      return res.json({ status: "success", ...result });
    } catch (error: any) {
      return res.status(500).json({ status: "error", message: error?.message || String(error) });
    }
  };

  app.get(["/api/ask", "/api/v1/ask"], handleJsonQueryRequest);
  app.post(["/api/ask", "/api/v1/ask"], handleJsonQueryRequest);

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
