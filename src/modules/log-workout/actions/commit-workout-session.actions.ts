'use server'

import { prisma } from '@core/lib/prisma'
import type { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import {
  CommitSessionPayload,
  CommitSetEntryPayload,
} from '../modules/session/types/commit-payload'
import { CommitSessionResult } from '../modules/session/types/commit-result'

export async function commitWorkoutSession(
  payload: CommitSessionPayload
): Promise<CommitSessionResult> {
  try {
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. Crear WorkoutSession
        const session = await tx.workoutSession.create({
          data: {
            userId: 1, // TODO: Obtener del contexto de auth
            date: payload.startedAt,
            routineId: payload.routineId,
            notes: payload.notes,
          },
        })

        // 2. Crear WorkoutExercises y SetEntries
        for (const exercise of payload.exercises) {
          const workoutExercise = await tx.workoutExercise.create({
            data: {
              sessionId: session.id,
              exerciseId: exercise.exerciseId,
              order: exercise.order,
              notes: exercise.notes,
            },
          })

          // 3. Crear SetEntries para este ejercicio
          if (exercise.sets.length > 0) {
            await tx.setEntry.createMany({
              data: exercise.sets.map((set: CommitSetEntryPayload) => ({
                workoutExerciseId: workoutExercise.id,
                exerciseId: exercise.exerciseId, // Redundancia para queries
                setNumber: set.setNumber,
                repsDone: set.repsDone,
                weightKg: set.weightKg,
                rpe: set.rpe,
                notes: set.notes,
              })),
            })
          }
        }

        return session
      }
    )

    // Revalidar rutas afectadas
    revalidatePath('/log-workout')
    revalidatePath('/statistics')
    revalidatePath('/history')

    return { success: true, sessionId: result.id }
  } catch (error) {
    console.error('[commitWorkoutSession] Transaction failed:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'TRANSACTION_FAILED',
    }
  }
}
