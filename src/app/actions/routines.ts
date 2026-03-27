'use server'

import { prisma } from '@core/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createRoutine(data: {
  name: string
  weeks: number
  days: Array<{
    name: string
    order: number
    items: Array<{
      exerciseId: number | null
      order: number
      series: number
      reps: string
      targetWeight: number | null
      notes: string
    }>
  }>
}) {
  try {
    // For now, we'll create with a default user ID of 1
    const routine = await prisma.routine.create({
      data: {
        name: data.name,
        weeks: data.weeks,
        userId: 1, // This should come from auth context
        days: {
          create: data.days.map((day) => ({
            name: day.name,
            order: day.order,
            items: {
              create: day.items
                .filter((item) => item.exerciseId)
                .map((item) => ({
                  exerciseId: item.exerciseId!,
                  order: item.order,
                  series: item.series,
                  reps: item.reps,
                  targetWeight: item.targetWeight,
                  notes: item.notes || null,
                })),
            },
          })),
        },
      },
    })

    revalidatePath('/routines')
    return { success: true, routine }
  } catch (error) {
    console.error('Error creating routine:', error)
    return { success: false, error: 'Failed to create routine' }
  }
}

export async function updateRoutine(
  id: number,
  data: {
    name: string
    weeks: number
    days: Array<{
      name: string
      order: number
      items: Array<{
        exerciseId: number | null
        order: number
        series: number
        reps: string
        targetWeight: number | null
        notes: string
      }>
    }>
  }
) {
  try {
    // Delete existing routine exercises and days, then recreate
    await prisma.routineExercise.deleteMany({
      where: {
        routineDay: {
          routineId: id,
        },
      },
    })

    await prisma.routineDay.deleteMany({
      where: { routineId: id },
    })

    await prisma.routine.update({
      where: { id },
      data: {
        name: data.name,
        weeks: data.weeks,
        days: {
          create: data.days.map((day) => ({
            name: day.name,
            order: day.order,
            items: {
              create: day.items
                .filter((item) => item.exerciseId)
                .map((item) => ({
                  exerciseId: item.exerciseId!,
                  order: item.order,
                  series: item.series,
                  reps: item.reps,
                  targetWeight: item.targetWeight,
                  notes: item.notes || null,
                })),
            },
          })),
        },
      },
    })

    revalidatePath('/routines')
    revalidatePath(`/routines/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating routine:', error)
    return { success: false, error: 'Failed to update routine' }
  }
}

export async function deleteRoutine(id: number) {
  try {
    await prisma.routine.delete({
      where: { id },
    })

    revalidatePath('/routines')
    return { success: true }
  } catch (error) {
    console.error('Error deleting routine:', error)
    return { success: false, error: 'Failed to delete routine' }
  }
}
