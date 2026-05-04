'use server'

/**
 * Exercise Server Actions
 *
 * Implements all server-side operations for exercise management:
 * - Read operations (get, search, paginate)
 * - Write operations (create, update, delete)
 * - Duplicate detection
 * - Alias management
 * - Lookup data
 */

import { revalidatePath } from 'next/cache'

// Import service functions
import * as exerciseService from '../services/exerciseService'

// Import types
import type {
  ExerciseDetail,
  ExerciseCard,
  ExerciseFilters,
  PaginationParams,
  PaginatedResult,
  CreateExercisePayload,
  UpdateExercisePayload,
  DuplicateCheckResult,
  CreateAliasPayload,
  ActionResult,
  MuscleGroup,
  Equipment,
  ExerciseAlias,
} from '../types'

// =============================================================================
// READ ACTIONS
// =============================================================================

/**
 * Get all active exercises
 */
export async function getExercises(): Promise<ExerciseCard[]> {
  return exerciseService.getExercises()
}

/**
 * Get paginated exercises with optional filters
 */
export async function getExercisesPaginated(
  params: PaginationParams,
  filters?: ExerciseFilters
): Promise<PaginatedResult<ExerciseCard>> {
  return exerciseService.getExercisesPaginated(params, filters)
}

/**
 * Get exercise by ID with full details
 */
export async function getExerciseById(
  id: string
): Promise<ExerciseDetail | null> {
  return exerciseService.getExerciseById(id)
}

/**
 * Get exercise by slug
 */
export async function getExerciseBySlug(
  slug: string
): Promise<ExerciseDetail | null> {
  return exerciseService.getExerciseBySlug(slug)
}

/**
 * Search exercises by name or alias
 */
export async function searchExercises(
  query: string,
  limit?: number
): Promise<ExerciseCard[]> {
  return exerciseService.searchExercises(query, limit)
}

// =============================================================================
// WRITE ACTIONS
// =============================================================================

/**
 * Create a new exercise
 */
export async function createExercise(
  data: CreateExercisePayload
): Promise<ActionResult<ExerciseCard>> {
  try {
    // Check for duplicates first
    const duplicateCheck = await exerciseService.checkForDuplicates(
      data.canonicalName
    )
    if (duplicateCheck.isDuplicate) {
      return {
        success: false,
        error: `Duplicate detected: "${data.canonicalName}" matches existing exercise "${duplicateCheck.matchedExercise?.canonicalName}"`,
      }
    }

    const exercise = await exerciseService.createExercise(data)
    revalidatePath('/exercises')

    return { success: true, data: exercise as ExerciseCard }
  } catch (error) {
    console.error('Error creating exercise:', error)
    return { success: false, error: 'Failed to create exercise' }
  }
}

/**
 * Update an existing exercise
 */
export async function updateExercise(
  data: UpdateExercisePayload
): Promise<ActionResult<ExerciseCard>> {
  try {
    // Check for duplicates if name is being changed
    if (data.canonicalName) {
      const duplicateCheck = await exerciseService.checkForDuplicates(
        data.canonicalName
      )
      if (
        duplicateCheck.isDuplicate &&
        String(duplicateCheck.matchedExercise?.id) !== data.id
      ) {
        return {
          success: false,
          error: `Duplicate detected: "${data.canonicalName}" matches existing exercise "${duplicateCheck.matchedExercise?.canonicalName}"`,
        }
      }
    }

    const exercise = await exerciseService.updateExercise(data)
    revalidatePath('/exercises')
    revalidatePath(`/exercises/${exercise.slug}`)

    return { success: true, data: exercise as ExerciseCard }
  } catch (error) {
    console.error('Error updating exercise:', error)
    return { success: false, error: 'Failed to update exercise' }
  }
}

/**
 * Soft delete an exercise (marks as inactive)
 */
export async function deleteExercise(id: string): Promise<ActionResult> {
  try {
    await exerciseService.deleteExercise(id)
    revalidatePath('/exercises')

    return { success: true }
  } catch (error) {
    console.error('Error deleting exercise:', error)
    return { success: false, error: 'Failed to delete exercise' }
  }
}

// =============================================================================
// DUPLICATE CHECK
// =============================================================================

/**
 * Check if an exercise name is a duplicate
 */
export async function checkDuplicateExercise(
  name: string
): Promise<DuplicateCheckResult> {
  return exerciseService.checkForDuplicates(name)
}

// =============================================================================
// ALIAS ACTIONS
// =============================================================================

/**
 * Add an alias to an exercise
 */
export async function addExerciseAlias(
  data: CreateAliasPayload
): Promise<ActionResult<ExerciseAlias>> {
  try {
    const alias = await exerciseService.addAlias(
      data.exerciseId,
      data.alias,
      data.language,
      data.isPrimary
    )
    revalidatePath('/exercises')

    return { success: true, data: alias }
  } catch (error) {
    console.error('Error adding alias:', error)
    return { success: false, error: 'Failed to add alias' }
  }
}

/**
 * Remove an alias from an exercise
 */
export async function removeExerciseAlias(
  aliasId: string
): Promise<ActionResult> {
  try {
    await exerciseService.removeAlias(aliasId)
    revalidatePath('/exercises')

    return { success: true }
  } catch (error) {
    console.error('Error removing alias:', error)
    return { success: false, error: 'Failed to remove alias' }
  }
}

// =============================================================================
// LOOKUP DATA ACTIONS
// =============================================================================

/**
 * Get all muscle groups
 */
export async function getMuscleGroups(): Promise<MuscleGroup[]> {
  return exerciseService.getMuscleGroups()
}

/**
 * Get all equipment
 */
export async function getEquipment(): Promise<Equipment[]> {
  return exerciseService.getEquipment()
}

/**
 * Get muscle groups by body region
 */
export async function getMuscleGroupsByRegion(
  bodyRegion: string
): Promise<MuscleGroup[]> {
  return exerciseService.getMuscleGroupsByRegion(bodyRegion)
}

/**
 * Get equipment by category
 */
export async function getEquipmentByCategory(
  category: string
): Promise<Equipment[]> {
  return exerciseService.getEquipmentByCategory(category)
}

// =============================================================================
// BODY PART ACTIONS
// =============================================================================

export interface BodyPartOption {
  value: string
  label: string
}

/**
 * Get BodyPart enum values with Spanish display names
 */
export async function getBodyParts(): Promise<BodyPartOption[]> {
  return [
    { value: 'CHEST', label: 'Pecho' },
    { value: 'BACK', label: 'Espalda' },
    { value: 'SHOULDERS', label: 'Hombros' },
    { value: 'BICEPS', label: 'Bíceps' },
    { value: 'TRICEPS', label: 'Tríceps' },
    { value: 'LEGS', label: 'Piernas' },
    { value: 'CORE', label: 'Core' },
    { value: 'OTHER', label: 'Otro' },
  ]
}

// =============================================================================
// USER GYM CONFIG ACTIONS
// =============================================================================

/**
 * Get user gym configuration
 */
export async function getUserGymConfig(userId: number) {
  return exerciseService.getUserGymConfig(userId)
}

/**
 * Save user gym configuration
 */
export async function saveUserGymConfig(
  userId: number,
  equipmentIds: string[],
  name?: string
) {
  return exerciseService.saveUserGymConfig(userId, equipmentIds, name)
}
