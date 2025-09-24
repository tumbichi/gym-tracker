'use server'

import { prisma } from "@core/lib/prisma"
import { revalidatePath } from "next/cache"

interface SetEntryData {
  exerciseId: number
  setNumber: number
  repsDone: number
  weightKg: number
  rpe?: number
  notes?: string
}

interface WorkoutSessionData {
  startTime: Date
  routineId?: number
  notes?: string
  setEntries: SetEntryData[]
}

export async function saveWorkoutSession(data: WorkoutSessionData) {
  const { startTime, routineId, notes, setEntries } = data

  // For now, we'll assume a single user with id 1
  const userId = 1

  const session = await prisma.workoutSession.create({
    data: {
      userId,
      date: startTime,
      routineId,
      notes,
    },
  })

  const setEntriesToCreate = setEntries.map((set) => ({
    sessionId: session.id,
    exerciseId: set.exerciseId,
    setNumber: set.setNumber,
    repsDone: set.repsDone,
    weightKg: set.weightKg,
    rpe: set.rpe,
    notes: set.notes,
  }))

  await prisma.setEntry.createMany({
    data: setEntriesToCreate,
  })

  revalidatePath("/log-workout")
  revalidatePath("/statistics")
}


