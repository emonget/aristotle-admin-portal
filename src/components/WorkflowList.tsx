
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

interface WorkflowListProps {
  workflows: MoviesWorkflowExecution[] | ReviewsWorkflowExecution[]
  selectedWorkflowId?: string
  onWorkflowSelect: (workflow: MoviesWorkflowExecution | ReviewsWorkflowExecution) => void
  workflowType: 'movies' | 'reviews'
  isLoading: boolean
  error: string | null
}

export function WorkflowList({ workflows, selectedWorkflowId, onWorkflowSelect, workflowType, isLoading, error }: WorkflowListProps) {
  const getDelta = (w: MoviesWorkflowExecution | ReviewsWorkflowExecution): number =>
    'deltaMovies' in w ? w.deltaMovies : (w as ReviewsWorkflowExecution).deltaReviews

  const totalItems = workflows.reduce((sum, workflow) => sum + getDelta(workflow), 0)
  const totalExecutions = workflows.length
  const maxDelta = workflows.length > 0 ? Math.max(...workflows.map(w => getDelta(w))) : 1

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Loading workflows...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="px-6 text-center text-red-600">
            <p>Error loading workflows: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (workflows.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p>No workflows executed</p>
          </div>
        </div>

        {/* Footer - Statistics */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex-shrink-0">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total workflows: 0 • Total {workflowType}: 0
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-3">
          {workflows.map((workflow, index) => (
            <div
              key={workflow.id}
              className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                selectedWorkflowId === workflow.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => onWorkflowSelect(workflow)}
            >
              <div className="w-8 text-sm font-mono text-gray-500 flex-shrink-0">
                {index + 1}.
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <span className={`font-medium ${
                      selectedWorkflowId === workflow.id
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {workflow.runDate}
                    </span>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Execution: {workflow.id}
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${
                    selectedWorkflowId === workflow.id
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    +{getDelta(workflow)} {workflowType}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      selectedWorkflowId === workflow.id
                        ? 'bg-blue-700'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${(getDelta(workflow) / maxDelta) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer - Statistics */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex-shrink-0">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Total workflows: {totalExecutions} • Total {workflowType}: {totalItems}
        </p>
      </div>
    </div>
  )
}