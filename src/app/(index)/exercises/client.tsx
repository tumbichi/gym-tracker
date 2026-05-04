'use client'

/**
 * Exercises Page Client Component
 *
 * This component serves as a thin wrapper around the ExerciseListFeature.
 * All business logic is handled by the feature component.
 */

import { ExerciseListFeature } from '@modules/exercises/features/exercise-list.feature'

interface ExercisesClientProps {
  // This component now delegates all logic to the feature
  // Props are kept for backward compatibility but not used
}

export function ExercisesClient(_props: ExercisesClientProps) {
  return (
    <div className='flex-1 space-y-6 p-6'>
      <ExerciseListFeature />
    </div>
  )
}
