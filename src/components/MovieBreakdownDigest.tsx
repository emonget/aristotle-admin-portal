import { useState, useEffect } from 'react'
import type { Tables } from '@/types/database'
import { getTableData } from '@/services/database'

interface MovieBreakdownDigestProps {
  movie: Tables<'movies'>
}

const TOPIC_CONFIG: Record<string, string> = {
  story_screenplay: 'Story & Screenplay',
  direction: 'Direction',
  acting_performance: 'Acting Performance',
  cinematography_visuals: 'Cinematography & Visuals',
  music_sound_design: 'Music & Sound Design',
  editing_rhythm: 'Editing & Rhythm',
  themes_subtext: 'Themes & Subtext',
  audience_appeal: 'Audience Appeal',
  buzz_cultural_reaction: 'Buzz & Cultural Reaction',
  overall_impression: 'Overall Impression',
}

const TOPIC_ORDER = [
  'story_screenplay',
  'direction',
  'acting_performance',
  'cinematography_visuals',
  'music_sound_design',
  'editing_rhythm',
  'themes_subtext',
  'audience_appeal',
  'buzz_cultural_reaction',
  'overall_impression',
]

export function MovieBreakdownDigest({ movie }: MovieBreakdownDigestProps) {
  const [digests, setDigests] = useState<Tables<'digests'>[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDigests = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getTableData<Tables<'digests'>>('digests', {
          filters: { movie_id: movie.ems_id },
        })

        if (result.error) {
          setError(result.error.message)
        } else {
          setDigests(result.data || [])
        }
      } catch (err) {
        setError('Failed to fetch breakdown digests')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDigests()
  }, [movie.ems_id])

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading breakdown...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center text-red-500 dark:text-red-400">
          <p className="font-medium">Error loading breakdown</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (digests.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center">
        <div>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-4 inline-block mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Breakdown Available</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">
            Breakdown digests have not been generated for this movie yet.
          </p>
        </div>
      </div>
    )
  }

  // Create a map for easy access
  const digestMap = digests.reduce((acc, digest) => {
    acc[digest.topic] = digest
    return acc
  }, {} as Record<string, Tables<'digests'>>)

  return (
    <div className="h-full overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {TOPIC_ORDER.map((topicKey) => {
          const digest = digestMap[topicKey]
          if (!digest) return null

          return (
            <div 
              key={topicKey} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col"
            >
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                  {TOPIC_CONFIG[topicKey] || topicKey}
                </h3>
              </div>
              <div className="p-5 flex-1">
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {digest.summary}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
