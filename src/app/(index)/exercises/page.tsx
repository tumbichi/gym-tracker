import { ExerciseListFeature } from '@modules/exercises/features/exercise-list.feature'

/**
 * Exercises Page
 *
 * Main page for browsing and managing exercises.
 * All data fetching and UI logic is handled by the client component.
 */
export default function ExercisesPage() {
  return (
    <div className='flex-1 space-y-6 p-6'>
      <ExerciseListFeature />
    </div>
  )
}
