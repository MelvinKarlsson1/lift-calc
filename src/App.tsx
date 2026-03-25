import { useState } from 'react'
import { isStorageAvailable } from './lib/storage'
import { ExerciseList } from './components/ExerciseList'
import { CalculatorView } from './components/CalculatorView'

// Two-screen navigation via useState — no React Router.
// Per CLAUDE.md STACK: "React useState for current view"
// Per research: app has exactly two screens; router adds overhead with no benefit.
type View = 'list' | 'calculator'

function StorageWarning() {
  return (
    <div className="flex items-center justify-center min-h-[100dvh] p-6 text-center bg-gray-950 text-white">
      <div className="max-w-sm">
        <p className="text-lg font-semibold mb-2">Storage unavailable</p>
        <p className="text-sm text-gray-400">
          You're in private browsing mode. Lift Calc needs localStorage to save
          your data. Open in a regular browser window to use the app.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const [storageAvailable] = useState(() => isStorageAvailable())
  const [view, setView] = useState<View>('list')
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)

  if (!storageAvailable) {
    return <StorageWarning />
  }

  if (view === 'calculator' && selectedExerciseId) {
    return (
      <CalculatorView
        exerciseId={selectedExerciseId}
        onBack={() => {
          setView('list')
          setSelectedExerciseId(null)
        }}
      />
    )
  }

  return (
    <ExerciseList
      onSelectExercise={(id) => {
        setSelectedExerciseId(id)
        setView('calculator')
      }}
    />
  )
}
