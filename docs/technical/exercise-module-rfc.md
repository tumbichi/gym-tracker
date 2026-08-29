# RFC: Exercise Module Redesign — Technical Specification

**ID**: technical/exercise-module-rfc  
**Status**: Draft  
**Date**: 2026-03-28  
**Author**: architect  
**Version**: 1.0  
**PRD Reference**: `docs/product/features/exercise-module-redesign.md`

---

## 1. Executive Summary

### Problem Statement

The current exercise module violates SDD architecture principles and lacks a professional classification system:

1. **Architecture Debt**: The exercises module was never migrated to SDD pattern. It only contains `actions/exercises.actions.ts` with a single `getExercises()` function.
2. **Misplaced Code**: `exercise-form.tsx` lives in `src/core/components/` instead of the exercises module.
3. **Cross-Module Coupling**: `ExercisePicker.tsx` is in the routines module but should be shared.
4. **Thick Pages**: `src/app/(index)/exercises/client.tsx` contains business logic that belongs in a Feature.
5. **Primitive Data Model**: Current `Exercise` model uses simple strings for muscle groups and equipment, preventing analytics and filtering.

### Solution Overview

This RFC defines a complete SDD migration and professional classification system:

- **Full SDD Module Structure**: Create complete `src/modules/exercises/` with features, components, hooks, services, types, and utils.
- **Canonical Exercise System**: Introduce `Exercise`, `ExerciseAlias`, `ExerciseVariation`, `MuscleGroup`, `Equipment`, and `UserGymConfig` models.
- **Professional Taxonomy**: 15+ muscle groups, 10 equipment categories, 8 movement patterns.
- **Incremental Migration**: 5-phase migration strategy preserving backward compatibility.

---

## 2. Architecture Overview

### 2.1 SDD Pattern Application

The exercises module will follow the established SDD pattern from `ARCHITECTURE.md`:

```
src/modules/exercises/
├── __tests__/                    # Unit and integration tests
│   ├── exercise-service.test.ts
│   ├── exercise-hooks.test.ts
│   └── components/
│       └── ExerciseCard.test.tsx
├── features/                     # Smart Components (Orchestrators)
│   ├── exercise-list.feature.tsx      # List with filters, search, pagination
│   ├── exercise-detail.feature.tsx    # Detail view with variations
│   ├── exercise-form.feature.tsx      # Create/edit with duplicate detection
│   └── exercise-picker.feature.tsx    # Picker for routines/workouts (shared)
├── components/                   # Dumb Components (Presentational)
│   ├── ExerciseCard.tsx              # Card for list view
│   ├── ExerciseFilters.tsx           # Filter controls
│   ├── ExerciseSearch.tsx            # Search input with suggestions
│   ├── ExerciseAliasList.tsx         # Alias management UI
│   ├── ExerciseVariationTree.tsx     # Variation hierarchy display
│   ├── MuscleGroupBadge.tsx          # Badge for muscle groups
│   ├── EquipmentBadge.tsx            # Badge for equipment
│   └── ExerciseDetailPanel.tsx       # Detail panel content
├── hooks/                        # Module-specific React logic
│   ├── useExercises.ts               # Fetch and cache exercises
│   ├── useExerciseSearch.ts          # Search with debouncing
│   ├── useExerciseFilters.ts         # Filter state management
│   ├── useExerciseAliases.ts         # Alias CRUD operations
│   └── useDuplicateDetection.ts      # Real-time duplicate check
├── services/                     # Communication with database
│   └── exerciseService.ts            # All exercise-related queries
├── actions/                      # Server Actions (refactored)
│   └── exercises.actions.ts          # CRUD operations
├── types/                        # TypeScript interfaces
│   └── index.ts                      # All domain types
└── utils/                        # Helper functions
    ├── exercise-helpers.ts           # Slug generation, matching
    └── taxonomy.ts                   # Muscle groups, equipment constants
```

### 2.2 Dependency Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        src/app/                                 │
│  (Thin pages - only render Features from modules)              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   src/modules/exercises/                        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │  features/  │───▶│  hooks/     │───▶│  services/  │        │
│  │  (Smart)    │    │             │    │             │        │
│  └──────┬──────┘    └─────────────┘    └─────────────┘        │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────┐                                              │
│  │ components/ │  ◀── Dumb components, no hooks/services      │
│  │  (Dumb)     │                                              │
│  └─────────────┘                                              │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        src/core/                                │
│  components/ui/  │  lib/  │  hooks/  │  layout/               │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Cross-Module Integration

The `exercise-picker.feature.tsx` will be the **public interface** for other modules:

```typescript
// src/modules/routines/features/routine-editor.feature.tsx
import { ExercisePickerFeature } from '@modules/exercises/features/exercise-picker.feature'

// src/modules/log-workout/modules/session/features/workout-session.tsx
import { ExercisePickerFeature } from '@modules/exercises/features/exercise-picker.feature'
```

---

## 3. Database Schema Design

### 3.1 Enums

```prisma
// Movement patterns for exercise classification
enum MovementPattern {
  SQUAT           // Knee-dominant: back squat, front squat, leg press
  HINGE           // Hip-dominant: deadlift, RDL, good morning
  PUSH_HORIZONTAL // Bench press, push-up, dip
  PUSH_VERTICAL   // Overhead press, handstand push-up
  PULL_HORIZONTAL // Barbell row, cable row, face pull
  PULL_VERTICAL   // Pull-up, lat pulldown, chin-up
  LUNGE           // Lunge, split squat, step-up
  CARRY           // Farmer's walk, suitcase carry
  ROTATION        // Russian twist, woodchop
  ISOLATION       // Bicep curl, tricep extension
  CARDIO          // Running, cycling, rowing machine
  MOBILITY        // Stretching, foam rolling
}

// Exercise type classification
enum ExerciseType {
  COMPOUND        // Multi-joint: squat, deadlift, bench press
  ISOLATION       // Single-joint: bicep curl, leg extension
  CARDIO          // Aerobic: running, cycling
  MOBILITY        // Flexibility/mobility work
  PLYOMETRIC      // Explosive: box jump, clap push-up
}

// Force vector for biomechanics
enum ForceVector {
  PUSH_HORIZONTAL
  PUSH_VERTICAL
  PULL_HORIZONTAL
  PULL_VERTICAL
  ISOMETRIC       // Plank, wall sit
}

// Difficulty level for user guidance
enum DifficultyLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

// Equipment categories
enum EquipmentCategory {
  BARBELL         // Olympic barbell
  DUMBBELL        // Dumbbells
  MACHINE         // Pin-loaded machines
  CABLE           // Cable machines
  BODYWEIGHT      // No equipment needed
  KETTLEBELL      // Kettlebells
  SMITH           // Smith machine
  MEDICINE_BALL   // Medicine balls
  RESISTANCE_BAND // Resistance bands
  OTHER           // Miscellaneous
}

// Body region for muscle groups
enum BodyRegion {
  UPPER_BODY
  LOWER_BODY
  CORE
  FULL_BODY
}

// Muscle type for classification
enum MuscleType {
  PRIMARY         // Primary mover
  SECONDARY       // Synergist
  STABILIZER      // Stabilizing muscle
}
```

### 3.2 Models

```prisma
// =============================================================================
// EXERCISE CORE MODELS
// =============================================================================

model Exercise {
  id                String           @id @default(cuid())
  canonicalName     String           @unique
  slug              String           @unique
  description       String?          @db.Text
  instructions      String?          @db.Text

  // Classification
  primaryMuscleId   String
  primaryMuscle     MuscleGroup      @relation("PrimaryMuscle", fields: [primaryMuscleId], references: [id])
  secondaryMuscles  MuscleGroup[]    @relation("SecondaryMuscles")
  movementPattern   MovementPattern
  exerciseType      ExerciseType
  forceVector       ForceVector?
  difficulty        DifficultyLevel  @default(INTERMEDIATE)

  // Equipment (many-to-many)
  equipment         Equipment[]      @relation("ExerciseEquipment")

  // Media
  videoUrl          String?
  imageUrl          String?

  // Metadata
  tags              String[]
  isCanonical       Boolean          @default(true)
  isActive          Boolean          @default(true)

  // Self-referential for variations
  baseExerciseId    String?
  baseExercise      Exercise?        @relation("ExerciseVariations", fields: [baseExerciseId], references: [id], onDelete: SetNull)
  variations        Exercise[]       @relation("ExerciseVariations")

  // Relations
  aliases           ExerciseAlias[]

  // Backward compatibility - keep Int IDs for existing relations
  legacyId          Int?             @unique  // Maps old Int ID to new String ID

  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt

  // Existing relations (will be updated in migration)
  routineExercises  RoutineExercise[]
  workoutExercises  WorkoutExercise[]
  setEntries        SetEntry[]

  @@index([canonicalName])
  @@index([slug])
  @@index([primaryMuscleId])
  @@index([movementPattern])
  @@index([exerciseType])
}

model ExerciseAlias {
  id          String    @id @default(cuid())
  exerciseId  String
  exercise    Exercise  @relation(fields: [exerciseId], references: [id], onDelete: Cascade)
  alias       String
  language    String    @default('es')
  isPrimary   Boolean   @default(false)  // Primary alias for display
  createdAt   DateTime  @default(now())

  @@unique([exerciseId, alias])
  @@index([alias])
}

model MuscleGroup {
  id                 String      @id @default(cuid())
  name               String      @unique
  slug               String      @unique
  bodyRegion         BodyRegion
  muscleType         MuscleType  @default(PRIMARY)
  description        String?
  displayOrder       Int         @default(0)

  // Relations
  primaryExercises   Exercise[]  @relation("PrimaryMuscle")
  secondaryExercises Exercise[]  @relation("SecondaryMuscles")

  @@index([bodyRegion])
  @@index([slug])
}

model Equipment {
  id           String            @id @default(cuid())
  name         String            @unique
  slug         String            @unique
  category     EquipmentCategory
  description  String?
  icon         String?           // Lucide icon name
  displayOrder Int              @default(0)

  // Relations
  exercises    Exercise[]        @relation("ExerciseEquipment")
  userConfigs  UserGymConfig[]   @relation("UserGymEquipment")

  @@index([category])
  @@index([slug])
}

model UserGymConfig {
  id          String      @id @default(cuid())
  userId      Int         @unique
  name        String?     // Gym name (optional)
  equipment   Equipment[] @relation("UserGymEquipment")
  isDefault   Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([userId])
}

// =============================================================================
// UPDATED EXISTING MODELS (Migration Phase 3)
// =============================================================================

// Updated RoutineExercise - exerciseId changes from Int to String
model RoutineExercise {
  id           Int        @id @default(autoincrement())
  routineDayId Int
  exerciseId   String     // Changed from Int
  order        Int
  series       Int
  reps         String     // JSON array: "[12,10,10,8]"
  notes        String?
  exercise     Exercise   @relation(fields: [exerciseId], references: [id])
  routineDay   RoutineDay @relation(fields: [routineDayId], references: [id], onDelete: Cascade)

  @@index([routineDayId])
  @@index([exerciseId])
}

// Updated WorkoutExercise - exerciseId changes from Int to String
model WorkoutExercise {
  id         Int        @id @default(autoincrement())
  sessionId  Int
  exerciseId String     // Changed from Int
  order      Int
  notes      String?
  sets       SetEntry[]
  session    WorkoutSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  exercise   Exercise       @relation(fields: [exerciseId], references: [id])

  @@index([sessionId])
  @@index([sessionId, order])
  @@index([exerciseId])
}

// Updated SetEntry - exerciseId changes from Int to String
model SetEntry {
  id                Int             @id @default(autoincrement())
  workoutExerciseId Int
  exerciseId        String          // Changed from Int
  setNumber         Int
  repsDone          Int
  weightKg          Float
  rpe               Int?
  notes             String?
  createdAt         DateTime        @default(now())
  workoutExercise   WorkoutExercise @relation(fields: [workoutExerciseId], references: [id], onDelete: Cascade)
  exercise          Exercise        @relation(fields: [exerciseId], references: [id])

  @@index([workoutExerciseId])
  @@index([exerciseId])
}
```

### 3.3 Many-to-Many Relation Table (Implicit in Prisma)

Prisma will create an implicit join table for `Exercise` ↔ `Equipment`:

```sql
-- Generated by Prisma
CREATE TABLE "_ExerciseEquipment" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL,
  CONSTRAINT "_ExerciseEquipment_A_fkey" FOREIGN KEY ("A") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "_ExerciseEquipment_B_fkey" FOREIGN KEY ("B") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
```

### 3.4 Indexes for Performance

```sql
-- Exercise search performance
CREATE INDEX idx_exercise_canonical_name ON "Exercise"("canonicalName");
CREATE INDEX idx_exercise_slug ON "Exercise"("slug");
CREATE INDEX idx_exercise_primary_muscle ON "Exercise"("primaryMuscleId");
CREATE INDEX idx_exercise_movement_pattern ON "Exercise"("movementPattern");
CREATE INDEX idx_exercise_type ON "Exercise"("exerciseType");

-- Alias search (full-text search candidate)
CREATE INDEX idx_exercise_alias ON "ExerciseAlias"("alias");

-- Muscle group lookups
CREATE INDEX idx_muscle_group_region ON "MuscleGroup"("bodyRegion");
CREATE INDEX idx_muscle_group_slug ON "MuscleGroup"("slug");

-- Equipment lookups
CREATE INDEX idx_equipment_category ON "Equipment"("category");
CREATE INDEX idx_equipment_slug ON "Equipment"("slug");

-- Cross-relation indexes
CREATE INDEX idx_routine_exercise_exercise ON "RoutineExercise"("exerciseId");
CREATE INDEX idx_workout_exercise_exercise ON "WorkoutExercise"("exerciseId");
CREATE INDEX idx_set_entry_exercise ON "SetEntry"("exerciseId");
```

---

## 4. Type Definitions

### 4.1 Domain Types (`src/modules/exercises/types/index.ts`)

```typescript
// =============================================================================
// PRISMA TYPE EXPORTS
// =============================================================================

import type {
  Exercise as PrismaExercise,
  ExerciseAlias as PrismaExerciseAlias,
  MuscleGroup as PrismaMuscleGroup,
  Equipment as PrismaEquipment,
  UserGymConfig as PrismaUserGymConfig,
} from '@prisma/client'

// Re-export Prisma types
export type Exercise = PrismaExercise
export type ExerciseAlias = PrismaExerciseAlias
export type MuscleGroup = PrismaMuscleGroup
export type Equipment = PrismaEquipment
export type UserGymConfig = PrismaUserGymConfig

// =============================================================================
// ENUM EXPORTS
// =============================================================================

export {
  MovementPattern,
  ExerciseType,
  ForceVector,
  DifficultyLevel,
  EquipmentCategory,
  BodyRegion,
  MuscleType,
} from '@prisma/client'

// =============================================================================
// RELATION TYPES (Exercise with included relations)
// =============================================================================

/** Exercise with primary muscle group included */
export type ExerciseWithMuscle = Exercise & {
  primaryMuscle: MuscleGroup
  secondaryMuscles: MuscleGroup[]
}

/** Exercise with all relations for detail view */
export type ExerciseDetail = Exercise & {
  primaryMuscle: MuscleGroup
  secondaryMuscles: MuscleGroup[]
  equipment: Equipment[]
  aliases: ExerciseAlias[]
  baseExercise?: Exercise | null
  variations: Exercise[]
}

/** Exercise for list/card view */
export type ExerciseCard = Exercise & {
  primaryMuscle: MuscleGroup
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
```

---

## 5. Service Layer Design

### 5.1 Exercise Service (`src/modules/exercises/services/exerciseService.ts`)

```typescript
import { database } from '@core/lib/database'
import type {
  Exercise,
  ExerciseDetail,
  ExerciseCard,
  ExerciseFilters,
  PaginationParams,
  PaginatedResult,
  CreateExercisePayload,
  UpdateExercisePayload,
  DuplicateCheckResult,
} from '../types'
import { calculateSimilarity } from '../utils/exercise-helpers'

// =============================================================================
// READ OPERATIONS
// =============================================================================

/** Get all exercises with basic relations */
export async function getExercises(): Promise<ExerciseCard[]> {
  return database.exercise.findMany({
    where: { isActive: true },
    include: {
      primaryMuscle: true,
      equipment: true,
      aliases: true,
    },
    orderBy: { canonicalName: 'asc' },
  })
}

/** Get paginated exercises with filters */
export async function getExercisesPaginated(
  params: PaginationParams,
  filters?: ExerciseFilters
): Promise<PaginatedResult<ExerciseCard>> {
  const { page, pageSize } = params
  const skip = (page - 1) * pageSize

  const where = buildWhereClause(filters)

  const [data, total] = await Promise.all([
    database.exercise.findMany({
      where: { ...where, isActive: true },
      include: {
        primaryMuscle: true,
        equipment: true,
        aliases: true,
      },
      skip,
      take: pageSize,
      orderBy: { canonicalName: 'asc' },
    }),
    database.exercise.count({ where: { ...where, isActive: true } }),
  ])

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/** Get exercise by ID with full details */
export async function getExerciseById(
  id: string
): Promise<ExerciseDetail | null> {
  return database.exercise.findUnique({
    where: { id },
    include: {
      primaryMuscle: true,
      secondaryMuscles: true,
      equipment: true,
      aliases: true,
      baseExercise: true,
      variations: {
        include: {
          primaryMuscle: true,
          equipment: true,
        },
      },
    },
  })
}

/** Get exercise by slug */
export async function getExerciseBySlug(
  slug: string
): Promise<ExerciseDetail | null> {
  return database.exercise.findUnique({
    where: { slug },
    include: {
      primaryMuscle: true,
      secondaryMuscles: true,
      equipment: true,
      aliases: true,
      baseExercise: true,
      variations: {
        include: {
          primaryMuscle: true,
          equipment: true,
        },
      },
    },
  })
}

/** Search exercises by name or alias */
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
    },
    include: {
      primaryMuscle: true,
      equipment: true,
      aliases: true,
    },
    take: limit,
    orderBy: { canonicalName: 'asc' },
  })

  return exercises
}

// =============================================================================
// WRITE OPERATIONS
// =============================================================================

/** Create a new exercise */
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
    },
    include: {
      primaryMuscle: true,
      equipment: true,
    },
  })
}

/** Update an existing exercise */
export async function updateExercise(
  data: UpdateExercisePayload
): Promise<Exercise> {
  const { id, ...updateData } = data

  return database.exercise.update({
    where: { id },
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
    },
    include: {
      primaryMuscle: true,
      equipment: true,
    },
  })
}

/** Soft delete an exercise */
export async function deleteExercise(id: string): Promise<void> {
  await database.exercise.update({
    where: { id },
    data: { isActive: false },
  })
}

// =============================================================================
// DUPLICATE DETECTION
// =============================================================================

/** Check for potential duplicates before creation */
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
      matchedExercise: exactMatch,
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
      matchedExercise: aliasMatch.exercise,
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
    const similarity = calculateSimilarity(
      normalizedName,
      exercise.canonicalName.toLowerCase()
    )
    if (similarity >= threshold) {
      return {
        isDuplicate: true,
        matchedExercise: exercise,
        similarity,
      }
    }

    for (const alias of exercise.aliases) {
      const aliasSimilarity = calculateSimilarity(
        normalizedName,
        alias.alias.toLowerCase()
      )
      if (aliasSimilarity >= threshold) {
        return {
          isDuplicate: true,
          matchedExercise: exercise,
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

/** Add an alias to an exercise */
export async function addAlias(
  exerciseId: string,
  alias: string,
  language: string = 'es',
  isPrimary: boolean = false
): Promise<ExerciseAlias> {
  return database.exerciseAlias.create({
    data: {
      exerciseId,
      alias,
      language,
      isPrimary,
    },
  })
}

/** Remove an alias */
export async function removeAlias(aliasId: string): Promise<void> {
  await database.exerciseAlias.delete({
    where: { id: aliasId },
  })
}

// =============================================================================
// LOOKUP DATA
// =============================================================================

/** Get all muscle groups */
export async function getMuscleGroups(): Promise<MuscleGroup[]> {
  return database.muscleGroup.findMany({
    orderBy: [{ bodyRegion: 'asc' }, { displayOrder: 'asc' }],
  })
}

/** Get all equipment */
export async function getEquipment(): Promise<Equipment[]> {
  return database.equipment.findMany({
    orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
  })
}

// =============================================================================
// HELPERS
// =============================================================================

function buildWhereClause(filters?: ExerciseFilters) {
  if (!filters) return {}

  return {
    AND: [
      filters.muscleGroupId ? { primaryMuscleId: filters.muscleGroupId } : {},
      filters.bodyRegion
        ? { primaryMuscle: { bodyRegion: filters.bodyRegion } }
        : {},
      filters.movementPattern
        ? { movementPattern: filters.movementPattern }
        : {},
      filters.exerciseType ? { exerciseType: filters.exerciseType } : {},
      filters.equipmentId
        ? { equipment: { some: { id: filters.equipmentId } } }
        : {},
      filters.equipmentCategory
        ? { equipment: { some: { category: filters.equipmentCategory } } }
        : {},
      filters.difficulty ? { difficulty: filters.difficulty } : {},
    ],
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
```

---

## 6. Server Actions Design

### 6.1 Exercise Actions (`src/modules/exercises/actions/exercises.actions.ts`)

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import * as exerciseService from '../services/exerciseService'
import type {
  CreateExercisePayload,
  UpdateExercisePayload,
  CreateAliasPayload,
  ActionResult,
  DuplicateCheckResult,
  Exercise,
  ExerciseDetail,
  ExerciseCard,
  PaginatedResult,
  PaginationParams,
  ExerciseFilters,
} from '../types'

// =============================================================================
// READ ACTIONS
// =============================================================================

export async function getExercises(): Promise<ExerciseCard[]> {
  return exerciseService.getExercises()
}

export async function getExercisesPaginated(
  params: PaginationParams,
  filters?: ExerciseFilters
): Promise<PaginatedResult<ExerciseCard>> {
  return exerciseService.getExercisesPaginated(params, filters)
}

export async function getExerciseById(
  id: string
): Promise<ExerciseDetail | null> {
  return exerciseService.getExerciseById(id)
}

export async function getExerciseBySlug(
  slug: string
): Promise<ExerciseDetail | null> {
  return exerciseService.getExerciseBySlug(slug)
}

export async function searchExercises(query: string): Promise<ExerciseCard[]> {
  return exerciseService.searchExercises(query)
}

// =============================================================================
// WRITE ACTIONS
// =============================================================================

export async function createExercise(
  data: CreateExercisePayload
): Promise<ActionResult<Exercise>> {
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

    return { success: true, data: exercise }
  } catch (error) {
    console.error('Error creating exercise:', error)
    return { success: false, error: 'Failed to create exercise' }
  }
}

export async function updateExercise(
  data: UpdateExercisePayload
): Promise<ActionResult<Exercise>> {
  try {
    // Check for duplicates if name is being changed
    if (data.canonicalName) {
      const duplicateCheck = await exerciseService.checkForDuplicates(
        data.canonicalName
      )
      if (
        duplicateCheck.isDuplicate &&
        duplicateCheck.matchedExercise?.id !== data.id
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

    return { success: true, data: exercise }
  } catch (error) {
    console.error('Error updating exercise:', error)
    return { success: false, error: 'Failed to update exercise' }
  }
}

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

export async function checkDuplicateExercise(
  name: string
): Promise<DuplicateCheckResult> {
  return exerciseService.checkForDuplicates(name)
}

// =============================================================================
// ALIAS ACTIONS
// =============================================================================

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

export async function getMuscleGroups() {
  return exerciseService.getMuscleGroups()
}

export async function getEquipment() {
  return exerciseService.getEquipment()
}
```

---

## 7. Hooks Design

### 7.1 useExercises Hook (`src/modules/exercises/hooks/useExercises.ts`)

```typescript
'use client'

import useSWR from 'swr'
import {
  getExercises,
  getExercisesPaginated,
} from '../actions/exercises.actions'
import type {
  ExerciseCard,
  PaginationParams,
  ExerciseFilters,
  PaginatedResult,
} from '../types'

export function useExercises() {
  const { data, error, isLoading, mutate } = useSWR(
    'exercises',
    () => getExercises(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  )

  return {
    exercises: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}

export function useExercisesPaginated(
  params: PaginationParams,
  filters?: ExerciseFilters
) {
  const key = filters
    ? `exercises-paginated-${JSON.stringify(params)}-${JSON.stringify(filters)}`
    : `exercises-paginated-${JSON.stringify(params)}`

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => getExercisesPaginated(params, filters),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  return {
    data: data?.data ?? [],
    pagination: data
      ? {
          total: data.total,
          page: data.page,
          pageSize: data.pageSize,
          totalPages: data.totalPages,
        }
      : null,
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}
```

### 7.2 useExerciseSearch Hook (`src/modules/exercises/hooks/useExerciseSearch.ts`)

```typescript
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import useSWR from 'swr'
import {
  searchExercises,
  checkDuplicateExercise,
} from '../actions/exercises.actions'
import type { ExerciseCard, DuplicateCheckResult } from '../types'

export function useExerciseSearch(debounceMs: number = 300) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query)
    }, debounceMs)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, debounceMs])

  const { data, error, isLoading } = useSWR(
    debouncedQuery ? `exercise-search-${debouncedQuery}` : null,
    () => searchExercises(debouncedQuery),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  )

  return {
    query,
    setQuery,
    results: data ?? [],
    isLoading,
    isError: !!error,
    error,
  }
}

export function useDuplicateDetection(debounceMs: number = 500) {
  const [name, setName] = useState('')
  const [debouncedName, setDebouncedName] = useState('')
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedName(name)
    }, debounceMs)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [name, debounceMs])

  const { data, isLoading } = useSWR<DuplicateCheckResult>(
    debouncedName.length >= 3 ? `duplicate-check-${debouncedName}` : null,
    () => checkDuplicateExercise(debouncedName),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  )

  return {
    name,
    setName,
    duplicateCheck: data ?? { isDuplicate: false, similarity: 0 },
    isChecking: isLoading,
  }
}
```

### 7.3 useExerciseFilters Hook (`src/modules/exercises/hooks/useExerciseFilters.ts`)

```typescript
'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ExerciseFilters, ExerciseSortOption } from '../types'

const DEFAULT_PAGE_SIZE = 20

export function useExerciseFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Parse filters from URL
  const filters = useMemo<ExerciseFilters>(
    () => ({
      muscleGroupId: searchParams.get('muscle') ?? undefined,
      bodyRegion: (searchParams.get('region') as BodyRegion) ?? undefined,
      movementPattern:
        (searchParams.get('pattern') as MovementPattern) ?? undefined,
      exerciseType: (searchParams.get('type') as ExerciseType) ?? undefined,
      equipmentId: searchParams.get('equipment') ?? undefined,
      equipmentCategory:
        (searchParams.get('category') as EquipmentCategory) ?? undefined,
      difficulty:
        (searchParams.get('difficulty') as DifficultyLevel) ?? undefined,
    }),
    [searchParams]
  )

  const sort = (searchParams.get('sort') as ExerciseSortOption) ?? 'name_asc'
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const pageSize = parseInt(
    searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE),
    10
  )

  const updateFilters = useCallback(
    (newFilters: Partial<ExerciseFilters>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          params.delete(key)
        } else {
          params.set(key, String(value))
        }
      })

      // Reset to page 1 when filters change
      params.set('page', '1')

      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const updateSort = useCallback(
    (newSort: ExerciseSortOption) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('sort', newSort)
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const updatePage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', String(newPage))
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const clearFilters = useCallback(() => {
    router.push('', { scroll: false })
  }, [router])

  return {
    filters,
    sort,
    page,
    pageSize,
    updateFilters,
    updateSort,
    updatePage,
    clearFilters,
    hasActiveFilters: Object.values(filters).some((v) => v !== undefined),
  }
}
```

---

## 8. Migration Strategy

### 8.1 Overview

The migration is divided into 5 phases to ensure zero downtime and data integrity:

```
Phase 1: Add New Tables (No Breaking Changes)
    ↓
Phase 2: Seed Reference Data (Muscle Groups, Equipment)
    ↓
Phase 3: Migrate Existing Exercises to Canonical System
    ↓
Phase 4: Update Foreign Keys (Int → String)
    ↓
Phase 5: Refactor UI to Use New Module Structure
```

### 8.2 Phase 1: Add New Tables

**Goal**: Create new tables without breaking existing functionality.

**Migration File**: `20260328_add_exercise_taxonomy_tables.prisma`

```prisma
// Add new enums
enum MovementPattern { ... }
enum ExerciseType { ... }
enum ForceVector { ... }
enum DifficultyLevel { ... }
enum EquipmentCategory { ... }
enum BodyRegion { ... }
enum MuscleType { ... }

// Add new models (no relations to existing tables yet)
model MuscleGroup { ... }
model Equipment { ... }
model UserGymConfig { ... }

// Add new fields to Exercise (nullable, optional)
model Exercise {
  // ... existing fields ...

  // New fields (all nullable for migration)
  canonicalName   String?   @unique
  description     String?   @db.Text
  instructions    String?   @db.Text
  movementPattern MovementPattern?
  exerciseType    ExerciseType?
  forceVector     ForceVector?
  difficulty      DifficultyLevel @default(INTERMEDIATE)
  videoUrl        String?
  imageUrl        String?
  tags            String[]
  isCanonical     Boolean   @default(true)
  isActive        Boolean   @default(true)
  legacyId        Int?      @unique
}
```

**Actions**:

1. Run `prisma migrate dev --name add_exercise_taxonomy_tables`
2. Verify existing functionality still works
3. No code changes required at this phase

### 8.3 Phase 2: Seed Reference Data

**Goal**: Populate MuscleGroup and Equipment tables with initial data.

**Seed File**: `prisma/seed-exercise-taxonomy.ts`

```typescript
import {
  PrismaClient,
  BodyRegion,
  MuscleType,
  EquipmentCategory,
} from '@prisma/client'

const prisma = new PrismaClient()

const MUSCLE_GROUPS = [
  // Upper Body - Push
  {
    name: 'Pecho',
    slug: 'pecho',
    bodyRegion: 'UPPER_BODY',
    muscleType: 'PRIMARY',
    displayOrder: 1,
  },
  {
    name: 'Pectoral Mayor',
    slug: 'pectoral-mayor',
    bodyRegion: 'UPPER_BODY',
    muscleType: 'PRIMARY',
    displayOrder: 2,
  },
  {
    name: 'Pectoral Menor',
    slug: 'pectoral-menor',
    bodyRegion: 'UPPER_BODY',
    muscleType: 'SECONDARY',
    displayOrder: 3,
  },
  {
    name: 'Deltoides Anterior',
    slug: 'deltoides-anterior',
    bodyRegion: 'UPPER_BODY',
    muscleType: 'PRIMARY',
    displayOrder: 4,
  },
  {
    name: 'Tríceps',
    slug: 'triceps',
    bodyRegion: 'UPPER_BODY',
    muscleType: 'PRIMARY',
    displayOrder: 5,
  },

  // Upper Body - Pull
  {
    name: 'Espalda',
    slug: 'espalda',
    bodyRegion: 'UPPER_BODY',
    muscleType: 'PRIMARY',
    displayOrder: 10,
  },
  {
    name: 'Dorsal Ancho',
    slug: 'dorsal-ancho',
    bodyRegion: 'UPPER_BODY',
    muscleType: 'PRIMARY',
    displayOrder: 11,
  },
  {
    name: 'Trapecio',
    slug: 'trapecio',
    bodyRegion: 'UPPER_BODY',
    muscleType: 'SECONDARY',
    displayOrder: 12,
  },
  {
    name: 'Romboides',
    slug: 'romboides',
    bodyRegion: 'UPPER_BODY',
    muscleType: 'SECONDARY',
    displayOrder: 13,
  },
  {
    name: 'Deltoides Posterior',
    slug: 'deltoides-posterior',
    bodyRegion: 'UPPER_BODY',
    muscleType: 'PRIMARY',
    displayOrder: 14,
  },
  {
    name: 'Bíceps',
    slug: 'biceps',
    bodyRegion: 'UPPER_BODY',
    muscleType: 'PRIMARY',
    displayOrder: 15,
  },
  {
    name: 'Antebrazo',
    slug: 'antebrazo',
    bodyRegion: 'UPPER_BODY',
    muscleType: 'SECONDARY',
    displayOrder: 16,
  },

  // Lower Body - Quad Dominant
  {
    name: 'Cuádriceps',
    slug: 'cuadriceps',
    bodyRegion: 'LOWER_BODY',
    muscleType: 'PRIMARY',
    displayOrder: 20,
  },
  {
    name: 'Recto Femoral',
    slug: 'recto-femoral',
    bodyRegion: 'LOWER_BODY',
    muscleType: 'PRIMARY',
    displayOrder: 21,
  },

  // Lower Body - Hip Dominant
  {
    name: 'Isquiotibiales',
    slug: 'isquiotibiales',
    bodyRegion: 'LOWER_BODY',
    muscleType: 'PRIMARY',
    displayOrder: 25,
  },
  {
    name: 'Glúteos',
    slug: 'gluteos',
    bodyRegion: 'LOWER_BODY',
    muscleType: 'PRIMARY',
    displayOrder: 26,
  },
  {
    name: 'Aductores',
    slug: 'aductores',
    bodyRegion: 'LOWER_BODY',
    muscleType: 'SECONDARY',
    displayOrder: 27,
  },
  {
    name: 'Pantorrillas',
    slug: 'pantorrillas',
    bodyRegion: 'LOWER_BODY',
    muscleType: 'PRIMARY',
    displayOrder: 28,
  },

  // Core
  {
    name: 'Core',
    slug: 'core',
    bodyRegion: 'CORE',
    muscleType: 'PRIMARY',
    displayOrder: 30,
  },
  {
    name: 'Recto Abdominal',
    slug: 'recto-abdominal',
    bodyRegion: 'CORE',
    muscleType: 'PRIMARY',
    displayOrder: 31,
  },
  {
    name: 'Oblicuos',
    slug: 'oblicuos',
    bodyRegion: 'CORE',
    muscleType: 'PRIMARY',
    displayOrder: 32,
  },
  {
    name: 'Erectores Espinales',
    slug: 'erectores-espinales',
    bodyRegion: 'CORE',
    muscleType: 'SECONDARY',
    displayOrder: 33,
  },
]

const EQUIPMENT = [
  {
    name: 'Barra Olímpica',
    slug: 'barra-olimpica',
    category: 'BARBELL',
    displayOrder: 1,
  },
  {
    name: 'Mancuernas',
    slug: 'mancuernas',
    category: 'DUMBBELL',
    displayOrder: 2,
  },
  { name: 'Máquina', slug: 'maquina', category: 'MACHINE', displayOrder: 3 },
  { name: 'Polea', slug: 'polea', category: 'CABLE', displayOrder: 4 },
  {
    name: 'Peso Corporal',
    slug: 'peso-corporal',
    category: 'BODYWEIGHT',
    displayOrder: 5,
  },
  {
    name: 'Kettlebell',
    slug: 'kettlebell',
    category: 'KETTLEBELL',
    displayOrder: 6,
  },
  { name: 'Smith', slug: 'smith', category: 'SMITH', displayOrder: 7 },
  {
    name: 'Balón Medicinal',
    slug: 'balon-medicinal',
    category: 'MEDICINE_BALL',
    displayOrder: 8,
  },
  {
    name: 'Bandas Elásticas',
    slug: 'bandas-elasticas',
    category: 'RESISTANCE_BAND',
    displayOrder: 9,
  },
  { name: 'Otro', slug: 'otro', category: 'OTHER', displayOrder: 99 },
]

async function main() {
  console.log('Seeding muscle groups...')
  for (const muscle of MUSCLE_GROUPS) {
    await prisma.muscleGroup.upsert({
      where: { slug: muscle.slug },
      update: muscle,
      create: { id: `mg_${muscle.slug}`, ...muscle },
    })
  }

  console.log('Seeding equipment...')
  for (const equip of EQUIPMENT) {
    await prisma.equipment.upsert({
      where: { slug: equip.slug },
      update: equip,
      create: { id: `eq_${equip.slug}`, ...equip },
    })
  }

  console.log('Seeding complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

**Actions**:

1. Run seed script: `pnpm exec prisma db seed`
2. Verify data in database

### 8.4 Phase 3: Migrate Existing Exercises

**Goal**: Map existing exercises to canonical system with proper classification.

**Migration Script**: `scripts/migrate-exercises-to-canonical.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mapping of old primaryGroup strings to new MuscleGroup IDs
const MUSCLE_MAPPING: Record<string, string> = {
  Pecho: 'mg_pecho',
  Espalda: 'mg_espalda',
  Pierna: 'mg_cuadriceps',
  Piernas: 'mg_cuadriceps',
  Hombro: 'mg_deltoides-anterior',
  Hombros: 'mg_deltoides-anterior',
  Bíceps: 'mg_biceps',
  Tríceps: 'mg_triceps',
  Core: 'mg_core',
  Glúteo: 'mg_gluteos',
  Glúteos: 'mg_gluteos',
  Pantorrillas: 'mg_pantorrillas',
}

// Mapping of old equipment strings to new Equipment IDs
const EQUIPMENT_MAPPING: Record<string, string> = {
  Barra: 'eq_barra-olimpica',
  Mancuernas: 'eq_mancuernas',
  Máquina: 'eq_maquina',
  Smith: 'eq_smith',
  Prensa: 'eq_maquina',
  'Peso Corporal': 'eq_peso-corporal',
  Cables: 'eq_polea',
  Polea: 'eq_polea',
  Kettlebell: 'eq_kettlebell',
  'Bandas Elásticas': 'eq_bandas-elasticas',
}

// Canonical exercise definitions for common exercises
const CANONICAL_EXERCISES = [
  {
    name: 'Press de Banca',
    aliases: ['Press Banca', 'Bench Press', 'Press de Pecho'],
    movementPattern: 'PUSH_HORIZONTAL',
    exerciseType: 'COMPOUND',
    forceVector: 'PUSH_HORIZONTAL',
    difficulty: 'INTERMEDIATE',
    primaryMuscleSlug: 'pecho',
    secondaryMuscleSlugs: ['triceps', 'deltoides-anterior'],
    equipmentSlugs: ['barra-olimpica'],
  },
  {
    name: 'Sentadilla',
    aliases: ['Squat', 'Sentadilla con Barra'],
    movementPattern: 'SQUAT',
    exerciseType: 'COMPOUND',
    forceVector: 'PUSH_VERTICAL',
    difficulty: 'INTERMEDIATE',
    primaryMuscleSlug: 'cuadriceps',
    secondaryMuscleSlugs: ['gluteos', 'isquiotibiales'],
    equipmentSlugs: ['barra-olimpica'],
  },
  // ... more canonical exercises
]

async function main() {
  const existingExercises = await prisma.exercise.findMany()
  console.log(`Found ${existingExercises.length} existing exercises`)

  for (const exercise of existingExercises) {
    // Generate canonical name from existing name
    const canonicalName = exercise.name.trim()

    // Map primaryGroup to new MuscleGroup
    const primaryMuscleId =
      MUSCLE_MAPPING[exercise.primaryGroup ?? ''] ?? 'mg_cuadriceps'

    // Map equipment to new Equipment
    const equipmentId = EQUIPMENT_MAPPING[exercise.equipment ?? '']

    // Update exercise with new fields
    await prisma.exercise.update({
      where: { id: exercise.id },
      data: {
        canonicalName,
        legacyId: exercise.id,
        primaryMuscleId,
        movementPattern: inferMovementPattern(
          exercise.name,
          exercise.primaryGroup
        ),
        exerciseType: inferExerciseType(exercise.name),
        difficulty: 'INTERMEDIATE',
        equipment: equipmentId ? { connect: { id: equipmentId } } : undefined,
      },
    })

    console.log(`Migrated: ${exercise.name} → ${canonicalName}`)
  }

  console.log('Migration complete!')
}

function inferMovementPattern(name: string, group?: string | null): string {
  const lowerName = name.toLowerCase()

  if (lowerName.includes('press') || lowerName.includes('push')) {
    if (lowerName.includes('militar') || lowerName.includes('military'))
      return 'PUSH_VERTICAL'
    return 'PUSH_HORIZONTAL'
  }
  if (
    lowerName.includes('remo') ||
    lowerName.includes('row') ||
    lowerName.includes('pull')
  ) {
    if (lowerName.includes('dominada') || lowerName.includes('pull-up'))
      return 'PULL_VERTICAL'
    return 'PULL_HORIZONTAL'
  }
  if (lowerName.includes('sentadilla') || lowerName.includes('squat'))
    return 'SQUAT'
  if (lowerName.includes('peso muerto') || lowerName.includes('deadlift'))
    return 'HINGE'
  if (lowerName.includes('curl') || lowerName.includes('extensión'))
    return 'ISOLATION'

  return 'ISOLATION'
}

function inferExerciseType(name: string): string {
  const lowerName = name.toLowerCase()

  const compoundKeywords = [
    'press',
    'sentadilla',
    'squat',
    'peso muerto',
    'deadlift',
    'remo',
    'row',
    'dominada',
  ]
  if (compoundKeywords.some((kw) => lowerName.includes(kw))) return 'COMPOUND'

  return 'ISOLATION'
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

**Actions**:

1. Run migration script
2. Verify all exercises have canonicalName and primaryMuscleId
3. Create ExerciseAlias records for variations

### 8.5 Phase 4: Update Foreign Keys

**Goal**: Change exerciseId from Int to String in related tables.

**Migration File**: `20260328_update_exercise_foreign_keys.prisma`

```prisma
// This is a destructive migration - backup first!

model Exercise {
  id String @id @default(cuid()) // Changed from Int

  // Remove old Int id, keep legacyId for reference
  // ... rest of fields
}

model RoutineExercise {
  exerciseId String // Changed from Int
  exercise Exercise @relation(fields: [exerciseId], references: [id])
}

model WorkoutExercise {
  exerciseId String // Changed from Int
  exercise Exercise @relation(fields: [exerciseId], references: [id])
}

model SetEntry {
  exerciseId String // Changed from Int
  exercise Exercise @relation(fields: [exerciseId], references: [id])
}
```

**Migration Strategy**:

1. Create backup of database
2. Create new Exercise table with String IDs
3. Copy data from old Exercise to new Exercise (using legacyId mapping)
4. Update RoutineExercise, WorkoutExercise, SetEntry with new String IDs
5. Drop old Exercise table
6. Rename new Exercise table

**SQL Migration** (generated by Prisma, but conceptually):

```sql
-- Step 1: Create new Exercise table with String ID
CREATE TABLE "Exercise_new" (
  "id" TEXT NOT NULL,
  "canonicalName" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  -- ... other fields
  CONSTRAINT "Exercise_new_pkey" PRIMARY KEY ("id")
);

-- Step 2: Copy data
INSERT INTO "Exercise_new" (id, canonicalName, slug, ...)
SELECT
  'ex_' || id,  -- Generate String ID from Int
  canonicalName,
  slug,
  ...
FROM "Exercise";

-- Step 3: Update foreign keys in related tables
UPDATE "RoutineExercise"
SET "exerciseId" = 'ex_' || "exerciseId";

UPDATE "WorkoutExercise"
SET "exerciseId" = 'ex_' || "exerciseId";

UPDATE "SetEntry"
SET "exerciseId" = 'ex_' || "exerciseId";

-- Step 4: Drop old table and rename
DROP TABLE "Exercise";
ALTER TABLE "Exercise_new" RENAME TO "Exercise";
```

### 8.6 Phase 5: Refactor UI

**Goal**: Move exercise-related code to new module structure.

**File Moves**:

| From                                                 | To                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| `src/core/components/exercise-form.tsx`              | `src/modules/exercises/features/exercise-form.feature.tsx`   |
| `src/modules/routines/components/ExercisePicker.tsx` | `src/modules/exercises/features/exercise-picker.feature.tsx` |
| `src/app/(index)/exercises/client.tsx`               | DELETE (logic moves to feature)                              |
| `src/app/actions/exercises.ts`                       | `src/modules/exercises/actions/exercises.actions.ts`         |

**New Page Structure**:

```typescript
// src/app/(index)/exercises/page.tsx
import { ExerciseListFeature } from '@modules/exercises/features/exercise-list.feature'

export default function ExercisesPage() {
  return <ExerciseListFeature />
}
```

---

## 9. Backward Compatibility

### 9.1 Compatibility Layer

During migration phases 1-4, maintain a compatibility layer:

```typescript
// src/modules/exercises/utils/compatibility.ts

/**
 * Maps legacy Int ID to new String ID
 * Used during transition period
 */
export function mapLegacyId(legacyId: number): string {
  return `ex_${legacyId}`
}

/**
 * Resolves exercise ID (handles both Int and String formats)
 */
export async function resolveExerciseId(id: string | number): Promise<string> {
  if (typeof id === 'string') return id
  return mapLegacyId(id)
}
```

### 9.2 Data Integrity Checks

```typescript
// scripts/verify-migration.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyMigration() {
  // Check all exercises have canonicalName
  const exercisesWithoutCanonical = await prisma.exercise.count({
    where: { canonicalName: null },
  })

  if (exercisesWithoutCanonical > 0) {
    console.error(
      `❌ ${exercisesWithoutCanonical} exercises missing canonicalName`
    )
  }

  // Check all RoutineExercise have valid exerciseId
  const orphanedRoutineExercises = await prisma.routineExercise.count({
    where: { exercise: null },
  })

  if (orphanedRoutineExercises > 0) {
    console.error(
      `❌ ${orphanedRoutineExercises} orphaned RoutineExercise records`
    )
  }

  // Check all WorkoutExercise have valid exerciseId
  const orphanedWorkoutExercises = await prisma.workoutExercise.count({
    where: { exercise: null },
  })

  if (orphanedWorkoutExercises > 0) {
    console.error(
      `❌ ${orphanedWorkoutExercises} orphaned WorkoutExercise records`
    )
  }

  console.log('✅ Migration verification complete')
}

verifyMigration()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

---

## 10. Testing Strategy

### 10.1 Unit Tests

**Location**: `src/modules/exercises/__tests__/`

```typescript
// exercise-service.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import {
  createExercise,
  checkForDuplicates,
  searchExercises,
} from '../services/exerciseService'
import { mockDatabase } from '@core/lib/test-utils'

describe('ExerciseService', () => {
  beforeEach(() => {
    mockDatabase.reset()
  })

  describe('createExercise', () => {
    it('should create exercise with valid data', async () => {
      const exercise = await createExercise({
        canonicalName: 'Press de Banca',
        primaryMuscleId: 'mg_pecho',
        movementPattern: 'PUSH_HORIZONTAL',
        exerciseType: 'COMPOUND',
      })

      expect(exercise.canonicalName).toBe('Press de Banca')
      expect(exercise.slug).toBe('press-de-banca')
    })

    it('should generate unique slug', async () => {
      await createExercise({
        canonicalName: 'Test Exercise',
        primaryMuscleId: 'mg_pecho',
        movementPattern: 'ISOLATION',
        exerciseType: 'ISOLATION',
      })

      const exercise2 = await createExercise({
        canonicalName: 'Test Exercise',
        primaryMuscleId: 'mg_espalda',
        movementPattern: 'ISOLATION',
        exerciseType: 'ISOLATION',
      })

      expect(exercise2.slug).not.toBe('test-exercise')
    })
  })

  describe('checkForDuplicates', () => {
    it('should detect exact match', async () => {
      await createExercise({
        canonicalName: 'Press de Banca',
        primaryMuscleId: 'mg_pecho',
        movementPattern: 'PUSH_HORIZONTAL',
        exerciseType: 'COMPOUND',
      })

      const result = await checkForDuplicates('Press de Banca')

      expect(result.isDuplicate).toBe(true)
      expect(result.similarity).toBe(1)
    })

    it('should detect alias match', async () => {
      const exercise = await createExercise({
        canonicalName: 'Press de Banca',
        primaryMuscleId: 'mg_pecho',
        movementPattern: 'PUSH_HORIZONTAL',
        exerciseType: 'COMPOUND',
      })

      await addAlias(exercise.id, 'Bench Press')

      const result = await checkForDuplicates('Bench Press')

      expect(result.isDuplicate).toBe(true)
    })

    it('should detect fuzzy match above threshold', async () => {
      await createExercise({
        canonicalName: 'Press de Banca',
        primaryMuscleId: 'mg_pecho',
        movementPattern: 'PUSH_HORIZONTAL',
        exerciseType: 'COMPOUND',
      })

      const result = await checkForDuplicates('Press Banca', 0.8)

      expect(result.isDuplicate).toBe(true)
    })
  })

  describe('searchExercises', () => {
    it('should find by canonical name', async () => {
      await createExercise({
        canonicalName: 'Press de Banca',
        primaryMuscleId: 'mg_pecho',
        movementPattern: 'PUSH_HORIZONTAL',
        exerciseType: 'COMPOUND',
      })

      const results = await searchExercises('press')

      expect(results.length).toBe(1)
      expect(results[0].canonicalName).toBe('Press de Banca')
    })

    it('should find by alias', async () => {
      const exercise = await createExercise({
        canonicalName: 'Press de Banca',
        primaryMuscleId: 'mg_pecho',
        movementPattern: 'PUSH_HORIZONTAL',
        exerciseType: 'COMPOUND',
      })

      await addAlias(exercise.id, 'Bench Press')

      const results = await searchExercises('bench')

      expect(results.length).toBe(1)
    })
  })
})
```

### 10.2 Integration Tests

```typescript
// __tests__/exercise-actions.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import {
  createExercise,
  getExerciseById,
  updateExercise,
} from '../actions/exercises.actions'
import { testDb } from '@core/lib/test-db'

describe('Exercise Actions (Integration)', () => {
  beforeEach(async () => {
    await testDb.reset()
  })

  it('should create and retrieve exercise', async () => {
    const result = await createExercise({
      canonicalName: 'Test Exercise',
      primaryMuscleId: 'mg_pecho',
      movementPattern: 'ISOLATION',
      exerciseType: 'ISOLATION',
    })

    expect(result.success).toBe(true)
    expect(result.data?.canonicalName).toBe('Test Exercise')

    const retrieved = await getExerciseById(result.data!.id)
    expect(retrieved?.canonicalName).toBe('Test Exercise')
  })

  it('should prevent duplicate creation', async () => {
    await createExercise({
      canonicalName: 'Press de Banca',
      primaryMuscleId: 'mg_pecho',
      movementPattern: 'PUSH_HORIZONTAL',
      exerciseType: 'COMPOUND',
    })

    const result = await createExercise({
      canonicalName: 'Press de Banca',
      primaryMuscleId: 'mg_pecho',
      movementPattern: 'PUSH_HORIZONTAL',
      exerciseType: 'COMPOUND',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('Duplicate detected')
  })
})
```

### 10.3 Component Tests

```typescript
// __tests__/components/ExerciseCard.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ExerciseCard } from '../../components/ExerciseCard'
import type { ExerciseCard as ExerciseCardType } from '../../types'

describe('ExerciseCard', () => {
  const mockExercise: ExerciseCardType = {
    id: 'ex_1',
    canonicalName: 'Press de Banca',
    slug: 'press-de-banca',
    primaryMuscleId: 'mg_pecho',
    primaryMuscle: {
      id: 'mg_pecho',
      name: 'Pecho',
      slug: 'pecho',
      bodyRegion: 'UPPER_BODY',
      muscleType: 'PRIMARY',
      displayOrder: 1,
    },
    equipment: [
      { id: 'eq_barra', name: 'Barra Olímpica', slug: 'barra-olimpica', category: 'BARBELL', displayOrder: 1 },
    ],
    aliases: [],
    movementPattern: 'PUSH_HORIZONTAL',
    exerciseType: 'COMPOUND',
    difficulty: 'INTERMEDIATE',
    isCanonical: true,
    isActive: true,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    routineExercises: [],
    workoutExercises: [],
    setEntries: [],
  }

  it('should render exercise name', () => {
    render(<ExerciseCard exercise={mockExercise} />)

    expect(screen.getByText('Press de Banca')).toBeInTheDocument()
  })

  it('should render primary muscle group', () => {
    render(<ExerciseCard exercise={mockExercise} />)

    expect(screen.getByText('Pecho')).toBeInTheDocument()
  })

  it('should render equipment badges', () => {
    render(<ExerciseCard exercise={mockExercise} />)

    expect(screen.getByText('Barra Olímpica')).toBeInTheDocument()
  })
})
```

### 10.4 E2E Tests

```typescript
// tests/e2e/exercises.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Exercise Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/exercises')
  })

  test('should display exercise list', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Ejercicios' })
    ).toBeVisible()
  })

  test('should search exercises', async ({ page }) => {
    await page.getByPlaceholder('Buscar ejercicio').fill('press')

    await expect(page.getByText('Press de Banca')).toBeVisible()
  })

  test('should filter by muscle group', async ({ page }) => {
    await page.getByRole('button', { name: 'Filtrar' }).click()
    await page.getByRole('option', { name: 'Pecho' }).click()

    // All visible exercises should be chest exercises
    const cards = page.getByTestId('exercise-card')
    const count = await cards.count()

    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i).getByText('Pecho')).toBeVisible()
    }
  })

  test('should prevent duplicate exercise creation', async ({ page }) => {
    await page.getByRole('button', { name: 'Nuevo Ejercicio' }).click()

    await page.getByLabel('Nombre del Ejercicio').fill('Press de Banca')

    // Should show duplicate warning
    await expect(page.getByText(/ya existe/i)).toBeVisible()
  })

  test('should create exercise with alias', async ({ page }) => {
    await page.getByRole('button', { name: 'Nuevo Ejercicio' }).click()

    await page.getByLabel('Nombre del Ejercicio').fill('Nuevo Ejercicio Test')
    await page.getByLabel('Grupo Muscular').click()
    await page.getByRole('option', { name: 'Pecho' }).click()

    await page.getByRole('button', { name: 'Crear' }).click()

    await expect(page.getByText('Ejercicio creado')).toBeVisible()
  })
})
```

---

## 11. Risks & Mitigations

| Risk                                    | Probability | Impact   | Mitigation                                                                                             |
| --------------------------------------- | ----------- | -------- | ------------------------------------------------------------------------------------------------------ |
| **Data loss during migration**          | Low         | Critical | Full database backup before each phase; migration scripts tested in staging; rollback scripts prepared |
| **Foreign key constraint failures**     | Medium      | High     | Phase 3 ensures all exercises have valid mappings before Phase 4; orphan detection scripts             |
| **Performance degradation with search** | Medium      | Medium   | Full-text search indexes; query optimization; caching with SWR                                         |
| **Duplicate detection false positives** | Medium      | Medium   | Configurable similarity threshold; user can override with confirmation                                 |
| **Breaking existing routines**          | Low         | Critical | Compatibility layer during transition; comprehensive E2E tests for routine flows                       |
| **UI regression from refactor**         | Medium      | Medium   | Visual regression tests; component tests; staged rollout                                               |
| **Seed data incomplete**                | Low         | Medium   | Reference external taxonomies (ExRx, MuscleWiki); community contribution pipeline                      |
| **User confusion with new system**      | Medium      | Low      | Clear UI messaging; help tooltips; gradual feature introduction                                        |

---

## 12. Performance Considerations

### 12.1 Database Optimization

- **Indexes**: All foreign keys and frequently queried fields indexed
- **Full-text Search**: PostgreSQL `pg_trgm` extension for fuzzy matching
- **Connection Pooling**: Prisma connection pool configured for production

### 12.2 Frontend Optimization

- **SWR Caching**: Exercise list cached for 1 minute, search results for 5 seconds
- **Debounced Search**: 300ms debounce on search input
- **Pagination**: Default 20 items per page, infinite scroll option
- **Lazy Loading**: Exercise details loaded on demand

### 12.3 Bundle Size

- **Tree Shaking**: Only import used components from module
- **Dynamic Imports**: Exercise picker loaded dynamically when needed
- **Icon Optimization**: Lucide icons tree-shaken

---

## 13. Future Considerations

### 13.1 Phase 2 Features (Post-MVP)

- Exercise variations system (base exercise → variations)
- User gym configuration (available equipment filtering)
- Exercise recommendations based on history
- Volume analytics by muscle group

### 13.2 Phase 3 Features

- Multi-language support (i18n for exercise names)
- Community contribution pipeline (user-submitted exercises)
- External video integration (YouTube embeds)
- Public API for integrations

### 13.3 Technical Debt

- Consider migrating from Prisma to Drizzle ORM for better TypeScript integration
- Implement full-text search with dedicated search service (Meilisearch/Algolia)
- Add exercise image CDN for optimized media delivery

---

## 14. Appendix

### A. Canonical Exercise Seed Data (MVP - 50 Exercises)

See `prisma/seed-canonical-exercises.ts` for complete list.

### B. Muscle Group Taxonomy

| Body Region | Primary Muscles                                   | Secondary Muscles              |
| ----------- | ------------------------------------------------- | ------------------------------ |
| Upper Body  | Pecho, Espalda, Hombros, Bíceps, Tríceps          | Antebrazo, Deltoides Posterior |
| Lower Body  | Cuádriceps, Isquiotibiales, Glúteos, Pantorrillas | Aductores                      |
| Core        | Recto Abdominal, Oblicuos                         | Erectores Espinales            |

### C. Equipment Categories

| Category        | Examples                              |
| --------------- | ------------------------------------- |
| BARBELL         | Olympic bar, EZ bar, trap bar         |
| DUMBBELL        | Adjustable dumbbells, fixed dumbbells |
| MACHINE         | Leg press, chest press, lat pulldown  |
| CABLE           | Cable crossover, seated row           |
| BODYWEIGHT      | Pull-up bar, dip station, floor       |
| KETTLEBELL      | Kettlebells                           |
| SMITH           | Smith machine                         |
| MEDICINE_BALL   | Medicine balls, slam balls            |
| RESISTANCE_BAND | Resistance bands, tubes               |

---

## Changelog

| Version | Date       | Change      |
| ------- | ---------- | ----------- |
| 1.0     | 2026-03-28 | Initial RFC |
