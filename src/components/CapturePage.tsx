export function CapturePage() {
  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex">
      {/* Left Panel: Content */}
      <div className="flex-1 flex items-center justify-center border-r border-gray-200 dark:border-gray-700 p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Content Panel
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            This section will display the content to be captured.
          </p>
        </div>
      </div>

      {/* Right Panel: Analysis */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Analysis Panel
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            This section will display the analysis of the captured content.
          </p>
        </div>
      </div>
    </div>
  )
}
