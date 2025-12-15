import { useState, useEffect } from 'react'
import type { Tables } from '@/types/database'
import { getMovieDigestVersions, getMovieDigestContent } from '@/services/storage'

interface MovieDigestPanelProps {
  movie: Tables<'movies'>
}

export function MovieDigestPanel({ movie }: MovieDigestPanelProps) {
  const [digestContent, setDigestContent] = useState<string | null>(null)
  const [isDigestLoading, setIsDigestLoading] = useState(false)
  const [digestVersions, setDigestVersions] = useState<string[]>([])
  const [selectedDigestVersion, setSelectedDigestVersion] = useState<string | null>(null)

  // Fetch digest versions when movie changes
  useEffect(() => {
    const fetchVersions = async () => {
      setIsDigestLoading(true)
      try {
        const versions = await getMovieDigestVersions(movie.ems_id)
        setDigestVersions(versions)
        if (versions.length > 0) {
          // Select the latest version by default (first one)
          setSelectedDigestVersion(versions[0])
        } else {
          setDigestVersions([])
          setSelectedDigestVersion(null)
          setDigestContent(null)
        }
      } catch (err) {
        console.error('Failed to fetch digest versions', err)
        setDigestVersions([])
        setSelectedDigestVersion(null)
        setDigestContent(null)
      } finally {
        setIsDigestLoading(false)
      }
    }

    fetchVersions()
  }, [movie])

  // Fetch digest content when selected version changes
  useEffect(() => {
    const fetchContent = async () => {
      if (selectedDigestVersion) {
        setIsDigestLoading(true)
        try {
          const content = await getMovieDigestContent(movie.ems_id, selectedDigestVersion)
          setDigestContent(content)
        } catch (err) {
          console.error('Failed to fetch digest content', err)
          setDigestContent(null)
        } finally {
          setIsDigestLoading(false)
        }
      }
    }

    fetchContent()
  }, [selectedDigestVersion, movie])

  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDigestVersion(e.target.value)
  }

  const handleTriggerDigest = () => {
    console.log('Trigger digest for', movie.ems_id)
    // Placeholder for actual trigger logic
    alert(`Digest generation triggered for ${movie.title} (ID: ${movie.ems_id}).\nCheck back later for new versions.`)
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Digest Controls Header */}
      <div className="flex flex-row justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
           <label htmlFor="digest-version" className="text-sm font-medium text-gray-700 dark:text-gray-300">
             Version:
           </label>
           <select
             id="digest-version"
             value={selectedDigestVersion || ''}
             onChange={handleVersionChange}
             disabled={digestVersions.length === 0 || isDigestLoading}
             className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
           >
             {digestVersions.length === 0 ? (
               <option value="">No versions available</option>
             ) : (
               digestVersions.map(version => (
                 <option key={version} value={version}>{version}</option>
               ))
             )}
           </select>
        </div>
        
        <button
          onClick={handleTriggerDigest}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          {digestVersions.length > 0 ? 'Re-generate Digest' : 'Generate Digest'}
        </button>
      </div>

      {isDigestLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Loading digest...</span>
          </div>
        </div>
      ) : digestContent ? (
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-sans text-sm dark:text-gray-300">
            {digestContent}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-4 inline-block mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Digest Available</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-4">
              A digest has not been generated for this movie yet.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
