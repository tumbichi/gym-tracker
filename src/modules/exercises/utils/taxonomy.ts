/**
 * Exercise Taxonomy - Constants for muscle groups, equipment, and movement patterns
 *
 * Provides pre-defined constants for seeding data and validating exercise attributes.
 * Based on professional exercise science and the RFC specification.
 */

// Import enums from Prisma client
import { $Enums } from '@prisma/client'

// Re-export types for convenience
export type MovementPattern = $Enums.MovementPattern
export type ExerciseType = $Enums.ExerciseType
export type ForceVector = $Enums.ForceVector
export type DifficultyLevel = $Enums.DifficultyLevel
export type EquipmentCategory = $Enums.EquipmentCategory
export type BodyRegion = $Enums.BodyRegion
export type MuscleType = $Enums.MuscleType

// =============================================================================
// MOVEMENT PATTERNS
// =============================================================================

/**
 * Movement patterns defined in the RFC
 * These classify exercises by their primary movement pattern
 */
export const MOVEMENT_PATTERNS = {
  SQUAT: 'SQUAT',
  HINGE: 'HINGE',
  PUSH_HORIZONTAL: 'PUSH_HORIZONTAL',
  PUSH_VERTICAL: 'PUSH_VERTICAL',
  PULL_HORIZONTAL: 'PULL_HORIZONTAL',
  PULL_VERTICAL: 'PULL_VERTICAL',
  LUNGE: 'LUNGE',
  CARRY: 'CARRY',
  ROTATION: 'ROTATION',
  ISOLATION: 'ISOLATION',
  CARDIO: 'CARDIO',
  MOBILITY: 'MOBILITY',
} as const

/**
 * Human-readable labels for movement patterns (Spanish)
 */
export const MOVEMENT_PATTERN_LABELS: Record<MovementPattern, string> = {
  SQUAT: 'Sentadilla',
  HINGE: 'Peso Muerto',
  PUSH_HORIZONTAL: 'Empuje Horizontal',
  PUSH_VERTICAL: 'Empuje Vertical',
  PULL_HORIZONTAL: 'Tracción Horizontal',
  PULL_VERTICAL: 'Tracción Vertical',
  LUNGE: 'Zancada',
  CARRY: 'Transporte',
  ROTATION: 'Rotación',
  ISOLATION: 'Aislamiento',
  CARDIO: 'Cardio',
  MOBILITY: 'Movilidad',
}

// =============================================================================
// EXERCISE TYPES
// =============================================================================

/**
 * Exercise type classification
 */
export const EXERCISE_TYPES = {
  COMPOUND: 'COMPOUND',
  ISOLATION: 'ISOLATION',
  CARDIO: 'CARDIO',
  MOBILITY: 'MOBILITY',
  PLYOMETRIC: 'PLYOMETRIC',
} as const

/**
 * Human-readable labels for exercise types (Spanish)
 */
export const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  COMPOUND: 'Compuesto',
  ISOLATION: 'Aislado',
  CARDIO: 'Cardio',
  MOBILITY: 'Movilidad',
  PLYOMETRIC: 'Pliométrico',
}

// =============================================================================
// FORCE VECTORS
// =============================================================================

/**
 * Force vector classification
 */
export const FORCE_VECTORS = {
  PUSH_HORIZONTAL: 'PUSH_HORIZONTAL',
  PUSH_VERTICAL: 'PUSH_VERTICAL',
  PULL_HORIZONTAL: 'PULL_HORIZONTAL',
  PULL_VERTICAL: 'PULL_VERTICAL',
  ISOMETRIC: 'ISOMETRIC',
} as const

/**
 * Human-readable labels for force vectors (Spanish)
 */
export const FORCE_VECTOR_LABELS: Record<ForceVector, string> = {
  PUSH_HORIZONTAL: 'Empuje Horizontal',
  PUSH_VERTICAL: 'Empuje Vertical',
  PULL_HORIZONTAL: 'Tracción Horizontal',
  PULL_VERTICAL: 'Tracción Vertical',
  ISOMETRIC: 'Isométrico',
}

// =============================================================================
// DIFFICULTY LEVELS
// =============================================================================

/**
 * Difficulty levels
 */
export const DIFFICULTY_LEVELS = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
} as const

/**
 * Human-readable labels for difficulty levels (Spanish)
 */
export const DIFFICULTY_LEVEL_LABELS: Record<DifficultyLevel, string> = {
  BEGINNER: 'Principiante',
  INTERMEDIATE: 'Intermedio',
  ADVANCED: 'Avanzado',
}

// =============================================================================
// EQUIPMENT CATEGORIES
// =============================================================================

/**
 * Equipment categories
 */
export const EQUIPMENT_CATEGORIES = {
  BARBELL: 'BARBELL',
  DUMBBELL: 'DUMBBELL',
  MACHINE: 'MACHINE',
  CABLE: 'CABLE',
  BODYWEIGHT: 'BODYWEIGHT',
  KETTLEBELL: 'KETTLEBELL',
  SMITH: 'SMITH',
  MEDICINE_BALL: 'MEDICINE_BALL',
  RESISTANCE_BAND: 'RESISTANCE_BAND',
  OTHER: 'OTHER',
} as const

/**
 * Human-readable labels for equipment categories (Spanish)
 */
export const EQUIPMENT_CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  BARBELL: 'Barra',
  DUMBBELL: 'Mancuernas',
  MACHINE: 'Máquina',
  CABLE: 'Polea',
  BODYWEIGHT: 'Peso Corporal',
  KETTLEBELL: 'Kettlebell',
  SMITH: 'Smith',
  MEDICINE_BALL: 'Balón Medicinal',
  RESISTANCE_BAND: 'Banda Elástica',
  OTHER: 'Otro',
}

// =============================================================================
// BODY REGIONS
// =============================================================================

/**
 * Body regions
 */
export const BODY_REGIONS = {
  UPPER_BODY: 'UPPER_BODY',
  LOWER_BODY: 'LOWER_BODY',
  CORE: 'CORE',
  FULL_BODY: 'FULL_BODY',
} as const

/**
 * Human-readable labels for body regions (Spanish)
 */
export const BODY_REGION_LABELS: Record<BodyRegion, string> = {
  UPPER_BODY: 'Tren Superior',
  LOWER_BODY: 'Tren Inferior',
  CORE: 'Core',
  FULL_BODY: 'Cuerpo Completo',
}

// =============================================================================
// MUSCLE TYPES
// =============================================================================

/**
 * Muscle types
 */
export const MUSCLE_TYPES = {
  PRIMARY: 'PRIMARY',
  SECONDARY: 'SECONDARY',
  STABILIZER: 'STABILIZER',
} as const

/**
 * Human-readable labels for muscle types (Spanish)
 */
export const MUSCLE_TYPE_LABELS: Record<MuscleType, string> = {
  PRIMARY: 'Primario',
  SECONDARY: 'Secundario',
  STABILIZER: 'Estabilizador',
}

// =============================================================================
// PRE-DEFINED MUSCLE GROUPS
// =============================================================================

/**
 * Pre-defined muscle groups for seeding
 * Based on RFC Section 8.3
 */
export const SEED_MUSCLE_GROUPS = [
  // Upper Body - Push
  {
    name: 'Pecho',
    slug: 'pecho',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    muscleType: 'PRIMARY' as MuscleType,
    displayOrder: 1,
  },
  {
    name: 'Pectoral Mayor',
    slug: 'pectoral-mayor',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    muscleType: 'PRIMARY' as MuscleType,
    displayOrder: 2,
  },
  {
    name: 'Pectoral Menor',
    slug: 'pectoral-menor',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    muscleType: 'SECONDARY' as MuscleType,
    displayOrder: 3,
  },
  {
    name: 'Deltoides Anterior',
    slug: 'deltoides-anterior',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    muscleType: 'PRIMARY' as MuscleType,
    displayOrder: 4,
  },
  {
    name: 'Tríceps',
    slug: 'triceps',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    muscleType: 'PRIMARY' as MuscleType,
    displayOrder: 5,
  },

  // Upper Body - Pull
  {
    name: 'Espalda',
    slug: 'espalda',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    muscleType: 'PRIMARY' as MuscleType,
    displayOrder: 10,
  },
  {
    name: 'Dorsal Ancho',
    slug: 'dorsal-ancho',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    muscleType: 'PRIMARY' as MuscleType,
    displayOrder: 11,
  },
  {
    name: 'Trapecio',
    slug: 'trapecio',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    muscleType: 'SECONDARY' as MuscleType,
    displayOrder: 12,
  },
  {
    name: 'Romboides',
    slug: 'romboides',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    muscleType: 'SECONDARY' as MuscleType,
    displayOrder: 13,
  },
  {
    name: 'Deltoides Posterior',
    slug: 'deltoides-posterior',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    muscleType: 'PRIMARY' as MuscleType,
    displayOrder: 14,
  },
  {
    name: 'Bíceps',
    slug: 'biceps',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    muscleType: 'PRIMARY' as MuscleType,
    displayOrder: 15,
  },
  {
    name: 'Antebrazo',
    slug: 'antebrazo',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    muscleType: 'SECONDARY' as MuscleType,
    displayOrder: 16,
  },

  // Lower Body - Quad Dominant
  {
    name: 'Cuádriceps',
    slug: 'cuadriceps',
    bodyRegion: 'LOWER_BODY' as BodyRegion,
    muscleType: 'PRIMARY' as MuscleType,
    displayOrder: 20,
  },
  {
    name: 'Recto Femoral',
    slug: 'recto-femoral',
    bodyRegion: 'LOWER_BODY' as BodyRegion,
    muscleType: 'PRIMARY' as MuscleType,
    displayOrder: 21,
  },
  {
    name: 'Vasto Lateral',
    slug: 'vasto-lateral',
    bodyRegion: 'LOWER_BODY' as BodyRegion,
    muscleType: 'SECONDARY' as MuscleType,
    displayOrder: 22,
  },
  {
    name: 'Vasto Medial',
    slug: 'vano-medial',
    bodyRegion: 'LOWER_BODY' as BodyRegion,
    muscleType: 'SECONDARY' as MuscleType,
    displayOrder: 23,
  },

  // Lower Body - Hip Dominant
  {
    name: 'Isquiotibiales',
    slug: 'isquiotibiales',
    bodyRegion: 'LOWER_BODY' as BodyRegion,
    muscleType: 'PRIMARY' as MuscleType,
    displayOrder: 25,
  },
  {
    name: 'Glúteos',
    slug: 'gluteos',
    bodyRegion: 'LOWER_BODY' as BodyRegion,
    muscleType: 'PRIMARY' as MuscleType,
    displayOrder: 26,
  },
  {
    name: 'Glúteo Mayor',
    slug: 'gluteo-mayor',
    bodyRegion: 'LOWER_BODY' as BodyRegion,
    muscleType: 'PRIMARY' as MuscleType,
    displayOrder: 27,
  },
  {
    name: 'Aductores',
    slug: 'aductores',
    bodyRegion: 'LOWER_BODY' as BodyRegion,
    muscleType: 'SECONDARY' as MuscleType,
    displayOrder: 28,
  },
  {
    name: 'Pantorrillas',
    slug: 'pantorrillas',
    bodyRegion: 'LOWER_BODY' as BodyRegion,
    muscleType: 'PRIMARY' as MuscleType,
    displayOrder: 29,
  },
  {
    name: 'Gemelos',
    slug: 'gemelos',
    bodyRegion: 'LOWER_BODY' as BodyRegion,
    muscleType: 'PRIMARY' as MuscleType,
    displayOrder: 30,
  },

  // Core
  {
    name: 'Core',
    slug: 'core',
    bodyRegion: 'CORE' as BodyRegion,
    muscleType: 'PRIMARY' as MuscleType,
    displayOrder: 40,
  },
  {
    name: 'Recto Abdominal',
    slug: 'recto-abdominal',
    bodyRegion: 'CORE' as BodyRegion,
    muscleType: 'PRIMARY' as MuscleType,
    displayOrder: 41,
  },
  {
    name: 'Oblicuos',
    slug: 'oblicuos',
    bodyRegion: 'CORE' as BodyRegion,
    muscleType: 'PRIMARY' as MuscleType,
    displayOrder: 42,
  },
  {
    name: 'Erectores Espinales',
    slug: 'erectores-espinales',
    bodyRegion: 'CORE' as BodyRegion,
    muscleType: 'SECONDARY' as MuscleType,
    displayOrder: 43,
  },
  {
    name: 'Transverso Abdominal',
    slug: 'transverso-abdominal',
    bodyRegion: 'CORE' as BodyRegion,
    muscleType: 'STABILIZER' as MuscleType,
    displayOrder: 44,
  },
] as const

// =============================================================================
// PRE-DEFINED EQUIPMENT
// =============================================================================

/**
 * Pre-defined equipment for seeding
 * Based on RFC Section 8.3
 */
export const SEED_EQUIPMENT = [
  {
    name: 'Barra Olímpica',
    slug: 'barra-olimpica',
    category: 'BARBELL' as EquipmentCategory,
    displayOrder: 1,
  },
  {
    name: 'Mancuernas',
    slug: 'mancuernas',
    category: 'DUMBBELL' as EquipmentCategory,
    displayOrder: 2,
  },
  {
    name: 'Máquina',
    slug: 'maquina',
    category: 'MACHINE' as EquipmentCategory,
    displayOrder: 3,
  },
  {
    name: 'Polea',
    slug: 'polea',
    category: 'CABLE' as EquipmentCategory,
    displayOrder: 4,
  },
  {
    name: 'Peso Corporal',
    slug: 'peso-corporal',
    category: 'BODYWEIGHT' as EquipmentCategory,
    displayOrder: 5,
  },
  {
    name: 'Kettlebell',
    slug: 'kettlebell',
    category: 'KETTLEBELL' as EquipmentCategory,
    displayOrder: 6,
  },
  {
    name: 'Smith',
    slug: 'smith',
    category: 'SMITH' as EquipmentCategory,
    displayOrder: 7,
  },
  {
    name: 'Balón Medicinal',
    slug: 'balon-medicinal',
    category: 'MEDICINE_BALL' as EquipmentCategory,
    displayOrder: 8,
  },
  {
    name: 'Bandas Elásticas',
    slug: 'bandas-elasticas',
    category: 'RESISTANCE_BAND' as EquipmentCategory,
    displayOrder: 9,
  },
  {
    name: 'Otro',
    slug: 'otro',
    category: 'OTHER' as EquipmentCategory,
    displayOrder: 99,
  },
] as const

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get all valid movement patterns
 */
export function getAllMovementPatterns(): MovementPattern[] {
  return Object.values(MOVEMENT_PATTERNS) as MovementPattern[]
}

/**
 * Get all valid exercise types
 */
export function getAllExerciseTypes(): ExerciseType[] {
  return Object.values(EXERCISE_TYPES) as ExerciseType[]
}

/**
 * Get all valid difficulty levels
 */
export function getAllDifficultyLevels(): DifficultyLevel[] {
  return Object.values(DIFFICULTY_LEVELS) as DifficultyLevel[]
}

/**
 * Get all valid equipment categories
 */
export function getAllEquipmentCategories(): EquipmentCategory[] {
  return Object.values(EQUIPMENT_CATEGORIES) as EquipmentCategory[]
}

/**
 * Get all valid body regions
 */
export function getAllBodyRegions(): BodyRegion[] {
  return Object.values(BODY_REGIONS) as BodyRegion[]
}
