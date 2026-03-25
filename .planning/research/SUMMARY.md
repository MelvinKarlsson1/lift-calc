# Project Research Summary

**Project:** Lift Calc
**Domain:** Mobile-first single-page PWA weightlifting calculator (local storage, no backend)
**Researched:** 2026-03-25
**Confidence:** HIGH

## Executive Summary

Lift Calc is a focused, single-user mobile web app: given a stored one-rep max (1RM) per exercise, compute the working weight for any given percentage. This is a well-understood product category with clear analogues (MaxLift, RackMath, Strength Level) but no direct competitor that gets the combination right — most are native apps, none surface a multi-exercise session view, and none are purpose-built for kg-only personal use. The correct approach is a vanilla-feeling PWA built on React 19 + Vite 7 + Tailwind CSS v4, with Zustand's persist middleware handling all localStorage interaction. The stack is lightweight (~1KB state layer), has no peer-dependency conflicts at the pinned versions, and delivers installable offline-first behavior with minimal configuration overhead.

The core architecture is deliberately simple: a single AppState object (exercises, maxWeights, session, ui), a pure Calculator function, and a centralized StorageService that is the only entry point to localStorage. Session state is intentionally ephemeral — only exercise definitions and 1RM values persist. This design eliminates the stale-session bug that plagues naive implementations and keeps data recovery straightforward. Building in this order is optimal: calculator logic first, storage layer second, exercise list UI third, 1RM editor fourth, and the workout calculator view last.

The three highest-risk areas are all in the foundation: (1) localStorage failure in Safari private browsing must be handled with a centralized try/catch abstraction before any feature writes to storage; (2) iOS Safari's `100vh` viewport bug must be addressed with `dvh` units from day one — retrofitting is expensive; and (3) a `schemaVersion` field must be written into localStorage from the first build to make future schema migrations possible without data loss. These pitfalls cost almost nothing to prevent upfront and are very costly to fix after user data exists.

## Key Findings

### Recommended Stack

The stack is tightly scoped to the problem. React 19 + Vite 7 gives the fastest developer experience with TypeScript out of the box. Tailwind CSS v4 (Vite plugin, no PostCSS) provides mobile-first utility classes and touch-target sizing without configuration friction. Zustand 5 replaces a manual localStorage layer entirely via its `persist` middleware. Vite is pinned to 7.3.1 rather than the latest 8.x because `vite-plugin-pwa@1.2.0` does not yet declare Vite 8 in its peer dependencies — this is the one version constraint to watch.

**Core technologies:**
- React 19.2.4: UI framework — component model maps naturally to exercise cards with per-exercise state
- Vite 7.3.1: Build tool — fastest DX, pinned to v7 for vite-plugin-pwa compatibility
- TypeScript 5.x: Type safety — catches number/string bugs endemic to calculator apps; free with Vite template
- Tailwind CSS 4.2.2: Styling — v4 Vite plugin requires zero PostCSS config; built-in container queries; mobile-first by default
- Zustand 5.0.12: State + persistence — `persist` middleware writes the store to localStorage automatically; ~1KB
- vite-plugin-pwa 1.2.0: PWA — generates service worker and web manifest; enables "Add to Home Screen" and offline use

### Expected Features

The core loop is narrow: browse exercises, set a 1RM, pick a percentage, see the working weight. Everything beyond that is enhancement. The feature set below reflects what users expect at launch versus what creates competitive differentiation versus what constitutes scope creep.

**Must have (table stakes):**
- Preloaded exercise list (~30-50 movements) — without defaults, the first-use experience is a blank slate
- Add / remove custom exercises — the preloaded list will always have gaps for personal use
- Store 1RM per exercise in localStorage — data must survive closing the browser
- Percentage calculation and immediate display — the core value proposition, pure math
- Mobile-friendly layout with large tap targets (48px+ minimum) — the app is used one-handed at the gym
- Offline functionality — gym WiFi is unreliable; static assets + localStorage deliver this automatically

**Should have (competitive advantage):**
- Search / filter the exercise list — with 30-50 items, scrolling kills mobile speed-of-use
- Per-exercise percentage presets — eliminates re-entry of the same percentage every session
- Session view (multi-exercise simultaneous view) — no competitor offers this; shows all working weights at once
- Weight rounding to nearest 1.25 kg increment — raw floating point output is not actionable with real plates

**Defer (v2+):**
- PWA installability / "Add to Home Screen" manifest — useful but adds build step; defer until core is solid
- Dark mode — OS-level dark mode covers most users; low priority for a personal tool
- JSON data export — a backup escape hatch; not critical while it's a single-device personal tool

**Anti-features to reject explicitly:**
- Workout history / logging — fundamentally different product (use Strong or Hevy)
- Plate calculator — different mental model, complex inventory state, separate app category
- Cloud sync / user accounts — kills the simple personal tool premise; adds auth/backend/cost
- lbs support — this is a personal tool; kg only

### Architecture Approach

The architecture follows a strict three-layer pattern: UI Layer (React components), State/Logic Layer (Zustand store + pure Calculator function), and Persistence Layer (Zustand persist middleware + StorageService). All localStorage access is centralized — components never call `localStorage` directly. Session state (the active workout) is held in memory only and is intentionally not persisted, preventing stale-session confusion. The seed data (default exercise list) is a static JS array that populates storage once on first launch and never overwrites user changes.

**Major components:**
1. AppState (Zustand store) — single source of truth: exercises[], maxWeights{}, session[], ui{}
2. StorageService / Zustand persist — centralized read/write to localStorage under versioned key `lift-calc-v1`
3. Calculator (pure function) — `workingWeight = 1RM * (pct / 100)`, rounded to nearest 0.5 kg; no side effects
4. ExerciseList view — browse, search, add, and remove exercises
5. ExerciseEditor — set and update 1RM per exercise
6. SessionView + WorkoutSlot — select exercises for today's session, pick %, see result; ephemeral state only
7. Default Seed — static array of ~30-50 exercises; loaded once if storage is empty

### Critical Pitfalls

1. **localStorage throws in Safari private browsing** — wrap all storage writes in try/catch inside a single `storage.ts` module; detect availability at startup and show a graceful warning rather than crashing. Zustand's persist middleware handles this gracefully if configured with an `onRehydrateStorage` error handler.

2. **`100vh` cuts off content on iOS Safari** — use `100dvh` everywhere from day one; add `-webkit-fill-available` fallback for older iOS. Never use raw `100vh` on iOS-targeting layouts. Test on a real iPhone before any layout phase is considered done.

3. **Virtual keyboard obscures weight inputs** — use `inputmode="decimal"` on all weight fields; avoid `position: fixed` elements near keyboard-visible areas; use `dvh` units; place numeric inputs with space above the fold.

4. **No schema version causes silent data corruption** — write `schemaVersion: 1` into the localStorage data shape from the first build. When schema changes, bump the version and apply a migration runner at startup. Zero-cost to add upfront; very costly after user data exists.

5. **Touch targets too small for gym conditions** — enforce 48px minimum on all interactive elements; prefer 56px+ for primary actions. Percentage +/- controls are the most-used controls and must be generously sized. Place primary output (the calculated weight) in the thumb zone (lower two-thirds of screen).

## Implications for Roadmap

Based on research, the natural dependency graph and pitfall-phase mapping suggest a four-phase structure.

### Phase 1: Foundation and Storage Layer

**Rationale:** All data features depend on a correct, safe storage abstraction. The iOS viewport bugs and schema versioning issues must be solved before any UI is built on top of them — retrofitting is expensive. This phase has no external dependencies and sets the constraints every subsequent phase respects.

**Delivers:** Project scaffold (Vite + React + TypeScript + Tailwind), Zustand store with persist middleware, centralized StorageService with try/catch error handling, `schemaVersion: 1` in data shape, `dvh` viewport shell, seed data loaded on first launch.

**Addresses (from FEATURES.md):** 1RM storage per exercise (infrastructure), offline functionality (Vite static + localStorage).

**Avoids (from PITFALLS.md):** localStorage Safari private browsing crash, iOS `100vh` layout break, no schema version.

**Research flag:** No deeper research needed — all patterns are well-documented with high-confidence sources.

### Phase 2: Exercise List and 1RM Management

**Rationale:** The exercise list and 1RM editor are the prerequisite for the calculator. They are also independent of the session/calculator view, making them the right second build target. Getting the exercise list UI right (search, add, remove, touch targets) validates the mobile UX approach before the more complex session view is built.

**Delivers:** Preloaded exercise list rendered from seed, search/filter, add custom exercise, remove/hide exercise, set and edit 1RM per exercise with numeric keyboard input, visual save confirmation.

**Addresses (from FEATURES.md):** All P1 table stakes except the calculator output itself. Differentiators: search/filter (P2).

**Avoids (from PITFALLS.md):** Touch targets too small, virtual keyboard covers inputs, search UX too slow for gym use.

**Research flag:** No deeper research needed — standard CRUD patterns on a Zustand store.

### Phase 3: Percentage Calculator and Session View

**Rationale:** This is the core value proposition and the differentiating feature (multi-exercise session view). It is built after Phase 2 because it requires exercises with stored 1RM values to function meaningfully. The calculator itself is a pure function with no complexity; the session view UX (simultaneous multi-exercise display) is where the design work is concentrated.

**Delivers:** Working weight calculation (pure function, rounded output), percentage input with +/- controls at gym-usable touch targets, per-exercise percentage presets stored in Zustand, session view showing all selected exercises and working weights simultaneously, weight rounding to nearest 1.25 kg.

**Addresses (from FEATURES.md):** Percentage calculation and display (P1), session view (P2 differentiator), per-exercise percentage presets (P2), weight rounding (P2).

**Avoids (from PITFALLS.md):** Touch targets too small for percentage controls, floating point output, calculated weight shown in small text.

**Research flag:** No deeper research needed — pure math + standard Zustand state patterns.

### Phase 4: PWA, Polish, and Production Readiness

**Rationale:** PWA installability is a build-step addition that is independent of all app logic. Polish (empty states, save confirmations, error handling, dark mode) is best applied after the core loop is validated. Deferring this avoids premature build complexity while the core is being developed.

**Delivers:** vite-plugin-pwa configuration (manifest, service worker, "Add to Home Screen"), app icon and theme color, graceful empty state on first install, storage unavailability warning for private browsing, verified offline behavior, dark mode if desired.

**Addresses (from FEATURES.md):** PWA installability (P3), dark mode (P3).

**Avoids (from PITFALLS.md):** No loading/empty states making app look broken on first install.

**Research flag:** vite-plugin-pwa setup is well-documented. The one watch item: confirm vite-plugin-pwa has added Vite 8 peer dep support before any future Vite upgrade.

### Phase Ordering Rationale

- Foundation first because four of the five critical pitfalls must be addressed before any feature code is written on top of storage or layout.
- Exercise list before calculator because the calculator view requires populated exercises with 1RM values — building them in reverse creates a chicken-and-egg demo problem.
- Session view in Phase 3 rather than split across phases because it composes ExerciseList + Calculator into one view — both dependencies must be complete first.
- PWA and polish last because they are additive with no blocking dependencies; deferring avoids service worker complexity interfering with local development.

### Research Flags

Phases with standard, well-documented patterns (skip `/gsd:research-phase`):
- **Phase 1:** Vite scaffold + Zustand persist + dvh CSS — all covered by official docs with high-confidence sources
- **Phase 2:** Exercise list CRUD with Zustand — standard React patterns
- **Phase 3:** Pure calculator function + Zustand session state — no novel patterns
- **Phase 4:** vite-plugin-pwa with `generateSW` strategy — official docs are complete; check peer deps at time of Vite upgrade

No phase requires deeper pre-build research. All patterns are verified and well-sourced.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions live-queried from npm registry; peer dependency conflict (vite-plugin-pwa / Vite 8) confirmed by inspecting peerDependencies directly |
| Features | HIGH | Competitor feature analysis across 6+ apps; UX patterns verified by NNG, Smashing Magazine, and multiple fitness app research sources |
| Architecture | HIGH | Patterns verified against MDN, Frontend Masters, and RxDB documentation; the single-state + write-through + seed pattern is standard and well-understood |
| Pitfalls | HIGH | All pitfalls documented with reproducible conditions, verified code fixes, and authoritative sources (MDN, WebKit Blog, W3C, CSS-Tricks, NNG) |

**Overall confidence:** HIGH

### Gaps to Address

- **Exercise seed list content:** Research did not enumerate the specific 30-50 exercises to include. This is an authoring task, not a research task — decide during Phase 2 planning. A reasonable starting set: squat, bench press, deadlift, overhead press, barbell row, Romanian deadlift, front squat, incline bench, close-grip bench, lat pulldown, cable row, dumbbell curl, tricep pushdown.
- **Rounding step configurability:** Research recommends defaulting to nearest 0.5 kg (or 1.25 kg for barbell work). Whether to expose this as a user setting or hardcode it should be decided during Phase 3 planning. Recommendation: hardcode 2.5 kg for barbell exercises, 0.5 kg for dumbbells/cables; revisit only if users request finer control.
- **iOS visual viewport API usage:** Research flags the `VisualViewport` API as the correct fix for virtual keyboard coverage, but implementation complexity depends on how weight inputs are positioned in the final layout. Validate during Phase 2 when the ExerciseEditor is built.

## Sources

### Primary (HIGH confidence)
- npm registry (live query) — React 19.2.4, Vite 7.3.1, Tailwind CSS 4.2.2, Zustand 5.0.12, vite-plugin-pwa 1.2.0 versions and peer deps
- [Tailwind CSS v4 official blog](https://tailwindcss.com/blog/tailwindcss-v4) — Vite plugin setup, CSS-first configuration
- [vite-plugin-pwa official docs](https://vite-pwa-org.netlify.app/guide/) — PWA setup, generateSW strategy
- [Zustand persist middleware docs](https://zustand.docs.pmnd.rs/reference/middlewares/persist) — localStorage integration
- [React v19 release](https://react.dev/blog/2024/12/05/react-19) — stable release confirmation
- [MDN: Client-side Storage](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Client-side_storage) — localStorage patterns, quota behavior
- [MDN: Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) — API reference
- [WebKit Blog: Updates to Storage Policy](https://webkit.org/blog/14403/updates-to-storage-policy/) — Safari private browsing behavior
- [CSS-Tricks: CSS fix for 100vh in mobile WebKit](https://css-tricks.com/css-fix-for-100vh-in-mobile-webkit/) — dvh fix
- [W3C: Understanding WCAG 2.5.8 Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) — 48px touch target standard
- [Nielsen Norman Group: Touch Target Size](https://www.nngroup.com/articles/touch-target-size/) — gym UX sizing

### Secondary (MEDIUM confidence)
- [Strength Level](https://strengthlevel.com/), [MaxLift (App Store)](https://apps.apple.com/us/app/maxlift-1rm-calculator/id6447921919), [RackMath (App Store)](https://apps.apple.com/us/app/rackmath-barbell-calculator/id1095054017) — competitor feature analysis
- [Smashing Magazine: Design Mobile Apps for One-Hand Usage](https://www.smashingmagazine.com/2020/02/design-mobile-apps-one-hand-usage/) — thumb-zone UX patterns
- [RxDB: Using localStorage in Modern Applications](https://rxdb.info/articles/localstorage.html) — schema versioning patterns, performance traps
- [Frontend Masters: Vanilla JS Architecture](https://frontendmasters.com/blog/vanilla-javascript-todomvc/) — single-state object patterns
- [HTMHell Advent Calendar 2024: 100dvh solution](https://www.htmhell.dev/adventcalendar/2024/4/) — dvh implementation

---
*Research completed: 2026-03-25*
*Ready for roadmap: yes*
