import type { WorkoutExercise } from '@core/types'

export interface DraftSession {
  // Metadata
  id: string // UUID generado al iniciar
  version: number // Para migraciones futuras
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp

  // Origen
  source: {
    type: 'routine' | 'free'
    routineId?: number
    routineDayId?: number
    routineDayName?: string
  }

  // Estado del timer
  timer: {
    startDate: string | null // ISO timestamp
    elapsedTime: number // Segundos
  }

  // Datos de la sesión
  exercises: WorkoutExercise[]
  sessionNotes: string

  // Metadatos de UI
  activeExerciseId: number | null
  lastCompletedSetId: string | null
}

// Constantes
export const DRAFT_SESSION_STORAGE_KEY = 'gym-tracker:draft-session'
export const DRAFT_SESSION_VERSION = 1
