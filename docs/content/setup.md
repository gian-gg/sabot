# Setup & Local Development

Quick start — run locally

1. Install dependencies

```bash
# macOS / zsh
bun install
```

2. Environment variables

Create a `.env.local` at the repository root with at least the following values:

- BETTER_AUTH_URL — URL for better-auth (auth provider)
- DATABASE_URL — Postgres connection string

Example (do not commit secrets):

```env
BETTER_AUTH_URL=https://auth.example
DATABASE_URL=postgres://user:pass@localhost:5432/sabot_dev
```

3. Run the dev server

```bash
bun dev
```

4. Database migrations

Drizzle is used for schema and migrations. Use `drizzle-kit` to manage migrations.

5. Playwright tests (to be implemented)

Run end-to-end tests with:

```bash
bun playwright test
```

Notes

- The project uses Next.js with Turbopack enabled in `package.json` scripts. If you encounter issues with Turbopack, try running `next dev` directly or set TURBOPACK=false.
- Formatting and pre-commit hooks are configured using Prettier and Husky.
