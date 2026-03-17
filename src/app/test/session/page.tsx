import { prisma } from "@core/lib/prisma";
import { WorkoutSessionClient, WorkoutExercise } from "@modules/log-workout/modules/session/features/client";
// import { WorkoutSessionClient, WorkoutExercise } from "./client"
import { Exercise, Routine as PrismaRoutine, RoutineDay as PrismaRoutineDay, RoutineExercise as PrismaRoutineExercise } from "@prisma/client"

type RoutineExercise = PrismaRoutineExercise & { exercise: Exercise };
type RoutineDay = PrismaRoutineDay & { items: RoutineExercise[] };
type Routine = PrismaRoutine & { days: RoutineDay[] };

function getTargetRepsForSet(repsJson: string, setNumber: number): number {
  if (!repsJson) return 0;

  try {
    const repsArray = JSON.parse(repsJson);
    if (!Array.isArray(repsArray)) return 0;

    const setIndex = setNumber - 1;
    if (setIndex < repsArray.length) {
      const reps = repsArray[setIndex];
      return typeof reps === 'number' ? reps : 0;
    } else if (repsArray.length > 0) {
      // If setNumber is out of bounds, use the last one
      const lastReps = repsArray[repsArray.length - 1];
      return typeof lastReps === 'number' ? lastReps : 0;
    }

    return 0;
  } catch (e) {
    // Fallback for old string formats if any exist, or invalid JSON
    if (repsJson.toLowerCase() === 'amrap') return 0;

    const parts = repsJson.split('-').map(s => s.trim());
    if (parts.length > 1) {
      const setIndex = setNumber - 1;
      if (setIndex < parts.length) {
        const parsed = parseInt(parts[setIndex], 10);
        return isNaN(parsed) ? 0 : parsed;
      } else {
        const lastParsed = parseInt(parts[parts.length - 1], 10);
        return isNaN(lastParsed) ? 0 : lastParsed;
      }
    }

    const singleValueParts = repsJson.split('x').map(s => s.trim());
    if (singleValueParts.length > 1) {
      const parsed = parseInt(singleValueParts[0], 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    const parsed = parseInt(repsJson, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
}

async function getRoutineDay(routineId: number, dayId: number): Promise<WorkoutExercise[]> {
  const routineDay = await prisma.routine.findFirst({
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
  }) as Routine

  if (!routineDay || !routineDay.days[0]) {
    return []
  }

  const day = routineDay.days[0]

  return day.items.map((item) => ({
    id: item.exercise.id,
    name: item.exercise.name,
    targetSeries: item.series,
    targetReps: item.reps,
     notes: item.notes || undefined,
     sets: Array.from({ length: item.series }, (_, i) => ({
      id: `set-${item.exercise.id}-${i + 1}`,
      exerciseId: item.exercise.id,
      exerciseName: item.exercise.name,
       setNumber: i + 1,
       targetReps: item.reps,
       repsDone: getTargetRepsForSet(item.reps, i + 1),
       weightKg: 0,
       rpe: undefined,
       notes: "",
       completed: false,
     })),
  }))
}

async function getAllExercises(): Promise<Exercise[]> {
  return await prisma.exercise.findMany();
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
