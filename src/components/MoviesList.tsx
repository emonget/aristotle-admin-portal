import React, { useState, useMemo, useEffect } from 'react'
import { getTableData } from '@/services/database'
import type { DatabaseRecord } from '@/types/database'

interface MoviesListProps {
  movies?: DatabaseRecord[]
  selectedMovieId?: string
  onMovieSelect?: (movie: DatabaseRecord) => void
  isLoading?: boolean
  error?: string | null
}

export function MoviesList({ movies: externalMovies, selectedMovieId, onMovieSelect, isLoading, error }: MoviesListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [movies, setMovies] = useState<DatabaseRecord[]>(externalMovies || [])
  const [internalLoading, setInternalLoading] = useState(isLoading !== undefined ? false : true)
  const [reviewsCount, setReviewsCount] = useState<{ [key: string]: number }>({})
  const itemsPerPage = 10

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

  // Filter movies based on search term
  const filteredMovies = useMemo(() => {
    if (!searchTerm) return movies
    return movies.filter(movie =>
      movie.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.ems_id?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [movies, searchTerm])

  // Paginate filtered movies
  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredMovies.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredMovies, currentPage])

  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handleMovieClick = (movie: DatabaseRecord) => {
    onMovieSelect?.(movie)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString()
  }

  if (actualLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading movies...</span>
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
      {/* Header */}
      <div className="px-6 py-4">
        <h3 className="font-semibold text-gray-900 mb-4">Movies</h3>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by title or EMS ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {filteredMovies.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            <p>{searchTerm ? 'No movies found matching your search.' : 'No movies available.'}</p>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EMS ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review Count
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fetch Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedMovies.map((movie) => (
                  <tr
                    key={movie.ems_id as string}
                    onClick={() => handleMovieClick(movie)}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedMovieId === movie.ems_id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate">
                      <div title={movie.title as string}>
                        {movie.title as string}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {(movie.ems_id as string)?.slice(-8)}...
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {reviewsCount[movie.ems_id as string] || 0}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(movie.fetched_at as string)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({filteredMovies.length} total movies)
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}