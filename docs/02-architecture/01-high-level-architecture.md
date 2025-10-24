# Architecture — High Level

This document explains the high-level architecture of Sabot and how the main pieces interact.

## Core Principles

- **Server-Rendered React**: We use Next.js with the App Router to build a fast and modern server-rendered React application. All pages and server components are located in `src/app`.
- **Composable UI**: Our UI is built with small, composable primitives, following the design patterns of shadcn/ui and Radix for accessibility and consistency.
- **Authentication**: User authentication and session management are handled by Supabase Auth, providing a secure and scalable solution.
- **Persistence**: Data is stored in a PostgreSQL database, accessed directly through the `postgres` client for performance and control.
- **State Management**: Client-side state is managed with Zustand, a lightweight and scalable state management library.

## Primary Layers

1.  **Presentation (UI)**
    - `src/components/`: Contains reusable UI components, organized by feature (e.g., `ui/`, `home/`, `user/`). All components are designed to be accessible and are styled with Tailwind CSS.
    - `src/app/layout.tsx`: The global layout for the application, responsible for hydrating the user session and mounting shared UI elements like the header, footer, and toaster.

2.  **Client Utilities**
    - `src/lib/`: A collection of small, reusable helpers for various tasks, including authentication clients, utility functions, and database helpers.
    - `src/store/`: Contains our Zustand stores (e.g., `userStore.ts`) for managing client-only state.

3.  **Server (API & Routing)**
    - `src/app/api/`: All backend endpoints are implemented as Next.js API Routes, providing a seamless integration with the frontend.
    - `src/lib/auth/server.ts`: Contains server-only authentication helpers for protecting our API routes.

4.  **Persistence**
    - **Postgres Client**: We use the `postgres` client for direct, type-safe access to our PostgreSQL database.
    - **Supabase**: Our database is hosted on Supabase, which also provides real-time capabilities and authentication. Migrations are managed with the Supabase CLI.

5.  **Integrations**
    - **Google Generative AI**: Powers our AI-driven features, such as conversation analysis and document summarization.
    - **Third-Party Libraries**: We use Radix primitives for accessible UI components and `lucide-react` for a consistent set of icons.

## Security and Data Flow

- **Server-First Authentication**: Authentication flows are handled on the server whenever possible to ensure security. Sensitive verification flows, such as ID uploads and face matching, are protected by verification middleware.
- **Session Hydration**: The root layout loads the user session on the server-side (`getSession`) and then hydrates the client-side stores for use in the UI.
