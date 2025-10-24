import './App.css'
import { MainPage } from './components/MainPage'

function App() {
  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <div className="flex-shrink-0 p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Movie Reviews Admin Portal
          </h1>
        </div>
      </div>

      {/* Main Content - fills remaining space */}
      <div className="flex-1 overflow-hidden px-6 pb-6">
        <MainPage />
      </div>
    </div>
  )
}

export default App
