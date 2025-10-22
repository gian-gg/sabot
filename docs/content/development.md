# Development Workflow

Coding style & linting

- Prettier and ESLint are configured. Use `bun format` to apply formatting and `bun lint` to run lint checks.
- Husky & lint-staged will run Prettier on staged files before commit.

Branching & commits

- Use feature branches off `main`.
- Commit messages follow conventional commits; commitlint is configured.

Testing

- Unit & integration: use Playwright where applicable for browser-based flows.

Debugging tips

- To inspect server logs, run the Next.js dev server and watch terminal output.
- When debugging auth flows, verify `BETTER_AUTH_URL` and callback URLs match your local environment.

Common dev tasks

- Start the app: `bun dev`
- Build for production locally: `bun build`
- Start production server: `bun start`

Component patterns

- UI primitives live in `src/components/ui/`. Follow the `Button` component pattern using `class-variance-authority` for variants.
- Keep components small and composable. Prefer props + slots over deeply nested logic.
