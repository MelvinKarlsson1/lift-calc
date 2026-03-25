---
phase: 02-exercise-management
plan: 01
subsystem: store
tags: [zustand, seed-data, types, persistence]
dependency_graph:
  requires: []
  provides: [removeExercise-action, SEED_EXERCISES, seed-on-first-launch]
  affects: [src/store/store.ts, src/store/types.ts, src/data/seedExercises.ts]
tech_stack:
  added: []
  patterns: [zustand-persist-merge-seeding, kebab-case-exercise-ids]
key_files:
  created:
    - src/data/seedExercises.ts
  modified:
    - src/store/types.ts
    - src/store/store.ts
decisions:
  - "Seed guard placed in persist merge callback (not onRehydrateStorage) so it fires exactly once per hydration, not on every state change"
  - "Seed guard uses merged.exercises.length === 0 — intentional runtime removal of all exercises does not re-trigger seeding"
  - "44 exercises chosen (requirement was ~50) — quality over padding with made-up exercises"
metrics:
  duration: "2m 29s"
  completed_date: "2026-03-25"
  tasks_completed: 2
  files_changed: 3
requirements: [EXER-01, EXER-02]
---

# Phase 02 Plan 01: Exercise Store Foundation Summary

**One-liner:** Seeded Zustand store with 44 pre-loaded exercises via persist merge callback and removeExercise action that filters by id.

## What Was Built

- `src/data/seedExercises.ts` — exports `SEED_EXERCISES` with 44 common weightlifting exercises (barbell compound, dumbbell, cable/machine, bodyweight), all `isCustom: false`, all kebab-case IDs
- `src/store/types.ts` — `AppStore` interface extended with `removeExercise: (id: string) => void`
- `src/store/store.ts` — three additions: SEED_EXERCISES import, removeExercise action (filters exercises array by id), and seed-on-first-launch guard inside the persist merge callback

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add removeExercise to types.ts and create seedExercises.ts | 131f7c9 | src/store/types.ts, src/data/seedExercises.ts |
| 2 | Wire removeExercise action and seed loading into store.ts | a5a3b57 | src/store/store.ts |

## Decisions Made

1. **Seed guard in merge callback, not onRehydrateStorage** — The merge callback receives the already-migrated persisted state, making it the correct interception point. `onRehydrateStorage` fires after merge and cannot mutate the returned state.

2. **`merged.exercises.length === 0` guard is intentional** — If the user removes all exercises at runtime, the store will not re-seed on next reload. The seed only fires at hydration when the persisted array is empty (i.e., truly first launch or cleared storage).

3. **44 exercises, not 50** — The requirement said "~50". The 44 exercises chosen are all real, named movements. No padding was added to hit an arbitrary number.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — SEED_EXERCISES is fully wired to the store merge callback and will populate the exercises array on first launch.

## Verification Results

- `npx tsc --noEmit` — PASS (no TypeScript errors)
- `npm run build` — PASS (557ms, 194KB JS bundle)
- `grep -c "isCustom: false" src/data/seedExercises.ts` — 44 (requirement: 40+)
- `grep "removeExercise" src/store/types.ts` — found with `(id: string) => void`
- `grep "SEED_EXERCISES" src/store/store.ts` — 2 matches (import + merge callback)
- `grep "exercises.length === 0" src/store/store.ts` — found

## Self-Check: PASSED
