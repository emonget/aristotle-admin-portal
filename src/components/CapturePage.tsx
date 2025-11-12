import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReviewSelection } from '@/hooks/useReviewSelection'
import { SearchComponent } from './SearchComponent'
import type { DatabaseRecord } from '@/types/database'

type ReviewItem = DatabaseRecord & {
  review_id: string
  data: any
  fetched_at: string
  movie_id: string
}

export function CapturePage() {
  // const { review_id } = useParams<{ review_id: string }>()
  const navigate = useNavigate()

  const {
    movies,
    sources,
    allReviews,
    selectedMovie,
    selectedSource,
    handleMovieSelect,
    handleSourceSelect,
  } = useReviewSelection()

  const onReviewSelect = (review: ReviewItem) => {
    if (review && review.review_id) {
      navigate(`/capture/${review.review_id}`)
    }
  }

  const reviewsForSelectedItem = useMemo(() => {
    if (selectedMovie) {
      return allReviews.filter(
        (review) => review.movie_id === selectedMovie.ems_id
      ) as ReviewItem[]
    }
    if (selectedSource) {
      return allReviews.filter((review) => {
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
          return false
        }
      }) as ReviewItem[]
    }
    return []
  }, [allReviews, selectedMovie, selectedSource])

  const reviewsCountForAllMovies = useMemo(() => {
    const countMap: { [key: string]: number } = {}
    allReviews.forEach((review) => {
      const movieId = review.movie_id as string
      if (movieId) {
        countMap[movieId] = (countMap[movieId] || 0) + 1
      }
    })
    return countMap
  }, [allReviews])

  // const movieTitle = (reviewDetails as any)?.movies?.title || 'Loading...'

  // const extractDomain = (url: string) => {
  //   try {
  //     const urlObj = new URL(url)
  //     return urlObj.hostname.replace(/^www\./, '')
  //   } catch {
  //     return url
  //   }
  // }

  // const reviewSource = review_id ? extractDomain(reviewDetails?.data?.reviewUrl || reviewDetails?.data?.publicationUrl || '') : ''

  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <div className="max-w-4xl w-full">
          <SearchComponent
            movies={movies}
            sources={sources}
            onMovieSelect={handleMovieSelect}
            onSourceSelect={handleSourceSelect}
            reviewsCount={reviewsCountForAllMovies}
          />
        </div>
      </div>
      
      { (selectedMovie || selectedSource) && (
        <div className="flex-1 flex flex-col px-4 pb-4 overflow-hidden">
          <div className="max-w-4xl w-full h-full flex flex-col border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="flex-1 overflow-y-auto">
              {reviewsForSelectedItem.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-600">
                  {reviewsForSelectedItem.map((review) => (
                    <div
                        key={review.review_id}
                        onClick={() => onReviewSelect(review)}
                        className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {review.data?.criticName || 'Unknown Critic'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {review.review_id}
                        </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                    <p>No reviews found for the selected item.</p>
                </div>
              )}
            </div>
            
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {reviewsForSelectedItem.length} review{reviewsForSelectedItem.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
