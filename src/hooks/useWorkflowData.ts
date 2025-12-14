import { useState, useEffect } from 'react'
import { getTableData } from '@/services/database'
import type { Database } from '@/types/database'
import { WorkflowType } from '@/types/datamodel'

type WorkflowExecutionRecord = Database['public']['Tables']['batches']['Row']

export interface MoviesWorkflowExecution {
  id: string
  runDate: string
  totalMovies: number
  deltaMovies: number
}

export interface ReviewsWorkflowExecution {
  id: string
  runDate: string
  totalReviews: number
  deltaReviews: number
}

interface WorkflowDataHook<T> {
  executions: T[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useMoviesWorkflowData(): WorkflowDataHook<MoviesWorkflowExecution> {
  const [executions, setExecutions] = useState<MoviesWorkflowExecution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMoviesWorkflowData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🎬 FETCHING MOVIES WORKFLOW DATA...')

      // Get workflow executions for movies workflow
      const workflowResult = await getTableData<WorkflowExecutionRecord>('batches', {
        filters: { workflow_type: WorkflowType.Movies },
        orderBy: 'timestamp',
        ascending: true
      })

      console.log('🎬 Movie workflow executions result:', workflowResult)

      if (workflowResult.error) {
        throw new Error(workflowResult.error.message || 'Failed to fetch workflow executions')
      }

      const executionsData = workflowResult.data || []

      if (executionsData.length === 0) {
        setExecutions([])
        return
      }

      // For each execution, get the count of movies created (can't efficiently compute running totals/deltas without additional aggregation tables)
      // For now, we'll compute cumulative totals and deltas from the available data
      const moviesWorkflowData: MoviesWorkflowExecution[] = []
      let runningTotal = 0

      for (let i = 0; i < executionsData.length; i++) {
        const exec = executionsData[i]
        const execId = exec.id
        const runDate = new Date(exec.timestamp).toISOString().split('T')[0] // Extract date part

        // Count movies for this execution
        const moviesResult = await getTableData<{ ems_id: string }>('movies', {
          filters: { workflow_exec_ref: execId },
          select: 'ems_id'
        })

        const moviesCount = moviesResult.data?.length || 0

        if (moviesCount > 0) {
          const previousTotal = runningTotal
          runningTotal += moviesCount
          const delta = runningTotal - previousTotal

          moviesWorkflowData.push({
            id: execId,
            runDate,
            totalMovies: runningTotal,
            deltaMovies: delta
          })
        }
      }

      setExecutions(moviesWorkflowData)

    } catch (err) {
      console.error('Error fetching movies workflow data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch workflow data')
      setExecutions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMoviesWorkflowData()
  }, [])

  return {
    executions,
    loading,
    error,
    refetch: fetchMoviesWorkflowData
  }
}

export function useReviewsWorkflowData(): WorkflowDataHook<ReviewsWorkflowExecution> {
  const [executions, setExecutions] = useState<ReviewsWorkflowExecution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReviewsWorkflowData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 FETCHING REVIEWS WORKFLOW EXECUTIONS...')

      // Get ALL workflow executions to identify parent reviews workflows
      const workflowResult = await getTableData<WorkflowExecutionRecord>('batches', {
        filters: { workflow_type: WorkflowType.Reviews },
        orderBy: 'timestamp',
        ascending: true
      })

      if (workflowResult.error) {
        throw new Error(workflowResult.error.message || 'Failed to fetch workflow executions')
      }

      const executionsData = workflowResult.data || []

      // Filter out sub-workflows - only keep parent workflow executions (no parent_exec_ref)
      const parentWorkflows = executionsData.filter(exec => !exec.parent_exec_ref)

      console.log(`🔍 DEBUG: All executions: ${executionsData.length}`)
      console.log(`🔍 DEBUG: Parent reviews workflows: ${parentWorkflows.length}`)

      if (parentWorkflows.length === 0) {
        console.log('⚠️ No parent reviews workflows found!')
        setExecutions([])
        return
      }

      // Create simplified workflow executions - counting will be done on-demand when a workflow is selected
      const reviewsWorkflowData: ReviewsWorkflowExecution[] = parentWorkflows.map(exec => ({
        id: exec.id,
        runDate: new Date(exec.timestamp).toISOString().split('T')[0],
        totalReviews: 0, // Placeholder - will be calculated when needed
        deltaReviews: 0  // Placeholder - will be calculated when needed
      }))

      console.log(`🔍 DEBUG: Created ${reviewsWorkflowData.length} parent reviews workflow executions`)

      setExecutions(reviewsWorkflowData)

    } catch (err) {
      console.error('Error fetching reviews workflow data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch workflow data')
      setExecutions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviewsWorkflowData()
  }, [])

  return {
    executions,
    loading,
    error,
    refetch: fetchReviewsWorkflowData
  }
}