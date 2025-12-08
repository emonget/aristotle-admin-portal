import type { DatabaseRecord } from '@/types/database'

interface SimpleMoviesListProps {
  movies: DatabaseRecord[]
  onMovieSelect: (movie: DatabaseRecord) => void
  reviewsCount: { [key: string]: number }
}

export function SearchMoviesList({ movies, onMovieSelect, reviewsCount }: SimpleMoviesListProps) {
  return (
    <div className="space-y-2">
      {movies.map((movie) => (
        <div
          key={movie.ems_id as string}
          onClick={() => onMovieSelect(movie)}
          className="p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center"
        >
          <p className="text-sm text-gray-900 dark:text-gray-100">
            {movie.title as string}
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {reviewsCount[movie.ems_id as string] || 0} reviews
          </span>
        </div>
      ))}
    </div>
  )
}
