# Requirements: Lift Calc

**Defined:** 2026-03-25
**Core Value:** Instantly see how much weight to load for any exercise at any percentage of your max.

## v1 Requirements

### Exercise Management

- [x] **EXER-01**: User sees a preloaded list of ~50 common weightlifting exercises on first launch
- [x] **EXER-02**: User can remove default exercises they don't use
- [ ] **EXER-03**: User can add custom exercises with a name
- [ ] **EXER-04**: User can record their 1RM (max weight in kg) for any exercise

### Calculator

- [ ] **CALC-01**: User can select an exercise and enter a percentage to see the calculated working weight
- [ ] **CALC-02**: User can tap preset percentage buttons (70%, 80%, 85%, 90%, 95%) instead of typing
- [ ] **CALC-03**: Calculated weights are rounded to the nearest 2.5kg

### Mobile UX

- [ ] **UX-01**: Primary actions are in the thumb zone (bottom of screen), usable one-handed
- [x] **UX-02**: All data persists in browser localStorage across sessions

### Foundation

- [x] **FOUND-01**: App uses safe localStorage abstraction with error handling (Safari private browsing)
- [x] **FOUND-02**: Storage schema is versioned from day one for future migrations

## v2 Requirements

### Exercise Management

- **EXER-05**: User can search/filter exercises by name or muscle group
- **EXER-06**: Exercises are categorized by muscle group / movement type

### Calculator

- **CALC-04**: User can build a multi-exercise session with different percentages per exercise
- **CALC-05**: User can save and load workout presets

### Mobile UX

- **UX-03**: Large tap targets (48px+) for all interactive elements
- **UX-04**: App is installable as PWA (Add to Home Screen)
- **UX-05**: 1RM history tracking over time

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts / authentication | Single user, local storage only |
| Cloud sync / Supabase | Keeping it simple, no backend |
| Pound/lb support | Kg only per user preference |
| Workout history / logging | This is a calculator, not a tracker |
| Rep/set tracking | Just weight calculation |
| Plate calculator | Separate problem with its own complexity (bar weight, collar weight, available plates) |
| Training programs (5/3/1 etc.) | Out of scope for a simple calculator |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| UX-02 | Phase 1 | Complete |
| EXER-01 | Phase 2 | Complete |
| EXER-02 | Phase 2 | Complete |
| EXER-03 | Phase 2 | Pending |
| EXER-04 | Phase 2 | Pending |
| CALC-01 | Phase 3 | Pending |
| CALC-02 | Phase 3 | Pending |
| CALC-03 | Phase 3 | Pending |
| UX-01 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-25 after roadmap creation*
