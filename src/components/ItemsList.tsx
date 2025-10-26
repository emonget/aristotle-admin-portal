import React, { useState, useEffect } from 'react'
import { MoviesList } from './MoviesList'
import { ReviewsFromSource } from './ReviewsFromSource'
import { getTableData } from '@/services/database'
import type { DatabaseRecord } from '@/types/database'

interface ReviewSource {
  domain: string
  publicationName?: string
  count: number
}

interface ItemsListProps {
  isLoading: boolean
  error: string | null
  itemsSelector: 'movies' | 'sources'
  movies?: DatabaseRecord[]
  onMovieSelect?: (movie: DatabaseRecord) => void
  selectedMovieId?: string
  onSourceSelect?: (source: ReviewSource) => void
  selectedSourceId?: string
}

export function ItemsList({ isLoading, error, itemsSelector, movies, onMovieSelect, selectedMovieId, onSourceSelect, selectedSourceId }: ItemsListProps) {
  const [sources, setSources] = useState<ReviewSource[]>([])
  const [totalReviews, setTotalReviews] = useState<number>(0)
  const [totalUniqueSources, setTotalUniqueSources] = useState<number>(0)

  useEffect(() => {
    const fetchReviewsCount = async () => {
      if (itemsSelector !== 'movies') return

      try {
        const result = await getTableData('reviews')
        if (result.data) {
          setTotalReviews(result.data.length)
        }
      } catch (err) {
        console.error('Failed to fetch reviews count:', err)
        setTotalReviews(0)
      }
    }

    const fetchSources = async () => {
      if (itemsSelector !== 'sources') return

      try {
        const result = await getTableData('reviews')
        if (result.data) {
          setTotalReviews(result.data.length) // Also update total reviews for sources view

          const domainCount = new Map<string, { count: number, publicationName: string }>()

          result.data.forEach((review: DatabaseRecord) => {
            const reviewData = review.data
            const reviewUrl = reviewData.reviewUrl || reviewData.publicationUrl
            if (reviewUrl) {
              try {
                const urlObj = new URL(reviewUrl)
                const domain = urlObj.hostname.replace(/^www\./, '')
                const existing = domainCount.get(domain)
                if (existing) {
                  existing.count += 1
                  if (reviewData.publicationName && !existing.publicationName) {
                    existing.publicationName = reviewData.publicationName
                  }
                } else {
                  domainCount.set(domain, {
                    count: 1,
                    publicationName: reviewData.publicationName || ''
                  })
                }
              } catch (err) {
                // Skip malformed URLs
              }
            }
          })

          // Set total unique sources count
          setTotalUniqueSources(domainCount.size)

          const sourceData = Array.from(domainCount.entries())
            .map(([domain, { count, publicationName }]) => ({
              domain,
              publicationName,
              count
            }))
            .sort((a, b) => b.count - a.count)

          setSources(sourceData.slice(0, 100)) // Display top 100 sources
        }
      } catch (err) {
        console.error('Failed to fetch sources:', err)
      }
    }

    fetchReviewsCount()
    fetchSources()
  }, [itemsSelector])

  if (itemsSelector === 'movies') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-auto">
          <MoviesList
            movies={movies || []}
            isLoading={isLoading}
            error={error}
            onMovieSelect={onMovieSelect}
            selectedMovieId={selectedMovieId}
          />
        </div>

        {/* Footer - Movies Statistics */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex-shrink-0">
          {!isLoading && !error && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total movies: {movies?.length || 0} • Total reviews: {totalReviews}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (itemsSelector === 'sources') {
    const maxCount = sources.length > 0 ? sources[0]?.count || 1 : 1

    return (
      <div className="h-full flex flex-col">
        {/* Content */}
        <div className="flex-1 overflow-auto">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Loading sources...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="px-6 py-4 text-center text-red-600">
              <p>Error loading sources: {error}</p>
            </div>
          )}

          {!isLoading && !error && sources.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p>No sources found</p>
              </div>
            </div>
          )}

          {!isLoading && !error && sources.length > 0 && (
            <div className="space-y-3">
              {sources.map((source: ReviewSource, index: number) => (
                <div
                  key={source.domain}
                  className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                    selectedSourceId === source.domain
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => onSourceSelect && onSourceSelect(source)}
                >
                  <div className="w-8 text-sm font-mono text-gray-500 flex-shrink-0">
                    {index + 1}.
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-medium ${
                        selectedSourceId === source.domain
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {source.domain}
                      </span>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {source.count} reviews
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          selectedSourceId === source.domain
                            ? 'bg-blue-700'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${(source.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && !error && sources.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex-shrink-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total sources {totalUniqueSources} • Total reviews: {totalReviews}
            </p>
          </div>
        )}
      </div>
    )
  }

  return null
}