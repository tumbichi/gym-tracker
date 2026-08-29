// =============================================================================
// PRISMA TYPE EXPORTS
// =============================================================================

// Import types and enums directly from the generated Prisma client
import {
  Exercise,
  ExerciseAlias,
  MuscleGroup,
  Equipment,
  UserGymConfig,
  $Enums,
} from '@prisma/client'

// Re-export Prisma types
export type { Exercise, ExerciseAlias, MuscleGroup, Equipment, UserGymConfig }

// Re-export Prisma enums from $Enums namespace
export const MovementPattern = $Enums.MovementPattern
export const ExerciseType = $Enums.ExerciseType
export const ForceVector = $Enums.ForceVector
export const DifficultyLevel = $Enums.DifficultyLevel
export const EquipmentCategory = $Enums.EquipmentCategory
export const BodyRegion = $Enums.BodyRegion
export const BodyPart = $Enums.BodyPart
export const MuscleType = $Enums.MuscleType

// Also export as types for convenience
export type MovementPattern = $Enums.MovementPattern
export type ExerciseType = $Enums.ExerciseType
export type ForceVector = $Enums.ForceVector
export type DifficultyLevel = $Enums.DifficultyLevel
export type EquipmentCategory = $Enums.EquipmentCategory
export type BodyRegion = $Enums.BodyRegion
export type BodyPart = $Enums.BodyPart
export type MuscleType = $Enums.MuscleType

// =============================================================================
// RELATION TYPES (Exercise with included relations)
// =============================================================================

/** Exercise with primary muscle group included */
export type ExerciseWithMuscle = Exercise & {
  primaryMuscle: MuscleGroup | null
  secondaryMuscles: MuscleGroup[]
}

/** Exercise with all relations for detail view */
export type ExerciseDetail = Exercise & {
  primaryMuscle: MuscleGroup | null
  secondaryMuscles: MuscleGroup[]
  equipment: Equipment[]
  aliases: ExerciseAlias[]
  baseExercise?: Exercise | null
  variations: (Exercise & { primaryMuscle?: MuscleGroup | null })[]
}

/** Exercise for list/card view */
export type ExerciseCard = Exercise & {
  primaryMuscle: MuscleGroup | null
  equipment: Equipment[]
  aliases: ExerciseAlias[]
}

// =============================================================================
// FORM TYPES
// =============================================================================

/** Payload for creating a new exercise */
export interface CreateExercisePayload {
  canonicalName: string
  description?: string
  instructions?: string
  primaryMuscleId: string
  secondaryMuscleIds?: string[]
  movementPattern: MovementPattern
  exerciseType: ExerciseType
  forceVector?: ForceVector
  difficulty?: DifficultyLevel
  equipmentIds?: string[]
  videoUrl?: string
  imageUrl?: string
  tags?: string[]
  baseExerciseId?: string
}

/** Payload for updating an exercise */
export interface UpdateExercisePayload extends Partial<CreateExercisePayload> {
  id: string
}

/** Payload for creating an alias */
export interface CreateAliasPayload {
  exerciseId: string
  alias: string
  language?: string
  isPrimary?: boolean
}

// =============================================================================
// SEARCH & FILTER TYPES
// =============================================================================

/** Filter options for exercise search */
export interface ExerciseFilters {
  muscleGroupId?: string
  bodyPart?: BodyPart
  bodyRegion?: BodyRegion
  movementPattern?: MovementPattern
  exerciseType?: ExerciseType
  equipmentId?: string
  equipmentCategory?: EquipmentCategory
  difficulty?: DifficultyLevel
}

/** Sort options for exercise list */
export type ExerciseSortOption =
  | 'name_asc'
  | 'name_desc'
  | 'created_asc'
  | 'created_desc'
  | 'difficulty_asc'
  | 'difficulty_desc'

/** Pagination params */
export interface PaginationParams {
  page: number
  pageSize: number
}

/** Paginated result */
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// =============================================================================
// ACTION RESULT TYPES
// =============================================================================

/** Standard action result */
export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

/** Duplicate detection result */
export interface DuplicateCheckResult {
  isDuplicate: boolean
  matchedExercise?: Exercise
  matchedAlias?: ExerciseAlias
  similarity: number // 0-1 score
}

// =============================================================================
// VIEW TYPES (Derived for UI)
// =============================================================================

/** Exercise option for picker/select components */
export interface ExerciseOption {
  id: string
  name: string
  primaryMuscle: string
  equipment: string[]
  difficulty: DifficultyLevel
}

/** Muscle group with exercise count */
export interface MuscleGroupWithCount extends MuscleGroup {
  exerciseCount: number
}

/** Equipment with exercise count */
export interface EquipmentWithCount extends Equipment {
  exerciseCount: number
}
