import { Exercise, PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create user
  const user = await prisma.user.upsert({
    where: { email: "demo@gymtracker.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@gymtracker.com",
    },
  })

  console.log("✅ Created user:", user.name)

  // ---- EXERCISES ----
  const exercises = [
    // Espalda
    { name: "Jalón al Pecho", slug: "jalon-pecho", primaryGroup: "Espalda", equipment: "Máquina" },
    { name: "Remo T", slug: "remo-t", primaryGroup: "Espalda", equipment: "Máquina" },
    { name: "Remo Máquina Unilateral", slug: "remo-unilateral", primaryGroup: "Espalda", equipment: "Máquina" },

    // Piernas
    { name: "Prensa", slug: "prensa", primaryGroup: "Piernas", equipment: "Máquina" },
    { name: "Hack", slug: "hack", primaryGroup: "Piernas", equipment: "Máquina" },
    { name: "Sentadilla Smith", slug: "sentadilla-smith", primaryGroup: "Piernas", equipment: "Máquina" },
    { name: "Gemelos en Prensa", slug: "gemelos-prensa", primaryGroup: "Piernas", equipment: "Máquina" },

    // Pecho
    { name: "Press Plano", slug: "press-plano", primaryGroup: "Pecho", equipment: "Barra" },
    { name: "Press Inclinado", slug: "press-inclinado", primaryGroup: "Pecho", equipment: "Barra/Máquina" },
    { name: "Apertura en Máquina", slug: "apertura-maquina", primaryGroup: "Pecho", equipment: "Máquina" },

    // Brazos
    { name: "Curl Bíceps Barra W", slug: "curl-biceps-w", primaryGroup: "Bíceps", equipment: "Barra" },
    { name: "Curl Martillo", slug: "curl-martillo", primaryGroup: "Bíceps", equipment: "Mancuernas" },
    { name: "Press Francés", slug: "press-frances", primaryGroup: "Tríceps", equipment: "Barra" },

    // Hombros
    { name: "Press Militar en Máquina", slug: "press-militar", primaryGroup: "Hombros", equipment: "Máquina" },
  ]

  console.log("🏋️ Creating exercises...")
  const createdExercises: Exercise[] = []
  for (const exercise of exercises) {
    const created = await prisma.exercise.upsert({
      where: { slug: exercise.slug },
      update: {},
      create: exercise,
    })
    createdExercises.push(created)
  }
  console.log(`✅ Created ${createdExercises.length} exercises`)

  // ---- ROUTINE ----
  const routine = await prisma.routine.create({
    data: {
      name: "Rutina Actual - 4 días",
      userId: user.id,
      weeks: 1,
    },
  })

  console.log("📋 Created routine:", routine.name)

  const days = [
    { name: "Lunes - Espalda / Bíceps", order: 1 },
    { name: "Martes - Piernas", order: 2 },
    { name: "Jueves - Pecho / Tríceps", order: 3 },
    { name: "Viernes - Hombros", order: 4 },
  ]

  const createdDays = []
  for (const day of days) {
    const created = await prisma.routineDay.create({
      data: { ...day, routineId: routine.id },
    })
    createdDays.push(created)
  }
  console.log("📅 Created routine days")

  // ---- ROUTINE EXERCISES ----
  const findEx = (slug: string) => createdExercises.find((e) => e.slug === slug)

  const lunes = [
    { slug: "jalon-pecho", series: 4, reps: "10-12", order: 1 },
    { slug: "remo-t", series: 4, reps: "10-12", order: 2 },
    { slug: "remo-unilateral", series: 4, reps: "10-12", order: 3 },
    { slug: "curl-biceps-w", series: 3, reps: "10-12", order: 4 },
    { slug: "curl-martillo", series: 3, reps: "12-15", order: 5 },
  ]

  const martes = [
    { slug: "prensa", series: 4, reps: "10-12", order: 1 },
    { slug: "hack", series: 4, reps: "10-12", order: 2 },
    { slug: "sentadilla-smith", series: 4, reps: "8-10", order: 3 },
    { slug: "gemelos-prensa", series: 4, reps: "15-20", order: 4 },
  ]

  const jueves = [
    { slug: "press-plano", series: 4, reps: "8-10", order: 1 },
    { slug: "press-inclinado", series: 4, reps: "8-10", order: 2 },
    { slug: "apertura-maquina", series: 3, reps: "12-15", order: 3 },
    { slug: "press-frances", series: 3, reps: "10-12", order: 4 },
  ]

  const viernes = [
    { slug: "press-militar", series: 4, reps: "8-10", order: 1 },
    { slug: "elevaciones-laterales", series: 3, reps: "12-15", order: 2 },
  ]

  const routineMap = [lunes, martes, jueves, viernes]

  for (let i = 0; i < routineMap.length; i++) {
    const day = createdDays[i]
    for (const ex of routineMap[i]) {
      const exercise = findEx(ex.slug)
      if (exercise) {
        await prisma.routineExercise.create({
          data: {
            routineDayId: day.id,
            exerciseId: exercise.id,
            order: ex.order,
            series: ex.series,
            reps: ex.reps,
          },
        })
      }
    }
  }

  console.log("✅ Routine exercises created")
  console.log("🎉 Database seed completed successfully!")
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Seed failed:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
