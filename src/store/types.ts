// src/store/types.ts
// All AppState types. The store shape is the contract for localStorage serialization.
// CRITICAL: schemaVersion must be present from the first write — changing the shape
// without bumping schemaVersion causes silent data corruption on existing installs.

export interface Exercise {
  id: string
  name: string
  isCustom: boolean
}

export interface AppState {
  schemaVersion: number          // Always present. Current version: 1.
  exercises: Exercise[]          // Populated with seed data in Phase 2.
  maxWeights: Record<string, number>  // exerciseId -> 1RM in kg. Set in Phase 2.
}

export interface AppStore extends AppState {
  // Actions added in Phase 2 and 3.
  setMaxWeight: (exerciseId: string, weight: number) => void
  addExercise: (exercise: Exercise) => void
  removeExercise: (id: string) => void
}
