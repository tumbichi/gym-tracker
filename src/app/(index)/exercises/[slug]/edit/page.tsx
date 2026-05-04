import { notFound } from 'next/navigation'
import { getExerciseBySlug } from '@modules/exercises/actions/exercises.actions'
import { ExerciseFormFeature } from '@modules/exercises/features/exercise-form.feature'

interface EditExercisePageProps {
  params: Promise<{ slug: string }>
}

/**
 * Edit Exercise Page
 *
 * Thin shell — fetches exercise by slug, delegates to ExerciseFormFeature in edit mode.
 */
export default async function EditExercisePage({
  params,
}: EditExercisePageProps) {
  const { slug } = await params
  const exercise = await getExerciseBySlug(slug)

  if (!exercise) {
    notFound()
  }

  return <ExerciseFormFeature exercise={exercise} />
}
