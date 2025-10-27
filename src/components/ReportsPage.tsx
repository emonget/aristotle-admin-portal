import { FileText } from 'lucide-react'

export function ReportsPage() {
  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <FileText className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Reports
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            Generated reports and analytics exports - coming soon...
          </p>
        </div>
      </div>
    </div>
  )
}