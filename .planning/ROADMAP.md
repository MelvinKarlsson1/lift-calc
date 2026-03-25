# Roadmap: Lift Calc

## Overview

Three phases that build from the ground up: a safe storage layer first (so data survives from day one), then exercise management with 1RM entry (the prerequisite for any calculation), then the calculator and session view (the core value). Every v1 requirement maps to exactly one phase. The app is fully usable after Phase 3.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Scaffold, storage layer, and iOS layout fixes (completed 2026-03-25)
- [x] **Phase 2: Exercise Management** - Exercise list, 1RM entry, and custom exercises (completed 2026-03-25)
- [ ] **Phase 3: Calculator** - Working weight calculation and thumb-zone session view

## Phase Details

### Phase 1: Foundation
**Goal**: The app shell runs, data persists reliably, and iOS layout bugs are prevented from day one
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, UX-02
**Success Criteria** (what must be TRUE):
  1. App loads in a mobile browser and renders without errors
  2. Any data written to the app survives a browser close and reopen (localStorage persists)
  3. App layout fills the full screen on iOS Safari without the bottom bar cutting off content
  4. Attempting to use the app in Safari private browsing shows a graceful warning instead of crashing
  5. Storage data shape contains a schemaVersion field (visible in browser dev tools)
**Plans**: 2 plans
Plans:
- [x] 01-01-PLAN.md — Scaffold Vite + React + TypeScript + Tailwind v4, apply dvh viewport fix
- [x] 01-02-PLAN.md — Storage layer (storage.ts, types.ts, store.ts) and App shell with storage gate
**UI hint**: yes

### Phase 2: Exercise Management
**Goal**: Users can build and maintain their personal exercise list with 1RM values ready for calculation
**Depends on**: Phase 1
**Requirements**: EXER-01, EXER-02, EXER-03, EXER-04
**Success Criteria** (what must be TRUE):
  1. User sees a preloaded list of common exercises on first launch (no blank slate)
  2. User can remove an exercise they don't use and it stays removed after closing the app
  3. User can add a custom exercise by name and it appears in the list
  4. User can enter or update their 1RM for any exercise using a numeric keyboard
**Plans**: 2 plans
Plans:
- [x] 02-01-PLAN.md — Store additions: removeExercise action, seedExercises.ts, seed-on-first-launch in persist merge
- [x] 02-02-PLAN.md — ExerciseList component with ExerciseRow, add/remove/1RM UI, wire into App.tsx
**UI hint**: yes

### Phase 3: Calculator
**Goal**: Users can instantly see the working weight for any exercise at any percentage of their max
**Depends on**: Phase 2
**Requirements**: CALC-01, CALC-02, CALC-03, UX-01
**Success Criteria** (what must be TRUE):
  1. User can select an exercise (with a stored 1RM) and see the working weight update immediately when they enter a percentage
  2. User can tap a preset percentage button (70%, 80%, 85%, 90%, 95%) and see the result without typing
  3. Calculated weight is displayed rounded to the nearest 2.5 kg (no raw floating point output)
  4. Primary controls and result display are reachable with one thumb at the bottom of the screen
**Plans**: 2 plans
Plans:
- [x] 03-01-PLAN.md — Pure calcWorkingWeight function (src/lib/calculator.ts) + ExerciseList navigation prop
- [ ] 03-02-PLAN.md — CalculatorView component + App.tsx view-switcher wiring
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete   | 2026-03-25 |
| 2. Exercise Management | 2/2 | Complete   | 2026-03-25 |
| 3. Calculator | 1/2 | In progress | - |
