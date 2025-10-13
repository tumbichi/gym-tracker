import { getRoutines, getAllExercises } from "@modules/routines/actions/routines.actions";
import RoutineList from "@modules/routines/features/routine-list.feature";

export default async function RoutinesPage() {
  const routines = await getRoutines();
  const allExercises = await getAllExercises();

  return (
    <RoutineList
      initialRoutines={routines}
      initialExercises={allExercises}
    />
  );
}
