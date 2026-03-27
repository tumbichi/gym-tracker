export interface CommitSetEntryPayload {
  exerciseId: number
  setNumber: number
  repsDone: number
  weightKg: number
  rpe?: number
  notes?: string
}

export interface CommitWorkoutExercisePayload {
  exerciseId: number
  order: number
  notes?: string
  sets: CommitSetEntryPayload[]
}

export interface CommitSessionPayload {
  // Metadata de sesión
  startedAt: Date
  finishedAt: Date
  durationSeconds: number

  // Origen
  routineId?: number

  // Notas
  notes?: string

  // Ejercicios y series
  exercises: CommitWorkoutExercisePayload[]
}
