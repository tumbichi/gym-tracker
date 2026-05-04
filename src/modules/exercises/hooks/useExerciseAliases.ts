'use client'

import { useState, useCallback } from 'react'
import type { ExerciseAlias, ActionResult } from '../types'

/**
 * Hook for managing exercise aliases
 * Note: Requires getExerciseById, addExerciseAlias, removeExerciseAlias server actions
 */
export function useExerciseAliases(exerciseId: string) {
  const [aliases, setAliases] = useState<ExerciseAlias[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchAliases = useCallback(async () => {
    if (!exerciseId) return

    try {
      setIsLoading(true)
      setError(null)

      // Dynamic import to avoid SSR issues
      const { getExerciseById } = await import('../actions/exercises.actions')
      const exercise = await getExerciseById(exerciseId)

      if (exercise) {
        setAliases(exercise.aliases)
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch aliases')
      )
    } finally {
      setIsLoading(false)
    }
  }, [exerciseId])

  const addAlias = useCallback(
    async (alias: string): Promise<void> => {
      try {
        setError(null)

        // Dynamic import to avoid SSR issues
        const { addExerciseAlias } =
          await import('../actions/exercises.actions')
        const result: ActionResult<ExerciseAlias> = await addExerciseAlias({
          exerciseId,
          alias,
        })

        if (!result.success) {
          throw new Error(result.error || 'Failed to add alias')
        }

        if (result.data) {
          setAliases((prev) => [...prev, result.data!])
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to add alias')
        setError(error)
        throw error
      }
    },
    [exerciseId]
  )

  const removeAlias = useCallback(async (aliasId: string): Promise<void> => {
    try {
      setError(null)

      // Dynamic import to avoid SSR issues
      const { removeExerciseAlias } =
        await import('../actions/exercises.actions')
      const result: ActionResult = await removeExerciseAlias(aliasId)

      if (!result.success) {
        throw new Error(result.error || 'Failed to remove alias')
      }

      setAliases((prev) => prev.filter((a) => a.id !== aliasId))
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to remove alias')
      setError(error)
      throw error
    }
  }, [])

  return {
    aliases,
    isLoading,
    error,
    refetch: fetchAliases,
    addAlias,
    removeAlias,
  }
}
