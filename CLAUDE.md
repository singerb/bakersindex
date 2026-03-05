# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Baker's Index is a SaaS app for bakers to manage baking formulas (recipes with baker's percentages). It has four main components in separate subdirectories:

- `bi-backend/` - Go HTTP server (dev) + AWS Lambda handlers (production), using GORM + PostgreSQL (Neon)
- `bi-frontend/` - React 19 + React Router v7 + Vite SPA, using TanStack Query, Tailwind v4, shadcn/ui
- `bi-infrastructure/` - Pulumi TypeScript for AWS (Lambda, API Gateway, S3, CloudFront, Route53, ACM)
- `bi-neon/` - Pulumi TypeScript for Neon PostgreSQL project/branches
- `bi-blog/` - Static blog built with `minipage`, output to `docs/` (served via GitHub Pages)

Auth is handled by Auth0. All API routes require a JWT Bearer token validated against Auth0.

## Backend

### Dev Commands (run from `bi-backend/`)

```sh
# Run dev server (uses nodemon to reload on changes)
./dev-server.sh

# Apply migrations to local DB
make migrate-local

# Apply migrations to staging/production
make migrate-staging
make migrate-production

# Build all Lambda zip artifacts
make build
```

### Architecture

The backend has two execution modes controlled by the `BI_BACKEND` env var:

1. **Local dev**: `main.go` runs a gorilla/mux HTTP server on `:8080` with JWT middleware applied inline.
2. **Lambda (production)**: Each route has its own handler in `lambda-handlers/<route-name>/handler.go`, compiled to a `bootstrap` binary and zipped. The `lambda-handlers/utils.go` wraps the common handler signature.

Core database logic lives in `lib/db.go` — the `Formula`, `FormulaPart`, and `FormulaMeta` GORM models plus CRUD functions used by both the dev server and Lambda handlers. The `lib/env.go` loads `.env.local` (or `.env.<BI_BACKEND>.local`) via godotenv.

**Database migrations** use Atlas with the GORM provider (`atlas.hcl`). The `atlas/main.go` program generates the SQL schema from the GORM models. To create a new migration after changing models:
```sh
cd bi-backend/
atlas migrate diff --env gorm
```
This requires Docker for the ephemeral dev Postgres container used by Atlas.

### Environment Files

- `.env.local` — `DATABASE_URL`, `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`
- `.env.nonpooled.local` — `DATABASE_URL` without PgBouncer (required for Atlas migrations)
- `neon.env` — `NEON_API_KEY`, `NEON_PROJECT_ID`, `PARENT_BRANCH_ID` for Neon Local

## Frontend

### Dev Commands (run from `bi-frontend/`)

```sh
yarn run dev       # dev server
yarn run build     # production build
yarn run lint      # ESLint
```

### Architecture

React Router v7 in SPA mode (not SSR). Routes are defined in `src/routes.ts`:
- `/` → `Home.tsx` (public landing page)
- `/callback` → `Callback.tsx` (Auth0 redirect handler)
- `MainPage.tsx` layout (guarded by `AuthenticationGuard`) wraps:
  - `/formulas` → `Formulas.tsx`
  - `/formula/:formulaId` → `Formula.tsx`
  - `/formula/new` → `CreateFormula.tsx`

`src/api.ts` — all API calls using `up-fetch`, attaches Auth0 Bearer token automatically.

`src/auth0/` — custom Auth0 provider implementation (not using `@auth0/auth0-react` directly — custom wrapper in `src/auth0-provider.tsx`).

`src/query-client.tsx` — TanStack Query client setup.

UI components in `src/components/ui/` are shadcn/ui components. Custom components in `src/components/`.

In production, the frontend is built and deployed as a static site to S3/CloudFront. The CloudFront distribution routes `/api/*` to API Gateway and everything else to S3. All 404/403 responses from S3 return `index.html` to support client-side routing.

## Infrastructure

### Deploy Commands (run from `bi-infrastructure/`)

```sh
# Full staging deploy (builds backend + frontend, then pulumi up)
make deploy-staging

# Full production deploy
make deploy-production

# Deploy without rebuilding
pulumi stack select staging && pulumi up
```

The Pulumi stack creates: API Gateway v2 (HTTP) with JWT authorizer, one Lambda per API route, S3 bucket + CloudFront distribution, ACM cert + Route53 records. Both stacks (`staging`, `production`) share the same code; `production` gets the apex domain with www redirect.

Neon DB connection strings are pulled from the `bi-neon/base` Pulumi stack via `StackReference`.

## Blog

### Build Commands (run from `bi-blog/`)

```sh
make       # builds all posts to ../docs/
make clean # removes generated files
```

Posts go in `bi-blog/src/` as Markdown files. The `minipage` tool (installed at `~/go/bin/minipage`) wraps them with `header.md` and `footer.md`. The `<!-- title: ... -->` comment in each post sets the HTML title. Output goes to `docs/` which is served via GitHub Pages.
