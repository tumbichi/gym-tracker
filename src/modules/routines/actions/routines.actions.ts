'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { database as prisma } from '@core/lib/database'
import type {
  CreateExercisePayload,
  CreateRoutinePayload,
  Routine,
  UpdateRoutinePayload,
} from '@modules/routines/types'
import type { Exercise } from '@prisma/client'

// TODO: obtener userId de la sesión de auth
const USER_ID = 1

const fullRoutineInclude = {
  days: {
    include: {
      items: {
        include: {
          exercise: true,
        },
        orderBy: { order: 'asc' as const },
      },
    },
    orderBy: { order: 'asc' as const },
  },
}

// =============================================================================
// ZOD SCHEMAS (Server-side validation)
// =============================================================================

const CreateRoutineSchema = z
  .object({
    name: z.string().min(1, 'El nombre es requerido.').max(100),
    days: z
      .array(
        z.object({
          name: z.string().min(1, 'El nombre del día es requerido.').max(50),
          order: z.number().int().positive(),
          items: z.array(
            z.object({
              exerciseId: z.string().min(1),
              order: z.number().int().positive(),
              series: z.number().int().min(1).max(10),
              reps: z.string().refine((val) => {
                try {
                  const arr = JSON.parse(val)
                  return (
                    Array.isArray(arr) &&
                    arr.every(
                      (n: unknown) =>
                        typeof n === 'number' && n >= 0 && n <= 200
                    )
                  )
                } catch {
                  return false
                }
              }, 'Formato de reps inválido. Debe ser un JSON array de números.'),
              notes: z
                .string()
                .max(500, 'Las notas no pueden exceder los 500 caracteres.')
                .nullable(),
            })
          ),
        })
      )
      .min(1, 'La rutina debe tener al menos un día.')
      .max(7, 'La rutina no puede tener más de 7 días.'),
  })
  .refine(
    (data) => {
      for (const day of data.days) {
        for (const item of day.items) {
          try {
            if (JSON.parse(item.reps).length !== item.series) {
              return false
            }
          } catch {
            return false
          }
        }
      }
      return true
    },
    {
      message:
        'El número de series debe coincidir con la cantidad de repeticiones provistas.',
      path: ['days'], // Path general para el error
    }
  )

const CreateExerciseSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.').max(100),
  primaryMuscleId: z.string().min(1),
  movementPattern: z.string().min(1),
  exerciseType: z.string().min(1),
  equipmentIds: z.array(z.string()).optional(),
  notes: z.string().max(500).optional(),
})

// =============================================================================
// ROUTINE ACTIONS
// =============================================================================

export async function getRoutines(): Promise<Routine[]> {
  const routines = await prisma.routine.findMany({
    where: { userId: USER_ID, archivedAt: null },
    include: fullRoutineInclude,
    orderBy: { createdAt: 'desc' },
  })
  return routines as unknown as Routine[]
}

export async function getRoutineById(id: number): Promise<Routine | null> {
  if (id <= 0) return null
  const routine = await prisma.routine.findUnique({
    where: { id, userId: USER_ID },
    include: fullRoutineInclude,
  })
  return routine as unknown as Routine | null
}

export async function createRoutine(
  payload: CreateRoutinePayload
): Promise<Routine> {
  const validatedPayload = CreateRoutineSchema.parse(payload)

  const newRoutine = await prisma.routine.create({
    data: {
      name: validatedPayload.name,
      weeks: 1, // Hardcoded as per RFC
      user: { connect: { id: USER_ID } },
      days: {
        create: validatedPayload.days.map((day) => ({
          name: day.name,
          order: day.order,
          items: {
            create: day.items.map((item) => ({
              order: item.order,
              series: item.series,
              reps: item.reps,
              notes: item.notes,
              exercise: { connect: { id: item.exerciseId } },
            })),
          },
        })),
      },
    },
    include: fullRoutineInclude,
  })

  revalidatePath('/routines')
  return newRoutine as unknown as Routine
}

export async function updateRoutine(
  id: number,
  payload: UpdateRoutinePayload
): Promise<Routine> {
  const validatedPayload = CreateRoutineSchema.parse(payload)

  // Verify routine exists and belongs to the user
  const existingRoutine = await prisma.routine.findFirst({
    where: { id, userId: USER_ID },
  })
  if (!existingRoutine) {
    throw new Error('Rutina no encontrada o no pertenece al usuario.')
  }

  const updatedRoutine = await prisma.$transaction(async (tx) => {
    // With onDelete: Cascade, we only need to delete the days.
    await tx.routineDay.deleteMany({ where: { routineId: id } })

    return tx.routine.update({
      where: { id },
      data: {
        name: validatedPayload.name,
        weeks: 1, // Hardcoded as per RFC
        days: {
          create: validatedPayload.days.map((day) => ({
            name: day.name,
            order: day.order,
            items: {
              create: day.items.map((item) => ({
                order: item.order,
                series: item.series,
                reps: item.reps,
                notes: item.notes,
                exercise: { connect: { id: item.exerciseId } },
              })),
            },
          })),
        },
      },
      include: fullRoutineInclude,
    })
  })

  revalidatePath('/routines')
  revalidatePath(`/routines/${id}`)

  return updatedRoutine as unknown as Routine
}

export async function deleteRoutine(
  id: number
): Promise<{ deleted: boolean; archived: boolean }> {
  const routine = await prisma.routine.findUnique({
    where: { id, userId: USER_ID },
    include: { _count: { select: { sessions: true } } },
  })

  if (!routine) {
    throw new Error('Rutina no encontrada.')
  }

  if (routine._count.sessions > 0) {
    await archiveRoutine(id)
    return { deleted: false, archived: true }
  }

  // Hard delete (cascade will remove days and exercises)
  await prisma.routine.delete({ where: { id } })
  revalidatePath('/routines')
  return { deleted: true, archived: false }
}

export async function archiveRoutine(id: number): Promise<Routine> {
  const routine = await prisma.routine.update({
    where: { id, userId: USER_ID },
    data: { archivedAt: new Date() },
    include: fullRoutineInclude,
  })

  revalidatePath('/routines')
  revalidatePath(`/routines/${id}`)
  return routine as unknown as Routine
}

export async function unarchiveRoutine(id: number): Promise<Routine> {
  const routine = await prisma.routine.update({
    where: { id, userId: USER_ID },
    data: { archivedAt: null },
    include: fullRoutineInclude,
  })

  revalidatePath('/routines')
  revalidatePath(`/routines/${id}`)
  return routine as unknown as Routine
}

// =============================================================================
// EXERCISE ACTIONS
// =============================================================================

export async function getAllExercises(): Promise<Exercise[]> {
  return prisma.exercise.findMany({
    orderBy: { canonicalName: 'asc' },
  })
}

export async function createExercise(payload: any): Promise<Exercise> {
  // This is a legacy action, we should probably use the one from exercises module
  // but for now let's just fix it to not crash
  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

  const baseSlug = generateSlug(payload.name)
  let finalSlug = baseSlug
  let counter = 1

  while (await prisma.exercise.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${baseSlug}-${counter}`
    counter++
  }

  const exercise = await prisma.exercise.create({
    data: {
      canonicalName: payload.name.trim(),
      slug: finalSlug,
      primaryMuscleId: payload.primaryMuscleId || 'mg_pecho', // Fallback
      movementPattern: 'ISOLATION', // Fallback
      exerciseType: 'ISOLATION', // Fallback
    },
  })

  revalidatePath('/routines')
  return exercise
}
