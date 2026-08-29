'use client'

import { useState, useEffect } from 'react'
import type { MuscleGroup, Equipment } from '../types'
import type { BodyPartOption } from '../components/ExerciseFilters'

interface UseExerciseFilterOptionsResult {
  bodyParts: BodyPartOption[]
  muscleGroups: MuscleGroup[]
  equipment: Equipment[]
  isLoading: boolean
  error: Error | null
}

/**
 * Hook for fetching exercise filter lookup data (body parts, muscle groups, equipment)
 * This data is used by filter components but should not be managed by dumb components
 */
export function useExerciseFilterOptions(): UseExerciseFilterOptionsResult {
  const [bodyParts, setBodyParts] = useState<BodyPartOption[]>([])
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [bodyPartsResult, muscleGroupsResult, equipmentResult] =
          await Promise.all([
            import('../actions/exercises.actions').then((m) =>
              m.getBodyParts()
            ),
            import('../actions/exercises.actions').then((m) =>
              m.getMuscleGroups()
            ),
            import('../actions/exercises.actions').then((e) =>
              e.getEquipment()
            ),
          ])

        setBodyParts(bodyPartsResult)
        setMuscleGroups(muscleGroupsResult)
        setEquipment(equipmentResult)
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error('Failed to fetch filter options')
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return {
    bodyParts,
    muscleGroups,
    equipment,
    isLoading,
    error,
  }
}
