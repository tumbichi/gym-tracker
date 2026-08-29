'use server'

import { database } from '@core/lib/database'
import { revalidatePath } from 'next/cache'

export async function createExercise(data: {
  name: string
  slug: string
  primaryGroup?: string
  equipment?: string
  notes?: string
}) {
  try {
    const newExercise = await database.exercise.create({
      data: {
        canonicalName: data.name,
        slug: data.slug,
        description: data.notes,
        // Note: This is a legacy action - primaryMuscleId and equipment
        // need to be provided as proper IDs for the new schema
      } as any,
    })

    revalidatePath('/exercises')
    return { success: true, exercise: newExercise }
  } catch (error) {
    console.error('Error creating exercise:', error)
    return { success: false, error: 'Failed to create exercise' }
  }
}

export async function updateExercise(
  id: string,
  data: {
    name: string
    slug: string
    primaryGroup?: string
    equipment?: string
    notes?: string
  }
) {
  try {
    await database.exercise.update({
      where: { id } as any,
      data: {
        canonicalName: data.name,
        slug: data.slug,
        description: data.notes,
      } as any,
    })

    revalidatePath('/exercises')
    return { success: true }
  } catch (error) {
    console.error('Error updating exercise:', error)
    return { success: false, error: 'Failed to update exercise' }
  }
}

export async function deleteExercise(id: string) {
  try {
    await database.exercise.delete({
      where: { id } as any,
    })

    revalidatePath('/exercises')
    return { success: true }
  } catch (error) {
    console.error('Error deleting exercise:', error)
    return { success: false, error: 'Failed to delete exercise' }
  }
}
