import { useState, useEffect } from 'react'
import { getTableData } from '@/services/database'
import type { DatabaseRecord } from '@/types/database'

export interface ReviewSource {
  domain: string
  publicationName?: string
  count: number
}

export function useReviewSelection() {
  const [movies, setMovies] = useState<DatabaseRecord[]>([])
  const [sources, setSources] = useState<ReviewSource[]>([])
  const [allReviews, setAllReviews] = useState<DatabaseRecord[]>([])
  const [selectedMovie, setSelectedMovie] = useState<DatabaseRecord | null>(null)
  const [selectedSource, setSelectedSource] = useState<ReviewSource | null>(null)
  const [itemsSelector, setItemsSelector] = useState<'movies' | 'sources'>('movies')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [moviesResult, reviewsResult] = await Promise.all([
          getTableData('movies'),
          getTableData('reviews'),
        ])

        if (moviesResult.error) {
          setError(moviesResult.error.message)
        } else {
          setMovies(moviesResult.data || [])
        }

        if (reviewsResult.error) {
          setError(reviewsResult.error.message)
        } else {
          setAllReviews(reviewsResult.data || [])
          const domainCount = new Map<string, { count: number, publicationName: string }>()
          reviewsResult.data?.forEach((review: DatabaseRecord) => {
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
                    publicationName: reviewData.publicationName || '',
                  })
                }
              } catch (err) {
                // Skip malformed URLs
              }
            }
          })

          const sourceData = Array.from(domainCount.entries())
            .map(([domain, { count, publicationName }]) => ({
              domain,
              publicationName,
              count,
            }))
            .sort((a, b) => b.count - a.count)
          setSources(sourceData)
        }
      } catch (err) {
        setError('Failed to fetch data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleMovieSelect = (movie: DatabaseRecord) => {
    setSelectedMovie(movie)
    setSelectedSource(null) // Clear source selection when selecting movie
  }

  const handleSourceSelect = (source: ReviewSource) => {
    setSelectedSource(source)
    setSelectedMovie(null) // Clear movie selection when selecting source
  }

  const handleSelectionChange = (selection: 'movies' | 'sources') => {
    setItemsSelector(selection)
    setSelectedMovie(null) // Clear selections when switching context
    setSelectedSource(null)
  }

  return {
    movies,
    sources,
    allReviews,
    selectedMovie,
    selectedSource,
    itemsSelector,
    isLoading,
    error,
    handleMovieSelect,
    handleSourceSelect,
    handleSelectionChange,
  }
}
