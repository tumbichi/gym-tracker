'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useExercisesPaginated } from '../hooks/useExercises'
import { useExerciseFilters } from '../hooks/useExerciseFilters'
import { useExerciseFilterOptions } from '../hooks/useExerciseFilterOptions'
import { ExerciseSearch } from '../components/ExerciseSearch'
import { ExerciseFiltersComponent } from '../components/ExerciseFilters'
import { ExerciseCard } from '../components/ExerciseCard'
import { Button } from '@core/components/ui/button'
import { Loader2, Plus } from 'lucide-react'
import Link from 'next/link'

/**
 * Exercise List Feature - Smart component that orchestrates the exercise list view
 *
 * Features:
 * - Paginated list of exercises
 * - Search with debouncing
 * - Filters with URL synchronization
 * - Loading and empty states
 */
export function ExerciseListFeature() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const {
    filters,
    sort,
    page,
    pageSize,
    updateFilters,
    updateSort,
    updatePage,
    clearFilters,
    hasActiveFilters,
  } = useExerciseFilters()

  // Fetch filter lookup data
  const {
    bodyParts,
    muscleGroups,
    equipment,
    isLoading: isFilterLoading,
  } = useExerciseFilterOptions()

  // Debounce search query
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [searchQuery])

  // Handle search with debouncing
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  // Trigger refetch when debounced query changes
  const { data, pagination, isLoading, isError, refetch } =
    useExercisesPaginated({ page, pageSize }, filters)

  // Refetch when search query changes
  useEffect(() => {
    refetch()
  }, [debouncedQuery, refetch])

  const totalPages = pagination?.totalPages ?? 0

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div>
          <h1 className='text-2xl font-bold'>Ejercicios</h1>
          <p className='text-muted-foreground'>
            {pagination?.total ?? 0} ejercicios disponibles
          </p>
        </div>
        <Link href='/exercises/new'>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            Nuevo Ejercicio
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className='flex flex-col gap-4'>
        <ExerciseSearch
          value={searchQuery}
          onChange={handleSearch}
          placeholder='Buscar ejercicios...'
        />
        <ExerciseFiltersComponent
          filters={filters}
          onFilterChange={updateFilters}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          bodyParts={bodyParts}
          muscleGroups={muscleGroups}
          equipment={equipment}
          isLoading={isFilterLoading}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='text-primary h-8 w-8 animate-spin' />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className='py-12 text-center'>
          <p className='text-destructive'>Error al cargar los ejercicios</p>
          <Button variant='outline' onClick={() => refetch()} className='mt-4'>
            Reintentar
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && data.length === 0 && (
        <div className='py-12 text-center'>
          <p className='text-muted-foreground'>No se encontraron ejercicios</p>
          {hasActiveFilters && (
            <Button variant='outline' onClick={clearFilters} className='mt-4'>
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

      {/* Exercise Grid */}
      {!isLoading && !isError && data.length > 0 && (
        <>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {data.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onClick={() => {
                  // Navigate to exercise detail
                  window.location.href = `/exercises/${exercise.slug || exercise.id}`
                }}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex items-center justify-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => updatePage(page - 1)}
                disabled={page <= 1}
              >
                Anterior
              </Button>
              <span className='text-muted-foreground text-sm'>
                Página {page} de {totalPages}
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={() => updatePage(page + 1)}
                disabled={page >= totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
