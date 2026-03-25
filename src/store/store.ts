// src/store/store.ts
// Single Zustand store for all app state.
// Uses `persist` middleware to write full store to localStorage under key `lift-calc-v1`.
// Source: https://zustand.docs.pmnd.rs/reference/middlewares/persist

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppState, AppStore } from './types'

const CURRENT_SCHEMA_VERSION = 1

// Migration stub — runs on every load; no-op when schema version matches.
// Grows in future phases as data shape changes.
function migrateIfNeeded(stored: AppState): AppState {
  if (!stored.schemaVersion || stored.schemaVersion < CURRENT_SCHEMA_VERSION) {
    return { ...stored, schemaVersion: CURRENT_SCHEMA_VERSION }
  }
  return stored
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // Foundation fields — present from first write, required for migrations.
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exercises: [],
      maxWeights: {},
      setMaxWeight: (exerciseId, weight) =>
        set((state) => ({
          maxWeights: { ...state.maxWeights, [exerciseId]: weight },
        })),
      addExercise: (exercise) =>
        set((state) => ({
          exercises: [...state.exercises, exercise],
        })),
    }),
    {
      name: 'lift-calc-v1',
      merge: (persisted, current) => {
        const migratedState = migrateIfNeeded(persisted as AppState)
        return { ...current, ...migratedState }
      },
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.warn('[lift-calc] Storage rehydration failed:', error)
        }
      },
    }
  )
)
