import React, { useState, useEffect } from 'react'
import { MoviesList } from './MoviesList'
import { ReviewsList } from './ReviewsList'
import { getTableData } from '@/services/database'
import type { DatabaseRecord } from '@/types/database'

export function MainPage() {
  const [movies, setMovies] = useState<DatabaseRecord[]>([])
  const [selectedMovie, setSelectedMovie] = useState<DatabaseRecord | null>(null)
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

  const handleMovieSelect = (movie: DatabaseRecord) => {
    setSelectedMovie(movie)
  }

  return (
    <div className="h-full relative">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Movies Column */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex-1 max-h-full">
          <MoviesList
            movies={movies}
            isLoading={isLoading}
            error={error}
            onMovieSelect={handleMovieSelect}
            selectedMovieId={selectedMovie?.ems_id as string}
          />
        </div>

        {/* Reviews Column */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden lg:flex-1 max-h-full">
          <ReviewsList selectedMovie={selectedMovie} />
        </div>
      </div>
    </div>
  )
}