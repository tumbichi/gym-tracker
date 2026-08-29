'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  ExerciseCard,
  PaginationParams,
  ExerciseFilters,
  PaginatedResult,
} from '../types'

// Note: These hooks will need the server actions to be implemented first
// For now, they provide the interface that will call the actions

/**
 * Hook for fetching all exercises (non-paginated)
 * Note: Requires getExercises server action
 */
export function useExercises() {
  const [exercises, setExercises] = useState<ExerciseCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchExercises = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Dynamic import to avoid SSR issues
      const { getExercises } = await import('../actions/exercises.actions')
      const data = await getExercises()
      setExercises(data)
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch exercises')
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExercises()
  }, [fetchExercises])

  return {
    exercises,
    isLoading,
    isError: !!error,
    error,
    refetch: fetchExercises,
  }
}

/**
 * Hook for fetching paginated exercises with filters
 * Note: Requires getExercisesPaginated server action
 */
export function useExercisesPaginated(
  params: PaginationParams,
  filters?: ExerciseFilters
) {
  const [data, setData] = useState<ExerciseCard[]>([])
  const [pagination, setPagination] = useState<{
    total: number
    page: number
    pageSize: number
    totalPages: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchExercises = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Dynamic import to avoid SSR issues
      const { getExercisesPaginated } =
        await import('../actions/exercises.actions')
      const result: PaginatedResult<ExerciseCard> = await getExercisesPaginated(
        params,
        filters
      )

      setData(result.data)
      setPagination({
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      })
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch exercises')
      )
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.page,
    params.pageSize,
    filters?.muscleGroupId,
    filters?.bodyPart,
    filters?.bodyRegion,
    filters?.movementPattern,
    filters?.exerciseType,
    filters?.equipmentId,
    filters?.equipmentCategory,
    filters?.difficulty,
  ])

  useEffect(() => {
    fetchExercises()
  }, [fetchExercises])

  return {
    data,
    pagination,
    isLoading,
    isError: !!error,
    error,
    refetch: fetchExercises,
  }
}
