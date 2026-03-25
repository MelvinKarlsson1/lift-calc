# Phase 1: Foundation - Research

**Researched:** 2026-03-25
**Domain:** Vite + React scaffold, Zustand persist middleware, iOS Safari viewport, localStorage safety
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-01 | App uses safe localStorage abstraction with error handling (Safari private browsing) | Centralized `storage.ts` with try/catch + startup sentinel write; Zustand `onRehydrateStorage` error handler |
| FOUND-02 | Storage schema is versioned from day one for future migrations | `schemaVersion: 1` embedded in Zustand store initial state; migration runner pattern documented |
| UX-02 | All data persists in browser localStorage across sessions | Zustand `persist` middleware writes full store to localStorage automatically under versioned key |
</phase_requirements>

---

## Summary

Phase 1 delivers the app shell and the two foundation contracts every later phase depends on: (1) data that survives browser close, and (2) a safe storage layer that does not crash on iOS Safari private browsing. Both are solved together because Zustand's `persist` middleware handles the localStorage write path — the only custom code needed is a storage-availability check at startup and a `schemaVersion` field in the initial store shape.

The iOS `100dvh` viewport fix must also land in this phase. It costs nothing to address at scaffold time and is expensive to retrofit after layout work is done on top of a broken shell. Every subsequent phase inherits this shell, so getting it right here is the multiplier.

The full stack (React 19 + Vite 7.3.1 + Tailwind v4 + Zustand 5) is locked by prior research. Phase 1 does not introduce any new libraries beyond what's already decided. The only version constraint to respect: Vite is pinned to 7.3.1 — do NOT upgrade to Vite 8 because `vite-plugin-pwa@1.2.0` has not declared Vite 8 in its peer dependencies as of 2026-03-25.

**Primary recommendation:** Scaffold with `npm create vite@latest` (react-ts template), install Tailwind v4 Vite plugin + Zustand, configure `persist` middleware with `onRehydrateStorage` handler, embed `schemaVersion: 1` in initial store state, and apply `100dvh` in the root CSS before writing any feature code.

---

## Project Constraints (from CLAUDE.md)

| Directive | Constraint |
|-----------|------------|
| No fixed stack | Use whatever fits — React/Vite/Tailwind/Zustand chosen by prior research, not mandated by CLAUDE.md |
| Simple, focused implementations | Keep Phase 1 minimal — scaffold + storage layer only, no feature UI |
| Document learnings | Add short README to `lift-calc/` subfolder |
| Each experiment in its own subfolder | Project already lives at `lift-calc/` |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | UI framework | Stable, TypeScript-first, component model fits exercise cards |
| Vite | **7.3.1** (pinned) | Build tool + dev server | Fastest DX; pinned to v7 — vite-plugin-pwa does not declare Vite 8 peer dep |
| TypeScript | 5.x (bundled) | Type safety | Catches number/string bugs in calculator math; free with react-ts template |
| Tailwind CSS | 4.2.2 | Utility styling | v4 Vite plugin — zero PostCSS config; mobile-first utilities; `dvh` support |
| @tailwindcss/vite | 4.2.2 | Tailwind Vite integration | Replaces PostCSS; automatic content detection; compatible with Vite 7 and 8 |
| Zustand | 5.0.12 | State + persistence | `persist` middleware writes store to localStorage automatically; ~1KB |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/react | 19.x | React TypeScript types | Always — bundled with react-ts template |
| @types/react-dom | 19.x | React DOM TypeScript types | Always — bundled with react-ts template |

### What NOT to Install in Phase 1

| Avoid | Why |
|-------|-----|
| vite-plugin-pwa | Deferred to Phase 4 — no PWA needed yet; adding it now introduces service worker complexity that interferes with dev workflow |
| React Router | Single-page app; use React state for view switching |
| Redux Toolkit | Massive overkill; Zustand covers the full state need |
| Next.js | SSR overhead for a 100% client-side app |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand persist | Raw localStorage + useEffect | Zustand persist is reactive, handles serialization, and provides a safe error callback; raw approach requires manual wiring across every component |
| Tailwind CSS v4 | CSS Modules | CSS Modules require more files; Tailwind's mobile-first responsive utilities are faster for gym UI |
| Vite 7.3.1 | Vite 8.0.2 | Use Vite 8 only after vite-plugin-pwa adds `^8` to peer deps |

**Installation:**
```bash
# Scaffold (run from lift-calc parent directory)
npm create vite@latest lift-calc -- --template react-ts
cd lift-calc

# Pin Vite to 7.3.1
npm install vite@7.3.1

# Tailwind CSS v4 (Vite plugin — no PostCSS)
npm install tailwindcss @tailwindcss/vite

# State management + localStorage persistence
npm install zustand
```

**Version verification (confirmed 2026-03-25 from npm registry):**

| Package | Verified Version | Registry Date |
|---------|-----------------|---------------|
| react | 19.2.4 | Current |
| vite | 7.3.1 (pinned) | Current v7 |
| tailwindcss | 4.2.2 | Current |
| @tailwindcss/vite | 4.2.2 | Current |
| zustand | 5.0.12 | Current |

---

## Architecture Patterns

### Recommended Project Structure

```
lift-calc/
├── src/
│   ├── store/
│   │   ├── store.ts          # Zustand store with persist middleware
│   │   └── types.ts          # AppState type, Exercise type, StoredData type
│   ├── lib/
│   │   └── storage.ts        # Storage availability check + sentinel write
│   ├── App.tsx               # App shell — dvh root, storage warning gate
│   ├── main.tsx              # React entry point
│   └── index.css             # @import "tailwindcss"; dvh root styles
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

No `components/` directory yet — Phase 1 has no feature UI. The shell is `App.tsx` with a placeholder content area.

### Pattern 1: Zustand Store with Persist Middleware

**What:** Single Zustand store with `persist` middleware that writes to localStorage under a versioned key. The store shape includes `schemaVersion` from the first commit.

**When to use:** Always — this is the only state management approach in this project.

```typescript
// Source: https://zustand.docs.pmnd.rs/reference/middlewares/persist
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  schemaVersion: number
  exercises: Exercise[]
  maxWeights: Record<string, number>  // exerciseId -> 1RM in kg
}

interface AppStore extends AppState {
  // actions added in later phases
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      schemaVersion: 1,
      exercises: [],
      maxWeights: {},
    }),
    {
      name: 'lift-calc-v1',  // localStorage key
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('Storage rehydration failed:', error)
          // storageAvailable flag set separately via sentinel check
        }
      },
    }
  )
)
```

### Pattern 2: Storage Availability Check (FOUND-01)

**What:** A sentinel write at app startup that detects whether localStorage is available. Result stored in React state to conditionally render a warning banner.

**When to use:** Called once in `App.tsx` on mount, before any data operation.

```typescript
// Source: MDN Window.localStorage + WebKit Blog storage policy
// src/lib/storage.ts
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__lift_calc_test__'
    localStorage.setItem(testKey, '1')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}
```

In `App.tsx`:
```typescript
const [storageAvailable] = useState(() => isStorageAvailable())

if (!storageAvailable) {
  return (
    <div className="flex items-center justify-center min-h-dvh p-6 text-center">
      <p>Storage is unavailable in private browsing mode. Your data won't be saved.</p>
    </div>
  )
}
```

### Pattern 3: iOS Safe Viewport Shell (Success Criterion 3)

**What:** Root CSS that uses `dvh` (dynamic viewport height) to correctly fill the screen on iOS Safari without being clipped by the address bar or home indicator.

**When to use:** Set on `html`, `body`, and the `#root` div from day one. Never use raw `100vh` for full-screen layouts on mobile.

```css
/* src/index.css */
@import "tailwindcss";

html {
  height: -webkit-fill-available; /* iOS Safari fallback for older versions */
}

body {
  min-height: 100vh;
  min-height: 100dvh;
}

#root {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}
```

```tsx
// App.tsx root element
<div className="min-h-dvh flex flex-col bg-gray-950 text-white">
  {/* app content */}
</div>
```

### Pattern 4: Schema Version in Stored Data (FOUND-02)

**What:** `schemaVersion: 1` is part of the Zustand store initial state from the very first commit. A migration runner stub at startup checks the version and applies upgrade functions when needed.

**When to use:** The version field is always present. The migration runner runs on every app load but is a no-op when schema version matches.

```typescript
// src/store/store.ts — migration stub (grows in future phases)
const CURRENT_SCHEMA_VERSION = 1

function migrateIfNeeded(stored: AppState): AppState {
  if (!stored.schemaVersion || stored.schemaVersion < CURRENT_SCHEMA_VERSION) {
    // future migration logic goes here
    return { ...stored, schemaVersion: CURRENT_SCHEMA_VERSION }
  }
  return stored
}

// Pass to persist middleware's `merge` option or call during onRehydrateStorage
```

### Anti-Patterns to Avoid

- **Direct `localStorage` calls in components:** All storage goes through Zustand persist. No component ever calls `localStorage.setItem` directly.
- **Using `100vh` for full-screen layouts:** Always `100dvh` with `-webkit-fill-available` fallback.
- **Skipping `schemaVersion` in initial state:** The migration hook must be present before any data is written — retrofitting after real user data exists is high-risk.
- **Swallowing storage errors silently:** The `isStorageAvailable()` check result must be surfaced to the user, not just logged.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| localStorage read/write with reactivity | Custom hooks + useEffect | Zustand `persist` middleware | Zustand handles serialization, deserialization, cross-tab sync, and provides a reactive store; custom approach requires re-implementing all of this |
| Storage error handling in Zustand | Custom wrapper around persist | `onRehydrateStorage` callback in persist config | Built-in error handler; fires on rehydration failure |
| CSS variable-based viewport fix | Custom JS that measures viewport | `100dvh` + `-webkit-fill-available` | CSS-native solution; no JS resize listeners needed |
| Build config for React + TypeScript | Manual Webpack/Rollup config | `npm create vite@latest -- --template react-ts` | Zero-config scaffold with HMR, TypeScript, ESLint baseline |

**Key insight:** The entire localStorage abstraction for this app is covered by Zustand `persist` + a 10-line `isStorageAvailable()` function. There is no storage layer to build from scratch.

---

## Common Pitfalls

### Pitfall 1: localStorage Throws in Safari Private Browsing (FOUND-01)

**What goes wrong:** Safari private browsing exposes `localStorage` as if available, but any `setItem` call throws `QuotaExceededError`. The app crashes silently or shows a blank screen.

**Why it happens:** Developers test in normal browser mode only. The API appears present so the error is never encountered during development.

**How to avoid:** Call `isStorageAvailable()` at startup with a sentinel write/delete inside try/catch. If it returns false, render a graceful warning instead of the app. Also configure Zustand's `onRehydrateStorage` to catch errors during hydration.

**Warning signs:** No try/catch around any localStorage call; no startup availability check; storage calls scattered across components.

### Pitfall 2: 100vh Clips Bottom Content on iOS Safari (UX-02 / Success Criterion 3)

**What goes wrong:** `height: 100vh` does not account for Safari's address bar and toolbar. Buttons and content near the bottom are obscured or unreachable.

**Why it happens:** iOS Safari calculates `100vh` as full screen height and then renders its chrome on top. This is invisible in Chrome DevTools mobile simulation.

**How to avoid:** Use `min-h-dvh` (Tailwind v4: `min-h-[100dvh]` or the built-in `dvh` variant) everywhere the shell needs to fill the screen. Add `height: -webkit-fill-available` on `html` as a fallback for iOS 14 and earlier. Test on a real iPhone.

**Warning signs:** `h-screen` (which maps to `100vh`) used on the root element; layout not tested on an actual iOS device.

### Pitfall 3: Missing schemaVersion — Silent Data Corruption (FOUND-02)

**What goes wrong:** When the data shape changes in Phase 2 or 3, old localStorage data is read by new code. The app gets `undefined` where it expects values, calculations break silently, or the app throws on startup.

**Why it happens:** Local-only apps feel too simple to need migrations. Developers add it after the first breaking change — by which point real data has already been affected.

**How to avoid:** The Zustand store initial state must include `schemaVersion: 1` from the first commit. A migration runner stub reads this on startup. Cost to add upfront: ~5 lines. Cost to add after user data exists: data loss risk.

**Warning signs:** No `schemaVersion` key in the stored JSON blob; `JSON.parse` result consumed without shape validation.

### Pitfall 4: Vite 8 Upgrade Breaking PWA (Phase 1 Watch Item)

**What goes wrong:** `vite-plugin-pwa@1.2.0` only declares peer deps up to Vite `^7`. Upgrading to Vite 8 causes peer dep warnings and potentially untested behavior.

**Why it happens:** vite-plugin-pwa has not yet added Vite 8 to its peer dependencies as of 2026-03-25.

**How to avoid:** Pin Vite to `7.3.1` in `package.json`. Do not run `npm update` without checking whether `vite-plugin-pwa` has added Vite 8 support. This watch item is noted in STATE.md.

---

## Code Examples

Verified patterns from official sources:

### Vite config with Tailwind v4 plugin

```typescript
// vite.config.ts
// Source: https://tailwindcss.com/blog/tailwindcss-v4 (official Tailwind v4 blog)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // vite-plugin-pwa added in Phase 4
  ],
})
```

### Tailwind v4 CSS entry point

```css
/* src/index.css */
/* Source: https://tailwindcss.com/blog/tailwindcss-v4 */
@import "tailwindcss";

/* iOS Safari viewport fix */
html {
  height: -webkit-fill-available;
}

body {
  min-height: 100vh;
  min-height: 100dvh;
}

#root {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}
```

### Zustand store with persist + error handling

```typescript
// src/store/store.ts
// Source: https://zustand.docs.pmnd.rs/reference/middlewares/persist
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Exercise {
  id: string
  name: string
  isCustom: boolean
}

interface AppState {
  schemaVersion: number
  exercises: Exercise[]
  maxWeights: Record<string, number>
}

interface AppStore extends AppState {
  setMaxWeight: (exerciseId: string, weight: number) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      schemaVersion: 1,
      exercises: [],
      maxWeights: {},
      setMaxWeight: (exerciseId, weight) =>
        set((state) => ({
          maxWeights: { ...state.maxWeights, [exerciseId]: weight },
        })),
    }),
    {
      name: 'lift-calc-v1',
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('[lift-calc] Storage rehydration failed:', error)
        }
      },
    }
  )
)
```

### Storage availability sentinel check

```typescript
// src/lib/storage.ts
// Source: MDN Window.localStorage — https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
// Source: WebKit Blog storage policy — https://webkit.org/blog/14403/updates-to-storage-policy/
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__lift_calc_test__'
    localStorage.setItem(testKey, '1')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}
```

### App.tsx shell with storage gate

```tsx
// src/App.tsx
import { useState } from 'react'
import { isStorageAvailable } from './lib/storage'

function StorageWarning() {
  return (
    <div className="flex items-center justify-center min-h-dvh p-6 text-center">
      <div className="max-w-sm">
        <p className="text-lg font-semibold mb-2">Storage unavailable</p>
        <p className="text-sm text-gray-400">
          You're in private browsing mode. Lift Calc needs localStorage to save
          your data. Open in a regular browser window to use the app.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const [storageAvailable] = useState(() => isStorageAvailable())

  if (!storageAvailable) {
    return <StorageWarning />
  }

  return (
    <div className="min-h-dvh flex flex-col bg-gray-950 text-white">
      <main className="flex-1 p-4">
        {/* Phase 2+ content renders here */}
        <p className="text-gray-500 text-sm">Foundation ready.</p>
      </main>
    </div>
  )
}
```

---

## Runtime State Inventory

> Greenfield phase — no existing runtime state to inventory.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no localStorage data exists yet | None |
| Live service config | None — no external services | None |
| OS-registered state | None | None |
| Secrets/env vars | None — no backend, no secrets | None |
| Build artifacts | None — project not yet scaffolded | None |

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm scaffold + Vite dev server | Yes | v24.14.1 | — |
| npm | Package installation | Yes | 11.11.0 | — |
| npx | `npm create vite@latest` scaffold | Yes | bundled | — |
| Vite 7.3.1 | Build + dev server | Yes (on npm) | 7.3.1 | — |
| React 19.2.4 | UI framework | Yes (on npm) | 19.2.4 | — |
| Tailwind CSS 4.2.2 | Styling | Yes (on npm) | 4.2.2 | — |
| Zustand 5.0.12 | State + persistence | Yes (on npm) | 5.0.12 | — |

**Missing dependencies with no fallback:** None — all required tools available.

**Missing dependencies with fallback:** None.

**iOS Safari testing:** Requires a real iPhone for final verification of the `dvh` fix. This is a validation requirement, not a build requirement. The planner should include a manual verification step.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind CSS v3 + PostCSS + `tailwind.config.js` | Tailwind CSS v4 + `@tailwindcss/vite` | v4.0 released Jan 2025 | No `tailwind.config.js` needed; `@import "tailwindcss"` in CSS; 5x faster full builds, 100x faster incremental |
| CRA (Create React App) | Vite + react-ts template | CRA unmaintained since 2022 | Vite is the current standard scaffold for React SPAs |
| `100vh` for full-height layouts | `100dvh` + `-webkit-fill-available` | Broadly supported since 2023 | Correctly excludes browser chrome from height calculation on iOS |
| Zustand v4 | Zustand v5 | v5 released Oct 2024 | Breaking: removed CommonJS default export; ES module only; otherwise API-compatible |

**Deprecated / outdated:**
- `Create React App`: Unmaintained — use Vite.
- `Tailwind v3`: No reason to start new projects on v3 — v4 Vite plugin is simpler.
- `100vh` on iOS-targeting layouts: Replaced by `100dvh`.
- Zustand's `createWithEqualityFn` default export pattern from v4: Changed in v5.

---

## Open Questions

1. **Does the project directory already exist at `lift-calc/`?**
   - What we know: The `.planning/` folder is at `lift-calc/.planning/`, implying the `lift-calc/` directory exists.
   - What's unclear: Whether a `src/` or `package.json` already exists (i.e., was scaffold already run?).
   - Recommendation: The planner's Wave 0 task should check whether `lift-calc/package.json` exists before running the Vite scaffold command. If it already exists, skip scaffold and start from Vite config setup.

2. **Tailwind `min-h-dvh` utility availability in v4**
   - What we know: Tailwind v4 supports `dvh` units. The class name convention may be `min-h-[100dvh]` (arbitrary value) or a named utility.
   - What's unclear: Whether `min-h-dvh` is a first-class named utility in v4 or requires arbitrary value syntax `min-h-[100dvh]`.
   - Recommendation: Use `min-h-[100dvh]` (arbitrary value, always works) in generated code. If the named utility `min-h-dvh` exists, either works — consistency matters more than which form is used.

---

## Sources

### Primary (HIGH confidence)

- Zustand persist middleware docs — https://zustand.docs.pmnd.rs/reference/middlewares/persist — store pattern, onRehydrateStorage, localStorage key
- Tailwind CSS v4 official blog — https://tailwindcss.com/blog/tailwindcss-v4 — Vite plugin setup, CSS-first config, `@import "tailwindcss"`
- MDN Window.localStorage — https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage — availability check pattern, QuotaExceededError
- WebKit Blog: Updates to Storage Policy — https://webkit.org/blog/14403/updates-to-storage-policy/ — Safari private browsing zero-quota behavior confirmed
- CSS-Tricks: CSS fix for 100vh in mobile WebKit — https://css-tricks.com/css-fix-for-100vh-in-mobile-webkit/ — dvh + -webkit-fill-available pattern
- HTMHell Advent Calendar 2024: 100dvh solution — https://www.htmhell.dev/adventcalendar/2024/4/ — dvh implementation details
- npm registry (live query 2026-03-25) — react@19.2.4, vite@7.3.1, tailwindcss@4.2.2, @tailwindcss/vite@4.2.2, zustand@5.0.12, vite-plugin-pwa@1.2.0

### Secondary (MEDIUM confidence)

- RxDB: Using localStorage in Modern Applications — https://rxdb.info/articles/localstorage.html — schema versioning patterns
- React v19 release — https://react.dev/blog/2024/12/05/react-19 — stable release confirmation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions live-queried from npm registry; peer dependency constraint (vite-plugin-pwa/Vite 8) confirmed
- Architecture: HIGH — patterns verified against official Zustand docs and MDN; no novel patterns in this phase
- Pitfalls: HIGH — all four critical pitfalls documented with verified code fixes and authoritative sources

**Research date:** 2026-03-25
**Valid until:** 2026-06-25 (90 days — stable stack, not fast-moving)
**Note:** Re-verify `vite-plugin-pwa` peer deps before any Vite upgrade; that is the one version-sensitive watch item.
