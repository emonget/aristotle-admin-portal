import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTableData } from '@/services/database'
import type { DatabaseRecord } from '@/types/database'

interface ReviewSource {
  domain: string
  publicationName?: string
  count: number
}

type ReviewItem = DatabaseRecord & {
  review_id: string
  data: any
  fetched_at: string
  movie_id: string
}

interface ReviewsListProps {
  selectedMovie?: DatabaseRecord | null
  selectedSource?: ReviewSource | null
  displayMode?: 'movie' | 'source' // 'movie' shows movie title, 'source' shows domain
  showHeader?: boolean
}

export function ReviewsList({ 
  selectedMovie, 
  selectedSource, 
  displayMode = 'movie',
  showHeader = true
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [movies, setMovies] = useState<DatabaseRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // Load movies data on mount for movie name lookups when in movie mode
  useEffect(() => {
    if (displayMode === 'movie') {
      const fetchMovies = async () => {
        const result = await getTableData('movies')
        if (result.data) {
          setMovies(result.data)
        }
      }
      fetchMovies()
    }
  }, [displayMode])

  useEffect(() => {
    const fetchReviews = async () => {
      // Check if we have valid selection based on display mode
      if (displayMode === 'movie' && !selectedMovie?.ems_id) {
        setReviews([])
        return
      }
      if (displayMode === 'source' && !selectedSource?.domain) {
        setReviews([])
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Fetch reviews for the selected item
        const result = await getTableData('reviews')
        if (result.error) {
          setError(result.error.message)
        } else {
          let filteredReviews: DatabaseRecord[] = []

          if (displayMode === 'movie') {
            // Filter reviews by movie_id
            filteredReviews = (result.data || []).filter(
              (review: DatabaseRecord) => review.movie_id === selectedMovie!.ems_id
            )
          } else {
            // Filter reviews by domain (with safe URL parsing)
            filteredReviews = (result.data || []).filter(
              (review: DatabaseRecord) => {
                try {
                  const reviewData = review.data as any
                  const reviewUrl = reviewData?.reviewUrl || reviewData?.publicationUrl
                  if (reviewUrl && typeof reviewUrl === 'string') {
                    const urlObj = new URL(reviewUrl)
                    const domain = urlObj.hostname.replace(/^www\./, '')
                    return domain === selectedSource!.domain
                  }
                  return false
                } catch (urlError) {
                  // Skip malformed URLs instead of crashing
                  return false
                }
              }
            )
          }

          // Sort by isTopCritic (top critics first) then by creation date (most recent first)
          filteredReviews.sort((a: DatabaseRecord, b: DatabaseRecord) => {
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

          setReviews(filteredReviews as ReviewItem[])
        }
      } catch (err) {
        setError('Failed to fetch reviews')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [selectedMovie, selectedSource, displayMode])

  const formatFetchDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const getSourceUrl = (review: ReviewItem) => {
    const reviewData = review.data as any
    return reviewData?.reviewUrl || reviewData?.publicationUrl || ''
  }

  const extractDomain = (url: string) => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname
    } catch {
      return url
    }
  }

  const handleReviewClick = (review: ReviewItem) => {
    const sourceUrl = getSourceUrl(review)
    if (sourceUrl) {
      window.open(sourceUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const getMovieTitle = (movieId: string) => {
    if (!movieId || !movies) return null
    console.log('Looking for movie with ID:', movieId, 'in movies:', movies.slice(0, 2))
    const movie = movies.find(m => (m.data as any)?.ems_id === movieId || m.ems_id === movieId)
    console.log('Found movie:', movie)
    return movie ? (movie.data as any)?.title : null
  }

  const getItemTitle = (review: ReviewItem) => {
    if (displayMode === 'movie') {
      // When viewing reviews for a movie, show the source domain
      const sourceUrl = getSourceUrl(review)
      return extractDomain(sourceUrl)
    } else {
      // When viewing reviews for a source, show the movie name
      return getMovieTitle(review.movie_id) || `Movie ${review.movie_id}`
    }
  }

  const getHeaderTitle = () => {
    if (displayMode === 'movie') {
      return selectedMovie ? `Reviews for ${(selectedMovie.data as any)?.title || 'Selected Movie'}` : 'Select a movie'
    } else {
      return selectedSource ? `Reviews from ${selectedSource.domain}` : 'Select a source'
    }
  }

  const getEmptyStateMessage = () => {
    if (displayMode === 'movie') {
      return selectedMovie ? 'No reviews found for this movie' : 'Select a movie to view reviews'
    } else {
      return selectedSource ? 'No reviews found for this source' : 'Select a source to view reviews'
    }
  }

  const hasSelection = (displayMode === 'movie' && selectedMovie) || (displayMode === 'source' && selectedSource)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      {showHeader && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {getHeaderTitle()}
          </h3>
        </div>
      )}

      {/* Content */}
      {!hasSelection ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4h10M7 8v10a2 2 0 002 2h6a2 2 0 002-2V8H7z" />
            </svg>
            <p>{getEmptyStateMessage()}</p>
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
                  <p>{getEmptyStateMessage()}</p>
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
                        <div className="flex items-start space-x-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                              {isTopCritic && (
                                <span className="text-yellow-500 dark:text-yellow-400 text-lg" title="Top Critic">☆</span>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className={`text-sm font-medium font-semibold ${
                                    displayMode === 'source' 
                                      ? 'text-blue-700 dark:text-blue-300' 
                                      : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'
                                  }`}>
                                    {getItemTitle(review)}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    ID: {review.review_id}
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
                          <div className="flex flex-row space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(review.review_id?.toString() || '');
                              }}
                              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                              title="Copy review ID"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <span>Copy ID</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const sourceUrl = getSourceUrl(review);
                                if (sourceUrl) {
                                  window.open(sourceUrl, '_blank', 'noopener,noreferrer');
                                }
                              }}
                              className="flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                              title="Open original review"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              <span>Open</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/capture/${review.review_id}`);
                              }}
                              className="flex items-center space-x-1 px-2 py-1 text-xs text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded transition-colors"
                              title="View review content"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>View</span>
                            </button>
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
      {hasSelection && !isLoading && !error && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''} found
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