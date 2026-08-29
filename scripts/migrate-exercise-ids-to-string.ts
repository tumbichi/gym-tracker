/**
 * Migration: Update Exercise Foreign Keys to String IDs
 *
 * Since Exercise.id is already String (CUID) in the schema, this migration
 * ensures all related tables (RoutineExercise, WorkoutExercise, SetEntry, ExerciseAlias)
 * correctly reference the String IDs.
 *
 * Note: This script assumes the database has already been migrated to use
 * String IDs for Exercise. The legacyId field can be used to map back to
 * original integer IDs if needed.
 *
 * Run with: npx tsx scripts/migrate-exercise-ids-to-string.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Starting Exercise ID migration verification...')

  // ========================================
  // Step 1: Verify Exercise IDs are strings
  // ========================================
  console.log('\n📝 Step 1: Verifying Exercise IDs...')

  const exercises = await prisma.exercise.findMany({
    select: { id: true, canonicalName: true },
  })

  console.log(`  Found ${exercises.length} exercises`)

  // Check that all IDs are strings (CUIDs)
  const stringIds = exercises.filter(
    (e) => typeof e.id === 'string' && (e.id as string).startsWith('c')
  )
  console.log(`  ✅ ${stringIds.length} exercises have String CUID IDs`)

  // ========================================
  // Step 2: Verify RoutineExercise foreign keys
  // ========================================
  console.log('\n📝 Step 2: Verifying RoutineExercise...')

  const routineExercises = await prisma.routineExercise.findMany({
    select: { id: true, exerciseId: true },
  })

  console.log(`  Found ${routineExercises.length} routine exercises`)

  // Check that all exerciseId references are strings
  const validRoutineRefs = routineExercises.filter(
    (re) =>
      typeof re.exerciseId === 'string' &&
      (re.exerciseId as string).startsWith('c')
  )
  console.log(
    `  ✅ ${validRoutineRefs.length} have valid String exerciseId references`
  )

  // ========================================
  // Step 3: Verify WorkoutExercise foreign keys
  // ========================================
  console.log('\n📝 Step 3: Verifying WorkoutExercise...')

  const workoutExercises = await prisma.workoutExercise.findMany({
    select: { id: true, exerciseId: true },
  })

  console.log(`  Found ${workoutExercises.length} workout exercises`)

  const validWorkoutRefs = workoutExercises.filter(
    (we) =>
      typeof we.exerciseId === 'string' &&
      (we.exerciseId as string).startsWith('c')
  )
  console.log(
    `  ✅ ${validWorkoutRefs.length} have valid String exerciseId references`
  )

  // ========================================
  // Step 4: Verify SetEntry foreign keys
  // ========================================
  console.log('\n📝 Step 4: Verifying SetEntry...')

  const setEntries = await prisma.setEntry.findMany({
    select: { id: true, exerciseId: true },
  })

  console.log(`  Found ${setEntries.length} set entries`)

  const validSetRefs = setEntries.filter(
    (se) =>
      typeof se.exerciseId === 'string' &&
      (se.exerciseId as string).startsWith('c')
  )
  console.log(
    `  ✅ ${validSetRefs.length} have valid String exerciseId references`
  )

  // ========================================
  // Step 5: Verify ExerciseAlias foreign keys
  // ========================================
  console.log('\n📝 Step 5: Verifying ExerciseAlias...')

  const aliases = await prisma.exerciseAlias.findMany({
    select: { id: true, exerciseId: true },
  })

  console.log(`  Found ${aliases.length} aliases`)

  const validAliasRefs = aliases.filter(
    (a) =>
      typeof a.exerciseId === 'string' &&
      (a.exerciseId as string).startsWith('c')
  )
  console.log(
    `  ✅ ${validAliasRefs.length} have valid String exerciseId references`
  )

  // ========================================
  // Summary
  // ========================================
  console.log('\n📊 Migration Status:')
  console.log(
    `  ✅ Exercise IDs: ${stringIds.length}/${exercises.length} are String CUIDs`
  )
  console.log(
    `  ✅ RoutineExercise: ${validRoutineRefs.length}/${routineExercises.length} have valid String FKs`
  )
  console.log(
    `  ✅ WorkoutExercise: ${validWorkoutRefs.length}/${workoutExercises.length} have valid String FKs`
  )
  console.log(
    `  ✅ SetEntry: ${validSetRefs.length}/${setEntries.length} have valid String FKs`
  )
  console.log(
    `  ✅ ExerciseAlias: ${validAliasRefs.length}/${aliases.length} have valid String FKs`
  )

  // Check for any issues
  const issues = []
  if (stringIds.length !== exercises.length) {
    issues.push(
      `${exercises.length - stringIds.length} exercises have non-String IDs`
    )
  }
  if (validRoutineRefs.length !== routineExercises.length) {
    issues.push(
      `${routineExercises.length - validRoutineRefs.length} routine exercises have invalid FKs`
    )
  }
  if (validWorkoutRefs.length !== workoutExercises.length) {
    issues.push(
      `${workoutExercises.length - validWorkoutRefs.length} workout exercises have invalid FKs`
    )
  }
  if (validSetRefs.length !== setEntries.length) {
    issues.push(
      `${setEntries.length - validSetRefs.length} set entries have invalid FKs`
    )
  }
  if (validAliasRefs.length !== aliases.length) {
    issues.push(
      `${aliases.length - validAliasRefs.length} aliases have invalid FKs`
    )
  }

  if (issues.length > 0) {
    console.log('\n⚠️  Issues found:')
    issues.forEach((issue) => console.log(`  - ${issue}`))
    console.log('\n❌ Migration incomplete - please review the issues above')
    process.exit(1)
  } else {
    console.log('\n✅ All foreign keys are correctly using String (CUID) IDs!')
  }
}

main()
  .catch((e) => {
    console.error('❌ Migration verification failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
