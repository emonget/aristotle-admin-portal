import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Clapperboard, Settings, FileText, BarChart3, ChevronDown } from 'lucide-react'

export function NavMenu() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const views = [
    { path: '/reviews', name: 'Reviews', title: 'Reviews', icon: Clapperboard },
    { path: '/analytics', name: 'Analytics', title: 'Analytics', icon: BarChart3 },
    { path: '/workflows', name: 'Monitoring', title: 'Monitoring', icon: Settings },
    { path: '/reporting', name: 'Reporting', title: 'Reporting', icon: FileText },
  ]

  const currentView = views.find(view => view.path === location.pathname) || views[0]


  return (
    <div className="relative">
      {/* Current view button - shows current view's icon */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 p-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        aria-label="Toggle navigation menu"
      >
        <currentView.icon className="w-5 h-5" />
        <span className="text-sm font-medium">{currentView.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu - always shows all views in same order */}
      {isDropdownOpen && (
        <>
          {/* Overlay to close dropdown when clicking outside */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />

          {/* Dropdown panel */}
          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 min-w-[200px]">
            {views.map(view => (
              <button
                key={view.path}
                onClick={() => {
                  navigate(view.path)
                  setIsDropdownOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${
                  location.pathname === view.path
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                <view.icon className={`w-5 h-5 ${
                  location.pathname === view.path
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300'
                }`} />
                <span>{view.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}