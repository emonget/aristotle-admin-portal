import { useState, useEffect } from 'react'
import { getTableData } from '@/services/database'
import type { DatabaseRecord } from '@/types/database'
import { ReviewsFromSource } from './ReviewsFromSource'

interface ReviewSource {
  domain: string
  publicationName?: string
  count: number
}

export function AnalyticsPage() {
  const [sources, setSources] = useState<ReviewSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalUniqueSources, setTotalUniqueSources] = useState(0)
  const [totalReviewCount, setTotalReviewCount] = useState(0)
  const [selectedSource, setSelectedSource] = useState<ReviewSource | null>(null)

  const extractDomain = (url: string) => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace(/^www\./, '')
    } catch {
      return url
    }
  }

  useEffect(() => {
    const fetchReviewData = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await getTableData('reviews', {
          select: 'data'
        })

        if (result.error) {
          throw result.error
        }

        const reviews = result.data || []
        const domainCount = new Map<string, { count: number, publicationName: string }>()

        reviews.forEach((review: DatabaseRecord) => {
          const reviewData = review.data
          const reviewUrl = reviewData.reviewUrl || reviewData.publicationUrl
          if (reviewUrl) {
            const domain = extractDomain(reviewUrl)
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
          }
        })

        const allSourceData = Array.from(domainCount.entries())
          .map(([domain, { count, publicationName }]) => ({
            domain,
            publicationName,
            count
          }))
          .sort((a, b) => b.count - a.count)

        const sourceData = allSourceData.slice(0, 100) // Display top 100 sources
        const allSourcesCount = allSourceData.length // All unique sources found
        const totalReviewCount = allSourceData.reduce((sum, source) => sum + source.count, 0) // Total reviews from all sources

        setSources(sourceData)
        setTotalUniqueSources(allSourcesCount)
        setTotalReviewCount(totalReviewCount)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch review data')
      } finally {
        setLoading(false)
      }
    }

    fetchReviewData()
  }, [])

  const maxCount = sources.length > 0 ? sources[0]?.count || 1 : 1


  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow flex">
      {/* Analytics Panel - Left Half */}
      <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-600">
        {/* Header - Fixed */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            Review Sources Analytics
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Analysis of review sources by URL domains
          </p>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-auto p-6">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-red-600">
              <p>Error loading analytics: {error}</p>
            </div>
          </div>
        )}

        {!loading && !error && sources.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p>No reviews found</p>
            </div>
          </div>
        )}

        {!loading && !error && sources.length > 0 && (
          <div className="space-y-3">
            {sources.map((source: ReviewSource, index: number) => (
              <div
                key={source.domain}
                className={`flex items-center space-x-4 p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                  selectedSource?.domain === source.domain
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setSelectedSource(source)}
              >
                <div className="w-8 text-sm font-mono text-gray-500 flex-shrink-0">
                  {index + 1}.
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-medium ${
                      selectedSource?.domain === source.domain
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {source.publicationName || source.domain}
                    </span>
                    <span className="text-sm text-gray-500">
                      {source.publicationName ? source.domain : ''}
                    </span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {source.count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        selectedSource?.domain === source.domain
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

        {/* Footer - Fixed */}
        {!loading && !error && sources.length === 0 && (
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total sources: {totalUniqueSources} • Total reviews: {totalReviewCount}
            </p>
          </div>
        )}
      </div>

      {/* Reviews Panel - Right Half */}
      <div className="flex-1">
        <ReviewsFromSource selectedSource={selectedSource} />
      </div>
    </div>
  )
}