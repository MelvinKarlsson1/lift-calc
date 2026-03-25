export interface Exercise {
  id: string
  name: string
  isCustom: boolean
}

export interface AppState {
  schemaVersion: number
  exercises: Exercise[]
  maxWeights: Record<string, number> // exerciseId -> 1RM in kg
}
