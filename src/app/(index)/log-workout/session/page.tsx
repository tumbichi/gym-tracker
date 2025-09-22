import { database } from "@/lib/database"
import { WorkoutSessionClient, WorkoutExercise } from "./client"
import { Exercise } from "@prisma/client"

function getTargetRepsForSet(repsString: string, setNumber: number): number {
  if (!repsString) return 0;
  if (repsString.toLowerCase() === 'amrap') return 0;

  const parts = repsString.split('-').map(s => s.trim());

  if (parts.length > 1) {
    // Format "12-10-8"
    const setIndex = setNumber - 1;
    if (setIndex < parts.length) {
      const parsed = parseInt(parts[setIndex], 10);
      return isNaN(parsed) ? 0 : parsed;
    } else {
      // If setNumber is out of bounds, use the last one
      const lastParsed = parseInt(parts[parts.length - 1], 10);
      return isNaN(lastParsed) ? 0 : lastParsed;
    }
  }

  const singleValueParts = repsString.split('x').map(s => s.trim());
  if (singleValueParts.length > 1) {
    // Format "12x3"
    const parsed = parseInt(singleValueParts[0], 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  // Format "12"
  const parsed = parseInt(repsString, 10);
  return isNaN(parsed) ? 0 : parsed;
}

async function getRoutineDay(routineId: number, dayId: number): Promise<WorkoutExercise[]> {
  const routineDay = await database.routine.findFirst({
    where: {
      id: routineId,
      days: {
        some: {
          id: dayId,
        },
      },
    },
    include: {
      days: {
        where: {
          id: dayId,
        },
        include: {
          items: {
            include: {
              exercise: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },
  })

  if (!routineDay || !routineDay.days[0]) {
    return []
  }

  const day = routineDay.days[0]

  return day.items.map((item) => ({
    id: item.exercise.id,
    name: item.exercise.name,
    targetSeries: item.series,
    targetReps: item.reps,
    targetWeight: item.targetWeight || undefined,
    notes: item.notes || undefined,
    sets: Array.from({ length: item.series }, (_, i) => ({
      id: `set-${item.exercise.id}-${i + 1}`,
      exerciseId: item.exercise.id,
      exerciseName: item.exercise.name,
      setNumber: i + 1,
      targetReps: item.reps,
      targetWeight: item.targetWeight || undefined,
      repsDone: getTargetRepsForSet(item.reps, i + 1),
      weightKg: item.targetWeight || 0,
      rpe: undefined,
      notes: "",
      completed: false,
    })),
  }))
}

async function getAllExercises(): Promise<Exercise[]> {
  return await database.exercise.findMany();
}

export default async function WorkoutSessionPage({ searchParams }: { searchParams: { routineId?: string; dayId?: string } }) {
  const routineId = searchParams.routineId ? parseInt(searchParams.routineId) : undefined
  const dayId = searchParams.dayId ? parseInt(searchParams.dayId) : undefined

  let initialExercises: WorkoutExercise[] = []
  if (routineId && dayId) {
    initialExercises = await getRoutineDay(routineId, dayId)
  }

  const allExercises = await getAllExercises();

  return <WorkoutSessionClient initialExercises={initialExercises} allExercises={allExercises} routineId={routineId} dayId={dayId} />
}
