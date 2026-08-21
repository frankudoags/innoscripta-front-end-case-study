# ClusterNews — News Aggregator

A mobile-responsive news aggregator that pulls articles from **multiple news providers**, merged into a single clean feed. Supports keyword search, filtering by date / category / source, and a personalized feed (preferred sources, categories, authors).

Built with **React + TypeScript + Vite**, **TanStack Query**, **nuqs**, **Zod**, **Tailwind CSS**, and **shadcn/ui**:
- **React + TypeScript + Vite** — component UI with type safety, served by a fast dev/build toolchain
- **TanStack Query** — server-state management: caching, deduping, and loading/error states for API calls
- **nuqs** — URL-synced state, so filters and pagination live in the query string
- **Zod** — runtime validation of each provider's API response into a single `Article` shape
- **Tailwind CSS** — utility-first styling
- **shadcn/ui** — prebuilt, themeable components (buttons, dialogs, etc.)

## Features
- **Search & filter** — keyword, date range, category, and source (synced to the URL via `nuqs`, so state survives reloads and is shareable)
- **Personalized feed** — pick preferred sources, categories, and authors (persisted in `localStorage`)
- **Mobile-responsive** — responsive grid, collapsible filters, touch-friendly controls
- **Normalized data** — every provider validates its response with Zod and maps it to a single `Article` shape (DRY / SOLID: provider interface + registry)

## Prerequisites
- Node.js ≥ 20
- npm ≥ 10
- (Optional) Docker Engine (Docker Desktop or a bare Docker daemon)

## Setup
1. Copy the env template and fill in your API keys:
   ```bash
   cp .env.example .env
   ```
   `.env` is gitignored. The Guardian `test` key works for development; the NYT key comes from developer.nytimes.com.
2. Install dependencies:
   ```bash
   npm install
   ```

## Run locally (dev)
```bash
npm run dev
```
Open http://localhost:5173. 

## Build & preview
```bash
npm run build      # type-checks (tsc -b) then bundles (vite build)
npm run preview
```

## Lint
```bash
npm run lint       # oxlint
```

## Run with Docker(Docker Compose)
```bash
docker compose up --build
```
Then open http://localhost:3000. The API keys are read from `.env` (copied into the image) and baked into the static bundle at image-build time — no build args needed.

### Manual Docker
```bash
docker build -t clusternews .
docker run -p 3000:80 clusternews
```

### How the Dockerfile works
The `Dockerfile` is a **two-stage build**:
1. **Build stage** (`node:20-alpine`) — installs dependencies, copies the source (including `.env`), and runs `npm run build` to produce the static bundle in `dist/`.
2. **Serve stage** (`nginx:alpine`) — copies `dist/` into nginx's web root and serves it.

**Why nginx?** The Vite dev server is for development only; there's no dev dependency or Node runtime needed to *serve* static files. nginx is a lightweight web server that serves the prebuilt HTML/JS/CSS to browsers on port 80 (mapped to `3000` on the host). The API keys are baked into the bundle at build time via `import.meta.env`.

## Project structure
```
src/
  App.tsx              # feed: filters + personalized settings + article grid
  components/          # article-card, article-list, filters-bar, feed-settings + shadcn/ui
  hooks/               # use-articles (TanStack Query), use-preferences (localStorage)
  lib/
    types.ts           # normalized Article / ArticleFilters / Paginated
    validation.ts      # Zod schemas for every provider endpoint
    fetch.ts           # fetchAll: fans out to providers, merges + sorts by date
    provider/          # NewsProvider interface, ProviderRegistry class, guardian + newsapi + nyt adapters
```

## Adding a new source
Implement the `NewsProvider` interface (search + optional getCategories/getSources/getAuthors), add its Zod schema, and register it in `lib/provider/registry.ts`. The UI and merge logic need no changes.

## Removing a source
1. Delete its adapter (e.g. `lib/provider/nyt.ts`) and its Zod schema in `lib/validation.ts`.
2. Remove it from the registry in `lib/provider/registry.ts` and drop its id from the `ProviderId` union in `lib/types.ts`.
3. Remove the corresponding `VITE_PUBLIC_*` env vars from `.env` and `.env.example`.

The UI, merge logic, and remaining providers need no changes.
