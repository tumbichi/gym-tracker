import {
  getRoutines,
  getAllExercises,
} from '@modules/routines/actions/routines.actions'
import RoutineList from '@modules/routines/features/routine-list.feature'

export default async function RoutinesPage() {
  const routines = await getRoutines()
  const allExercises = await getAllExercises()

  return (
    <div className='flex-1 space-y-6 p-6'>
      <RoutineList initialRoutines={routines} initialExercises={allExercises} />
    </div>
  )
}
