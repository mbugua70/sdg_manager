# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `bun dev` — Start dev server (http://localhost:3000)
- `bun run build` — Production build
- `bun run lint` — Run ESLint
- `bun start` — Start production server

Package manager is **Bun** (see `bun.lock`).

## Architecture

Next.js 16 app using the App Router (`app/` directory), React 19, TypeScript (strict mode), and Tailwind CSS v4 (via `@tailwindcss/postcss`).

Path alias `@/*` maps to the project root.

Fonts: Geist Sans and Geist Mono loaded via `next/font/google`.

ESLint config uses Next.js core-web-vitals and TypeScript presets (flat config in `eslint.config.mjs`).

## SDG Manager Dashboard

Admin-only management dashboard for BA (Business Associates), Games, and Teams with full CRUD.

### Auth

- Only user id `"2"` (Admin / adminlogic@gmail.com) is allowed access. Other users who authenticate successfully are still rejected at the API route and middleware level.
- JWT token and user info stored in httpOnly cookies (`sdg_token`, `sdg_user`).
- Middleware (`middleware.ts`) protects all routes except `/login` and `/api/auth/login`.
- Login flow: client → `/api/auth/login` (Next.js route) → external API → validates admin id → sets cookies.

### External API

Base URL: `https://iguru.co.ke/PLAYGROUND/sdg`

| Resource | List             | Create (POST)      | Update (PATCH)     | Delete (DELETE)    |
|----------|------------------|--------------------|--------------------|---------------------|
| BA       | /players/list.php | /players/manage.php | /players/manage.php | /players/manage.php |
| Games    | /games/list.php   | /games/manage.php   | /games/manage.php   | /games/manage.php   |
| Teams    | /team/list.php    | /team/manage.php    | /team/manage.php    | /team/manage.php    |
| Points   | /games/filter.php?game_id=N | —              | /points/manage.php (PATCH: {id, points}) | — |

All external API calls are proxied through Next.js API routes (`app/api/ba/`, `app/api/games/`, `app/api/teams/`) — the client never calls the external API directly.

### Key Libraries

- `@tanstack/react-table` for data tables
- `lucide-react` for icons
- `react-hot-toast` for notifications
- `jose` / `cookie` for auth utilities

### File Structure

- `lib/constants.ts` — API base URL, admin user ID, cookie names
- `lib/auth.ts` — Server-side session helpers
- `middleware.ts` — Route protection
- `components/` — Reusable UI (DataTable, Modal, ConfirmDialog, Sidebar)
- `app/login/` — Login page
- `app/dashboard/` — Dashboard layout + overview cards
- `app/dashboard/ba|games|teams/` — CRUD management pages
- `app/api/auth/` — Login/logout/session endpoints
- `app/api/ba|games|teams|points/` — Proxy CRUD routes to external API
- Points per game: Games table has "View Points" action → shows team/player/points for that game with inline edit
