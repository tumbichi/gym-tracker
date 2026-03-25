import {
  getRoutineById,
  getAllExercises,
} from '@modules/routines/actions/routines.actions'
import RoutineDetailsFeature from '@modules/routines/features/routine-details.feature'
import { notFound } from 'next/navigation'

export default async function RoutineDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const routineId = Number.parseInt(params.id)
  if (isNaN(routineId)) {
    notFound()
  }

  const routinePromise = getRoutineById(routineId)
  const exercisesPromise = getAllExercises()

  const [routine, allExercises] = await Promise.all([
    routinePromise,
    exercisesPromise,
  ])

  if (!routine) {
    notFound()
  }

  return (
    <RoutineDetailsFeature
      initialRoutine={routine}
      initialExercises={allExercises}
    />
  )
}
