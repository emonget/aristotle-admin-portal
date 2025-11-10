import { Camera } from 'lucide-react'

export function CapturePage() {
  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <Camera className="w-16 h-16 text-gray-400 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Capture
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            Review capture functionality - coming soon...
          </p>
        </div>
      </div>
    </div>
  )
}
