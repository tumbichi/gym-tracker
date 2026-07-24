// prisma/seed.ts
import {
  PrismaClient,
  MovementPattern,
  ExerciseType,
  DifficultyLevel,
  BodyPart,
} from '@prisma/client'
const prisma = new PrismaClient()

function dateFromISO(iso: string) {
  return new Date(iso + 'T10:00:00')
}

// Semana 2 comienza el 2025-08-04 (lunes)
const WEEK2_START = dateFromISO('2025-08-04')

async function main() {
  console.log('🌱 Starting seed...')

  // Clean up existing data to avoid unique constraint issues
  console.log('🧹 Cleaning up existing data...')
  await prisma.routineExercise.deleteMany()
  await prisma.routineDay.deleteMany()
  await prisma.routine.deleteMany()
  await prisma.workoutExercise.deleteMany()
  await prisma.setEntry.deleteMany()
  await prisma.exerciseAlias.deleteMany()
  await prisma.exercise.deleteMany()
  // Note: MuscleGroup and Equipment are handled by seed-exercise-taxonomy.ts
  // but we can clean them here too if needed, or just rely on upsert there.

  // 1) Usuario
  const user = await prisma.user.upsert({
    where: { email: 'germanvigliettigmail.com' },
    update: {},
    create: {
      name: 'Pity',
      email: 'germanvigliettigmail.com',
    },
  })

  // 2) Ejercicios
  const exercisesData = [
    // Espalda / Bíceps
    {
      canonicalName: 'Jalón al pecho',
      slug: 'jalon-pecho',
      primaryMuscleId: 'mg_espalda',
      bodyPart: BodyPart.BACK,
      movementPattern: MovementPattern.PULL_VERTICAL,
      exerciseType: ExerciseType.COMPOUND,
      equipmentIds: ['eq_polea'],
    },
    {
      canonicalName: 'Remo (máquina roja)',
      slug: 'remo-roja',
      primaryMuscleId: 'mg_espalda',
      bodyPart: BodyPart.BACK,
      movementPattern: MovementPattern.PULL_HORIZONTAL,
      exerciseType: ExerciseType.COMPOUND,
      equipmentIds: ['eq_maquina'],
    },
    {
      canonicalName: 'Remo T',
      slug: 'remo-t',
      primaryMuscleId: 'mg_espalda',
      bodyPart: BodyPart.BACK,
      movementPattern: MovementPattern.PULL_HORIZONTAL,
      exerciseType: ExerciseType.COMPOUND,
      equipmentIds: ['eq_maquina'],
    },
    {
      canonicalName: 'Remo agarre cerrado',
      slug: 'remo-cerrado',
      primaryMuscleId: 'mg_espalda',
      bodyPart: BodyPart.BACK,
      movementPattern: MovementPattern.PULL_HORIZONTAL,
      exerciseType: ExerciseType.COMPOUND,
      equipmentIds: ['eq_polea'],
    },
    {
      canonicalName: 'Bíceps Scott',
      slug: 'biceps-scott',
      primaryMuscleId: 'mg_biceps',
      bodyPart: BodyPart.BICEPS,
      movementPattern: MovementPattern.ISOLATION,
      exerciseType: ExerciseType.ISOLATION,
      equipmentIds: ['eq_maquina'],
    },
    {
      canonicalName: 'Bíceps barra W',
      slug: 'biceps-barra-w',
      primaryMuscleId: 'mg_biceps',
      bodyPart: BodyPart.BICEPS,
      movementPattern: MovementPattern.ISOLATION,
      exerciseType: ExerciseType.ISOLATION,
      equipmentIds: ['eq_barra-olimpica'],
    },
    {
      canonicalName: 'Bíceps martillo',
      slug: 'biceps-martillo',
      primaryMuscleId: 'mg_biceps',
      bodyPart: BodyPart.BICEPS,
      movementPattern: MovementPattern.ISOLATION,
      exerciseType: ExerciseType.ISOLATION,
      equipmentIds: ['eq_mancuernas'],
    },
    {
      canonicalName: 'Bíceps sentado con mancuerna',
      slug: 'biceps-sentado',
      primaryMuscleId: 'mg_biceps',
      movementPattern: MovementPattern.ISOLATION,
      exerciseType: ExerciseType.ISOLATION,
      equipmentIds: ['eq_mancuernas'],
    },

    // Piernas
    {
      canonicalName: 'Hack',
      slug: 'hack',
      primaryMuscleId: 'mg_cuadriceps',
      movementPattern: MovementPattern.SQUAT,
      exerciseType: ExerciseType.COMPOUND,
      equipmentIds: ['eq_maquina'],
    },
    {
      canonicalName: 'Prensa (vieja)',
      slug: 'prensa-vieja',
      primaryMuscleId: 'mg_cuadriceps',
      movementPattern: MovementPattern.SQUAT,
      exerciseType: ExerciseType.COMPOUND,
      equipmentIds: ['eq_maquina'],
    },
    {
      canonicalName: 'Prensa (nueva)',
      slug: 'prensa-nueva',
      primaryMuscleId: 'mg_cuadriceps',
      movementPattern: MovementPattern.SQUAT,
      exerciseType: ExerciseType.COMPOUND,
      equipmentIds: ['eq_maquina'],
    },
    {
      canonicalName: 'Sillón de cuádriceps',
      slug: 'sillon-cuadriceps',
      primaryMuscleId: 'mg_cuadriceps',
      movementPattern: MovementPattern.ISOLATION,
      exerciseType: ExerciseType.ISOLATION,
      equipmentIds: ['eq_maquina'],
    },
    {
      canonicalName: 'Camilla femoral',
      slug: 'camilla-femoral',
      primaryMuscleId: 'mg_isquiotibiales',
      movementPattern: MovementPattern.ISOLATION,
      exerciseType: ExerciseType.ISOLATION,
      equipmentIds: ['eq_maquina'],
    },
    {
      canonicalName: 'Aductor en máquina',
      slug: 'adductor-maquina',
      primaryMuscleId: 'mg_aductores',
      movementPattern: MovementPattern.ISOLATION,
      exerciseType: ExerciseType.ISOLATION,
      equipmentIds: ['eq_maquina'],
    },
    {
      canonicalName: 'Gemelos en prensa',
      slug: 'gemelos-prensa',
      primaryMuscleId: 'mg_gemelos',
      movementPattern: MovementPattern.ISOLATION,
      exerciseType: ExerciseType.ISOLATION,
      equipmentIds: ['eq_maquina'],
    },
    {
      canonicalName: 'Gemelos smith gravedad',
      slug: 'gemelos-smith',
      primaryMuscleId: 'mg_gemelos',
      movementPattern: MovementPattern.ISOLATION,
      exerciseType: ExerciseType.ISOLATION,
      equipmentIds: ['eq_smith'],
    },

    // Pecho / Tríceps
    {
      canonicalName: 'Pecho inclinado',
      slug: 'pecho-inclinado',
      primaryMuscleId: 'mg_pecho',
      movementPattern: MovementPattern.PUSH_HORIZONTAL,
      exerciseType: ExerciseType.COMPOUND,
      equipmentIds: ['eq_barra-olimpica'],
    },
    {
      canonicalName: 'Pecho plano',
      slug: 'pecho-plano',
      primaryMuscleId: 'mg_pecho',
      movementPattern: MovementPattern.PUSH_HORIZONTAL,
      exerciseType: ExerciseType.COMPOUND,
      equipmentIds: ['eq_barra-olimpica'],
    },
    {
      canonicalName: 'Apertura en máquina',
      slug: 'apertura-maquina',
      primaryMuscleId: 'mg_pecho',
      movementPattern: MovementPattern.ISOLATION,
      exerciseType: ExerciseType.ISOLATION,
      equipmentIds: ['eq_maquina'],
    },
    {
      canonicalName: 'Apertura en polea',
      slug: 'apertura-polea',
      primaryMuscleId: 'mg_pecho',
      movementPattern: MovementPattern.ISOLATION,
      exerciseType: ExerciseType.ISOLATION,
      equipmentIds: ['eq_polea'],
    },
    {
      canonicalName: 'Pecho hammer',
      slug: 'pecho-hammer',
      primaryMuscleId: 'mg_pecho',
      movementPattern: MovementPattern.PUSH_HORIZONTAL,
      exerciseType: ExerciseType.COMPOUND,
      equipmentIds: ['eq_maquina'],
    },
    {
      canonicalName: 'Press francés (mancuernas)',
      slug: 'press-frances-mancuernas',
      primaryMuscleId: 'mg_triceps',
      movementPattern: MovementPattern.ISOLATION,
      exerciseType: ExerciseType.ISOLATION,
      equipmentIds: ['eq_mancuernas'],
    },
    {
      canonicalName: 'Press francés (barra S)',
      slug: 'press-frances-barra-s',
      primaryMuscleId: 'mg_triceps',
      movementPattern: MovementPattern.ISOLATION,
      exerciseType: ExerciseType.ISOLATION,
      equipmentIds: ['eq_barra-olimpica'],
    },
    {
      canonicalName: 'Tríceps en polea con barra',
      slug: 'triceps-polea-barra',
      primaryMuscleId: 'mg_triceps',
      movementPattern: MovementPattern.ISOLATION,
      exerciseType: ExerciseType.ISOLATION,
      equipmentIds: ['eq_polea'],
    },
    {
      canonicalName: 'Tríceps con una mancuerna',
      slug: 'triceps-mancuerna',
      primaryMuscleId: 'mg_triceps',
      movementPattern: MovementPattern.ISOLATION,
      exerciseType: ExerciseType.ISOLATION,
      equipmentIds: ['eq_mancuernas'],
    },

    // Hombros
    {
      canonicalName: 'Press militar máquina',
      slug: 'press-militar-maquina',
      primaryMuscleId: 'mg_deltoides-anterior',
      movementPattern: MovementPattern.PUSH_VERTICAL,
      exerciseType: ExerciseType.COMPOUND,
      equipmentIds: ['eq_maquina'],
    },
    {
      canonicalName: 'Vuelos con mancuernas (vuelvo)',
      slug: 'vuelos-mancuernas',
      primaryMuscleId: 'mg_deltoides-anterior',
      movementPattern: MovementPattern.ISOLATION,
      exerciseType: ExerciseType.ISOLATION,
      equipmentIds: ['eq_mancuernas'],
    },
    {
      canonicalName: 'Press frontal en polea',
      slug: 'press-frontal-polea',
      primaryMuscleId: 'mg_deltoides-anterior',
      movementPattern: MovementPattern.ISOLATION,
      exerciseType: ExerciseType.ISOLATION,
      equipmentIds: ['eq_polea'],
    },
    {
      canonicalName: 'Facepull en polea',
      slug: 'facepull-polea',
      primaryMuscleId: 'mg_deltoides-posterior',
      movementPattern: MovementPattern.PULL_HORIZONTAL,
      exerciseType: ExerciseType.ISOLATION,
      equipmentIds: ['eq_polea'],
    },
    {
      canonicalName: 'Elevación de hombros (shrugs)',
      slug: 'elevacion-hombros',
      primaryMuscleId: 'mg_trapecio',
      movementPattern: MovementPattern.ISOLATION,
      exerciseType: ExerciseType.ISOLATION,
      equipmentIds: ['eq_barra-olimpica'],
    },

    // Core
    {
      canonicalName: 'Abdominales cortos',
      slug: 'abdominales-cortos',
      primaryMuscleId: 'mg_recto-abdominal',
      movementPattern: MovementPattern.ISOLATION,
      exerciseType: ExerciseType.ISOLATION,
      equipmentIds: ['eq_peso-corporal'],
    },
  ]

  // create exercises
  for (const e of exercisesData) {
    const { equipmentIds, ...data } = e
    await prisma.exercise.upsert({
      where: { slug: e.slug },
      update: {
        ...data,
        equipment: {
          set: equipmentIds.map((id) => ({ id })),
        },
      },
      create: {
        ...data,
        equipment: {
          connect: equipmentIds.map((id) => ({ id })),
        },
      },
    })
  }

  const allExercises = await prisma.exercise.findMany()
  const ex = (slug: string) => {
    const found = allExercises.find((x) => x.slug === slug)
    if (!found) throw new Error('Exercise not found: ' + slug)
    return found
  }

  // 3) Rutina 4 días (Lun-Jue)
  const routine = await prisma.routine.create({
    data: {
      name: 'Rutina Actual - 4 días (Lun-Jue)',
      userId: user.id,
      weeks: 1,
      days: {
        create: [
          { name: 'Lunes - Espalda y Bíceps', order: 1 },
          { name: 'Martes - Piernas', order: 2 },
          { name: 'Miércoles - Pecho y Tríceps', order: 3 },
          { name: 'Jueves - Hombros', order: 4 },
        ],
      },
    },
    include: { days: true },
  })

  // attach RoutineExercise plan
  // Lunes
  await prisma.routineDay.update({
    where: { id: routine.days[0].id },
    data: {
      items: {
        create: [
          {
            exerciseId: ex('jalon-pecho').id,
            order: 1,
            series: 4,
            reps: '[12,12,10,8]',
          },
          {
            exerciseId: ex('remo-t').id,
            order: 2,
            series: 4,
            reps: '[12,12,10,8]',
          },
          {
            exerciseId: ex('remo-cerrado').id,
            order: 3,
            series: 4,
            reps: '[12,12,10,8]',
          },
          {
            exerciseId: ex('biceps-barra-w').id,
            order: 4,
            series: 4,
            reps: '[12,12,10,8]',
          },
          {
            exerciseId: ex('biceps-martillo').id,
            order: 5,
            series: 4,
            reps: '[12,12,10,8]',
          },
          {
            exerciseId: ex('biceps-sentado').id,
            order: 6,
            series: 4,
            reps: '[12,12,10,8]',
          },
          {
            exerciseId: ex('abdominales-cortos').id,
            order: 7,
            series: 3,
            reps: '[20]',
          },
        ],
      },
    },
  })

  // Martes
  await prisma.routineDay.update({
    where: { id: routine.days[1].id },
    data: {
      items: {
        create: [
          {
            exerciseId: ex('hack').id,
            order: 1,
            series: 4,
            reps: '[12,12,10,8]',
          },
          {
            exerciseId: ex('prensa-vieja').id,
            order: 2,
            series: 4,
            reps: '[12,12,10,8]',
          },
          {
            exerciseId: ex('sillon-cuadriceps').id,
            order: 3,
            series: 4,
            reps: '[12,12,10,8]',
          },
          {
            exerciseId: ex('camilla-femoral').id,
            order: 4,
            series: 4,
            reps: '[12,12,10,8]',
          },
          {
            exerciseId: ex('adductor-maquina').id,
            order: 5,
            series: 3,
            reps: '[15]',
          },
          {
            exerciseId: ex('gemelos-prensa').id,
            order: 6,
            series: 3,
            reps: '[20]',
          },
        ],
      },
    },
  })

  // Miércoles
  await prisma.routineDay.update({
    where: { id: routine.days[2].id },
    data: {
      items: {
        create: [
          {
            exerciseId: ex('pecho-inclinado').id,
            order: 1,
            series: 4,
            reps: '[12,12,10,8]',
          },
          {
            exerciseId: ex('pecho-plano').id,
            order: 2,
            series: 4,
            reps: '[12,12,10,8]',
          },
          {
            exerciseId: ex('apertura-maquina').id,
            order: 3,
            series: 4,
            reps: '[12,12,10,8]',
          },
          {
            exerciseId: ex('pecho-hammer').id,
            order: 4,
            series: 4,
            reps: '[12,12,12,11]',
          },
          {
            exerciseId: ex('press-frances-mancuernas').id,
            order: 5,
            series: 3,
            reps: '[12,12,12]',
          },
          {
            exerciseId: ex('triceps-polea-barra').id,
            order: 6,
            series: 4,
            reps: '[12,12,9,7]',
          },
          {
            exerciseId: ex('triceps-mancuerna').id,
            order: 7,
            series: 3,
            reps: '[12,12,12]',
          },
        ],
      },
    },
  })

  // Jueves
  await prisma.routineDay.update({
    where: { id: routine.days[3].id },
    data: {
      items: {
        create: [
          {
            exerciseId: ex('press-militar-maquina').id,
            order: 1,
            series: 4,
            reps: '[12,12,10,8]',
          },
          {
            exerciseId: ex('vuelos-mancuernas').id,
            order: 2,
            series: 4,
            reps: '[12,12,10,8]',
          },
          {
            exerciseId: ex('press-frontal-polea').id,
            order: 3,
            series: 4,
            reps: '[12,12,10,8]',
          },
          {
            exerciseId: ex('facepull-polea').id,
            order: 4,
            series: 4,
            reps: '[12,12,10,10]',
          },
          {
            exerciseId: ex('elevacion-hombros').id,
            order: 5,
            series: 4,
            reps: '[12,12,10,8]',
          },
          {
            exerciseId: ex('abdominales-cortos').id,
            order: 6,
            series: 3,
            reps: '[20]',
          },
        ],
      },
    },
  })

  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error('SEED ERROR:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
