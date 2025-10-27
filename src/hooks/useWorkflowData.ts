import { useState, useEffect } from 'react'
import { getTableData } from '@/services/database'

interface WorkflowExecutionRecord {
  exec_id: string
  workflow_id: string
  timestamp: string
  metadata?: any
}

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
      const workflowResult = await getTableData('workflow_executions', {
        filters: { workflow_id: 'eTbtW2WLgxa6ZqXS' }, // Corrected workflow_id from debug output
        orderBy: 'timestamp',
        ascending: true
      })

      console.log('🎬 Movie workflow executions result:', workflowResult)

      if (workflowResult.error) {
        throw new Error(workflowResult.error.message || 'Failed to fetch workflow executions')
      }

      const executionsData = workflowResult.data as WorkflowExecutionRecord[] || []

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
        const execId = exec.exec_id
        const runDate = new Date(exec.timestamp).toISOString().split('T')[0] // Extract date part

        // Count movies for this execution
        const moviesResult = await getTableData('movies', {
          filters: { workflow_exec_id: execId },
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

      // Get ALL workflow executions to identify which ones are parent reviews workflows
      const workflowResult = await getTableData('workflow_executions', {
        orderBy: 'timestamp',
        ascending: true
      })

      // Filter for reviews-related workflows (WF065Cx7idbo2R9C) that are parent workflows (no parent_exec_id)
      // NOTE: WF065Cx7idbo2R9C executions that have parent_exec_id are actually sub-workflows
      // The parent reviews workflows are the ones with null parent_exec_id

      if (workflowResult.error) {
        throw new Error(workflowResult.error.message || 'Failed to fetch workflow executions')
      }

      const executionsData = workflowResult.data as WorkflowExecutionRecord[] || []

      // Filter for reviews workflow executions only
      const reviewsWorkflowExecutions = executionsData.filter(exec => exec.workflow_id === 'WF065Cx7idbo2R9C')

      // Filter out sub-workflows - only keep parent workflow executions
      // Parent workflows have null parent_exec_id, sub-workflows have non-null parent_exec_id
      const parentWorkflows = reviewsWorkflowExecutions.filter(exec => !exec.parent_exec_id)

      console.log(`🔍 DEBUG: All executions: ${executionsData.length}`)
      console.log(`🔍 DEBUG: Reviews workflow executions: ${reviewsWorkflowExecutions.length}`)
      console.log(`🔍 DEBUG: Parent reviews workflows: ${parentWorkflows.length}`)
      parentWorkflows.forEach((exec, i) => {
        console.log(`🔍 DEBUG: Parent ${i+1}: ${exec.exec_id} at ${exec.timestamp} (${exec.workflow_id})`)
      })

      if (parentWorkflows.length === 0) {
        console.log('⚠️ No parent reviews workflows found!')
        setExecutions([])
        return
      }

      // For each parent execution, get the count of reviews created
      const reviewsWorkflowData: ReviewsWorkflowExecution[] = []
      let runningTotal = 0

      for (let i = 0; i < parentWorkflows.length; i++) {
        const exec = parentWorkflows[i]
        const execId = exec.exec_id
        const runDate = new Date(exec.timestamp).toISOString().split('T')[0]

        console.log(`🔍 DEBUG: Processing parent workflow ${execId}`)

        // Count reviews for this parent execution (includes sub-workflows)
        // Get all sub-workflow executions spawned by this parent execId
        console.log(`🔍 DEBUG: Fetching sub-workflows for parent ${execId} (workflow_id: 'cPANQaWH3eoCy3FZ', parent_exec_id: ${execId})`)
        const subWorkflowResult = await getTableData('workflow_executions', {
          filters: { workflow_id: 'cPANQaWH3eoCy3FZ', parent_exec_id: execId },
          select: 'exec_id'
        })

        if (subWorkflowResult.error) {
          console.error(`❌ Error fetching sub-workflows for parent ${execId}:`, JSON.stringify(subWorkflowResult.error, null, 2))
          continue
        }

        if (!subWorkflowResult.data || !Array.isArray(subWorkflowResult.data)) {
          console.warn(`⚠️ Unexpected response for parent ${execId}:`, JSON.stringify(subWorkflowResult, null, 2))
          continue
        }

        const subWorkflows = subWorkflowResult.data as { exec_id: string }[] || []
        const subExecIds = subWorkflows.map(sw => sw.exec_id)

        console.log(`🔍 DEBUG: Found ${subWorkflows.length} sub-workflows for parent ${execId}:`, subExecIds)

        // Count reviews from all sub-workflows spawned by this parent
        let reviewsCount = 0
        for (const subExecId of subExecIds) {
          console.log(`🔍 DEBUG: Fetching reviews for sub-workflow ${subExecId}`)
          const reviewsResult = await getTableData('reviews', {
            filters: { workflow_exec_id: subExecId },
            select: 'review_id'
          })

          if (reviewsResult.error) {
            console.error(`❌ Error fetching reviews for sub-workflow ${subExecId}:`, reviewsResult.error)
            continue
          }

          const subReviewCount = reviewsResult.data?.length || 0
          console.log(`🔍 DEBUG: Sub-workflow ${subExecId} has ${subReviewCount} reviews`)
          reviewsCount += subReviewCount
        }

        console.log(`🔍 DEBUG: Parent ${execId} total reviews: ${reviewsCount}`)

        if (reviewsCount > 0) {
          const previousTotal = runningTotal
          runningTotal += reviewsCount
          const delta = runningTotal - previousTotal

              console.log(`📊 Adding reviews workflow data for ${execId}: delta=${delta}, total=${runningTotal}`)

          reviewsWorkflowData.push({
            id: execId,
            runDate,
            totalReviews: runningTotal,
            deltaReviews: delta
          })
        } else {
          console.log(`⚠️ Skipping ${execId} - no reviews found`)
        }
      }

      console.log(`🔍 DEBUG: Final reviews workflow data summary: ${reviewsWorkflowData.length} executions with reviews out of ${parentWorkflows.length} total parent workflows`)

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