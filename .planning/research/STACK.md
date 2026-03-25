# Stack Research

**Domain:** Mobile-first single-user PWA with local storage (weightlifting calculator)
**Researched:** 2026-03-25
**Confidence:** HIGH — all versions confirmed live from npm registry; architecture verified against official docs

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.2.4 | UI framework | Component model is the right fit for the exercise-list + per-exercise state pattern. Each exercise card with its 1RM input, percentage slider, and result display maps naturally to a component. Vanilla JS would require manual DOM wiring that grows painful fast. React 19 is stable and has no overhead for this scale. |
| Vite | 7.3.1 | Build tool + dev server | Fastest DX, zero config for React + TypeScript. Pinned to v7 (not v8) because `vite-plugin-pwa@1.2.0` peer deps only declare up to `^7` — using Vite 8 risks install warnings and untested behavior. Vite 7 is actively maintained with security backports. |
| TypeScript | 5.x (bundled with Vite) | Type safety | Catches the number-vs-string bugs that are endemic to calculator apps (1RM inputs, percentage values). Free with `create-vite` template, zero extra setup. |
| Tailwind CSS | 4.2.2 | Utility-first styling | v4 ships with a first-party Vite plugin (`@tailwindcss/vite`) that requires zero PostCSS config. CSS-first configuration (no `tailwind.config.js`). Built-in container queries. Perfect for mobile-first layouts and one-handed gym UI — compact, fast, consistent spacing. |
| @tailwindcss/vite | 4.2.2 | Tailwind Vite integration | Replaces the PostCSS approach. Tighter integration, faster HMR, automatic content detection. Supports Vite 7. |
| Zustand | 5.0.12 | State management + persistence | Built-in `persist` middleware writes the entire store to `localStorage` automatically. No boilerplate. The store shape maps directly to the domain: a list of exercises, each with a name and optional 1RM. ~1KB. Replaces any need for a manual `localStorage` read/write layer. |
| vite-plugin-pwa | 1.2.0 | PWA / installability + offline | Enables "Add to Home Screen" on mobile so the app behaves like a native gym tool. Auto-generates service worker and web manifest. `generateSW` strategy (default) caches all static assets — the app works offline at the gym with no signal. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| workbox-window | 7.4.x (peer dep of vite-plugin-pwa) | Service worker lifecycle | Use it if you want to show "update available" toast when a new version deploys. Otherwise vite-plugin-pwa handles it silently. |
| @types/react | 19.x | TypeScript types for React | Always — bundled with the `react-ts` Vite template. |
| @types/react-dom | 19.x | TypeScript types for React DOM | Always — bundled with the `react-ts` Vite template. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vite dev server | HMR, local development | `npm run dev` — fast cold start, React Fast Refresh built in. |
| ESLint | Lint TypeScript + React | Include `eslint-plugin-react-hooks` to catch stale closure bugs in exercise state. Use the config from `create-vite` as a baseline. |
| Prettier | Code formatting | Optional but reduces cognitive friction. Configure via `.prettierrc`. |

## Installation

```bash
# Scaffold with React + TypeScript template
npm create vite@latest lift-calc -- --template react-ts
cd lift-calc

# Tailwind CSS v4 (Vite plugin — replaces PostCSS approach)
npm install tailwindcss @tailwindcss/vite

# State management with persistence
npm install zustand

# PWA (pin Vite to 7.x first — see Version Compatibility section)
npm install -D vite-plugin-pwa

# Dev dependencies (ESLint is included by create-vite; Prettier optional)
npm install -D prettier
```

Then in `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Lift Calc',
        short_name: 'LiftCalc',
        theme_color: '#000000',
        display: 'standalone',
      },
    }),
  ],
})
```

And in `src/index.css`:

```css
@import "tailwindcss";
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| React 19 | Vanilla JS | Only if the app is a single screen with no reusable components and no state that lives outside one function. Lift Calc has enough component reuse (exercise cards, search, session view) that vanilla becomes DOM spaghetti. |
| React 19 | Vue 3 | If you already know Vue or want a gentler learning curve. Vue 3 + Composition API is a legitimate choice, but React has better TypeScript ergonomics for this project style. |
| Zustand | Raw localStorage via useEffect | Works for trivial cases, but requires manual serialization, deserialization, and synchronization across components. Zustand persist gives you this for free and keeps state reactive. |
| Zustand | Jotai | Jotai is atom-based and excellent for highly granular state. For this app the state is a single flat store (list of exercises + per-exercise 1RM), making Zustand's single-store model simpler. |
| vite-plugin-pwa | Manual service worker | Manual SW is verbose and error-prone. vite-plugin-pwa generates a correct Workbox SW from your build artifacts automatically. |
| Tailwind CSS | CSS Modules | CSS Modules are valid for component-scoped styles but require more files and custom media query management. Tailwind's mobile-first responsive utilities (`sm:`, `md:`) and touch target sizing (`h-12`, `p-4`) are faster for gym UI. |
| Vite 7.3.1 | Vite 8.0.2 | Use Vite 8 once `vite-plugin-pwa` explicitly adds `^8` to its peer deps. As of 2026-03-25 it does not. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Next.js | SSR/SSG overhead for an app that is 100% client-side with no routing or server. Adds build complexity, larger bundle, and no benefit. | Vite + React (SPA) |
| Redux Toolkit | Designed for apps with complex async flows, server state, and multiple developer teams. For a local-storage calculator it is massive overkill (~13KB vs Zustand's ~1KB). | Zustand |
| React Router | The app is a single-page experience with no deep-linking requirement. Adding a router creates navigation state that has to be persisted separately. Start without routing; add it only if multi-page navigation becomes a real requirement. | React useState for "current view" |
| Tailwind CSS v3 | v3 uses PostCSS + `tailwind.config.js`. v4 is 5x faster on full builds, 100x faster incrementally, and integrates directly with Vite. No reason to start a new project on v3. | Tailwind CSS v4 with @tailwindcss/vite |
| Create React App (CRA) | Unmaintained since 2022. Slow builds, outdated Webpack. | Vite + react-ts template |
| IndexedDB directly | Complex API, async, overkill for a simple exercise list. localStorage is synchronous and sufficient for this data volume (<50 exercises, each with one number). | Zustand persist (uses localStorage by default) |

## Stack Patterns by Variant

**If PWA installability is the top priority (gym home screen icon):**
- Use `vite-plugin-pwa` with `registerType: 'autoUpdate'` and `display: 'standalone'`
- Add `apple-touch-icon` and `theme-color` to the manifest for iOS Safari support
- Test with `npm run build && npm run preview` — service workers don't run in dev mode

**If you want to skip PWA for now and add it later:**
- Skip `vite-plugin-pwa` in phase 1 — it's a drop-in addition at any time
- The Zustand + Tailwind + Vite core is not affected by PWA presence

**If Tailwind feels like overhead for a first pass:**
- Use a minimal CSS reset + custom properties for phase 1
- Migrate to Tailwind v4 in a later phase — the Vite plugin makes it a 10-minute addition

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| vite-plugin-pwa@1.2.0 | vite@^3.1.0 \|\| ^4 \|\| ^5 \|\| ^6 \|\| ^7 | Does NOT declare Vite 8 support as of 2026-03-25. Use Vite 7.3.1. |
| @tailwindcss/vite@4.2.2 | vite@^5.2.0 \|\| ^6 \|\| ^7 \|\| ^8 | Works with both Vite 7 and Vite 8. |
| zustand@5.0.12 | react@^18 \|\| ^19 | Fully compatible with React 19. |
| react@19.2.4 | react-dom@19.2.4 | Always keep react and react-dom versions in sync. |

## Sources

- npm registry (live query) — vite@8.0.2, vite@7.3.1, react@19.2.4, tailwindcss@4.2.2, @tailwindcss/vite@4.2.2, zustand@5.0.12, vite-plugin-pwa@1.2.0 — HIGH confidence
- [Tailwind CSS v4.0 official blog](https://tailwindcss.com/blog/tailwindcss-v4) — Vite plugin setup, CSS-first configuration — HIGH confidence
- [vite-plugin-pwa official docs](https://vite-pwa-org.netlify.app/guide/) — PWA setup, generateSW strategy — HIGH confidence
- [Zustand persist middleware docs](https://zustand.docs.pmnd.rs/reference/middlewares/persist) — localStorage integration — HIGH confidence
- [React v19 release](https://react.dev/blog/2024/12/05/react-19) — stable release confirmation — HIGH confidence
- npm `peerDependencies` inspection — vite-plugin-pwa Vite 8 incompatibility confirmed — HIGH confidence

---
*Stack research for: Lift Calc — mobile-first PWA weightlifting calculator*
*Researched: 2026-03-25*
