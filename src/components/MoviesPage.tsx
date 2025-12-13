import { MoviesList } from './MoviesList'
import { useState, useEffect, useMemo } from 'react'
import { getTableData } from '@/services/database'
import type { DatabaseRecord } from '@/types/database'

export function MoviesPage() {
  const [movies, setMovies] = useState<DatabaseRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true)
        const result = await getTableData('movies')
        if (result.error) {
          setError(result.error.message)
        } else {
          setMovies(result.data || [])
        }
      } catch (err) {
        setError('Failed to fetch movies')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovies()
  }, [])

  // Filter movies based on search term
  const filteredMovies = useMemo(() => {
    if (!searchTerm) return movies
    return movies.filter(movie =>
      (movie.title as string)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (movie.ems_id as string)?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [movies, searchTerm])

  return (
    <div className="h-full relative">
      <div className="flex flex-col h-full gap-4">
        {/* Search Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex-shrink-0">
          <input
            type="text"
            placeholder="Search by title or EMS ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Movies List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col">
          <MoviesList
            movies={filteredMovies}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  )
}