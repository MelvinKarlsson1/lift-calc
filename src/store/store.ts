import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppState, Exercise } from './types'

const CURRENT_SCHEMA_VERSION = 1

// Migration stub — runs on every load; no-op when schema version matches.
// Grows in future phases as data shape changes.
function migrateIfNeeded(stored: AppState): AppState {
  if (!stored.schemaVersion || stored.schemaVersion < CURRENT_SCHEMA_VERSION) {
    return { ...stored, schemaVersion: CURRENT_SCHEMA_VERSION }
  }
  return stored
}

interface AppStore extends AppState {
  setMaxWeight: (exerciseId: string, weight: number) => void
  addExercise: (exercise: Exercise) => void
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
