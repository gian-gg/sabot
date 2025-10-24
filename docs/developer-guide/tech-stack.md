# Tech Stack

This page explains the main technologies used in Sabot and why they were chosen.

Frontend

- Next.js 15 (App Router) — fast server rendering, routing, and modern React features.
- React 19 — modern component model and concurrent features.
- Tailwind CSS v4 + `prettier-plugin-tailwindcss` — utility-first styling and consistent formatting.
- shadcn/ui + Radix primitives — accessible, composable UI building blocks.
- `lucide-react` — lightweight, customizable icons.

Backend & Database

- Next.js server routes for API endpoints.
- PostgreSQL — relational store for transactions, users, and reports.
- Drizzle ORM & drizzle-kit — type-safe DB access and migrations.

Auth & Security

- better-auth — authentication provider used for email and social logins (Google configured client-side).
- Environment-managed secrets (see `.env` pattern) — keep BETTER_AUTH_URL and DATABASE_URL in environment.

State & Utilities

- Zustand — lightweight client state where needed.
- clsx + tailwind-merge — CSS class composition + deduping.

Dev Tooling

- TypeScript — typed codebase, `tsconfig.json` included.
- ESLint, Prettier, Husky, lint-staged — consistent code quality and pre-commit checks.
- Playwright — end-to-end testing.

Observability & AI

- AI integrations are planned for conversation analysis and market comparison features (open provider selection).

Why these choices

- Developer ergonomics (Next.js + TypeScript) accelerates building server-rendered UI and APIs.
- Drizzle + Postgres provide a simple, typed DB model that's easy to reason about for transaction records.
- shadcn/ui and Radix combine accessibility with Tailwind's speed of iteration.
