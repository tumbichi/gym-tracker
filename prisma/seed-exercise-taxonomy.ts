/**
 * Seed Exercise Taxonomy - Muscle Groups and Equipment
 *
 * This script seeds the initial reference data for the exercise taxonomy system.
 * Run with: pnpm exec prisma db seed
 *
 * Based on RFC Section 8.3
 */

import {
  PrismaClient,
  BodyRegion,
  BodyPart,
  MuscleType,
  EquipmentCategory,
} from '@prisma/client'

const prisma = new PrismaClient()

// Muscle Groups to seed
const MUSCLE_GROUPS = [
  // CHEST - Chest muscles
  {
    name: 'Pecho',
    slug: 'pecho',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    bodyPart: 'CHEST' as BodyPart,
    muscleType: 'PRIMARY' as MuscleType,
    description: 'Músculos del pecho',
    displayOrder: 1,
  },
  {
    name: 'Pectoral Mayor',
    slug: 'pectoral-mayor',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    bodyPart: 'CHEST' as BodyPart,
    muscleType: 'PRIMARY' as MuscleType,
    description: 'Músculo principal del pecho',
    displayOrder: 2,
  },
  {
    name: 'Pectoral Menor',
    slug: 'pectoral-menor',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    bodyPart: 'CHEST' as BodyPart,
    muscleType: 'SECONDARY' as MuscleType,
    description: 'Músculo secundario del pecho',
    displayOrder: 3,
  },

  // SHOULDERS - Shoulder muscles
  {
    name: 'Deltoides Anterior',
    slug: 'deltoides-anterior',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    bodyPart: 'SHOULDERS' as BodyPart,
    muscleType: 'PRIMARY' as MuscleType,
    description: 'Parte frontal del hombro',
    displayOrder: 4,
  },
  {
    name: 'Deltoides Posterior',
    slug: 'deltoides-posterior',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    bodyPart: 'SHOULDERS' as BodyPart,
    muscleType: 'PRIMARY' as MuscleType,
    description: 'Parte posterior del hombro',
    displayOrder: 14,
  },

  // TRICEPS - Triceps
  {
    name: 'Tríceps',
    slug: 'triceps',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    bodyPart: 'TRICEPS' as BodyPart,
    muscleType: 'PRIMARY' as MuscleType,
    description: 'Músculo posterior del brazo',
    displayOrder: 5,
  },

  // BACK - Back muscles
  {
    name: 'Espalda',
    slug: 'espalda',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    bodyPart: 'BACK' as BodyPart,
    muscleType: 'PRIMARY' as MuscleType,
    description: 'Músculos de la espalda',
    displayOrder: 10,
  },
  {
    name: 'Dorsal Ancho',
    slug: 'dorsal-ancho',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    bodyPart: 'BACK' as BodyPart,
    muscleType: 'PRIMARY' as MuscleType,
    description: 'Músculo ancho de la espalda',
    displayOrder: 11,
  },
  {
    name: 'Trapecio',
    slug: 'trapecio',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    bodyPart: 'BACK' as BodyPart,
    muscleType: 'SECONDARY' as MuscleType,
    description: 'Músculo del cuello y parte superior de la espalda',
    displayOrder: 12,
  },
  {
    name: 'Romboides',
    slug: 'romboides',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    bodyPart: 'BACK' as BodyPart,
    muscleType: 'SECONDARY' as MuscleType,
    description: 'Músculo entre la columna y el omóplato',
    displayOrder: 13,
  },

  // BICEPS - Biceps
  {
    name: 'Bíceps',
    slug: 'biceps',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    bodyPart: 'BICEPS' as BodyPart,
    muscleType: 'PRIMARY' as MuscleType,
    description: 'Músculo frontal del brazo',
    displayOrder: 15,
  },

  // OTHER - Forearms
  {
    name: 'Antebrazo',
    slug: 'antebrazo',
    bodyRegion: 'UPPER_BODY' as BodyRegion,
    bodyPart: 'OTHER' as BodyPart,
    muscleType: 'SECONDARY' as MuscleType,
    description: 'Músculos del antebrazo',
    displayOrder: 16,
  },

  // LEGS - Quad dominant
  {
    name: 'Cuádriceps',
    slug: 'cuadriceps',
    bodyRegion: 'LOWER_BODY' as BodyRegion,
    bodyPart: 'LEGS' as BodyPart,
    muscleType: 'PRIMARY' as MuscleType,
    description: 'Músculos frontales del muslo',
    displayOrder: 20,
  },
  {
    name: 'Recto Femoral',
    slug: 'recto-femoral',
    bodyRegion: 'LOWER_BODY' as BodyRegion,
    bodyPart: 'LEGS' as BodyPart,
    muscleType: 'PRIMARY' as MuscleType,
    description: 'Músculo central del cuádriceps',
    displayOrder: 21,
  },
  {
    name: 'Vasto Lateral',
    slug: 'vasto-lateral',
    bodyRegion: 'LOWER_BODY' as BodyRegion,
    bodyPart: 'LEGS' as BodyPart,
    muscleType: 'SECONDARY' as MuscleType,
    description: 'Músculo exterior del cuádriceps',
    displayOrder: 22,
  },
  {
    name: 'Vasto Medial',
    slug: 'vasto-medial',
    bodyRegion: 'LOWER_BODY' as BodyRegion,
    bodyPart: 'LEGS' as BodyPart,
    muscleType: 'SECONDARY' as MuscleType,
    description: 'Músculo interior del cuádriceps',
    displayOrder: 23,
  },

  // LEGS - Hip dominant
  {
    name: 'Isquiotibiales',
    slug: 'isquiotibiales',
    bodyRegion: 'LOWER_BODY' as BodyRegion,
    bodyPart: 'LEGS' as BodyPart,
    muscleType: 'PRIMARY' as MuscleType,
    description: 'Músculos posteriores del muslo',
    displayOrder: 25,
  },
  {
    name: 'Glúteos',
    slug: 'gluteos',
    bodyRegion: 'LOWER_BODY' as BodyRegion,
    bodyPart: 'LEGS' as BodyPart,
    muscleType: 'PRIMARY' as MuscleType,
    description: 'Músculos de los glúteos',
    displayOrder: 26,
  },
  {
    name: 'Glúteo Mayor',
    slug: 'gluteo-mayor',
    bodyRegion: 'LOWER_BODY' as BodyRegion,
    bodyPart: 'LEGS' as BodyPart,
    muscleType: 'PRIMARY' as MuscleType,
    description: 'Músculo principal de los glúteos',
    displayOrder: 27,
  },
  {
    name: 'Aductores',
    slug: 'aductores',
    bodyRegion: 'LOWER_BODY' as BodyRegion,
    bodyPart: 'LEGS' as BodyPart,
    muscleType: 'SECONDARY' as MuscleType,
    description: 'Músculos internos del muslo',
    displayOrder: 28,
  },
  {
    name: 'Pantorrillas',
    slug: 'pantorrillas',
    bodyRegion: 'LOWER_BODY' as BodyRegion,
    bodyPart: 'LEGS' as BodyPart,
    muscleType: 'PRIMARY' as MuscleType,
    description: 'Músculos de la pantorrilla',
    displayOrder: 29,
  },
  {
    name: 'Gemelos',
    slug: 'gemelos',
    bodyRegion: 'LOWER_BODY' as BodyRegion,
    bodyPart: 'LEGS' as BodyPart,
    muscleType: 'PRIMARY' as MuscleType,
    description: 'Músculos inferiores de la pantorrilla',
    displayOrder: 30,
  },

  // CORE - Core muscles
  {
    name: 'Core',
    slug: 'core',
    bodyRegion: 'CORE' as BodyRegion,
    bodyPart: 'CORE' as BodyPart,
    muscleType: 'PRIMARY' as MuscleType,
    description: 'Músculos del core (centro del cuerpo)',
    displayOrder: 40,
  },
  {
    name: 'Recto Abdominal',
    slug: 'recto-abdominal',
    bodyRegion: 'CORE' as BodyRegion,
    bodyPart: 'CORE' as BodyPart,
    muscleType: 'PRIMARY' as MuscleType,
    description: 'Músculos frontales del abdomen (six pack)',
    displayOrder: 41,
  },
  {
    name: 'Oblicuos',
    slug: 'oblicuos',
    bodyRegion: 'CORE' as BodyRegion,
    bodyPart: 'CORE' as BodyPart,
    muscleType: 'PRIMARY' as MuscleType,
    description: 'Músculos laterales del abdomen',
    displayOrder: 42,
  },
  {
    name: 'Erectores Espinales',
    slug: 'erectores-espinales',
    bodyRegion: 'CORE' as BodyRegion,
    bodyPart: 'CORE' as BodyPart,
    muscleType: 'SECONDARY' as MuscleType,
    description: 'Músculos que extienden la columna',
    displayOrder: 43,
  },
  {
    name: 'Transverso Abdominal',
    slug: 'transverso-abdominal',
    bodyRegion: 'CORE' as BodyRegion,
    bodyPart: 'CORE' as BodyPart,
    muscleType: 'STABILIZER' as MuscleType,
    description: 'Músculo profundo del abdomen',
    displayOrder: 44,
  },
]

// Equipment to seed
const EQUIPMENT = [
  {
    name: 'Barra Olímpica',
    slug: 'barra-olimpica',
    category: 'BARBELL' as EquipmentCategory,
    description: 'Barra larga de 220cm para levantamientos olímpicos',
    icon: 'Barbell',
    displayOrder: 1,
  },
  {
    name: 'Mancuernas',
    slug: 'mancuernas',
    category: 'DUMBBELL' as EquipmentCategory,
    description: 'Peso libre con mango',
    icon: 'Dumbbell',
    displayOrder: 2,
  },
  {
    name: 'Máquina',
    slug: 'maquina',
    category: 'MACHINE' as EquipmentCategory,
    description: 'Máquina de健身房 con asiento y guías',
    icon: 'Pc',
    displayOrder: 3,
  },
  {
    name: 'Polea',
    slug: 'polea',
    category: 'CABLE' as EquipmentCategory,
    description: 'Sistema de poleas con pesas',
    icon: 'Cable',
    displayOrder: 4,
  },
  {
    name: 'Peso Corporal',
    slug: 'peso-corporal',
    category: 'BODYWEIGHT' as EquipmentCategory,
    description: 'Ejercicios sin equipamiento externo',
    icon: 'User',
    displayOrder: 5,
  },
  {
    name: 'Kettlebell',
    slug: 'kettlebell',
    category: 'KETTLEBELL' as EquipmentCategory,
    description: 'Pesa rusa con asa',
    icon: 'Kettlebell',
    displayOrder: 6,
  },
  {
    name: 'Smith',
    slug: 'smith',
    category: 'SMITH' as EquipmentCategory,
    description: 'Máquina Smith con barra guiada',
    icon: 'Activity',
    displayOrder: 7,
  },
  {
    name: 'Balón Medicinal',
    slug: 'balon-medicinal',
    category: 'MEDICINE_BALL' as EquipmentCategory,
    description: 'Balón pesado para ejercicios funcionales',
    icon: 'Circle',
    displayOrder: 8,
  },
  {
    name: 'Bandas Elásticas',
    slug: 'bandas-elasticas',
    category: 'RESISTANCE_BAND' as EquipmentCategory,
    description: 'Bandas de resistencia elástica',
    icon: 'CircleDot',
    displayOrder: 9,
  },
  {
    name: 'Otro',
    slug: 'otro',
    category: 'OTHER' as EquipmentCategory,
    description: 'Otro tipo de equipamiento',
    icon: 'Square',
    displayOrder: 99,
  },
]

async function main() {
  console.log('🏋️ Seeding exercise taxonomy data...')

  // Clean up existing data to ensure correct IDs
  // Note: Must delete in correct order due to foreign key constraints
  console.log('🧹 Cleaning up existing taxonomy data...')
  // First delete all exercise-related data that references Exercise
  await prisma.routineExercise.deleteMany()
  await prisma.workoutExercise.deleteMany()
  await prisma.setEntry.deleteMany()
  await prisma.exerciseAlias.deleteMany()
  await prisma.exercise.deleteMany()
  // Now can delete muscle groups and equipment
  await prisma.muscleGroup.deleteMany()
  await prisma.equipment.deleteMany()

  // Seed Muscle Groups
  console.log(`📍 Seeding ${MUSCLE_GROUPS.length} muscle groups...`)
  for (const muscle of MUSCLE_GROUPS) {
    await prisma.muscleGroup.upsert({
      where: { slug: muscle.slug },
      update: muscle,
      create: {
        ...muscle,
        id: `mg_${muscle.slug}`,
      },
    })
    console.log(`  ✅ ${muscle.name}`)
  }

  // Seed Equipment
  console.log(`📍 Seeding ${EQUIPMENT.length} equipment types...`)
  for (const equip of EQUIPMENT) {
    await prisma.equipment.upsert({
      where: { slug: equip.slug },
      update: equip,
      create: {
        ...equip,
        id: `eq_${equip.slug}`,
      },
    })
    console.log(`  ✅ ${equip.name}`)
  }

  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
