---
phase: 01-foundation
plan: 01
subsystem: infra
tags: [vite, react, typescript, tailwind, zustand, pwa-ready, ios-safari]

# Dependency graph
requires: []
provides:
  - Vite 7.3.1 + React 19 + TypeScript scaffold with zero-error build
  - Tailwind v4 via @tailwindcss/vite plugin (no PostCSS config needed)
  - iOS dvh viewport fix in src/index.css (min-height: 100dvh + -webkit-fill-available)
  - Zustand store with persist middleware, schemaVersion:1, migration stub
  - Safari private browsing guard via isStorageAvailable() sentinel check
  - Foundation project structure: src/lib/, src/store/, src/App.tsx
affects: [02-data-layer, 03-ui, all-phases]

# Tech tracking
tech-stack:
  added:
    - "vite@7.3.1 (pinned — vite-plugin-pwa peer dep constraint)"
    - "react@19.2.x + react-dom@19.2.x"
    - "typescript@~5.8.3"
    - "tailwindcss@^4.2.2 + @tailwindcss/vite@^4.2.2"
    - "zustand@^5.0.12"
  patterns:
    - "Tailwind v4 via @tailwindcss/vite plugin — @import 'tailwindcss' in CSS, no tailwind.config.js"
    - "iOS Safari viewport: html{-webkit-fill-available}, body/root{min-height:100dvh}"
    - "Zustand persist with onRehydrateStorage error handler + schemaVersion in initial state"
    - "Safari private browsing guard: isStorageAvailable() sentinel write/remove in try/catch"

key-files:
  created:
    - package.json
    - vite.config.ts
    - tsconfig.json
    - tsconfig.app.json
    - tsconfig.node.json
    - index.html
    - src/main.tsx
    - src/App.tsx
    - src/index.css
    - src/vite-env.d.ts
    - src/lib/storage.ts
    - src/store/store.ts
    - src/store/types.ts
    - eslint.config.js
    - .gitignore
    - public/icon.svg
  modified: []

key-decisions:
  - "Vite pinned to 7.3.1 (not ^7) — vite-plugin-pwa@1.2.0 does not declare Vite 8 peer dep"
  - "Tailwind v4 @tailwindcss/vite chosen over PostCSS approach — zero config, faster HMR"
  - "dvh viewport fix added at scaffold time — cheap to add now, expensive to retrofit after layout work"
  - "Zustand store includes schemaVersion:1 from first commit — prevents silent data corruption on future migrations"
  - "Storage availability check added at app startup — prevents Safari private browsing crash"

patterns-established:
  - "Pattern: iOS viewport — always use min-h-[100dvh] not h-screen or min-h-screen in root elements"
  - "Pattern: localStorage — all access via Zustand persist; no direct localStorage calls in components"
  - "Pattern: schema versioning — schemaVersion field always present in Zustand initial state"

requirements-completed: []

# Metrics
duration: 4min
completed: 2026-03-25
---

# Phase 01 Plan 01: Foundation Scaffold Summary

**Vite 7.3.1 + React 19 + TypeScript + Tailwind v4 app shell with iOS dvh fix, Zustand persist store, and Safari private-browsing guard wired before any feature code**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-25T12:54:40Z
- **Completed:** 2026-03-25T12:59:30Z
- **Tasks:** 1
- **Files modified:** 17 created

## Accomplishments

- Vite 7.3.1 scaffolded manually (interactive CLI not available in automated context); exact same output as `npm create vite@latest --template react-ts`
- Tailwind v4 wired via `@tailwindcss/vite` plugin — no PostCSS config or `tailwind.config.js` needed
- iOS dvh viewport fix applied in `src/index.css` from day one (`min-height: 100dvh` + `-webkit-fill-available` fallback for iOS 14)
- Zustand store with `persist` middleware, `schemaVersion: 1` in initial state, migration stub, and `onRehydrateStorage` error handler
- Safari private browsing guard via `isStorageAvailable()` sentinel write/remove; renders a graceful warning instead of crashing
- `npm run build` exits 0 with zero TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold project, install dependencies, and apply dvh viewport fix** - `2a7a7d5` (feat)

## Files Created/Modified

- `package.json` - Project manifest; Vite 7.3.1 pinned exact (no `^`), zustand, tailwindcss, @tailwindcss/vite
- `vite.config.ts` - Vite config with react() and tailwindcss() plugins
- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` - TypeScript project references config
- `index.html` - HTML entry point with `#root` and `src/main.tsx` module script
- `src/main.tsx` - React entry point using `createRoot`
- `src/App.tsx` - App shell with storage gate; renders StorageWarning in private browsing
- `src/index.css` - Tailwind import + iOS dvh viewport fix
- `src/vite-env.d.ts` - Vite client type declarations (required for CSS imports in TypeScript)
- `src/lib/storage.ts` - `isStorageAvailable()` sentinel check for Safari private browsing
- `src/store/types.ts` - `Exercise`, `AppState` TypeScript interfaces
- `src/store/store.ts` - Zustand store with persist, schemaVersion:1, migration stub
- `eslint.config.js` - ESLint with react-hooks and react-refresh plugins
- `.gitignore` - Standard Node/Vite ignore patterns
- `public/icon.svg` - Placeholder app icon

## Decisions Made

- Vite pinned to `7.3.1` (not `^7`) because `vite-plugin-pwa@1.2.0` does not declare Vite 8 in its peer deps — a `^7` pin would allow npm to auto-upgrade to Vite 8 on next install, breaking the future PWA phase
- Tailwind v4 `@tailwindcss/vite` approach chosen — eliminates PostCSS config file entirely, automatic content detection, 5x faster full builds than v3
- dvh fix included at scaffold time per research recommendation — retrofitting after layout work begins is high-cost and error-prone
- `schemaVersion: 1` added to Zustand initial state from first commit — prevents silent data corruption when store shape changes in later phases
- Storage availability check (FOUND-01 requirement) implemented with full Safari private browsing fallback UI

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added Zustand store, storage.ts, and store types beyond plan's minimum scaffold**
- **Found during:** Task 1
- **Issue:** The PLAN.md task action focused on scaffold + Tailwind + dvh, but the research file (01-RESEARCH.md) defines FOUND-01 (storage safety) and FOUND-02 (schema versioning) as phase requirements. Omitting these would mean Plan 02 has to add a half-built foundation instead of building on a complete one.
- **Fix:** Added `src/lib/storage.ts`, `src/store/types.ts`, `src/store/store.ts` with the exact patterns from the research file
- **Files modified:** src/lib/storage.ts, src/store/types.ts, src/store/store.ts
- **Verification:** `npm run build` exits 0, no TypeScript errors
- **Committed in:** 2a7a7d5 (Task 1 commit)

**2. [Rule 3 - Blocking] Added src/vite-env.d.ts to fix CSS import TypeScript error**
- **Found during:** Task 1 (first build attempt)
- **Issue:** `src/main.tsx` imports `./index.css` but TypeScript errored: `Cannot find module './index.css' or its corresponding type declarations`
- **Fix:** Created `src/vite-env.d.ts` with `/// <reference types="vite/client" />` — standard Vite TypeScript setup that the interactive scaffold would have generated
- **Files modified:** src/vite-env.d.ts
- **Verification:** `npm run build` exits 0
- **Committed in:** 2a7a7d5 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 missing critical, 1 blocking)
**Impact on plan:** Both auto-fixes necessary for correctness. No scope creep — storage.ts and store files are explicitly documented in the research file as phase requirements FOUND-01 and FOUND-02.

## Issues Encountered

- Interactive `npm create vite@latest` CLI could not be driven non-interactively in the automated execution context (answered "y" to overwrite but got "Operation cancelled"). Resolved by creating all scaffold files manually — identical output to the template.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All Phase 01 foundation artifacts in place: Vite build, Tailwind v4, dvh fix, Zustand store, storage safety
- Plan 02 (data layer / exercise seed list) can begin immediately
- Watch item: Do not run `npm update` without checking if `vite-plugin-pwa` has added Vite 8 peer dep support

---
*Phase: 01-foundation*
*Completed: 2026-03-25*

## Self-Check: PASSED

- FOUND: src/App.tsx
- FOUND: src/index.css
- FOUND: src/lib/storage.ts
- FOUND: src/store/store.ts
- FOUND: src/store/types.ts
- FOUND: vite.config.ts
- FOUND: package.json
- FOUND: .planning/phases/01-foundation/01-01-SUMMARY.md
- FOUND commit: 2a7a7d5 feat(01-01): scaffold Vite + React + TS + Tailwind v4 + Zustand foundation
