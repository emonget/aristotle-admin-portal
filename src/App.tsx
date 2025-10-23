import './App.css'
import { DataTable } from './components/DataTable'

function App() {
  // Get table name from environment variable, fallback to 'users'
  const tableName = import.meta.env.VITE_DATABASE_TABLE || 'users'

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Aristotle Admin Portal
            </h1>
            <p className="text-gray-600">
              Database overview - currently viewing table: <strong>{tableName}</strong>
            </p>
          </div>

          {/* Database Content */}
          <DataTable tableName={tableName} />
        </div>
      </div>
    </div>
  )
}

export default App
