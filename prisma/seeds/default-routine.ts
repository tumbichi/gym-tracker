import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const allExercises = await prisma.exercise.findMany();
  let user = await prisma.user.upsert({
    where: { email: "germanvigliettigmail.com" },
    update: {},
    create: {
      name: "Pity",
      email: "germanvigliettigmail.com",
    },
  });

  const ex = (slug: string) => {
    const found = allExercises.find((x) => x.slug === slug);
    if (!found) throw new Error("Exercise not found: " + slug);
    return found;
  };

  // 3) Rutina 4 días (Lun-Jue)
  const routine = await prisma.routine.create({
    data: {
      name: "Rutina Actual - 4 días (Lun-Jue)",
      userId: user.id,
      weeks: 1,
      days: {
        create: [
          { name: "Lunes - Espalda y Bíceps", order: 1 },
          { name: "Martes - Piernas", order: 2 },
          { name: "Miércoles - Pecho y Tríceps", order: 3 },
          { name: "Jueves - Hombros", order: 4 },
        ],
      },
    },
    include: { days: true },
  });

  console.log("✅ Routine created:", routine.name);

  // attach RoutineExercise plan (series/reps target) per day roughly matching tus notas
  // Lunes
  const lunesDay = await prisma.routineDay.update({
    where: { id: routine.days[0].id },
    data: {
      items: {
        create: [
          { exerciseId: ex("jalon-pecho").id, order: 1, series: 4, reps: "12-12-10-8", targetWeight: 40 },
          { exerciseId: ex("remo-t").id, order: 2, series: 4, reps: "12-12-10-8", targetWeight: 15 },
          { exerciseId: ex("remo-cerrado").id, order: 3, series: 4, reps: "12-12-10-8", targetWeight: 30 },
          { exerciseId: ex("biceps-barra-w").id, order: 4, series: 4, reps: "12-12-10-8", targetWeight: 15 },
          { exerciseId: ex("biceps-martillo").id, order: 5, series: 4, reps: "12-12-10-8", targetWeight: 5 },
          { exerciseId: ex("biceps-sentado").id, order: 6, series: 4, reps: "12-12-10-8", targetWeight: 5 },
          { exerciseId: ex("abdominales-cortos").id, order: 7, series: 3, reps: "20", targetWeight: 0 },
        ],
      },
    },
  });

  // Martes
  const martesDay = await prisma.routineDay.update({
    where: { id: routine.days[1].id },
    data: {
      items: {
        create: [
          { exerciseId: ex("hack").id, order: 1, series: 4, reps: "12-12-10-8", targetWeight: 10 },
          { exerciseId: ex("prensa-vieja").id, order: 2, series: 4, reps: "12-12-10-8", targetWeight: 80 },
          { exerciseId: ex("sillon-cuadriceps").id, order: 3, series: 4, reps: "12-12-10-8", targetWeight: 25 },
          { exerciseId: ex("camilla-femoral").id, order: 4, series: 4, reps: "12-12-10-8", targetWeight: 20 },
          { exerciseId: ex("adductor-maquina").id, order: 5, series: 3, reps: "15", targetWeight: 40 },
          { exerciseId: ex("gemelos-prensa").id, order: 6, series: 3, reps: "20", targetWeight: 50 },
        ],
      },
    },
  });

  // Miércoles
  const miercolesDay = await prisma.routineDay.update({
    where: { id: routine.days[2].id },
    data: {
      items: {
        create: [
          { exerciseId: ex("pecho-inclinado").id, order: 1, series: 4, reps: "12-12-10-8", targetWeight: 20 },
          { exerciseId: ex("pecho-plano").id, order: 2, series: 4, reps: "12-12-10-8", targetWeight: 20 },
          { exerciseId: ex("apertura-maquina").id, order: 3, series: 4, reps: "12-12-10-8", targetWeight: 20 },
          { exerciseId: ex("pecho-hammer").id, order: 4, series: 4, reps: "12-12-12-11", targetWeight: 10 },
          { exerciseId: ex("press-frances-mancuernas").id, order: 5, series: 3, reps: "12-12-12", targetWeight: 5 },
          { exerciseId: ex("triceps-polea-barra").id, order: 6, series: 4, reps: "12-12-9-7", targetWeight: 15 },
          { exerciseId: ex("triceps-mancuerna").id, order: 7, series: 3, reps: "12-12-12", targetWeight: 7.5 },
        ],
      },
    },
  });

  // Jueves
  const juevesDay = await prisma.routineDay.update({
    where: { id: routine.days[3].id },
    data: {
      items: {
        create: [
          { exerciseId: ex("press-militar-maquina").id, order: 1, series: 4, reps: "12-12-10-8", targetWeight: 10 },
          { exerciseId: ex("vuelos-mancuernas").id, order: 2, series: 4, reps: "12-12-10-8", targetWeight: 5 },
          { exerciseId: ex("press-frontal-polea").id, order: 3, series: 4, reps: "12-12-10-8", targetWeight: 10 },
          { exerciseId: ex("facepull-polea").id, order: 4, series: 4, reps: "12-12-10-10", targetWeight: 10 },
          { exerciseId: ex("elevacion-hombros").id, order: 5, series: 4, reps: "12-12-10-8", targetWeight: 50 },
          { exerciseId: ex("abdominales-cortos").id, order: 6, series: 3, reps: "20", targetWeight: 0 },
        ],
      },
    },
  });

  console.log("✅ lunes updated:", lunesDay.name);
  console.log("✅ martes updated:", martesDay.name);
  console.log("✅ miercoles updated:", miercolesDay.name);
  console.log("✅ jueves updated:", juevesDay.name);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Disconnected");
  })
  .catch(async (e) => {
    console.error("SEED ERROR:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
