# Tech Stack

This page explains the main technologies used in Sabot and why they were chosen.

## Frontend

- **Next.js 15 (App Router)** — Powers our server-rendered React application, providing optimized performance, file-based routing, and a streamlined developer experience.
- **React 19** — The core of our UI, enabling the creation of interactive and reusable components with modern concurrent features.
- **Tailwind CSS v4** — A utility-first CSS framework that allows for rapid and consistent styling directly in the markup.
- **shadcn/ui & Radix Primitives** — A collection of accessible and composable UI components that form the building blocks of our design system.
- **Tiptap** — A headless rich-text editor framework used for collaborative document editing in our agreement platform.
- **Lucide React** — Provides a set of clean and lightweight icons, ensuring visual consistency across the application.

## Backend & Database

- **Next.js API Routes** — Used to build our backend endpoints, seamlessly integrated with the frontend.
- **PostgreSQL** — Our primary relational database for storing all application data, including transactions, users, and agreements.
- **Supabase** — Our backend-as-a-service platform, providing database hosting, real-time capabilities, and authentication.

## Auth & Security

- **Supabase Auth** — Manages user authentication, including email/password and social logins, with built-in security features.
- **Environment Variables** — Securely manages sensitive information like API keys and database credentials.

## Blockchain & AI

- **Ethers.js** — A complete and compact library for interacting with the Ethereum blockchain, used for our escrow functionalities.
- **Google Generative AI** — Powers our AI-driven features, such as conversation analysis and document summarization.

## State & Utilities

- **Zustand** — A small, fast, and scalable state management solution for handling client-side state.
- **clsx & tailwind-merge** — Utilities for composing and managing CSS classes efficiently.

## Dev Tooling

- **TypeScript** — Ensures type safety and improves code quality across the entire codebase.
- **ESLint, Prettier, Husky, lint-staged** — A suite of tools for maintaining consistent code style and quality through automated checks and pre-commit hooks.
