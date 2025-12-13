import { MoviesList } from './MoviesList'
import { ReviewsList } from './ReviewsList'
import { useState, useEffect, useMemo } from 'react'
import { getTableData } from '@/services/database'
import type { DatabaseRecord } from '@/types/database'

export function MoviesPage() {
  const [movies, setMovies] = useState<DatabaseRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Selection state
  const [selectedMovie, setSelectedMovie] = useState<DatabaseRecord | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'digest'>('details')

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

  const handleMovieSelect = (movie: DatabaseRecord) => {
    setSelectedMovie(movie)
    // Reset to details tab when a new movie is selected
    setActiveTab('details')
  }

  return (
    <div className="h-full flex flex-row gap-6">
      {/* Left Column - Search and Movies List */}
      <div className="w-1/3 flex flex-col gap-4 h-full">
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
            onMovieSelect={handleMovieSelect}
            selectedMovieId={selectedMovie?.ems_id as string}
          />
        </div>
      </div>

      {/* Right Column - Details Panel */}
      <div className="w-2/3 h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
        {selectedMovie ? (
          <>
            {/* Tabs Header */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'details'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Reviews
              </button>
              <button
                onClick={() => setActiveTab('digest')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'digest'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Digest
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'details' && (
                <div className="h-full overflow-auto p-6">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                    {selectedMovie.title as string}
                  </h2>
                  <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">EMS ID</h3>
                        <p className="mt-1 font-mono text-sm text-gray-900 dark:text-gray-100">{selectedMovie.ems_id as string}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Fetched At</h3>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{new Date(selectedMovie.fetched_at as string).toLocaleString()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Raw Data</h3>
                      <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-xs text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                        {JSON.stringify(selectedMovie.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="h-full flex flex-col">
                    <ReviewsList selectedMovie={selectedMovie} displayMode="movie" showHeader={false} />
                </div>
              )}

              {activeTab === 'digest' && (
                <div className="h-full flex items-center justify-center p-6 text-center">
                  <div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-4 inline-block mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Review Digest</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                      AI-generated digest and analysis of reviews will appear here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                <p>Select a movie from the list to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}