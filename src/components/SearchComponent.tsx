import { useState, useMemo, useEffect, useRef } from 'react'
import { SearchTypeSelector } from './SearchTypeSelector'
import { Search } from 'lucide-react'
import { SearchMoviesList } from './SearchMoviesList'
import { SearchSourcesList } from './SearchSourcesList'
import type { Tables } from '@/types/database'
import type { ReviewSource } from '@/hooks/useReviewSelection'

interface SearchComponentProps {
  movies: Tables<'movies'>[]
  sources: ReviewSource[]
  onMovieSelect: (movie: Tables<'movies'>) => void
  onSourceSelect: (source: ReviewSource) => void
  reviewsCount: { [key: string]: number }
}

export function SearchComponent({
  movies,
  sources,
  onMovieSelect,
  onSourceSelect,
  reviewsCount,
}: SearchComponentProps) {
  const [searchType, setSearchType] = useState<'movie' | 'source'>('movie')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState<Tables<'movies'> | ReviewSource | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const searchInputRef = useRef<HTMLDivElement>(null) // Ref for the search input container

  const filteredMovies = useMemo(() => {
    if (!searchTerm) return movies
    return movies.filter((movie) =>
      (movie.title as string).toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [movies, searchTerm])

  const filteredSources = useMemo(() => {
    if (!searchTerm) return sources
    return sources.filter((source) =>
      source.domain.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [sources, searchTerm])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleMovieSelect = (movie: Tables<'movies'>) => {
    onMovieSelect(movie)
    setSelectedItem(movie)
    setSearchTerm('')
    setIsDropdownOpen(false)
  }

  const handleSourceSelect = (source: ReviewSource) => {
    onSourceSelect(source)
    setSelectedItem(source)
    setSearchTerm('')
    setIsDropdownOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setSelectedItem(null)
    setIsDropdownOpen(true)
  }

  const getInputValue = () => {
    if (selectedItem) {
      return searchType === 'movie' ? (selectedItem as Tables<'movies'>).title as string : (selectedItem as ReviewSource).domain
    }
    return searchTerm
  }

  return (
    <div className="flex items-center space-x-4">
                <SearchTypeSelector selectedType={searchType} onSelectType={(type) => {
        setSearchType(type)
        setSelectedItem(null)
        setSearchTerm('')
      }} />
      <div className="relative flex-1" ref={searchInputRef}> {/* Search input container */}
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={
            searchType === 'movie'
              ? 'Search for a movie...'
              : 'Search for a source...'
          }
          value={getInputValue()}
          onChange={handleInputChange}
          onFocus={() => setIsDropdownOpen(true)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />

        {isDropdownOpen && (
          <div className="absolute top-full mt-2 left-0 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 max-h-96 overflow-y-auto">
            {searchType === 'movie' ? (
              <SearchMoviesList movies={filteredMovies} onMovieSelect={handleMovieSelect} reviewsCount={reviewsCount} />
            ) : (
              <SearchSourcesList sources={filteredSources} onSourceSelect={handleSourceSelect} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
