# Routes & Pages

The project follows Next.js App Router conventions. Key pages and routes live under `src/app`.

Top-level pages

- `/` — Home page (public ledger, marketplace overview). Implemented under `src/app/page.tsx` and `src/app/home/page.tsx`.
- `/login` — Login page: `src/app/login.md` (or `src/app/login/page.tsx` if implemented as a page component).
- `/signup` — Signup flow.
- `/profile/[id]` — User profile pages; server rendered per user.

Transaction flows

- `/transaction/new` — New transaction creation.
- `/transaction/invite` — Invitation flow.
- `/transaction/[id]` — Transaction details and preview mode. Has nested `active` and `invite` routes.

API routes

- `src/app/api/*` contains server endpoints. Document specific routes as they are added.

Route conventions

- Keep route handlers small and focused. Use dedicated folders for complex flows (transaction preview, verification, reporting).
- Use nested layouts for flows that share UI (e.g., transaction preview and active transaction share header/footer).
