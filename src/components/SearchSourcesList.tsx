interface ReviewSource {
  domain: string
  publicationName?: string
  count: number
}

interface SourcesListProps {
  sources: ReviewSource[]
  onSourceSelect: (source: ReviewSource) => void
}

export function SearchSourcesList({ sources, onSourceSelect }: SourcesListProps) {
  return (
    <div className="space-y-2">
      {sources.map((source) => (
        <div
          key={source.domain}
          onClick={() => onSourceSelect(source)}
          className="p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {source.domain}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {source.count} reviews
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
