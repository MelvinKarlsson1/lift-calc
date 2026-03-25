import { useState } from 'react'
import { isStorageAvailable } from './lib/storage'
import { ExerciseList } from './components/ExerciseList'

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

  if (!storageAvailable) {
    return <StorageWarning />
  }

  return <ExerciseList />
}
