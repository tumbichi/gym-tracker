'use client'

import { ExerciseFormFeature } from '@modules/exercises/features/exercise-form.feature'

/**
 * New Exercise Page
 *
 * Thin shell — delegates all logic and UI to ExerciseFormFeature in create mode.
 */
export default function NewExercisePage() {
  return <ExerciseFormFeature />
}
