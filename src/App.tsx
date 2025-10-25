import React, { useState } from 'react'
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ReviewsPage } from './components/ReviewsPage'
import { WorkflowsPage } from './components/WorkflowsPage'
import { AnalyticsPage } from './components/AnalyticsPage'
import { ThemeToggle } from './components/ThemeToggle'
import { NavMenu } from './components/NavMenu'
import { ThemeProvider } from './contexts/theme'

function App() {
  const [pageTitle, setPageTitle] = useState('Movie & Reviews')

  return (
    <ThemeProvider>
      <div className="h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
        <div className="flex-shrink-0 p-6">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <NavMenu onTitleChange={setPageTitle} />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {pageTitle}
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Main Content - fills remaining space */}
        <div className="flex-1 overflow-hidden px-6 pb-6">
          <Routes>
            <Route path="/" element={<Navigate to="/reviews" replace />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/workflows" element={<WorkflowsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
