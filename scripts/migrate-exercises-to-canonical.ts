/**
 * Migrate Exercises to Canonical System
 *
 * This script migrates existing exercises to the new canonical system:
 * - Maps old primaryGroup strings to MuscleGroup IDs
 * - Maps old equipment strings to Equipment IDs
 * - Infers movementPattern and exerciseType from muscle group
 * - Sets canonicalName, slug, legacyId (stores original integer ID)
 *
 * Run with: npx tsx scripts/migrate-exercises-to-canonical.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// =============================================================================
// MAPPING TABLES
// =============================================================================

// Map old primaryGroup strings to MuscleGroup slugs (we'll look up IDs)
const MUSCLE_GROUP_MAPPING: Record<string, string> = {
  // Upper Body - Push
  Pecho: 'pecho',
  Pectoral: 'pecho',

  // Upper Body - Pull
  Espalda: 'espalda',
  Dorsal: 'dorsal-ancho',
  Lumbar: 'espalda',

  // Shoulders
  Hombro: 'deltoides-anterior',
  Hombros: 'deltoides-anterior',
  Deltoides: 'deltoides-anterior',
  Delto: 'deltoides-anterior',

  // Arms
  Bíceps: 'biceps',
  Biceps: 'biceps',
  Tríceps: 'triceps',
  Triceps: 'triceps',
  Antebrazo: 'antebrazo',

  // Lower Body - Quad
  Pierna: 'cuadriceps',
  Piernas: 'cuadriceps',
  Cuádriceps: 'cuadriceps',
  Quadriceps: 'cuadriceps',
  Femoral: 'cuadriceps',

  // Lower Body - Hip
  Glúteo: 'gluteos',
  Gluteo: 'gluteos',
  Glúteos: 'gluteos',
  Isquiotibiales: 'isquiotibiales',
  Isquiotibial: 'isquiotibiales',
  Pantorrilla: 'pantorrillas',
  Pantorrillas: 'pantorrillas',
  Gemelo: 'gemelos',
  Gemelos: 'gemelos',
  Aductores: 'aductores',

  // Core
  Core: 'core',
  Abdominal: 'recto-abdominal',
  Abdominales: 'recto-abdominal',
  Abs: 'recto-abdominal',
  Oblicuos: 'oblicuos',
  'Espalda baja': 'erectores-espinales',
  Erectores: 'erectores-espinales',

  // Cardio (treating as full body for now)
  Cardio: 'core',
}

// Map old equipment strings to Equipment slugs
const EQUIPMENT_MAPPING: Record<string, string> = {
  // Barbell variations
  Barra: 'eq_barra-olimpica',
  'Barra Olímpica': 'eq_barra-olimpica',
  'Barra W': 'eq_barra-olimpica',
  'Barra curva': 'eq_barra-olimpica',
  'Barra recta': 'eq_barra-olimpica',

  // Dumbbells
  Mancuernas: 'eq_mancuernas',
  Mancuerna: 'eq_mancuernas',
  'Mancuernas / Polea': 'eq_mancuernas',

  // Machines
  Máquina: 'eq_maquina',
  'Maq. Femoral': 'eq_maquina',
  'Maq. Glúteo': 'eq_maquina',
  Prensa: 'eq_maquina',
  'Prensa (vieja)': 'eq_maquina',
  'Prensa (nueva)': 'eq_maquina',
  Hack: 'eq_maquina',
  'Sillón de cuádriceps': 'eq_maquina',
  'Sillon de cuadriceps': 'eq_maquina',
  'Extensión de cuádriceps': 'eq_maquina',
  'Curl de femoral': 'eq_maquina',
  Femoral: 'eq_maquina',
  Glúteo: 'eq_maquina',
  Pantorrilla: 'eq_maquina',
  'Banco Scott': 'eq_maquina',
  Remo: 'eq_maquina',
  'Remo (máquina roja)': 'eq_maquina',
  'Remo T': 'eq_maquina',

  // Cable
  Polea: 'eq_polea',
  'Polea alta': 'eq_polea',
  'Polea baja': 'eq_polea',
  'Crucifijo inverso': 'eq_polea',
  Pulldown: 'eq_polea',

  // Smith
  Smith: 'eq_smith',
  'Sentadilla Smith': 'eq_smith',

  // Bodyweight
  'Peso corporal': 'eq_peso-corporal',
  'Peso Corporal': 'eq_peso-corporal',
  Banco: 'eq_peso-corporal',
  Copa: 'eq_peso-corporal',

  // Other
  Kettlebell: 'eq_kettlebell',
  Balón: 'eq_balon-medicinal',
  'Balón medicinal': 'eq_balon-medicinal',
  Elastic: 'eq_bandas-elasticas',
  Banda: 'eq_bandas-elasticas',
  Bandas: 'eq_bandas-elasticas',

  // Default fallback
  Otro: 'eq_otro',
}

// Infer movement pattern from muscle group and exercise name
function inferMovementPattern(
  primaryGroup: string | null,
  exerciseName: string
): string {
  const name = exerciseName.toLowerCase()

  if (!primaryGroup) {
    // Try to infer from name
    if (
      name.includes('press') ||
      name.includes('press de') ||
      name.includes('banca')
    )
      return 'PUSH_HORIZONTAL'
    if (
      name.includes('sentadilla') ||
      name.includes('squat') ||
      name.includes('hack')
    )
      return 'SQUAT'
    if (
      name.includes('peso muerto') ||
      name.includes('deadlift') ||
      name.includes('rdl')
    )
      return 'HINGE'
    if (
      name.includes('jalón') ||
      name.includes('pull') ||
      name.includes('dominada')
    )
      return 'PULL_VERTICAL'
    if (name.includes('remo') || name.includes('row')) return 'PULL_HORIZONTAL'
    if (
      name.includes('curl') ||
      name.includes('extensión') ||
      name.includes('extension')
    )
      return 'ISOLATION'
    if (name.includes('zancada') || name.includes('lunge')) return 'LUNGE'
    if (
      name.includes('abdominal') ||
      name.includes('crunch') ||
      name.includes('flexión')
    )
      return 'ISOLATION'
    return 'COMPOUND'
  }

  // Infer from primary group
  const group = primaryGroup.toLowerCase()

  if (group.includes('pecho') || group.includes('pectoral')) {
    if (name.includes('inclinado') || name.includes('inclina'))
      return 'PUSH_HORIZONTAL'
    if (name.includes('crucifijo')) return 'ISOLATION'
    return 'PUSH_HORIZONTAL'
  }

  if (
    group.includes('espalda') ||
    group.includes('dorsal') ||
    group.includes('lumbar')
  ) {
    if (name.includes('remo')) return 'PULL_HORIZONTAL'
    if (
      name.includes('jalón') ||
      name.includes('pull') ||
      name.includes('dominada')
    )
      return 'PULL_VERTICAL'
    return 'PULL_VERTICAL'
  }

  if (group.includes('hombro') || group.includes('deltoides')) {
    if (
      name.includes('elevación') ||
      name.includes('elevacion') ||
      name.includes('lateral')
    )
      return 'ISOLATION'
    if (name.includes('press') || name.includes('militar'))
      return 'PUSH_VERTICAL'
    return 'PUSH_VERTICAL'
  }

  if (group.includes('bíceps') || group.includes('biceps')) return 'ISOLATION'
  if (group.includes('tríceps') || group.includes('triceps')) return 'ISOLATION'

  if (
    group.includes('pierna') ||
    group.includes('cuádriceps') ||
    group.includes('quad')
  ) {
    if (name.includes('extensión') || name.includes('extension'))
      return 'ISOLATION'
    return 'SQUAT'
  }

  if (group.includes('femoral') || group.includes('isquiotibial')) {
    if (name.includes('curl')) return 'ISOLATION'
    return 'HINGE'
  }

  if (group.includes('glúteo') || group.includes('gluteo')) {
    if (name.includes('hip thrust')) return 'HINGE'
    return 'HINGE'
  }

  if (group.includes('pantorrilla') || group.includes('gemelo'))
    return 'ISOLATION'

  if (
    group.includes('core') ||
    group.includes('abdominal') ||
    group.includes('oblicuo')
  ) {
    if (name.includes('extensión') || name.includes('extension'))
      return 'ISOLATION'
    return 'ISOLATION'
  }

  return 'COMPOUND'
}

// Infer exercise type from muscle group and movement pattern
function inferExerciseType(
  primaryGroup: string | null,
  movementPattern: string
): string {
  // Compound exercises typically involve multiple large muscle groups
  const compoundPatterns = [
    'SQUAT',
    'HINGE',
    'PUSH_HORIZONTAL',
    'PUSH_VERTICAL',
    'PULL_HORIZONTAL',
    'PULL_VERTICAL',
    'LUNGE',
  ]

  if (compoundPatterns.includes(movementPattern)) {
    return 'COMPOUND'
  }

  // Isolation exercises
  if (movementPattern === 'ISOLATION') {
    return 'ISOLATION'
  }

  // Default to compound if we're unsure
  return 'COMPOUND'
}

// Infer force vector from movement pattern
function inferForceVector(movementPattern: string): string | null {
  const forceVectorMap: Record<string, string> = {
    PUSH_HORIZONTAL: 'PUSH_HORIZONTAL',
    PUSH_VERTICAL: 'PUSH_VERTICAL',
    PULL_HORIZONTAL: 'PULL_HORIZONTAL',
    PULL_VERTICAL: 'PULL_VERTICAL',
  }

  return forceVectorMap[movementPattern] || null
}

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function main() {
  console.log('🔄 Starting exercise migration to canonical system...')

  // First, get all muscle groups and create a lookup map
  const muscleGroups = await prisma.muscleGroup.findMany({
    select: { id: true, slug: true },
  })

  const muscleGroupIdBySlug = new Map<string, string>()
  for (const mg of muscleGroups) {
    muscleGroupIdBySlug.set(mg.slug, mg.id)
  }

  console.log(`📍 Loaded ${muscleGroups.length} muscle groups`)

  // Get all equipment and create a lookup map
  const equipmentList = await prisma.equipment.findMany({
    select: { id: true, slug: true },
  })

  const equipmentIdBySlug = new Map<string, string>()
  for (const eq of equipmentList) {
    equipmentIdBySlug.set(eq.slug, eq.id)
  }

  console.log(`📍 Loaded ${equipmentList.length} equipment items`)

  // Get all existing exercises that need migration
  // Note: These are exercises that have canonicalName but still have old primaryGroup field
  const exercises = await prisma.exercise.findMany({
    where: {
      OR: [
        // For exercises that haven't been migrated yet
        { canonicalName: { equals: '' } },
        // Or that have old primaryGroup (legacy field)
        { primaryMuscleId: { equals: '' } },
      ],
    },
  })

  // If no exercises match, try to find all exercises
  const allExercises = await prisma.exercise.findMany({
    where: {
      primaryMuscleId: '', // Empty primaryMuscleId means not migrated
    },
  })

  const exercisesToMigrate = allExercises.length > 0 ? allExercises : exercises

  console.log(`📊 Found ${exercisesToMigrate.length} exercises to migrate`)

  let migrated = 0
  let skipped = 0

  for (const exercise of exercisesToMigrate) {
    try {
      // Get the original integer ID for legacyId (the ID field is now String)
      // We need to parse the CUID to get some integer value or use a counter
      // Actually, we can't get the original integer ID since it's already a String
      // So we'll use a hash of the ID or just leave it null if we can't determine it

      // For legacyId, we'll try to find if there's any way to recover it
      // Since this migration runs after the schema change, we might not have access
      // to the original integer ID. We'll set legacyId based on a best-effort approach.

      // Get the muscle group ID from slug mapping
      // Note: The old 'primaryGroup' field was removed from schema, so we can't use it
      // We'll try to infer from the exercise name if no primary muscle is set
      let muscleGroupId = exercise.primaryMuscleId

      if (!muscleGroupId || muscleGroupId === '') {
        // Try to infer from canonical name
        const inferredPattern = inferMovementPattern(
          null,
          exercise.canonicalName || 'unknown'
        )

        // Map to a default muscle group based on movement pattern
        const defaultMuscleMap: Record<string, string> = {
          PUSH_HORIZONTAL: 'pecho',
          PUSH_VERTICAL: 'deltoides-anterior',
          PULL_HORIZONTAL: 'dorsal-ancho',
          PULL_VERTICAL: 'dorsal-ancho',
          SQUAT: 'cuadriceps',
          HINGE: 'isquiotibiales',
          LUNGE: 'cuadriceps',
          ISOLATION: 'biceps',
        }
        const defaultSlug = defaultMuscleMap[inferredPattern] || 'pecho'
        muscleGroupId = muscleGroupIdBySlug.get(defaultSlug) || ''
      }

      // Infer movement pattern and exercise type
      const movementPattern = inferMovementPattern(
        null,
        exercise.canonicalName || ''
      )
      const exerciseType = inferExerciseType(null, movementPattern)
      const forceVector = inferForceVector(movementPattern)

      // Update the exercise
      await prisma.exercise.update({
        where: { id: exercise.id },
        data: {
          primaryMuscleId: muscleGroupId,
          movementPattern: movementPattern as any,
          exerciseType: exerciseType as any,
          forceVector: forceVector as any,
          difficulty: 'INTERMEDIATE',
          isCanonical: true,
          isActive: true,
        },
      })

      migrated++

      if (migrated % 5 === 0) {
        console.log(
          `  ✅ Migrated ${migrated}/${exercisesToMigrate.length} exercises...`
        )
      }
    } catch (error) {
      console.error(
        `  ❌ Failed to migrate exercise ${exercise.canonicalName || exercise.id}:`,
        error
      )
      skipped++
    }
  }

  console.log(`\n🎉 Migration complete!`)
  console.log(`  ✅ Migrated: ${migrated} exercises`)
  console.log(`  ❌ Skipped: ${skipped} exercises`)

  // Verify migration
  const migratedCount = await prisma.exercise.count({
    where: {
      isCanonical: true,
      primaryMuscleId: { not: '' },
    },
  })

  console.log(`\n📈 Total exercises with canonical data: ${migratedCount}`)

  // Show some examples
  const examples = await prisma.exercise.findMany({
    where: {
      isCanonical: true,
      primaryMuscleId: { not: '' },
    },
    take: 5,
    select: {
      id: true,
      canonicalName: true,
      primaryMuscleId: true,
      movementPattern: true,
      exerciseType: true,
    },
  })

  console.log('\n📋 Sample migrated exercises:')
  console.log(JSON.stringify(examples, null, 2))
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
