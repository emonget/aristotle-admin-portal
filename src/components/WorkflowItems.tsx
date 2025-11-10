import { useEffect, useState } from 'react'
import { getTableData } from '@/services/database'
import type { DatabaseRecord } from '@/types/database'
import type { MoviesWorkflowExecution, ReviewsWorkflowExecution } from '@/hooks/useWorkflowData'
import { WorkflowType } from '@/types/datamodel'

interface WorkflowItemsProps {
  selectedWorkflow?: MoviesWorkflowExecution | ReviewsWorkflowExecution
  workflowType: 'movies' | 'reviews'
}

export function WorkflowItems({ selectedWorkflow, workflowType }: WorkflowItemsProps) {
  const [items, setItems] = useState<DatabaseRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [movies, setMovies] = useState<DatabaseRecord[]>([])

  useEffect(() => {
    const fetchWorkflowItems = async () => {
      if (!selectedWorkflow) {
        setItems([])
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // First fetch movies for lookup
        const moviesResult = await getTableData('movies', {
          select: 'ems_id,title'
        })

        if (moviesResult.error) {
          console.error('❌ Error fetching movies:', moviesResult.error)
          setMovies([])
        } else {
          setMovies(moviesResult.data || [])
          console.log(`🔍 Loaded ${moviesResult.data?.length || 0} movies for title lookup`)
        }

        if (workflowType === 'movies') {
          // Movies workflows are straightforward - fetch directly by workflow_exec_ref
          const filters = { workflow_exec_ref: selectedWorkflow.id }
          const result = await getTableData(workflowType, { filters })

          if (result.error) {
            setError(result.error.message || 'Failed to fetch workflow items')
            setItems([])
          } else {
            setItems(result.data || [])
          }
        } else if (workflowType === 'reviews') {
          // Reviews workflows are more complex - need to fetch from sub-workflows
          // For reviews, the selectedWorkflow.id is the parent workflow execution ID
          // We need to find all sub-workflows spawned by this parent and get reviews from them

          console.log(`🔍 Fetching reviews for parent workflow: ${selectedWorkflow.id}`)
          console.log(`🔍 DEBUG: Selected workflow object:`, selectedWorkflow)

          // First, get all sub-workflow executions spawned by this parent
          const subWorkflowResult = await getTableData('workflow_executions', {
            filters: { workflow_type: WorkflowType.MovieReviews, parent_exec_ref: selectedWorkflow.id },
            select: 'id'
          })

          if (subWorkflowResult.error) {
            console.error('❌ Error fetching sub-workflows:', subWorkflowResult.error)
            setError(subWorkflowResult.error.message || 'Failed to fetch sub-workflows')
            setItems([])
            return
          }

          const subWorkflows = (subWorkflowResult.data as unknown as { id: string }[]) || []
          const subExecIds = subWorkflows.map(sw => sw.id)

          console.log(`🔍 Found ${subWorkflows.length} sub-workflows for parent ${selectedWorkflow.id}:`, subExecIds)

          if (subWorkflows.length === 0) {
            console.log('⚠️ No sub-workflows found for parent', selectedWorkflow.id)
            console.log(`🔍 DEBUG: Sub-workflow query result:`, subWorkflowResult)
          }

          // Fetch reviews for each sub-workflow
          const allReviews: DatabaseRecord[] = []

          for (const subExecId of subExecIds) {
            console.log(`🔍 Fetching reviews for sub-workflow: ${subExecId}`)
            const reviewsResult = await getTableData('reviews', {
              filters: { workflow_exec_ref: subExecId }
            })

            if (reviewsResult.error) {
              console.error(`❌ Error fetching reviews for sub-workflow ${subExecId}:`, reviewsResult.error)
              continue
            }

            const subReviews = reviewsResult.data as DatabaseRecord[] || []
            console.log(`🔍 Sub-workflow ${subExecId} has ${subReviews.length} reviews`)
            allReviews.push(...subReviews)
          }

          console.log(`🔍 Total reviews found for parent workflow ${selectedWorkflow.id}: ${allReviews.length}`)
          setItems(allReviews)
        }
      } catch (err) {
        console.error('Error fetching workflow items:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch workflow items')
        setItems([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkflowItems()
  }, [selectedWorkflow, workflowType])

  // Helper function to get movie title by ems_id
  const getMovieTitle = (movieId: string): string => {
    const movie = movies.find(m => m.ems_id === movieId)
    return movie?.title || (movieId ? `Movie ID: ${movieId}` : 'Unknown Movie')
  }

  if (!selectedWorkflow) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>Select a workflow execution to view items</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-2"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Loading items...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="px-6 text-center text-red-600">
          <p>Error loading items: {error}</p>
        </div>
      </div>
    )
  }

  if (workflowType === 'movies') {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Movies Added on {selectedWorkflow.runDate}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {items.length} of {(selectedWorkflow as MoviesWorkflowExecution).deltaMovies} movies added
          </p>
        </div>

        <div className="flex-1 overflow-auto">
          {items.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No movies were added during this workflow execution</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-600">
              {items.map((movie, index) => (
                <div key={movie.ems_id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {movie.title}
                      </h4>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-mono">{movie.ems_id}</span>
                        </p>
                        {movie.fetched_at && (
                          <p className="text-xs text-gray-500">
                            Fetched: {new Date(movie.fetched_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                      #{index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {items.length} movies from workflow execution
          </p>
        </div>
      </div>
    )
  }

  // Reviews workflow type
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Reviews Added on {selectedWorkflow.runDate}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {items.length} of {(selectedWorkflow as ReviewsWorkflowExecution).deltaReviews} reviews added
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        {items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No reviews were added during this workflow execution</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {items.map((review, index) => (
              <div key={review.review_id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Movie:</span> {getMovieTitle(review.movie_id) || (review.data as any)?.title || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span className="font-medium">Source:</span> {(review.data as any)?.publicationName ? (review.data as any).publicationName : ((review.data as any)?.reviewUrl || (review.data as any)?.publicationUrl ? (() => {
                          try {
                            const link = (review.data as any)?.reviewUrl || (review.data as any)?.publicationUrl;
                            return new URL(link).hostname;
                          } catch (e) {
                            return (review.data as any)?.reviewUrl || (review.data as any)?.publicationUrl;
                          }
                        })() : 'Unknown')}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                      #{index + 1}
                    </div>
                  </div>

                  {review.content && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                        "{review.content.substring(0, 300)}{review.content.length > 300 ? '...' : ''}"
                      </p>
                    </div>
                  )}

                  {(review.reviewUrl || review.publicationUrl) && (
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      <a
                        href={review.reviewUrl || review.publicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {review.reviewUrl || review.publicationUrl}
                      </a>
                    </div>
                  )}

                  {review.created_at && (
                    <div className="text-xs text-gray-500">
                      Added: {new Date(review.created_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {items.length} reviews from workflow execution
        </p>
      </div>
    </div>
  )
}