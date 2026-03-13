# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Portfolio website for Farah Ismail — a multidisciplinary creative (architect, interior designer, art director, model) based in Kuala Lumpur. The UI is designed to look and feel like a spreadsheet/blueprint application, with a tab-based interface, grid layouts, and a monospace-heavy design language.

## Commands

- `npm run dev` — Start dev server (Next.js, port 3000)
- `npm run build` — Production build
- `npm run lint` — ESLint (flat config, Next.js core-web-vitals + TypeScript rules)
- No test framework is configured

## Tech Stack

- **Next.js 16** (App Router) with React 19, TypeScript, Tailwind CSS v4
- **Styling**: Tailwind v4 via `@tailwindcss/postcss`, plus CSS custom properties defined in `globals.css`. Design tokens are duplicated in both CSS custom properties (`:root` and `@theme inline` blocks in `globals.css`) and the JS `tokens` object in `src/lib/design-system.ts` — keep them in sync.
- **Fonts**: IBM Plex Mono (body/UI via `@fontsource`) + Aguzzo variable font (headings, loaded from `public/fonts/`)
- **Map**: Mapbox GL JS — token is in `.env` as `NEXT_PUBLIC_MAPBOX_TOKEN`
- **Icons**: `lucide-react`
- **Path alias**: `@/*` maps to `./src/*`

## Architecture

This is a single-page app — all content lives in `src/app/page.tsx` (a `'use client'` component). The app shell uses `100dvh` with `overflow: hidden` and a fixed header/footer pattern.

### Navigation & State

Navigation is hash-based (`#profile`, `#archive`, `#detail/<slug>`). All routing state is managed in `page.tsx` via React state — there is no file-based routing beyond the single page. Detail tabs can be "docked" (shown in the tab bar) or "detached" (rendered as draggable `FloatingWindow` overlays).

### Data

All data is hardcoded in `src/lib/seed-data.ts` — there is no backend or API. Types are in `src/lib/types.ts`. The main data type is `ArchiveEntry` (portfolio projects with coordinates, timeline updates, media items).

### Key Component Relationships

- **page.tsx** — orchestrates tabs, floating windows, voice note player, and all navigation
- **TabBar** — spreadsheet-style tabs with drag-to-detach for detail tabs; archive tab has a hover dropdown for list/map view toggle
- **ArchiveTab** — filter/sort via `useReducer`, renders either `SpreadsheetTable` (list view) or `MapView` (Mapbox)
- **DetailTab** — entry detail view with metadata grid, timeline, media gallery, mini-map, and prev/next navigation
- **ProfileTab** — dashboard grid layout with identity, bio, stats, disciplines, recent work, and contact form panels
- **GridContainer** — wrapper that provides the spreadsheet-like grid chrome (row numbers, borders)

### Design System

The visual language mimics a spreadsheet/blueprint. Colors are a blue-cream palette. The grid lines, cell backgrounds, and monospace typography reinforce the metaphor. Responsive breakpoints: 1024px (tablet), 768px (mobile), 480px (small mobile). On mobile, the map view is hidden and the profile dashboard collapses to single-column.
