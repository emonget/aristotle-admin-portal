import './App.css'
import { MainPage } from './components/MainPage'
import { ThemeToggle } from './components/ThemeToggle'
import { ThemeProvider } from './contexts/theme'

function App() {
  return (
    <ThemeProvider>
      <div className="h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
        <div className="flex-shrink-0 p-6">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Movie Reviews Admin Portal
            </h1>
            <ThemeToggle />
          </div>
        </div>

        {/* Main Content - fills remaining space */}
        <div className="flex-1 overflow-hidden px-6 pb-6">
          <MainPage />
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
