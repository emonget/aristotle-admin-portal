import { useState, useMemo, useEffect } from 'react'
import { getTableData } from '@/services/database'
import type { DatabaseRecord } from '@/types/database'

interface MoviesListProps {
  movies?: DatabaseRecord[]
  selectedMovieId?: string
  onMovieSelect?: (movie: DatabaseRecord) => void
  isLoading?: boolean
  error?: string | null
}

export function MoviesList({ movies: externalMovies, isLoading, error }: MoviesListProps) {
  const [movies, setMovies] = useState<DatabaseRecord[]>(externalMovies || [])
  const [internalLoading, setInternalLoading] = useState(isLoading !== undefined ? false : true)
  const [reviewsCount, setReviewsCount] = useState<{ [key: string]: number }>({})

  const actualLoading = isLoading !== undefined ? isLoading : internalLoading

  // Fetch movies if not provided externally
  useEffect(() => {
    if (externalMovies !== undefined) {
      setMovies(externalMovies)
      setInternalLoading(false)
    } else {
      const fetchMovies = async () => {
        try {
          setInternalLoading(true)
          const result = await getTableData('movies')
          if (!result.error && result.data) {
            setMovies(result.data)
          }
        } catch (err) {
          console.error('Failed to fetch movies:', err)
        } finally {
          setInternalLoading(false)
        }
      }
      fetchMovies()
    }
  }, [externalMovies])

  // Fetch review counts for all movies
  useEffect(() => {
    const fetchReviewCounts = async () => {
      if (movies.length === 0) return

      try {
        const result = await getTableData('reviews')
        if (!result.error && result.data) {
          const countMap: { [key: string]: number } = {}
          result.data.forEach((review: DatabaseRecord) => {
            const movieId = review.movie_id as string
            if (movieId) {
              countMap[movieId] = (countMap[movieId] || 0) + 1
            }
          })
          setReviewsCount(countMap)
        }
      } catch (err) {
        console.error('Failed to fetch review counts:', err)
      }
    }

    fetchReviewCounts()
  }, [movies])

  if (actualLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading movies...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-6 py-8 text-center text-red-600">
        <p>Error loading movies: {error}</p>
      </div>
    )
  }


  return (
    <div className="h-full flex flex-col">
    {/* Table */}
      <div className="flex-1 overflow-auto">
        {movies.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
            <p>No movies available.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Review Count
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              {movies.map((movie) => (
                <tr
                  key={movie.ems_id as string}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">
                    <div title={movie.title as string}>
                      {movie.title as string}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {reviewsCount[movie.ems_id as string] || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer stats */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex-shrink-0">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {movies.length} {movies.length === 1 ? 'movie' : 'movies'} • {Object.values(reviewsCount).reduce((sum, count) => sum + count, 0)} {Object.values(reviewsCount).reduce((sum, count) => sum + count, 0) === 1 ? 'review' : 'reviews'} total
        </p>
      </div>
    </div>
  )
}