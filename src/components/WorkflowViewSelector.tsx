// react import not needed in React 17+ with new JSX transform

interface WorkflowViewSelectorProps {
  workflowSelector: 'movies' | 'reviews'
  onSelectionChange: (selection: 'movies' | 'reviews') => void
}

export function WorkflowViewSelector({ workflowSelector, onSelectionChange }: WorkflowViewSelectorProps) {
  return (
    <div className="flex items-center space-x-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
      <button
        onClick={() => onSelectionChange('movies')}
        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
          workflowSelector === 'movies'
            ? 'bg-white dark:bg-gray-600 text-blue-700 dark:text-blue-300 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        Movies Workflows
      </button>
      <button
        onClick={() => onSelectionChange('reviews')}
        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
          workflowSelector === 'reviews'
            ? 'bg-white dark:bg-gray-600 text-blue-700 dark:text-blue-300 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        Reviews Workflows
      </button>
    </div>
  )
}