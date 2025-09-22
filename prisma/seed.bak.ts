import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create a default user
  const user = await prisma.user.upsert({
    where: { email: "demo@gymtracker.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@gymtracker.com",
    },
  })

  console.log("✅ Created user:", user.name)

  // Create exercises
  const exercises = [
    // Pecho
    {
      name: "Press de Banca",
      slug: "press-de-banca",
      primaryGroup: "Pecho",
      equipment: "Barra",
      notes: "Ejercicio compuesto fundamental para el desarrollo del pecho",
    },
    {
      name: "Press Inclinado con Mancuernas",
      slug: "press-inclinado-mancuernas",
      primaryGroup: "Pecho",
      equipment: "Mancuernas",
      notes: "Enfoque en la parte superior del pecho",
    },
    {
      name: "Aperturas con Mancuernas",
      slug: "aperturas-mancuernas",
      primaryGroup: "Pecho",
      equipment: "Mancuernas",
      notes: "Ejercicio de aislamiento para el pecho",
    },
    {
      name: "Fondos en Paralelas",
      slug: "fondos-paralelas",
      primaryGroup: "Pecho",
      equipment: "Peso Corporal",
      notes: "Ejercicio compuesto que también trabaja tríceps",
    },

    // Espalda
    {
      name: "Peso Muerto",
      slug: "peso-muerto",
      primaryGroup: "Espalda",
      equipment: "Barra",
      notes: "Ejercicio compuesto fundamental, trabaja toda la cadena posterior",
    },
    {
      name: "Dominadas",
      slug: "dominadas",
      primaryGroup: "Espalda",
      equipment: "Peso Corporal",
      notes: "Ejercicio compuesto para el desarrollo del dorsal ancho",
    },
    {
      name: "Remo con Barra",
      slug: "remo-barra",
      primaryGroup: "Espalda",
      equipment: "Barra",
      notes: "Ejercicio compuesto para el grosor de la espalda",
    },
    {
      name: "Remo en Polea Baja",
      slug: "remo-polea-baja",
      primaryGroup: "Espalda",
      equipment: "Máquina",
      notes: "Ejercicio para el desarrollo del romboides y trapecio medio",
    },

    // Piernas
    {
      name: "Sentadilla",
      slug: "sentadilla",
      primaryGroup: "Piernas",
      equipment: "Barra",
      notes: "El rey de los ejercicios, trabaja todo el tren inferior",
    },
    {
      name: "Prensa de Piernas",
      slug: "prensa-piernas",
      primaryGroup: "Piernas",
      equipment: "Máquina",
      notes: "Alternativa segura a la sentadilla",
    },
    {
      name: "Peso Muerto Rumano",
      slug: "peso-muerto-rumano",
      primaryGroup: "Piernas",
      equipment: "Barra",
      notes: "Enfoque en isquiotibiales y glúteos",
    },
    {
      name: "Extensión de Cuádriceps",
      slug: "extension-cuadriceps",
      primaryGroup: "Piernas",
      equipment: "Máquina",
      notes: "Ejercicio de aislamiento para cuádriceps",
    },
    {
      name: "Curl Femoral",
      slug: "curl-femoral",
      primaryGroup: "Piernas",
      equipment: "Máquina",
      notes: "Ejercicio de aislamiento para isquiotibiales",
    },

    // Hombros
    {
      name: "Press Militar",
      slug: "press-militar",
      primaryGroup: "Hombros",
      equipment: "Barra",
      notes: "Ejercicio compuesto fundamental para hombros",
    },
    {
      name: "Elevaciones Laterales",
      slug: "elevaciones-laterales",
      primaryGroup: "Hombros",
      equipment: "Mancuernas",
      notes: "Ejercicio de aislamiento para deltoides medio",
    },
    {
      name: "Elevaciones Posteriores",
      slug: "elevaciones-posteriores",
      primaryGroup: "Hombros",
      equipment: "Mancuernas",
      notes: "Ejercicio de aislamiento para deltoides posterior",
    },

    // Brazos
    {
      name: "Curl de Bíceps con Barra",
      slug: "curl-biceps-barra",
      primaryGroup: "Bíceps",
      equipment: "Barra",
      notes: "Ejercicio básico para el desarrollo de bíceps",
    },
    {
      name: "Curl Martillo",
      slug: "curl-martillo",
      primaryGroup: "Bíceps",
      equipment: "Mancuernas",
      notes: "Trabaja bíceps y braquial anterior",
    },
    {
      name: "Press Francés",
      slug: "press-frances",
      primaryGroup: "Tríceps",
      equipment: "Barra",
      notes: "Ejercicio de aislamiento para tríceps",
    },
    {
      name: "Extensiones en Polea",
      slug: "extensiones-polea",
      primaryGroup: "Tríceps",
      equipment: "Máquina",
      notes: "Ejercicio de aislamiento para tríceps",
    },
  ]

  console.log("🏋️ Creating exercises...")
  const createdExercises = []
  for (const exercise of exercises) {
    const created = await prisma.exercise.upsert({
      where: { slug: exercise.slug },
      update: {},
      create: exercise,
    })
    createdExercises.push(created)
  }
  console.log(`✅ Created ${createdExercises.length} exercises`)

  // Create a sample routine
  const routine = await prisma.routine.create({
    data: {
      name: "Push/Pull/Legs - Principiante",
      userId: user.id,
      weeks: 1,
    },
  })

  console.log("📋 Created routine:", routine.name)

  // Create routine days
  const routineDays = [
    { name: "Lunes - Push (Pecho/Hombros/Tríceps)", order: 1 },
    { name: "Martes - Pull (Espalda/Bíceps)", order: 2 },
    { name: "Miércoles - Legs (Piernas)", order: 3 },
    { name: "Jueves - Descanso", order: 4 },
    { name: "Viernes - Push (Pecho/Hombros/Tríceps)", order: 5 },
    { name: "Sábado - Pull (Espalda/Bíceps)", order: 6 },
    { name: "Domingo - Legs (Piernas)", order: 7 },
  ]

  const createdDays = []
  for (const day of routineDays) {
    const created = await prisma.routineDay.create({
      data: {
        ...day,
        routineId: routine.id,
      },
    })
    createdDays.push(created)
  }

  console.log("📅 Created routine days")

  // Add exercises to routine days
  // Lunes - Push
  const pushDay = createdDays[0]
  const pushExercises = [
    { exerciseSlug: "press-de-banca", series: 4, reps: "8-10", targetWeight: 80, order: 1 },
    { exerciseSlug: "press-inclinado-mancuernas", series: 3, reps: "10-12", targetWeight: 30, order: 2 },
    { exerciseSlug: "aperturas-mancuernas", series: 3, reps: "12-15", targetWeight: 15, order: 3 },
    { exerciseSlug: "press-militar", series: 3, reps: "8-10", targetWeight: 50, order: 4 },
    { exerciseSlug: "elevaciones-laterales", series: 3, reps: "12-15", targetWeight: 10, order: 5 },
    { exerciseSlug: "press-frances", series: 3, reps: "10-12", targetWeight: 30, order: 6 },
  ]

  for (const ex of pushExercises) {
    const exercise = createdExercises.find((e) => e.slug === ex.exerciseSlug)
    if (exercise) {
      await prisma.routineExercise.create({
        data: {
          routineDayId: pushDay.id,
          exerciseId: exercise.id,
          order: ex.order,
          series: ex.series,
          reps: ex.reps,
          targetWeight: ex.targetWeight,
        },
      })
    }
  }

  // Martes - Pull
  const pullDay = createdDays[1]
  const pullExercises = [
    { exerciseSlug: "peso-muerto", series: 4, reps: "5-6", targetWeight: 100, order: 1 },
    { exerciseSlug: "dominadas", series: 3, reps: "8-12", targetWeight: null, order: 2 },
    { exerciseSlug: "remo-barra", series: 3, reps: "8-10", targetWeight: 70, order: 3 },
    { exerciseSlug: "remo-polea-baja", series: 3, reps: "10-12", targetWeight: 60, order: 4 },
    { exerciseSlug: "curl-biceps-barra", series: 3, reps: "10-12", targetWeight: 25, order: 5 },
    { exerciseSlug: "curl-martillo", series: 3, reps: "12-15", targetWeight: 12, order: 6 },
  ]

  for (const ex of pullExercises) {
    const exercise = createdExercises.find((e) => e.slug === ex.exerciseSlug)
    if (exercise) {
      await prisma.routineExercise.create({
        data: {
          routineDayId: pullDay.id,
          exerciseId: exercise.id,
          order: ex.order,
          series: ex.series,
          reps: ex.reps,
          targetWeight: ex.targetWeight,
        },
      })
    }
  }

  // Miércoles - Legs
  const legsDay = createdDays[2]
  const legExercises = [
    { exerciseSlug: "sentadilla", series: 4, reps: "8-10", targetWeight: 90, order: 1 },
    { exerciseSlug: "peso-muerto-rumano", series: 3, reps: "10-12", targetWeight: 70, order: 2 },
    { exerciseSlug: "prensa-piernas", series: 3, reps: "12-15", targetWeight: 150, order: 3 },
    { exerciseSlug: "extension-cuadriceps", series: 3, reps: "12-15", targetWeight: 40, order: 4 },
    { exerciseSlug: "curl-femoral", series: 3, reps: "12-15", targetWeight: 35, order: 5 },
  ]

  for (const ex of legExercises) {
    const exercise = createdExercises.find((e) => e.slug === ex.exerciseSlug)
    if (exercise) {
      await prisma.routineExercise.create({
        data: {
          routineDayId: legsDay.id,
          exerciseId: exercise.id,
          order: ex.order,
          series: ex.series,
          reps: ex.reps,
          targetWeight: ex.targetWeight,
        },
      })
    }
  }

  // Create sample workout sessions with historical data
  console.log("📊 Creating sample workout sessions...")

  const today = new Date()
  const sessions = []

  // Create 4 weeks of workout history
  for (let week = 0; week < 4; week++) {
    for (let day = 0; day < 3; day++) {
      // 3 workouts per week
      const sessionDate = new Date(today)
      sessionDate.setDate(today.getDate() - week * 7 - day * 2 - 1)

      const session = await prisma.workoutSession.create({
        data: {
          userId: user.id,
          routineId: routine.id,
          date: sessionDate,
          notes: `Sesión semana ${4 - week}, día ${day + 1}`,
        },
      })
      sessions.push(session)

      // Add sets for each session
      const dayExercises = day === 0 ? pushExercises : day === 1 ? pullExercises : legExercises

      for (const ex of dayExercises.slice(0, 4)) {
        // First 4 exercises per day
        const exercise = createdExercises.find((e) => e.slug === ex.exerciseSlug)
        if (exercise) {
          const baseWeight = ex.targetWeight || 0
          const progressionWeight = baseWeight + week * 2.5 // Progressive overload

          for (let set = 1; set <= ex.series; set++) {
            const repsRange = ex.reps.split("-")
            const minReps = Number.parseInt(repsRange[0])
            const maxReps = repsRange[1] ? Number.parseInt(repsRange[1]) : minReps
            const actualReps = Math.floor(Math.random() * (maxReps - minReps + 1)) + minReps

            await prisma.setEntry.create({
              data: {
                sessionId: session.id,
                exerciseId: exercise.id,
                setNumber: set,
                repsDone: actualReps,
                weightKg: progressionWeight,
                rpe: Math.floor(Math.random() * 3) + 7, // RPE between 7-9
                notes: set === 1 ? "Primera serie" : null,
              },
            })
          }
        }
      }
    }
  }

  console.log(`✅ Created ${sessions.length} workout sessions with historical data`)
  console.log("🎉 Database seed completed successfully!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
