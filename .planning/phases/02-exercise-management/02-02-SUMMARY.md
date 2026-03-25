---
phase: 02-exercise-management
plan: 02
subsystem: ui
tags: [react, zustand, tailwind, exercise-list, 1rm-input]
dependency_graph:
  requires: [02-01]
  provides: [ExerciseList-component, ExerciseRow-component, exercise-management-ui]
  affects: [src/components/ExerciseList.tsx, src/App.tsx]
tech_stack:
  added: []
  patterns: [individual-zustand-selectors, onBlur-store-write, text-decimal-input, dvh-layout]
key_files:
  created:
    - src/components/ExerciseList.tsx
  modified:
    - src/App.tsx
decisions:
  - "type=text with inputMode=decimal chosen over type=number — avoids browser spinners that break gym-use mobile UX"
  - "onBlur write to store (not onChange) — prevents noisy writes on every keystroke; parseFloat guard ensures only valid positive numbers reach the store"
  - "ExerciseList owns its own h-[100dvh] layout — App.tsx wrapper div removed; component is self-contained full-screen"
  - "Add form is inline in flex column, not fixed-position — keyboard on mobile does not obscure it"
metrics:
  duration: "1m 49s"
  completed_date: "2026-03-25"
  tasks_completed: 2
  files_changed: 2
requirements: [EXER-03, EXER-04]
---

# Phase 02 Plan 02: ExerciseList UI Summary

**One-liner:** Full-screen exercise management UI with scrollable list, per-row 1RM decimal input (onBlur store write), 48px remove button, and inline add form wired to the Zustand store.

## What Was Built

- `src/components/ExerciseList.tsx` — exports `ExerciseList` with internal `ExerciseRow`. List scrolls independently via `flex-1 overflow-y-auto`. Add form is pinned at the bottom of the flex column (not fixed-position, so it moves with the soft keyboard on mobile). 1RM input uses `type="text" inputMode="decimal"` and writes to the store on `onBlur` only. Remove button has `min-h-12 min-w-12` (48px touch target). New exercises get IDs via `crypto.randomUUID()`.
- `src/App.tsx` — stripped the placeholder `<div><main>` wrapper. Now imports and renders `<ExerciseList />` directly. `StorageWarning` component and `isStorageAvailable()` guard are preserved unchanged.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create ExerciseList component with inline ExerciseRow | 5187100 | src/components/ExerciseList.tsx |
| 2 | Wire ExerciseList into App.tsx | 08b3193 | src/App.tsx |

## Decisions Made

1. **`type="text" inputMode="decimal"` for 1RM input** — `type="number"` adds browser-native spinners that are accidentally easy to trigger at the gym. `text` + `inputMode="decimal"` gives the correct numeric keyboard on iOS/Android without spinner interference.

2. **`onBlur` store write with `parseFloat` guard** — Writing on every keystroke would flood Zustand with partial values ("1", "10", "100", "100." etc.) and trigger unnecessary localStorage serializations. The guard (`!isNaN(parsed) && parsed > 0`) ensures only complete, positive numbers reach the store.

3. **ExerciseList owns full-screen layout** — App.tsx no longer wraps ExerciseList in a layout div. This avoids double-nesting dvh containers and keeps the component self-contained for future navigation.

4. **Inline add form vs. fixed-position** — Fixed-position forms are obscured by the soft keyboard on many mobile browsers. Inline in a flex column, the form stays above the keyboard naturally.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all store actions are wired and all UI flows (add, remove, 1RM persist) are fully functional.

## Verification Results

- `grep "export function ExerciseList" src/components/ExerciseList.tsx` — PASS
- `grep 'inputMode="decimal"' src/components/ExerciseList.tsx` — PASS
- `grep 'type="number"' src/components/ExerciseList.tsx` — NO MATCH (correct)
- `grep "onBlur" src/components/ExerciseList.tsx` — PASS
- `grep "crypto.randomUUID" src/components/ExerciseList.tsx` — PASS
- `grep -c "min-h-12" src/components/ExerciseList.tsx` — 3 matches (input + remove button + add button)
- `grep -c "ExerciseList" src/App.tsx` — 2 matches (import + JSX)
- `grep "foundation ready" src/App.tsx` — NO MATCH (correct, placeholder removed)
- `grep "StorageWarning" src/App.tsx` — PASS (preserved)
- `grep "isStorageAvailable" src/App.tsx` — PASS (preserved)
- `npx tsc --noEmit` — PASS (0 errors)
- `npm run build` — PASS (563ms, 201KB JS bundle)

## Self-Check: PASSED
