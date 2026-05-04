'use client'

import { useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ExerciseFilters, ExerciseSortOption } from '../types'

const DEFAULT_PAGE_SIZE = 20

/**
 * Hook for managing exercise filter state with URL synchronization
 */
export function useExerciseFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Parse filters from URL — keys must match what updateFilters writes (kebab-case)
  const filters = useMemo<ExerciseFilters>(
    () => ({
      muscleGroupId: searchParams.get('muscle-group-id') ?? undefined,
      bodyPart:
        (searchParams
          .get('body-part')
          ?.toUpperCase() as ExerciseFilters['bodyPart']) ?? undefined,
      bodyRegion:
        (searchParams.get('body-region') as ExerciseFilters['bodyRegion']) ??
        undefined,
      movementPattern:
        (searchParams.get(
          'movement-pattern'
        ) as ExerciseFilters['movementPattern']) ?? undefined,
      exerciseType:
        (searchParams.get(
          'exercise-type'
        ) as ExerciseFilters['exerciseType']) ?? undefined,
      equipmentId: searchParams.get('equipment-id') ?? undefined,
      equipmentCategory:
        (searchParams.get(
          'equipment-category'
        ) as ExerciseFilters['equipmentCategory']) ?? undefined,
      difficulty:
        (searchParams.get('difficulty') as ExerciseFilters['difficulty']) ??
        undefined,
    }),
    [searchParams]
  )

  const sort = (searchParams.get('sort') as ExerciseSortOption) ?? 'name_asc'
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const pageSize = parseInt(
    searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE),
    10
  )

  const updateFilters = useCallback(
    (newFilters: Partial<ExerciseFilters>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(newFilters).forEach(([key, value]) => {
        // Always compute kebab-case key for both set and delete
        const paramKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
        if (value === undefined || value === '') {
          params.delete(paramKey)
        } else {
          params.set(paramKey, String(value))
        }
      })

      // Reset to page 1 when filters change
      params.set('page', '1')

      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const updateSort = useCallback(
    (newSort: ExerciseSortOption) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('sort', newSort)
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const updatePage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', String(newPage))
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const updatePageSize = useCallback(
    (newPageSize: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('pageSize', String(newPageSize))
      params.set('page', '1') // Reset to page 1 when page size changes
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams()
    params.set('page', '1')
    params.set('sort', 'name_asc')
    params.set('pageSize', String(DEFAULT_PAGE_SIZE))
    router.push(`?${params.toString()}`, { scroll: false })
  }, [router])

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined)

  return {
    filters,
    sort,
    page,
    pageSize,
    updateFilters,
    updateSort,
    updatePage,
    updatePageSize,
    clearFilters,
    hasActiveFilters,
  }
}
