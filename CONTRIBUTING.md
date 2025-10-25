# Contributing to Sabot

Thanks for your interest in contributing to Sabot! We welcome bug reports, feature requests, documentation improvements, and code contributions. This document explains the preferred workflow, conventions, and helpful commands to get you productive quickly.

## Quick start

1. Fork the repository on GitHub and clone your fork locally.
2. Install dependencies and apply any required patches:

```bash
bun install
# patches are applied automatically via prepare/postinstall scripts in this repo
```

3. Start the development server:

```bash
bun run dev
```

4. Create a branch for your change (see Branching and workflow below).

## Branching & workflow

- Base new work off the `main` branch.
- Use descriptive branch names. Examples:
  - `feature/add-payment-button`
  - `fix/issue-123-escrow-null`
  - `docs/update-contributing`
- Keep changes small and focused. One logical change per branch/PR makes review easier.

When your change is ready, open a Pull Request (PR) against `main` and include:

- A clear title and summary of the change.
- The motivation and links to any related issues.
- Testing steps and screenshots/GIFs for UI changes.

## Commit messages

We enforce Conventional Commits. Examples:

- feat: add token purchase flow
- fix: correct rounding error in escrow calculation
- docs: update payment docs
- chore: bump dependency versions

Commit messages are linted by commitlint (configured in this repo). Please follow the Conventional Commits format to avoid CI failures.

## Pull request checklist

- [ ] The change has a clear scope and title.
- [ ] New features include tests where appropriate.
- [ ] Code is formatted and linted.
- [ ] All existing tests pass locally.
- [ ] Add or update documentation when behavior changes.

## Tests, linting and formatting

Use the scripts in `package.json`:

- Start dev server: `bun run dev`
- Build for production: `bun run build`
- Lint: `bun run lint`
- Format: `bun run format`
- Check formatting: `bun run format:check`

The repository also uses Husky and lint-staged to run formatting on staged files and commit hooks. Running `bun install` will set those up (see `prepare`/`postinstall` scripts).

If the repository contains tests, run them using the project scripts or test runner used by the repo (for example, Playwright is available in devDependencies — run `npx playwright test` if you need to run end-to-end tests).

## Code style and conventions

- Prettier is used for formatting. Use `bun run format` to auto-format changes.
- ESLint is used for linting; use `bun run lint`.
- Follow the repository's TypeScript and React patterns. Look at existing components and hooks under `src/` for examples.

## Patches and third-party fixes

This repo uses `patch-package` (patches live in `patches/`). Patches are applied automatically via the `prepare` and `postinstall` scripts. If you need to add or update a patch, run `npx patch-package <package-name>` and commit the resulting file under `patches/`.

## Security and sensitive data

- Do not commit secrets, private keys, or credentials. Use environment variables for secrets and add them to `.gitignore`.
- If you discover a security vulnerability, please open a private issue or contact the maintainers directly instead of posting details publicly.

## Where to get help

- Open an issue on GitHub for bugs or feature requests.
- For questions about contributing, mention the maintainers in an issue or reach out in the project channels listed in the README.

## Thank you

Thanks for contributing! Small, consistent contributions are highly valuable — from documentation fixes to major features.

-- The Sabot maintainers
