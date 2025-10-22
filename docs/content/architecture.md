# Architecture — High Level

This document explains the high-level architecture of Sabot and how the main pieces interact.

Core principles

- Server-rendered React using Next.js (App Router). Pages and server components live under `src/app`.
- Small, composable UI primitives follow shadcn/ui and Radix design patterns.
- Authentication and session management are handled by `better-auth`.
- Persistent data lives in PostgreSQL accessed via Drizzle ORM.
- State management for client-only UI uses `zustand` where needed.

Primary layers

1. Presentation (UI)
   - `src/components/` contains reusable UI primitives (ui/, home/, user/). Components are designed to be accessible and themeable via Tailwind CSS.
   - The global layout is in `src/app/layout.tsx` which hydrates the user session and mounts shared UI (Header, Footer, Toaster).

2. Client utilities
   - `src/lib/` holds small helpers: auth clients, utility functions and db helpers.
   - `src/store/` (e.g. `userStore.ts`) keeps client-only state for quick UI reads.

3. Server (API & routing)
   - Next.js App Router server routes in `src/app/api/*` provide backend endpoints.
   - Server-only auth helpers live under `src/lib/auth/server.ts`.

4. Persistence
   - Drizzle ORM + `postgres` provides typed DB access.
   - Database schema is in `src/lib/db/schema.ts` and drizzle-kit is used for migrations.

5. Integrations
   - AI processing (conversation analysis, summaries) is designed as a modular service (details TBD in code). External providers like OpenAI/Anthropic are likely candidates.
   - Third-party UI libs: Radix primitives and `lucide-react` icons.

Security and data flow

- Auth flows are server-first when possible; sensitive verification flows (ID upload, face-match) are gated behind verification middleware.
- The RootLayout loads the session server-side (`getSession`) then hydrates client stores for UI consumption.

Notes & next steps

- Consider documenting the AI service contract (input/output schema) and adding formal API specs (OpenAPI) under `docs/api-spec`.
- Add a deployment diagram with environment variables (e.g., BETTER_AUTH_URL, DATABASE_URL).
