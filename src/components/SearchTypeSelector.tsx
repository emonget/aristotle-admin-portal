import { Film, Globe } from 'lucide-react'

interface TypeSelectorProps {
  selectedType: 'movie' | 'source'
  onSelectType: (type: 'movie' | 'source') => void
}

export function SearchTypeSelector({ selectedType, onSelectType }: TypeSelectorProps) {
  return (
    <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
      <button
        onClick={() => onSelectType('movie')}
        className={`px-3 py-1 rounded-md text-sm font-medium flex items-center space-x-2 ${
          selectedType === 'movie'
            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
        }`}
      >
        <Film className="w-4 h-4" />
        <span>Movie</span>
      </button>
      <button
        onClick={() => onSelectType('source')}
        className={`px-3 py-1 rounded-md text-sm font-medium flex items-center space-x-2 ${
          selectedType === 'source'
            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
        }`}
      >
        <Globe className="w-4 h-4" />
        <span>Source</span>
      </button>
    </div>
  )
}
