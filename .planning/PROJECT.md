# Lift Calc

## What This Is

A mobile-friendly web app for tracking weightlifting max weights and calculating working weights based on percentages. Built as a personal tool for Melvin to use at the gym — quick, simple, one-user.

## Core Value

Instantly see how much weight to load for any exercise at any percentage of your max.

## Requirements

### Validated

- ✓ Data persists in browser local storage — Validated in Phase 1: Foundation
- ✓ Safe localStorage with error handling (Safari private browsing) — Validated in Phase 1: Foundation
- ✓ Versioned storage schema for future migrations — Validated in Phase 1: Foundation

### Active

- [ ] Browse and search a comprehensive list of weightlifting exercises
- [ ] Remove default exercises you don't use
- [ ] Add custom exercises
- [ ] Record your 1RM (one-rep max) for each exercise
- [ ] Select exercises for a workout session
- [ ] Set a percentage of max for each selected exercise
- [ ] See the calculated working weight displayed clearly
- [ ] Mobile-friendly UI that works well on phone screens at the gym

### Out of Scope

- User accounts / authentication — single user, local storage only
- Cloud sync / Supabase — keeping it simple with browser storage
- Pound/lb support — kg only
- Workout history / logging — this is a calculator, not a tracker
- Rep/set tracking — just weight calculation
- Plate calculator (which plates to load) — just the number

## Context

- Personal tool for gym use — needs to be fast and usable with one hand
- Will be used on a phone, often between sets
- The exercise list should come pre-loaded with common weightlifting movements (compounds, isolation, machine, cable, etc.)
- Weight units are kilograms only

## Constraints

- **Tech**: Mobile-friendly web app — no native app, no backend
- **Storage**: Browser local storage only — no database, no auth
- **Units**: Kilograms only — no unit conversion needed
- **User**: Single user — no multi-user considerations

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Local storage over Supabase | Keep it simple, no account needed, works offline | — Pending |
| Kg only | User preference, simplifies UI | — Pending |
| Subfolder of learning repo | Part of MK-Claude-Learning-Tool project | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-25 after Phase 1 completion*
