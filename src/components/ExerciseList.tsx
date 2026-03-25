// src/components/ExerciseList.tsx
// ExerciseList renders the full exercise management screen.
// ExerciseRow (internal) handles per-row display: name, 1RM input, and remove.

import { useState } from 'react'
import { useAppStore } from '../store/store'
import type { Exercise } from '../store/types'

// ---------------------------------------------------------------------------
// ExerciseRow — internal component, not exported
// ---------------------------------------------------------------------------

interface ExerciseRowProps {
  exercise: Exercise
  weight: number | null
  onRemove: () => void
  onWeightChange: (weight: number) => void
  onSelect?: () => void  // optional navigation callback
}

function ExerciseRow({ exercise, weight, onRemove, onWeightChange, onSelect }: ExerciseRowProps) {
  const [localWeight, setLocalWeight] = useState(weight != null ? String(weight) : '')

  function handleBlur() {
    const parsed = parseFloat(localWeight)
    if (!isNaN(parsed) && parsed > 0) {
      onWeightChange(parsed)
    }
  }

  return (
    <div className="flex items-center gap-3 bg-gray-900 rounded-lg px-4 py-3 min-h-[56px]">
      <button
        onClick={() => onSelect?.()}
        className="flex-1 text-left text-white text-base py-1 disabled:cursor-default"
        aria-label={`Calculate working weight for ${exercise.name}`}
        disabled={!weight}
      >
        <span>{exercise.name}</span>
        {weight != null && (
          <span className="ml-2 text-gray-400 text-sm" aria-hidden="true">&rarr;</span>
        )}
      </button>
      <input
        type="text"
        inputMode="decimal"
        pattern="[0-9]*\.?[0-9]*"
        value={localWeight}
        onChange={(e) => setLocalWeight(e.target.value)}
        onBlur={handleBlur}
        placeholder="kg"
        aria-label={`1RM for ${exercise.name}`}
        className="w-20 text-right bg-gray-800 text-white rounded px-3 py-2 min-h-10"
      />
      <button
        onClick={onRemove}
        aria-label={`Remove ${exercise.name}`}
        className="text-gray-500 hover:text-red-400 min-h-12 min-w-12 flex items-center justify-center"
      >
        ×
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ExerciseList — exported component
// ---------------------------------------------------------------------------

interface ExerciseListProps {
  onSelectExercise: (exerciseId: string) => void
}

export function ExerciseList({ onSelectExercise }: ExerciseListProps) {
  const exercises = useAppStore((s) => s.exercises)
  const addExercise = useAppStore((s) => s.addExercise)
  const removeExercise = useAppStore((s) => s.removeExercise)
  const maxWeights = useAppStore((s) => s.maxWeights)
  const setMaxWeight = useAppStore((s) => s.setMaxWeight)

  const [newName, setNewName] = useState('')

  function handleAdd() {
    const name = newName.trim()
    if (!name) return
    addExercise({ id: crypto.randomUUID(), name, isCustom: true })
    setNewName('')
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-950 text-white">
      {/* Header */}
      <div className="px-4 pt-6 pb-3">
        <h1 className="text-xl font-bold text-white">Exercises</h1>
      </div>

      {/* Scrollable exercise list */}
      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-2">
        {exercises.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-8">No exercises. Add one below.</p>
        ) : (
          exercises.map((ex) => (
            <ExerciseRow
              key={ex.id}
              exercise={ex}
              weight={maxWeights[ex.id] ?? null}
              onRemove={() => removeExercise(ex.id)}
              onWeightChange={(w) => setMaxWeight(ex.id, w)}
              onSelect={() => onSelectExercise(ex.id)}
            />
          ))
        )}
      </div>

      {/* Add form — pinned at bottom via flex column order, not fixed position */}
      <div className="px-4 py-4 border-t border-gray-800 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
          placeholder="Exercise name"
          className="flex-1 bg-gray-800 text-white rounded px-3 py-3 min-h-12 placeholder:text-gray-500"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white rounded px-5 min-h-12 font-semibold"
        >
          Add
        </button>
      </div>
    </div>
  )
}
