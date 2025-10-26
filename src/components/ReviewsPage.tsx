import React, { useState, useEffect } from 'react'
import { ItemsList } from './ItemsList'
import { ViewSelector } from './ViewSelector'
import { ReviewsList } from './ReviewsList'
import { ReviewsFromSource } from './ReviewsFromSource'
import { getTableData } from '@/services/database'
import type { DatabaseRecord } from '@/types/database'

interface ReviewSource {
  domain: string
  publicationName?: string
  count: number
}

export function ReviewsPage() {
  const [movies, setMovies] = useState<DatabaseRecord[]>([])
  const [selectedMovie, setSelectedMovie] = useState<DatabaseRecord | null>(null)
  const [selectedSource, setSelectedSource] = useState<ReviewSource | null>(null)
  const [itemsSelector, setItemsSelector] = useState<'movies' | 'sources'>('movies')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true)
        const result = await getTableData('movies')
        if (result.error) {
          setError(result.error.message)
        } else {
          setMovies(result.data || [])
        }
      } catch (err) {
        setError('Failed to fetch movies')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovies()
  }, [])

  const handleMovieSelect = (movie: DatabaseRecord) => {
    setSelectedMovie(movie)
    setSelectedSource(null) // Clear source selection when selecting movie
  }

  const handleSourceSelect = (source: ReviewSource) => {
    setSelectedSource(source)
    setSelectedMovie(null) // Clear movie selection when selecting source
  }

  const handleSelectionChange = (selection: 'movies' | 'sources') => {
    setItemsSelector(selection)
    setSelectedMovie(null) // Clear selections when switching context
    setSelectedSource(null)
  }

  return (
    <div className="h-full relative">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Items Column */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col">
          <div className="p-4">
            <ViewSelector
              itemsSelector={itemsSelector}
              onSelectionChange={handleSelectionChange}
            />
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <ItemsList
              isLoading={isLoading}
              error={error}
              itemsSelector={itemsSelector}
              movies={movies}
              onMovieSelect={handleMovieSelect}
              selectedMovieId={selectedMovie?.ems_id as string}
              onSourceSelect={handleSourceSelect}
              selectedSourceId={selectedSource?.domain}
            />
          </div>
        </div>

        {/* Reviews Column */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden lg:flex-1 max-h-full">
          {itemsSelector === 'movies' ? (
            <ReviewsList selectedMovie={selectedMovie} />
          ) : (
            <ReviewsFromSource selectedSource={selectedSource} />
          )}
        </div>
      </div>
    </div>
  )
}