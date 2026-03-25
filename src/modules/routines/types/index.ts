// =============================================================================
// DOMAIN TYPES — Representan datos como vienen de la BD (con relaciones)
// =============================================================================

import type {
  Exercise,
  Routine as PrismaRoutine,
  RoutineDay as PrismaRoutineDay,
  RoutineExercise as PrismaRoutineExercise,
} from '@prisma/client'

/** RoutineExercise con la relación exercise incluida */
export type RoutineExercise = PrismaRoutineExercise & {
  exercise: Exercise
}

/** RoutineDay con sus ejercicios (items) incluidos */
export type RoutineDay = PrismaRoutineDay & {
  items: RoutineExercise[]
}

/** Routine completa con días y ejercicios anidados */
export type Routine = PrismaRoutine & {
  days: RoutineDay[]
}

// =============================================================================
// FORM TYPES — Estado local del editor (lo que maneja React state)
// =============================================================================

/** Una fila de ejercicio en el formulario del editor */
export interface ExerciseFormItem {
  /** ID del ejercicio seleccionado, null si aún no se eligió */
  exerciseId: number | null
  /** Posición dentro del día (1-based) */
  order: number
  /** Número de series (1-10). Debe coincidir con repsPerSet.length */
  series: number
  /** Reps por cada serie. Array de enteros, ej: [12, 10, 10, 8] */
  repsPerSet: number[]
  /** Notas opcionales del ejercicio */
  notes: string
}

/** Un día en el formulario del editor */
export interface DayFormData {
  /** Nombre editable del día, max 50 chars. Default: "Día N" */
  name: string
  /** Posición del día (1-based) */
  order: number
  /** Ejercicios del día */
  items: ExerciseFormItem[]
}

/** Estado completo del formulario de rutina (crear o editar) */
export interface RoutineFormData {
  /** Nombre de la rutina, max 100 chars */
  name: string
  /** Días de la rutina (1-7) */
  days: DayFormData[]
}

// =============================================================================
// ACTION PAYLOAD TYPES — Lo que se envía al server action
// =============================================================================

/** Payload para crear una rutina (server action input) */
export interface CreateRoutinePayload {
  name: string
  days: {
    name: string
    order: number
    items: {
      exerciseId: number
      order: number
      series: number
      /** JSON string: "[12,10,10,8]" */
      reps: string
      notes: string | null
    }[]
  }[]
}

/** Payload para actualizar una rutina (server action input) */
export interface UpdateRoutinePayload extends CreateRoutinePayload {}

/** Payload para crear un ejercicio on-the-fly */
export interface CreateExercisePayload {
  name: string
  primaryGroup?: string
  equipment?: string
  notes?: string
}

/** Datos para crear un ejercicio desde el editor */
export interface CreateExerciseData {
  name: string
  primaryGroup?: string
  equipment?: string
}

// =============================================================================
// VIEW TYPES — Tipos derivados para renderizado
// =============================================================================

/** Resumen de rutina para la tarjeta en la lista */
export interface RoutineCardData {
  id: number
  name: string
  daysCount: number
  activeDaysCount: number
  totalExercises: number
  isArchived: boolean
  createdAt: Date
  /** Preview de los primeros 3 días */
  dayPreviews: {
    name: string
    exerciseCount: number
  }[]
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/** Resultado de una acción de mutación */
export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

// =============================================================================
// CONVERSION HELPERS — Entre formatos de BD y formulario
// =============================================================================

/** Parsea el campo reps de la BD (JSON string) a array de números */
export function parseReps(repsJson: string): number[] {
  try {
    const parsed = JSON.parse(repsJson)
    if (Array.isArray(parsed) && parsed.every((n) => typeof n === 'number')) {
      return parsed
    }
  } catch {
    // Fallback para formato legacy "12-10-8"
    const parts = repsJson
      .split('-')
      .map(Number)
      .filter((n) => !isNaN(n))
    if (parts.length > 0) return parts
  }
  return [10] // Default fallback
}

/** Serializa array de reps a JSON string para la BD */
export function serializeReps(repsPerSet: number[]): string {
  return JSON.stringify(repsPerSet)
}

/** Convierte una Routine de BD a RoutineFormData para el editor */
export function routineToFormData(routine: Routine): RoutineFormData {
  return {
    name: routine.name,
    days: routine.days.map((day) => ({
      name: day.name,
      order: day.order,
      items: day.items.map((item) => ({
        exerciseId: item.exerciseId,
        order: item.order,
        series: item.series,
        repsPerSet: parseReps(item.reps),
        notes: item.notes ?? '',
      })),
    })),
  }
}

/** Convierte RoutineFormData del editor a CreateRoutinePayload para el action */
export function formDataToPayload(
  formData: RoutineFormData
): CreateRoutinePayload {
  return {
    name: formData.name.trim(),
    days: formData.days.map((day) => ({
      name: day.name.trim(),
      order: day.order,
      items: day.items
        .filter((item) => item.exerciseId !== null)
        .map((item) => ({
          exerciseId: item.exerciseId as number,
          order: item.order,
          series: item.repsPerSet.length,
          reps: serializeReps(item.repsPerSet),
          notes: item.notes.trim() || null,
        })),
    })),
  }
}

/** Convierte una Routine a RoutineCardData para la vista de lista */
export function routineToCardData(routine: Routine): RoutineCardData {
  return {
    id: routine.id,
    name: routine.name,
    daysCount: routine.days.length,
    activeDaysCount: routine.days.filter((d) => d.items.length > 0).length,
    totalExercises: routine.days.reduce((sum, d) => sum + d.items.length, 0),
    isArchived: routine.archivedAt !== null,
    createdAt: routine.createdAt,
    dayPreviews: routine.days.slice(0, 3).map((d) => ({
      name: d.name,
      exerciseCount: d.items.length,
    })),
  }
}
