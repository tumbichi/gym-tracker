/**
 * Exercise Service - Database operations for exercises
 *
 * Implements all CRUD operations, search, duplicate detection,
 * and alias management for the exercise taxonomy.
 */

import { database } from '@core/lib/database'

// Import types from the types module
import type {
  ExerciseDetail,
  ExerciseCard,
  ExerciseFilters,
  PaginationParams,
  PaginatedResult,
  CreateExercisePayload,
  UpdateExercisePayload,
  DuplicateCheckResult,
  Exercise,
  ExerciseAlias,
  MuscleGroup,
  Equipment,
  UserGymConfig,
} from '../types'

// Import helpers
import { calculateSimilarity, generateSlug } from '../utils/exercise-helpers'

// Import Prisma types for proper typing
import type { Prisma } from '@prisma/client'

// Re-export enums for convenience
export type {
  MovementPattern,
  ExerciseType,
  ForceVector,
  DifficultyLevel,
} from '@prisma/client'

// =============================================================================
// READ OPERATIONS
// =============================================================================

/**
 * Get all active exercises with basic relations
 */
export async function getExercises(): Promise<ExerciseCard[]> {
  return database.exercise.findMany({
    where: { isActive: true },
    include: {
      primaryMuscle: true,
      equipment: true as any,
      aliases: true,
    },
    orderBy: { canonicalName: 'asc' },
  } as any) as unknown as Promise<ExerciseCard[]>
}

/**
 * Get paginated exercises with filters
 */
export async function getExercisesPaginated(
  params: PaginationParams,
  filters?: ExerciseFilters
): Promise<PaginatedResult<ExerciseCard>> {
  const { page, pageSize } = params
  const skip = (page - 1) * pageSize

  const where = buildWhereClause(filters)

  const [data, total] = await Promise.all([
    database.exercise.findMany({
      where: { ...where, isActive: true } as any,
      include: {
        primaryMuscle: true,
        equipment: true as any,
        aliases: true,
      },
      skip,
      take: pageSize,
      orderBy: { canonicalName: 'asc' },
    } as any),
    database.exercise.count({ where: { ...where, isActive: true } as any }),
  ])

  return {
    data: data as unknown as ExerciseCard[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Get exercise by ID with full details
 */
export async function getExerciseById(
  id: string
): Promise<ExerciseDetail | null> {
  const exercise = await database.exercise.findUnique({
    where: { id } as any,
    include: {
      primaryMuscle: true,
      secondaryMuscles: true,
      equipment: true as any,
      aliases: true,
      baseExercise: true,
      variations: {
        include: {
          primaryMuscle: true,
          equipment: true as any,
        },
      },
    } as any,
  })

  return exercise as unknown as ExerciseDetail | null
}

/**
 * Get exercise by slug
 */
export async function getExerciseBySlug(
  slug: string
): Promise<ExerciseDetail | null> {
  const exercise = await database.exercise.findUnique({
    where: { slug } as any,
    include: {
      primaryMuscle: true,
      secondaryMuscles: true,
      equipment: true as any,
      aliases: true,
      baseExercise: true,
      variations: {
        include: {
          primaryMuscle: true,
          equipment: true as any,
        },
      },
    } as any,
  })

  return exercise as unknown as ExerciseDetail | null
}

/**
 * Search exercises by name or alias
 */
export async function searchExercises(
  query: string,
  limit: number = 20
): Promise<ExerciseCard[]> {
  const normalizedQuery = query.toLowerCase().trim()

  // Search in canonical names and aliases
  const exercises = await database.exercise.findMany({
    where: {
      isActive: true,
      OR: [
        { canonicalName: { contains: normalizedQuery, mode: 'insensitive' } },
        {
          aliases: {
            some: { alias: { contains: normalizedQuery, mode: 'insensitive' } },
          },
        },
      ],
    } as any,
    include: {
      primaryMuscle: true,
      equipment: true as any,
      aliases: true,
    } as any,
    take: limit,
    orderBy: { canonicalName: 'asc' },
  })

  return exercises as unknown as ExerciseCard[]
}

// =============================================================================
// WRITE OPERATIONS
// =============================================================================

/**
 * Create a new exercise
 */
export async function createExercise(
  data: CreateExercisePayload
): Promise<Exercise> {
  const slug = generateSlug(data.canonicalName)

  return database.exercise.create({
    data: {
      canonicalName: data.canonicalName,
      slug,
      description: data.description,
      instructions: data.instructions,
      primaryMuscleId: data.primaryMuscleId,
      secondaryMuscles: data.secondaryMuscleIds
        ? { connect: data.secondaryMuscleIds.map((id) => ({ id })) }
        : undefined,
      movementPattern: data.movementPattern,
      exerciseType: data.exerciseType,
      forceVector: data.forceVector,
      difficulty: data.difficulty ?? 'INTERMEDIATE',
      equipment: data.equipmentIds
        ? { connect: data.equipmentIds.map((id) => ({ id })) }
        : undefined,
      videoUrl: data.videoUrl,
      imageUrl: data.imageUrl,
      tags: data.tags ?? [],
      baseExerciseId: data.baseExerciseId,
      isCanonical: true,
      isActive: true,
    } as any,
    include: {
      primaryMuscle: true,
      equipment: true as any,
    } as any,
  }) as unknown as Exercise
}

/**
 * Update an existing exercise
 */
export async function updateExercise(
  data: UpdateExercisePayload
): Promise<Exercise> {
  const { id, ...updateData } = data

  return database.exercise.update({
    where: { id } as any,
    data: {
      canonicalName: updateData.canonicalName,
      slug: updateData.canonicalName
        ? generateSlug(updateData.canonicalName)
        : undefined,
      description: updateData.description,
      instructions: updateData.instructions,
      primaryMuscleId: updateData.primaryMuscleId,
      secondaryMuscles: updateData.secondaryMuscleIds
        ? { set: updateData.secondaryMuscleIds.map((id) => ({ id })) }
        : undefined,
      movementPattern: updateData.movementPattern,
      exerciseType: updateData.exerciseType,
      forceVector: updateData.forceVector,
      difficulty: updateData.difficulty,
      equipment: updateData.equipmentIds
        ? { set: updateData.equipmentIds.map((id) => ({ id })) }
        : undefined,
      videoUrl: updateData.videoUrl,
      imageUrl: updateData.imageUrl,
      tags: updateData.tags,
      baseExerciseId: updateData.baseExerciseId,
    } as any,
    include: {
      primaryMuscle: true,
      equipment: true as any,
    } as any,
  }) as unknown as Exercise
}

/**
 * Soft delete an exercise (marks as inactive)
 */
export async function deleteExercise(id: string): Promise<void> {
  await database.exercise.update({
    where: { id } as any,
    data: { isActive: false },
  } as any)
}

// =============================================================================
// DUPLICATE DETECTION
// =============================================================================

/**
 * Check for potential duplicates before creation
 */
export async function checkForDuplicates(
  name: string,
  threshold: number = 0.8
): Promise<DuplicateCheckResult> {
  const normalizedName = name.toLowerCase().trim()

  // Check exact matches in canonical names
  const exactMatch = await database.exercise.findFirst({
    where: {
      canonicalName: { equals: normalizedName, mode: 'insensitive' },
      isActive: true,
    },
  })

  if (exactMatch) {
    return {
      isDuplicate: true,
      matchedExercise: exactMatch as unknown as Exercise,
      similarity: 1,
    }
  }

  // Check aliases
  const aliasMatch = await database.exerciseAlias.findFirst({
    where: {
      alias: { equals: normalizedName, mode: 'insensitive' },
      exercise: { isActive: true },
    },
    include: { exercise: true },
  })

  if (aliasMatch) {
    return {
      isDuplicate: true,
      matchedExercise: aliasMatch.exercise as unknown as Exercise,
      matchedAlias: aliasMatch,
      similarity: 1,
    }
  }

  // Fuzzy match using similarity
  const allExercises = await database.exercise.findMany({
    where: { isActive: true },
    include: { aliases: true },
  })

  for (const exercise of allExercises) {
    // Check canonical name
    const canonicalSimilarity = calculateSimilarity(
      normalizedName,
      exercise.canonicalName?.toLowerCase() || ''
    )
    if (canonicalSimilarity >= threshold) {
      return {
        isDuplicate: true,
        matchedExercise: exercise as unknown as Exercise,
        similarity: canonicalSimilarity,
      }
    }

    // Check aliases
    for (const alias of exercise.aliases) {
      const aliasSimilarity = calculateSimilarity(
        normalizedName,
        alias.alias.toLowerCase()
      )
      if (aliasSimilarity >= threshold) {
        return {
          isDuplicate: true,
          matchedExercise: exercise as unknown as Exercise,
          matchedAlias: alias,
          similarity: aliasSimilarity,
        }
      }
    }
  }

  return { isDuplicate: false, similarity: 0 }
}

// =============================================================================
// ALIAS MANAGEMENT
// =============================================================================

/**
 * Add an alias to an exercise
 */
export async function addAlias(
  exerciseId: string,
  alias: string,
  language: string = 'es',
  isPrimary: boolean = false
): Promise<ExerciseAlias> {
  return database.exerciseAlias.create({
    data: {
      exerciseId: exerciseId as any,
      alias,
      language,
      isPrimary,
    },
  } as any) as unknown as ExerciseAlias
}

/**
 * Remove an alias
 */
export async function removeAlias(aliasId: string): Promise<void> {
  await database.exerciseAlias.delete({
    where: { id: aliasId },
  })
}

// =============================================================================
// LOOKUP DATA
// =============================================================================

/**
 * Get all muscle groups
 */
export async function getMuscleGroups(): Promise<MuscleGroup[]> {
  return database.muscleGroup.findMany({
    orderBy: [{ bodyRegion: 'asc' }, { displayOrder: 'asc' }],
  })
}

/**
 * Get all equipment
 */
export async function getEquipment(): Promise<Equipment[]> {
  return database.equipment.findMany({
    orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
  })
}

/**
 * Get muscle groups by body region
 */
export async function getMuscleGroupsByRegion(
  bodyRegion: string
): Promise<MuscleGroup[]> {
  return database.muscleGroup.findMany({
    where: { bodyRegion: bodyRegion as any },
    orderBy: { displayOrder: 'asc' },
  })
}

/**
 * Get equipment by category
 */
export async function getEquipmentByCategory(
  category: string
): Promise<Equipment[]> {
  return database.equipment.findMany({
    where: { category: category as any },
    orderBy: { displayOrder: 'asc' },
  })
}

// =============================================================================
// USER GYM CONFIG
// =============================================================================

/**
 * Get user gym configuration
 */
export async function getUserGymConfig(
  userId: number
): Promise<UserGymConfig | null> {
  return database.userGymConfig.findUnique({
    where: { userId },
    include: { equipment: true },
  })
}

/**
 * Create or update user gym configuration
 */
export async function saveUserGymConfig(
  userId: number,
  equipmentIds: string[],
  name?: string
): Promise<UserGymConfig> {
  return database.userGymConfig.upsert({
    where: { userId },
    update: {
      equipment: { set: equipmentIds.map((id) => ({ id })) },
      name,
    },
    create: {
      userId,
      equipment: { connect: equipmentIds.map((id) => ({ id })) },
      name,
      isDefault: true,
    },
    include: { equipment: true },
  })
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Build Prisma where clause from filters
 */
function buildWhereClause(
  filters?: ExerciseFilters
): Prisma.ExerciseWhereInput {
  if (!filters) return {}

  const conditions: Prisma.ExerciseWhereInput[] = []

  if (filters.muscleGroupId)
    conditions.push({ primaryMuscleId: filters.muscleGroupId })

  if (filters.bodyPart)
    conditions.push({
      OR: [{ primaryMuscle: { bodyPart: filters.bodyPart } }],
    } as Prisma.ExerciseWhereInput)

  if (filters.bodyRegion)
    conditions.push({
      primaryMuscle: { bodyRegion: filters.bodyRegion },
    } as Prisma.ExerciseWhereInput)

  if (filters.movementPattern)
    conditions.push({ movementPattern: filters.movementPattern })

  if (filters.exerciseType)
    conditions.push({ exerciseType: filters.exerciseType })

  if (filters.equipmentId)
    conditions.push({
      equipment: { some: { id: filters.equipmentId } },
    } as Prisma.ExerciseWhereInput)

  if (filters.equipmentCategory)
    conditions.push({
      equipment: { some: { category: filters.equipmentCategory } },
    } as Prisma.ExerciseWhereInput)

  if (filters.difficulty) conditions.push({ difficulty: filters.difficulty })

  return conditions.length > 0 ? { AND: conditions } : {}
}
