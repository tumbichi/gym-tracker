-- Migration: add_exercise_taxonomy_tables
-- Description: Add exercise taxonomy tables and fields for the Exercise Module Redesign
-- Date: 2026-03-28

-- Create Enums
CREATE TYPE "MovementPattern" AS ENUM ('SQUAT', 'HINGE', 'PUSH_HORIZONTAL', 'PUSH_VERTICAL', 'PULL_HORIZONTAL', 'PULL_VERTICAL', 'LUNGE', 'CARRY', 'ROTATION', 'ISOLATION', 'CARDIO', 'MOBILITY');

CREATE TYPE "ExerciseType" AS ENUM ('COMPOUND', 'ISOLATION', 'CARDIO', 'MOBILITY', 'PLYOMETRIC');

CREATE TYPE "ForceVector" AS ENUM ('PUSH_HORIZONTAL', 'PUSH_VERTICAL', 'PULL_HORIZONTAL', 'PULL_VERTICAL', 'ISOMETRIC');

CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

CREATE TYPE "EquipmentCategory" AS ENUM ('BARBELL', 'DUMBBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT', 'KETTLEBELL', 'SMITH', 'MEDICINE_BALL', 'RESISTANCE_BAND', 'OTHER');

CREATE TYPE "BodyRegion" AS ENUM ('UPPER_BODY', 'LOWER_BODY', 'CORE', 'FULL_BODY');

CREATE TYPE "MuscleType" AS ENUM ('PRIMARY', 'SECONDARY', 'STABILIZER');

-- Add new columns to Exercise table
ALTER TABLE "Exercise" ADD COLUMN "updatedAt" TIMESTAMP(3);
ALTER TABLE "Exercise" ADD COLUMN "canonicalName" TEXT;
ALTER TABLE "Exercise" ADD COLUMN "description" TEXT;
ALTER TABLE "Exercise" ADD COLUMN "instructions" TEXT;
ALTER TABLE "Exercise" ADD COLUMN "primaryMuscleId" TEXT;
ALTER TABLE "Exercise" ADD COLUMN "movementPattern" "MovementPattern";
ALTER TABLE "Exercise" ADD COLUMN "exerciseType" "ExerciseType";
ALTER TABLE "Exercise" ADD COLUMN "forceVector" "ForceVector";
ALTER TABLE "Exercise" ADD COLUMN "difficulty" "DifficultyLevel" NOT NULL DEFAULT 'INTERMEDIATE';
ALTER TABLE "Exercise" ADD COLUMN "videoUrl" TEXT;
ALTER TABLE "Exercise" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "Exercise" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Exercise" ADD COLUMN "isCanonical" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Exercise" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Exercise" ADD COLUMN "baseExerciseId" INTEGER;
ALTER TABLE "Exercise" ADD COLUMN "legacyId" INTEGER;

-- Create unique indexes
CREATE UNIQUE INDEX "Exercise_canonicalName_key" ON "Exercise"("canonicalName");
CREATE UNIQUE INDEX "Exercise_legacyId_key" ON "Exercise"("legacyId");

-- Create indexes for Exercise
CREATE INDEX "Exercise_canonicalName_idx" ON "Exercise"("canonicalName");
CREATE INDEX "Exercise_primaryMuscleId_idx" ON "Exercise"("primaryMuscleId");
CREATE INDEX "Exercise_movementPattern_idx" ON "Exercise"("movementPattern");
CREATE INDEX "Exercise_exerciseType_idx" ON "Exercise"("exerciseType");
CREATE INDEX "Exercise_legacyId_idx" ON "Exercise"("legacyId");

-- Create ExerciseAlias table
CREATE TABLE "ExerciseAlias" (
    "id" TEXT NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "alias" TEXT NOT NULL,
    "lang" TEXT NOT NULL DEFAULT 'es',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseAlias_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ExerciseAlias_exerciseId_alias_key" ON "ExerciseAlias"("exerciseId", "alias");
CREATE INDEX "ExerciseAlias_alias_idx" ON "ExerciseAlias"("alias");

-- Create MuscleGroup table
CREATE TABLE "MuscleGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bodyRegion" "BodyRegion" NOT NULL,
    "muscleType" "MuscleType" NOT NULL DEFAULT 'PRIMARY',
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MuscleGroup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MuscleGroup_name_key" ON "MuscleGroup"("name");
CREATE UNIQUE INDEX "MuscleGroup_slug_key" ON "MuscleGroup"("slug");
CREATE INDEX "MuscleGroup_bodyRegion_idx" ON "MuscleGroup"("bodyRegion");
CREATE INDEX "MuscleGroup_slug_idx" ON "MuscleGroup"("slug");

-- Create Equipment table
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "EquipmentCategory" NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Equipment_name_key" ON "Equipment"("name");
CREATE UNIQUE INDEX "Equipment_slug_key" ON "Equipment"("slug");
CREATE INDEX "Equipment_category_idx" ON "Equipment"("category");
CREATE INDEX "Equipment_slug_idx" ON "Equipment"("slug");

-- Create UserGymConfig table
CREATE TABLE "UserGymConfig" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGymConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserGymConfig_userId_key" ON "UserGymConfig"("userId");
CREATE INDEX "UserGymConfig_userId_idx" ON "UserGymConfig"("userId");

-- Create join tables for many-to-many relations
CREATE TABLE "_SecondaryMuscles" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SecondaryMuscles_AB_pkey" PRIMARY KEY ("A","B")
);

CREATE TABLE "_ExerciseEquipment" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ExerciseEquipment_AB_pkey" PRIMARY KEY ("A","B")
);

CREATE TABLE "_UserGymEquipment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserGymEquipment_AB_pkey" PRIMARY KEY ("A","B")
);

CREATE INDEX "_SecondaryMuscles_B_index" ON "_SecondaryMuscles"("B");
CREATE INDEX "_ExerciseEquipment_B_index" ON "_ExerciseEquipment"("B");
CREATE INDEX "_UserGymEquipment_B_index" ON "_UserGymEquipment"("B");

-- Add foreign keys for new relations
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_primaryMuscleId_fkey" FOREIGN KEY ("primaryMuscleId") REFERENCES "MuscleGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_baseExerciseId_fkey" FOREIGN KEY ("baseExerciseId") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExerciseAlias" ADD CONSTRAINT "ExerciseAlias_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_SecondaryMuscles" ADD CONSTRAINT "_SecondaryMuscles_A_fkey" FOREIGN KEY ("A") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_SecondaryMuscles" ADD CONSTRAINT "_SecondaryMuscles_B_fkey" FOREIGN KEY ("B") REFERENCES "MuscleGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_ExerciseEquipment" ADD CONSTRAINT "_ExerciseEquipment_A_fkey" FOREIGN KEY ("A") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ExerciseEquipment" ADD CONSTRAINT "_ExerciseEquipment_B_fkey" FOREIGN KEY ("B") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_UserGymEquipment" ADD CONSTRAINT "_UserGymEquipment_A_fkey" FOREIGN KEY ("A") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_UserGymEquipment" ADD CONSTRAINT "_UserGymEquipment_B_fkey" FOREIGN KEY ("B") REFERENCES "UserGymConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add indexes to existing tables for exerciseId (for performance)
CREATE INDEX "RoutineExercise_exerciseId_idx" ON "RoutineExercise"("exerciseId");
CREATE INDEX "WorkoutExercise_exerciseId_idx" ON "WorkoutExercise"("exerciseId");
CREATE INDEX "SetEntry_exerciseId_idx" ON "SetEntry"("exerciseId");
