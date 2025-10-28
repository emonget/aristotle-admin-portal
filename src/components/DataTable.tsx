import { useState, useEffect } from 'react'
import { getTableData, getTableStructure, type QueryResult } from '@/services/database'
import type { DatabaseRecord } from '@/types/database'

interface DataTableProps {
  tableName: string
}

export function DataTable({ tableName }: DataTableProps) {
  const [result, setResult] = useState<QueryResult>({ data: null, error: null, isLoading: true })
  const [columns, setColumns] = useState<string[]>([])
  const [connectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Test connection on mount
  // useEffect(() => {
  //   const testConn = async () => {
  //     const statusResult = await testConnection()
  //     setConnectionStatus(statusResult.error ? 'failed' : 'connected')
  //   }
  //   testConn()
  // }, [])

  // Fetch table data and structure when tableName changes
  useEffect(() => {
    const fetchData = async () => {
      setResult({ data: null, error: null, isLoading: true })

      // Get table structure
      const tableColumns = await getTableStructure(tableName)
      setColumns(tableColumns)

      // Get table data
      const dataResult = await getTableData(tableName)
      setResult(dataResult)
    }

    if (tableName) {
      fetchData()
    }
  }, [tableName, refreshTrigger])

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const renderCellValue = (value: any): string => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'boolean') return value ? '✓' : '✗'
    if (typeof value === 'object') return JSON.stringify(value)
    if (typeof value === 'string' && value.length > 50) return value.substring(0, 47) + '...'
    return String(value)
  }

  if (connectionStatus === 'failed') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="bg-red-500 text-white rounded-full p-2 mr-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-red-900">Database Connection Failed</h3>
            <p className="text-red-700">Unable to connect to Supabase. Check your environment variables.</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Database Records</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Table: <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">{tableName}</code></p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{connectionStatus}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition flex items-center space-x-1"
            disabled={result.isLoading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {result.isLoading && (
        <div className="px-6 py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Loading records...</p>
        </div>
      )}

      {/* Error State */}
      {result.error && !result.isLoading && (
        <div className="px-6 py-6 bg-red-50 border border-red-200 rounded">
          <div className="flex items-center mb-3">
            <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h4 className="font-semibold text-red-900">Error Loading Data</h4>
          </div>
          <p className="text-red-700 text-sm">{result.error.message}</p>
        </div>
      )}

      {/* Table */}
      {result.data && !result.isLoading && !result.error && (
        <>
          {/* Table Stats */}
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400">{result.data.length} records found</p>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto max-h-96">
            {result.data.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-5.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H3.414a1 1 0 00-.707.293l-2.414 2.414A1 1 0 010 16.414V19a3 3 0 003 3h14a3 3 0 003-3v-2.586a1 1 0 00-.293-.707L15.414 13H18z" />
                </svg>
                <p>No data found in table "{tableName}"</p>
                <p className="text-sm mt-1">Try checking your table name or permissions</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  {result.data.map((record: DatabaseRecord, index: number) => (
                    <tr key={record.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {columns.map((column) => (
                        <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <div className="max-w-xs overflow-hidden">
                            <span className="truncate">
                              {renderCellValue(record[column])}
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}