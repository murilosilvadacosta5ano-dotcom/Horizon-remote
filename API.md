# Kaise GIF API

Base URL: `https://kaise.space`

A API pública do Kaise normaliza resultados de GIFs em um formato próprio e preserva a identificação da fonte em cada resultado.

## Endpoints

### Search

`GET /api/v1/search?q=naruto&limit=20&offset=0`

Parâmetros:

- `q`: termo de busca.
- `category`: categoria opcional.
- `limit`: 1 a 50, padrão 20.
- `offset`: posição inicial, padrão 0.

### Random

`GET /api/v1/random`

Opcional:

`GET /api/v1/random?category=anime`

### Categories

`GET /api/v1/categories`

### Category results

`GET /api/v1/categories/anime?limit=20&offset=0`

### Legacy

`GET /api/gifs?search=naruto&limit=20&pos=0`

A rota antiga continua disponível para não quebrar bots já configurados.

## Response

Cada resultado pode conter a origem:

```json
{
  "id": "tenor-123",
  "url": "https://...",
  "source": {
    "provider": "tenor",
    "url": "https://tenor.com/..."
  }
}
```

Resultados locais usam `kaise-local` como provider.

## Rate limit

A API pública possui um limite de 60 requisições por minuto por IP. As respostas incluem `X-RateLimit-Limit`, `X-RateLimit-Remaining` e `X-RateLimit-Reset`.

Quando o limite é excedido, a API responde HTTP `429` e inclui `Retry-After`.

## Attribution

Quando um resultado vier de um provedor externo, a aplicação consumidora deve preservar a informação de `source` e respeitar os termos e requisitos de atribuição aplicáveis ao provedor de origem.
