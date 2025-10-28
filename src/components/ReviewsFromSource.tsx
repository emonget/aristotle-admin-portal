import { useState, useEffect } from 'react'
import { getTableData } from '@/services/database'
import type { DatabaseRecord } from '@/types/database'

interface ReviewSource {
  domain: string
  publicationName?: string
  count: number
}

interface ReviewsFromSourceProps {
  selectedSource: ReviewSource | null
}

interface ReviewWithData extends DatabaseRecord {
  review_id: string
  data: any
  fetched_at: string
  movie_id: string
}

export function ReviewsFromSource({ selectedSource }: ReviewsFromSourceProps) {
  const [reviews, setReviews] = useState<ReviewWithData[]>([])
  const [movies, setMovies] = useState<DatabaseRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load movies data on mount for movie name lookups
  useEffect(() => {
    const fetchMovies = async () => {
      const result = await getTableData('movies')
      if (result.data) {
        setMovies(result.data)
      }
    }
    fetchMovies()
  }, [])

  useEffect(() => {
    const fetchReviews = async () => {
      if (!selectedSource?.domain) {
        setReviews([])
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Fetch reviews for the selected source
        const result = await getTableData('reviews')
        if (result.error) {
          setError(`Failed to load reviews: ${result.error.message}`)
        } else {
          // Filter reviews by domain (with safe URL parsing)
          const sourceReviews = (result.data || []).filter(
            (review: DatabaseRecord) => {
              try {
                const reviewData = review.data as any
                const reviewUrl = reviewData?.reviewUrl || reviewData?.publicationUrl
                if (reviewUrl && typeof reviewUrl === 'string') {
                  const urlObj = new URL(reviewUrl)
                  const domain = urlObj.hostname.replace(/^www\./, '')
                  return domain === selectedSource.domain
                }
                return false
              } catch (urlError) {
                // Skip malformed URLs instead of crashing
                return false
              }
            }
          )

          // Sort by isTopCritic (top critics first) then by creation date (most recent first)
          sourceReviews.sort((a: DatabaseRecord, b: DatabaseRecord) => {
            const aData = a.data as any
            const bData = b.data as any

            // Top critics first
            if (aData?.isTopCritic && !bData?.isTopCritic) return -1
            if (!aData?.isTopCritic && bData?.isTopCritic) return 1

            // Then by creation date (if available)
            const aDate = aData?.creationDate ? new Date(aData.creationDate).getTime() : 0
            const bDate = bData?.creationDate ? new Date(bData.creationDate).getTime() : 0
            return bDate - aDate
          })

          setReviews(sourceReviews)
        }
      } catch (err) {
        setError('Failed to fetch reviews')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [selectedSource])

  const formatFetchDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const getSourceUrl = (review: ReviewWithData) => {
    const reviewData = review.data as any
    return reviewData?.reviewUrl || reviewData?.publicationUrl || ''
  }

  const handleReviewClick = (review: ReviewWithData) => {
    const url = getSourceUrl(review)
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const getMovieTitle = (movieId: string) => {
    if (!movieId || !movies) return null
    console.log('Looking for movie with ID:', movieId, 'in movies:', movies.slice(0, 2))
    const movie = movies.find(m => (m.data as any)?.ems_id === movieId || m.ems_id === movieId)
    console.log('Found movie:', movie)
    return movie ? (movie.data as any)?.title : null
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {selectedSource ? `Reviews from ${selectedSource.domain}` : 'Select a source'}
        </h3>
      </div>

      {/* Content */}
      {!selectedSource ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4h10M7 8v10a2 2 0 002 2h6a2 2 0 002-2V8H7z" />
            </svg>
            <p>Select a source to view reviews</p>
          </div>
        </div>
      ) : (
        <>
          {/* Loading State */}
          {isLoading && (
            <div className="px-6 py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="px-6 py-4 text-center text-red-600">
              <p>Error loading reviews: {error}</p>
            </div>
          )}

          {/* Reviews List */}
          {!isLoading && !error && (
            <div className="flex-1 overflow-auto">
              {reviews.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  <p>No reviews found for this source</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-600">
                  {reviews.map((review) => {
                    const reviewData = review.data as any
                                        const isTopCritic = reviewData?.isTopCritic

                    return (
                      <div
                        key={review.review_id}
                        className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => handleReviewClick(review)}
                      >
                        <div className="flex items-center space-x-3">
                          {isTopCritic && (
                            <span className="text-yellow-500 dark:text-yellow-400 text-lg" title="Top Critic">☆</span>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-blue-700 dark:text-blue-300 font-semibold">
                                {getMovieTitle(review.movie_id) || `Movie ${review.movie_id}`}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                [{review.review_id?.toString().slice(-6) || 'N/A'}]
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                on {formatFetchDate(review.fetched_at)}
                              </span>
                              {reviewData?.criticName && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  by {reviewData.criticName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Footer stats */}
      {selectedSource && !isLoading && !error && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            {reviews.some(r => (r.data as any)?.isTopCritic) && (
              <span className="ml-2">
                • {reviews.filter(r => (r.data as any)?.isTopCritic).length} top critic{reviews.filter(r => (r.data as any)?.isTopCritic).length !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}