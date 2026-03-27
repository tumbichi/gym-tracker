'use server'

import { prisma } from '@core/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createWorkoutSession(data: {
  userId: number
  routineId?: number
  date: Date
  notes?: string
  sets: Array<{
    exerciseId: number
    setNumber: number
    repsDone: number
    weightKg: number
    rpe?: number
    notes?: string
  }>
}) {
  try {
    // Group sets by exerciseId to create WorkoutExercises
    const exerciseMap = new Map<number, typeof data.sets>()
    for (const set of data.sets) {
      const existing = exerciseMap.get(set.exerciseId) || []
      existing.push(set)
      exerciseMap.set(set.exerciseId, existing)
    }

    // Build workoutExercises data with nested sets
    const workoutExercisesData = Array.from(exerciseMap.entries()).map(
      ([exerciseId, sets], index) => ({
        exerciseId,
        order: index,
        notes: null,
        sets: {
          create: sets.map((set) => ({
            exerciseId: set.exerciseId,
            setNumber: set.setNumber,
            repsDone: set.repsDone,
            weightKg: set.weightKg,
            rpe: set.rpe || null,
            notes: set.notes || null,
          })),
        },
      })
    )

    const session = await prisma.workoutSession.create({
      data: {
        userId: data.userId,
        routineId: data.routineId || null,
        date: data.date,
        notes: data.notes || null,
        workoutExercises: {
          create: workoutExercisesData,
        },
      },
      include: {
        routine: true,
        workoutExercises: {
          include: {
            exercise: true,
            sets: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    revalidatePath('/log-workout')
    return { success: true, session }
  } catch (error) {
    console.error('Error creating workout session:', error)
    return { success: false, error: 'Failed to create workout session' }
  }
}

export async function getRoutineDay(routineId: number, dayId: number) {
  try {
    const routineDay = await prisma.routineDay.findFirst({
      where: {
        id: dayId,
        routineId: routineId,
      },
      include: {
        items: {
          include: {
            exercise: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    console.log('routineDay', routineDay)

    return routineDay
  } catch (error) {
    console.error('Error fetching routine day:', error)
    throw error
  }
}
