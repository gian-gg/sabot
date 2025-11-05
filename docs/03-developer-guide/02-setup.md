# Setup & Local Development

Quick start — run locally

1. Install dependencies

```bash
# macOS / zsh
bun install
```

2. Environment variables

Create a `.env` at the repository root with at least the following values:

- `SUPABASE_URL` — URL for your Supabase project
- `SUPABASE_ANON_KEY` — Anon key for your Supabase project

## Database

Migrations are handled via the Supabase CLI.

## Running Tests

End-to-end tests are not yet implemented.

Notes

- The project uses Next.js with Turbopack enabled in `package.json` scripts. If you encounter issues with Turbopack, try running `next dev` directly or set TURBOPACK=false.
- Formatting and pre-commit hooks are configured using Prettier and Husky.
