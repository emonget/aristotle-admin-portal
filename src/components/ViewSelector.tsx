import React from 'react'

interface ViewSelectorProps {
  itemsSelector: 'movies' | 'sources'
  onSelectionChange: (selection: 'movies' | 'sources') => void
}

export function ViewSelector({ itemsSelector, onSelectionChange }: ViewSelectorProps) {
  return (
    <div className="flex items-center space-x-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
      <button
        onClick={() => onSelectionChange('movies')}
        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
          itemsSelector === 'movies'
            ? 'bg-white dark:bg-gray-600 text-blue-700 dark:text-blue-300 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        By Movie
      </button>
      <button
        onClick={() => onSelectionChange('sources')}
        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
          itemsSelector === 'sources'
            ? 'bg-white dark:bg-gray-600 text-blue-700 dark:text-blue-300 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        By Source
      </button>
    </div>
  )
}