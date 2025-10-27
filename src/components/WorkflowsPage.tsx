import React, { useState } from 'react'
import { useMoviesWorkflowData, useReviewsWorkflowData } from '@/hooks/useWorkflowData'
import { WorkflowViewSelector } from './WorkflowViewSelector'
import { WorkflowList } from './WorkflowList'
import { WorkflowItems } from './WorkflowItems'

interface MoviesWorkflowExecution {
  id: string
  runDate: string
  totalMovies: number
  deltaMovies: number
}

interface ReviewsWorkflowExecution {
  id: string
  runDate: string
  totalReviews: number
  deltaReviews: number
}

type SelectedWorkflow = MoviesWorkflowExecution | ReviewsWorkflowExecution | null

export function WorkflowsPage() {
  const { executions: moviesExecutions, loading: moviesLoading, error: moviesError } = useMoviesWorkflowData()
  const { executions: reviewsExecutions, loading: reviewsLoading, error: reviewsError } = useReviewsWorkflowData()

  const [workflowSelector, setWorkflowSelector] = useState<'movies' | 'reviews'>('movies')
  const [selectedWorkflow, setSelectedWorkflow] = useState<SelectedWorkflow>(null)

  // Log workflow data results
  if (!moviesLoading && moviesExecutions.length > 0) {
    console.log('📊 Movies workflow data:', moviesExecutions)
    console.log(`🎬 Total movies workflow executions: ${moviesExecutions.length}`)
  }

  if (!reviewsLoading && reviewsExecutions.length > 0) {
    console.log('📊 Reviews workflow data:', reviewsExecutions)
    console.log(`🔍 Total reviews workflow executions: ${reviewsExecutions.length}`)
  }

  if (moviesError) {
    console.error('❌ Movies workflow error:', moviesError)
  }

  if (reviewsError) {
    console.error('❌ Reviews workflow error:', reviewsError)
  }

  const handleWorkflowSelector = (selection: 'movies' | 'reviews') => {
    setWorkflowSelector(selection)
    setSelectedWorkflow(null) // Clear selection when switching tabs
  }

  const handleWorkflowSelect = (workflow: MoviesWorkflowExecution | ReviewsWorkflowExecution) => {
    setSelectedWorkflow(workflow)
  }

  const currentWorkflows = workflowSelector === 'movies' ? moviesExecutions : reviewsExecutions
  const currentLoading = workflowSelector === 'movies' ? moviesLoading : reviewsLoading
  const currentError = workflowSelector === 'movies' ? moviesError : reviewsError

  return (
    <div className="h-full relative">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Workflows Column */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col">
          <div className="p-4">
            <WorkflowViewSelector
              workflowSelector={workflowSelector}
              onSelectionChange={handleWorkflowSelector}
            />
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <WorkflowList
              workflows={currentWorkflows}
              selectedWorkflowId={selectedWorkflow?.id}
              onWorkflowSelect={handleWorkflowSelect}
              workflowType={workflowSelector}
              isLoading={currentLoading}
              error={currentError}
            />
          </div>
        </div>

        {/* Items Column */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden lg:flex-1 max-h-full">
          <WorkflowItems
            selectedWorkflow={selectedWorkflow}
            workflowType={workflowSelector}
          />
        </div>
      </div>
    </div>
  )
}