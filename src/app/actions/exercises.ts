"use server"

import { database } from "@/lib/database"
import { revalidatePath } from "next/cache"

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
        name: data.name,
        slug: data.slug,
        primaryGroup: data.primaryGroup || null,
        equipment: data.equipment || null,
        notes: data.notes || null,
      },
    })

    revalidatePath("/exercises")
    return { success: true, exercise: newExercise }
  } catch (error) {
    console.error("Error creating exercise:", error)
    return { success: false, error: "Failed to create exercise" }
  }
}

export async function updateExercise(
  id: number,
  data: {
    name: string
    slug: string
    primaryGroup?: string
    equipment?: string
    notes?: string
  },
) {
  try {
    await database.exercise.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        primaryGroup: data.primaryGroup || null,
        equipment: data.equipment || null,
        notes: data.notes || null,
      },
    })

    revalidatePath("/exercises")
    return { success: true }
  } catch (error) {
    console.error("Error updating exercise:", error)
    return { success: false, error: "Failed to update exercise" }
  }
}

export async function deleteExercise(id: number) {
  try {
    await database.exercise.delete({
      where: { id },
    })

    revalidatePath("/exercises")
    return { success: true }
  } catch (error) {
    console.error("Error deleting exercise:", error)
    return { success: false, error: "Failed to delete exercise" }
  }
}
