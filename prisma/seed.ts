// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function dateFromISO(iso: string) { return new Date(iso + "T10:00:00"); }

// Semana 2 comienza el 2025-08-04 (lunes)
const WEEK2_START = dateFromISO("2025-08-04");

async function main() {
  console.log("🌱 Starting seed...");

  // 1) Usuario
  const user = await prisma.user.upsert({
    where: { email: "germanvigliettigmail.com" },
    update: {},
    create: {
      name: "Pity",
      email: "germanvigliettigmail.com",
    },
  });

  // 2) Ejercicios (todos los que aparecen en tus notas)
  const exercisesData = [
    // Espalda / Bíceps
    { name: "Jalón al pecho", slug: "jalon-pecho", primaryGroup: "Espalda", equipment: "Polea" },
    { name: "Remo (máquina roja)", slug: "remo-roja", primaryGroup: "Espalda", equipment: "Máquina" },
    { name: "Remo T", slug: "remo-t", primaryGroup: "Espalda", equipment: "Máquina" },
    { name: "Remo agarre cerrado", slug: "remo-cerrado", primaryGroup: "Espalda", equipment: "Polea" },
    { name: "Bíceps Scott", slug: "biceps-scott", primaryGroup: "Bíceps", equipment: "Banco Scott" },
    { name: "Bíceps barra W", slug: "biceps-barra-w", primaryGroup: "Bíceps", equipment: "Barra W" },
    { name: "Bíceps martillo", slug: "biceps-martillo", primaryGroup: "Bíceps", equipment: "Mancuernas" },
    { name: "Bíceps sentado con mancuerna", slug: "biceps-sentado", primaryGroup: "Bíceps", equipment: "Mancuernas" },

    // Piernas
    { name: "Hack", slug: "hack", primaryGroup: "Piernas", equipment: "Máquina" },
    { name: "Prensa (vieja)", slug: "prensa-vieja", primaryGroup: "Piernas", equipment: "Prensa" },
    { name: "Prensa (nueva)", slug: "prensa-nueva", primaryGroup: "Piernas", equipment: "Prensa" },
    { name: "Sillón de cuádriceps", slug: "sillon-cuadriceps", primaryGroup: "Piernas", equipment: "Máquina" },
    { name: "Camilla femoral", slug: "camilla-femoral", primaryGroup: "Piernas", equipment: "Máquina" },
    { name: "Aductor en máquina", slug: "adductor-maquina", primaryGroup: "Piernas", equipment: "Máquina" },
    { name: "Gemelos en prensa", slug: "gemelos-prensa", primaryGroup: "Piernas", equipment: "Prensa" },
    { name: "Gemelos smith gravedad", slug: "gemelos-smith", primaryGroup: "Piernas", equipment: "Smith" },

    // Pecho / Tríceps
    { name: "Pecho inclinado", slug: "pecho-inclinado", primaryGroup: "Pecho", equipment: "Barra/Máquina" },
    { name: "Pecho plano", slug: "pecho-plano", primaryGroup: "Pecho", equipment: "Barra" },
    { name: "Apertura en máquina", slug: "apertura-maquina", primaryGroup: "Pecho", equipment: "Máquina" },
    { name: "Apertura en polea", slug: "apertura-polea", primaryGroup: "Pecho", equipment: "Polea" },
    { name: "Pecho hammer", slug: "pecho-hammer", primaryGroup: "Pecho", equipment: "Máquina" },
    { name: "Press francés (mancuernas)", slug: "press-frances-mancuernas", primaryGroup: "Tríceps", equipment: "Mancuernas" },
    { name: "Press francés (barra S)", slug: "press-frances-barra-s", primaryGroup: "Tríceps", equipment: "Barra S" },
    { name: "Tríceps en polea con barra", slug: "triceps-polea-barra", primaryGroup: "Tríceps", equipment: "Polea" },
    { name: "Tríceps con una mancuerna", slug: "triceps-mancuerna", primaryGroup: "Tríceps", equipment: "Mancuernas" },

    // Hombros
    { name: "Press militar máquina", slug: "press-militar-maquina", primaryGroup: "Hombros", equipment: "Máquina" },
    { name: "Vuelos con mancuernas (vuelvo)", slug: "vuelos-mancuernas", primaryGroup: "Hombros", equipment: "Mancuernas" },
    { name: "Press frontal en polea", slug: "press-frontal-polea", primaryGroup: "Hombros", equipment: "Polea" },
    { name: "Facepull en polea", slug: "facepull-polea", primaryGroup: "Hombros", equipment: "Polea" },
    { name: "Elevación de hombros (shrugs)", slug: "elevacion-hombros", primaryGroup: "Hombros", equipment: "Barra" },

    // Core
    { name: "Abdominales cortos", slug: "abdominales-cortos", primaryGroup: "Core", equipment: null },
  ];

  // create exercises
  for (const e of exercisesData) {
    await prisma.exercise.upsert({
      where: { slug: e.slug },
      update: {},
      create: e,
    });
  }

  const allExercises = await prisma.exercise.findMany();
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

  // attach RoutineExercise plan (series/reps target) per day roughly matching tus notas
  // Lunes
  const lunesDay = await prisma.routineDay.update({
    where: { id: routine.days[0].id },
    data: {
      items: {
        create: [
          { exerciseId: ex("jalon-pecho").id, order: 1, series: 4, reps: "[12,12,10,8]" },
          { exerciseId: ex("remo-t").id, order: 2, series: 4, reps: "[12,12,10,8]" },
          { exerciseId: ex("remo-cerrado").id, order: 3, series: 4, reps: "[12,12,10,8]" },
          { exerciseId: ex("biceps-barra-w").id, order: 4, series: 4, reps: "[12,12,10,8]" },
          { exerciseId: ex("biceps-martillo").id, order: 5, series: 4, reps: "[12,12,10,8]" },
          { exerciseId: ex("biceps-sentado").id, order: 6, series: 4, reps: "[12,12,10,8]" },
          { exerciseId: ex("abdominales-cortos").id, order: 7, series: 3, reps: "[20]" },
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
          { exerciseId: ex("hack").id, order: 1, series: 4, reps: "[12,12,10,8]" },
          { exerciseId: ex("prensa-vieja").id, order: 2, series: 4, reps: "[12,12,10,8]" },
          { exerciseId: ex("sillon-cuadriceps").id, order: 3, series: 4, reps: "[12,12,10,8]" },
          { exerciseId: ex("camilla-femoral").id, order: 4, series: 4, reps: "[12,12,10,8]" },
          { exerciseId: ex("adductor-maquina").id, order: 5, series: 3, reps: "[15]" },
          { exerciseId: ex("gemelos-prensa").id, order: 6, series: 3, reps: "[20]" },
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
          { exerciseId: ex("pecho-inclinado").id, order: 1, series: 4, reps: "[12,12,10,8]" },
          { exerciseId: ex("pecho-plano").id, order: 2, series: 4, reps: "[12,12,10,8]" },
          { exerciseId: ex("apertura-maquina").id, order: 3, series: 4, reps: "[12,12,10,8]" },
          { exerciseId: ex("pecho-hammer").id, order: 4, series: 4, reps: "[12,12,12,11]" },
          { exerciseId: ex("press-frances-mancuernas").id, order: 5, series: 3, reps: "[12,12,12]" },
          { exerciseId: ex("triceps-polea-barra").id, order: 6, series: 4, reps: "[12,12,9,7]" },
          { exerciseId: ex("triceps-mancuerna").id, order: 7, series: 3, reps: "[12,12,12]" },
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
          { exerciseId: ex("press-militar-maquina").id, order: 1, series: 4, reps: "[12,12,10,8]" },
          { exerciseId: ex("vuelos-mancuernas").id, order: 2, series: 4, reps: "[12,12,10,8]" },
          { exerciseId: ex("press-frontal-polea").id, order: 3, series: 4, reps: "[12,12,10,8]" },
          { exerciseId: ex("facepull-polea").id, order: 4, series: 4, reps: "[12,12,10,10]" },
          { exerciseId: ex("elevacion-hombros").id, order: 5, series: 4, reps: "[12,12,10,8]" },
          { exerciseId: ex("abdominales-cortos").id, order: 6, series: 3, reps: "[20]" },
        ],
      },
    },
  });

  // 4) Historico: semanas 2 → 8
  // We'll map the weekly notes you gave into structured day entries.
  // Weeks start on WEEK2_START; week offset 0 == week2
  // Helper to compute date
  const getDate = (weekIndex: number, weekdayName: string) => {
    // weekdayName: "Lunes","Martes","Miércoles","Jueves","Viernes"
    const weekdayIndexMap: any = { "Lunes": 0, "Martes": 1, "Miércoles": 2, "Miercoles": 2, "Jueves": 3, "Viernes": 4 };
    const dayIndex = weekdayIndexMap[weekdayName];
    const d = new Date(WEEK2_START);
    d.setDate(WEEK2_START.getDate() + weekIndex * 7 + dayIndex);
    return d;
  };

  // For each week's data we will list sessions exactly as your notes.
  // weekIndex: 0 => Semana 2 (starting 2025-08-04)
  const weeksData: any = [
    // Semana 2 (weekIndex 0)
    {
      weekIndex: 0,
      days: [
        {
          name: "Lunes",
          dayName: "Lunes",
          // Lunes (espalda y bíceps) - from your Semana 2 notes
          exercises: [
            // Jalón al pecho 20kg 12x3 (última con 25kg)
            { slug: "jalon-pecho", sets: [ { reps:12, weight:20 }, { reps:12, weight:20 }, { reps:12, weight:25 } ] },
            // Remo (máquina roja) 10kg 12x3 cada brazo
            { slug: "remo-roja", sets: [ { reps:12, weight:10 }, { reps:12, weight:10 }, { reps:12, weight:10 } ] },
            // Remo en polea agarre abierto 15kg 12x3
            { slug: "remo-t", sets: [ { reps:12, weight:15 }, { reps:12, weight:15 }, { reps:12, weight:15 } ] },
            // Biceps barra 10kg 12x3
            { slug: "biceps-barra-w", sets: [ { reps:12, weight:10 }, { reps:12, weight:10 }, { reps:12, weight:10 } ] },
            // Biceps martillo 5kg 12x3 (la izquierda me costó) -> put notes on left sets later
            { slug: "biceps-martillo", sets: [ { reps:12, weight:5, notes: "la izquierda me costo" }, { reps:12, weight:5 }, { reps:12, weight:5 } ] },
            // Biceps en polea 5kg 12x3 cada brazo
            { slug: "biceps-sentado", sets: [ { reps:12, weight:5 }, { reps:12, weight:5 }, { reps:12, weight:5 } ] },
            { slug: "abdominales-cortos", sets: [ { reps:20, weight:0 }, { reps:20, weight:0 }, { reps:20, weight:0 } ] },
          ],
        },
        {
          name: "Martes",
          dayName: "Martes",
          exercises: [
            // Sentadillas smith 5kg-5kg 12x3
            { slug: "sentadilla-smith", sets: [ { reps:12, weight:5 }, { reps:12, weight:5 }, { reps:12, weight:5 } ] },
            // Prensa 12x3 40kg
            { slug: "prensa-vieja", sets: [ { reps:12, weight:40 }, { reps:12, weight:40 }, { reps:12, weight:40 } ] },
            // Estocadas 5kg-5kg 12x3
            { slug: "hack", sets: [ { reps:12, weight:5 }, { reps:12, weight:5 }, { reps:12, weight:5 } ] }, // approximate
            // Camilla femoral 15kg 12x3
            { slug: "camilla-femoral", sets: [ { reps:12, weight:15 }, { reps:12, weight:15 }, { reps:12, weight:15 } ] },
            { slug: "adductor-maquina", sets: [ { reps:15, weight:35 }, { reps:15, weight:35 }, { reps:15, weight:35 } ] },
            { slug: "gemelos-smith", sets: [ { reps:20, weight:0 }, { reps:20, weight:0 }, { reps:20, weight:0 } ] },
          ],
        },
        {
          name: "Jueves",
          dayName: "Jueves",
          exercises: [
            // Pecho inclinado 12x3 sin peso (2da 8 3era 7)
            { slug: "pecho-inclinado", sets: [ { reps:12, weight:0 }, { reps:8, weight:0, notes: "la 2da hice 8" }, { reps:7, weight:0, notes: "la 3era hice 7" } ] },
            // Apertura en máquina 12x3 15kg
            { slug: "apertura-maquina", sets: [ { reps:12, weight:15 }, { reps:12, weight:15 }, { reps:12, weight:15 } ] },
            // Apertura en polea 12x3 5kg-5kg
            { slug: "apertura-polea", sets: [ { reps:12, weight:5 }, { reps:12, weight:5 }, { reps:12, weight:5 } ] },
            // Press frances mancuernas 5kg 12x3
            { slug: "press-frances-mancuernas", sets: [ { reps:12, weight:5 }, { reps:12, weight:5 }, { reps:12, weight:5 } ] },
            // Triceps maquina 12x3 10kg
            { slug: "triceps-polea-barra", sets: [ { reps:12, weight:10 }, { reps:12, weight:10 }, { reps:12, weight:10 } ] },
          ],
        },
      ],
    },

    // Semana 3 (weekIndex 1) — notes from your Semana 3
    {
      weekIndex: 1,
      days: [
        {
          name: "Martes",
          dayName: "Martes",
          exercises: [
            // Jalon 30kg 12x3 (1era 25kg)
            { slug: "jalon-pecho", sets: [ { reps:12, weight:25 }, { reps:12, weight:30 }, { reps:12, weight:30 } ] },
            { slug: "remo-roja", sets: [ { reps:12, weight:10 }, { reps:12, weight:10 }, { reps:12, weight:10 } ] },
            { slug: "remo-t", sets: [ { reps:12, weight:15 }, { reps:12, weight:15 }, { reps:12, weight:15 } ] },
            { slug: "biceps-barra-w", sets: [ { reps:12, weight:10 }, { reps:12, weight:10 }, { reps:12, weight:10 } ] },
            { slug: "biceps-martillo", sets: [ { reps:12, weight:5 }, { reps:12, weight:5 }, { reps:12, weight:5 } ] },
            { slug: "biceps-sentado", sets: [ { reps:12, weight:5 }, { reps:12, weight:5 }, { reps:12, weight:5 } ] },
          ],
        },
        {
          name: "Miércoles",
          dayName: "Miércoles",
          exercises: [
            // Hack 5kg-5kg 12x3
            { slug: "hack", sets: [ { reps:12, weight:5 }, { reps:12, weight:5 }, { reps:12, weight:5 } ] },
            { slug: "sentadilla-smith", sets: [ { reps:12, weight:5 }, { reps:12, weight:5 }, { reps:12, weight:5 } ] },
            { slug: "sillon-cuadriceps", sets: [ { reps:12, weight:20 }, { reps:12, weight:20 }, { reps:12, weight:20 } ] },
            { slug: "camilla-femoral", sets: [ { reps:12, weight:20 }, { reps:12, weight:20 }, { reps:12, weight:15 } ] },
            { slug: "adductor-maquina", sets: [ { reps:15, weight:35 }, { reps:15, weight:35 }, { reps:15, weight:35 } ] },
            { slug: "gemelos-prensa", sets: [ { reps:20, weight:0 }, { reps:20, weight:0 }, { reps:20, weight:0 } ] },
          ],
        },
        {
          name: "Jueves",
          dayName: "Jueves",
          exercises: [
            { slug: "pecho-plano", sets: [ { reps:12, weight:0 }, { reps:12, weight:0 }, { reps:8, weight:5, notes: "última hice 8 con 5kg de cada lado" } ] },
            { slug: "pecho-inclinado", sets: [ { reps:8, weight:0 }, { reps:5, weight:0 }, { reps:6, weight:0 } ] },
            { slug: "apertura-maquina", sets: [ { reps:12, weight:15 }, { reps:12, weight:15 }, { reps:12, weight:15 } ] },
            { slug: "press-frances-mancuernas", sets: [ { reps:12, weight:5 }, { reps:9, weight:5, notes: "2da y 3era quede en 9 por brazo izquierdo" }, { reps:9, weight:5 } ] },
            { slug: "triceps-polea-barra", sets: [ { reps:12, weight:5 }, { reps:12, weight:5 }, { reps:12, weight:5 } ] },
          ],
        },
        {
          name: "Viernes",
          dayName: "Viernes",
          exercises: [
            { slug: "press-militar-maquina", sets: [ { reps:12, weight:10 }, { reps:12, weight:10 }, { reps:12, weight:10 } ] },
            { slug: "vuelos-mancuernas", sets: [ { reps:12, weight:5 }, { reps:12, weight:5 }, { reps:12, weight:5 } ] },
            { slug: "press-frontal-polea", sets: [ { reps:12, weight:5 }, { reps:12, weight:5 }, { reps:12, weight:5 } ] },
            { slug: "facepull-polea", sets: [ { reps:12, weight:10 }, { reps:12, weight:10 }, { reps:12, weight:15 } ] },
            { slug: "elevacion-hombros", sets: [ { reps:12, weight:12 }, { reps:12, weight:12 }, { reps:12, weight:12 } ] },
            { slug: "abdominales-cortos", sets: [ { reps:3, weight:20 } ] },
          ],
        },
      ],
    },

    // Semana 4 (weekIndex 2)
    {
      weekIndex: 2,
      days: [
        {
          name: "Lunes",
          dayName: "Lunes",
          exercises: [
            { slug: "jalon-pecho", sets: [ { reps:12, weight:30 }, { reps:12, weight:30 }, { reps:12, weight:30 } ] },
            { slug: "remo-roja", sets: [ { reps:12, weight:10 }, { reps:12, weight:10 }, { reps:12, weight:10 } ] },
            { slug: "remo-t", sets: [ { reps:12, weight:10 }, { reps:12, weight:10 }, { reps:12, weight:10 } ] },
            { slug: "biceps-barra-w", sets: [ { reps:12, weight:10 }, { reps:12, weight:10 }, { reps:12, weight:10 } ] },
            { slug: "biceps-martillo", sets: [ { reps:11, weight:5 }, { reps:8, weight:5 }, { reps:8, weight:5 } ] },
            { slug: "biceps-sentado", sets: [ { reps:10, weight:5 }, { reps:8, weight:5 }, { reps:9, weight:5 } ] },
            { slug: "abdominales-cortos", sets: [ { reps:15, weight:0 } ] },
          ],
        },
        {
          name: "Martes",
          dayName: "Martes",
          exercises: [
            { slug: "hack", sets: [ { reps:12, weight:10 }, { reps:12, weight:10 }, { reps:12, weight:15 } ] },
            { slug: "sillon-cuadriceps", sets: [ { reps:12, weight:20 }, { reps:12, weight:20 }, { reps:12, weight:20 } ] },
            { slug: "prensa-vieja", sets: [ { reps:12, weight:50 }, { reps:12, weight:50 }, { reps:12, weight:70 } ] },
            { slug: "camilla-femoral", sets: [ { reps:12, weight:20 }, { reps:12, weight:20 }, { reps:12, weight:20 } ] },
            { slug: "adductor-maquina", sets: [ { reps:15, weight:40 }, { reps:15, weight:40 }, { reps:15, weight:40 } ] },
            { slug: "gemelos-smith", sets: [ { reps:15, weight:5 }, { reps:15, weight:5 }, { reps:15, weight:5 } ] },
          ],
        },
        {
          name: "Miércoles",
          dayName: "Miércoles",
          exercises: [
            { slug: "pecho-inclinado", sets: [ { reps:12, weight:0 }, { reps:6, weight:0, notes: "la 2da hice 6" }, { reps:9, weight:0 } ] },
            { slug: "pecho-plano", sets: [ { reps:12, weight:0 }, { reps:12, weight:0 }, { reps:8, weight:5, notes: "última hice 8 con 5kg de cada lado" } ] },
            { slug: "apertura-polea", sets: [ { reps:12, weight:5 }, { reps:12, weight:5 }, { reps:12, weight:5 } ] },
            { slug: "apertura-maquina", sets: [ { reps:12, weight:15 }, { reps:12, weight:15 }, { reps:12, weight:15 } ] },
            { slug: "triceps-polea-barra", sets: [ { reps:12, weight:10 }, { reps:12, weight:10 }, { reps:12, weight:10 } ] },
            { slug: "press-frances-barra-s", sets: [ { reps:9, weight:10, notes: "1era 9" }, { reps:7, weight:10, notes: "3era 7" } ] },
            { slug: "abdominales-cortos", sets: [ { reps:0, weight:0 } ] },
          ],
        },
        {
          name: "Jueves",
          dayName: "Jueves",
          exercises: [
            { slug: "press-militar-maquina", sets: [ { reps:12, weight:10 }, { reps:12, weight:15 }, { reps:8, weight:20 }, { reps:8, weight:20 } ] },
            { slug: "vuelos-mancuernas", sets: [ { reps:12, weight:5 }, { reps:10, weight:5 }, { reps:8, weight:5 } ] },
            { slug: "press-frontal-polea", sets: [ { reps:12, weight:5 }, { reps:10, weight:5 }, { reps:8, weight:5 } ] },
            { slug: "facepull-polea", sets: [ { reps:12, weight:10 }, { reps:10, weight:10 }, { reps:10, weight:15 } ] },
            { slug: "elevacion-hombros", sets: [ { reps:12, weight:40 }, { reps:12, weight:40 }, { reps:12, weight:40 } ] },
            { slug: "abdominales-cortos", sets: [ { reps:10, weight:0 }, { reps:11, weight:0 } ] },
          ],
        },
      ],
    },

    // Semana 5 (weekIndex 3)
    {
      weekIndex: 3,
      days: [
        {
          name: "Lunes",
          dayName: "Lunes",
          exercises: [
            { slug: "jalon-pecho", sets: [ { reps:12, weight:35 }, { reps:12, weight:35 }, { reps:12, weight:40 } ] }, // 35kg -> 3era 40kg
            { slug: "remo-t", sets: [ { reps:12, weight:15 }, { reps:12, weight:15 }, { reps:12, weight:15 } ] },
            { slug: "remo-roja", sets: [ { reps:12, weight:12.5 }, { reps:12, weight:12.5 }, { reps:12, weight:12.5 } ] },
            { slug: "biceps-scott", sets: [ { reps:12, weight:0 }, { reps:2.5, weight:2.5, notes: "2da 2.5kg" }, { reps:5, weight:5, notes: "3era 5" } ] },
            { slug: "biceps-martillo", sets: [ { reps:12, weight:5 }, { reps:12, weight:5 }, { reps:12, weight:5 } ] },
            { slug: "biceps-sentado", sets: [ { reps:12, weight:5, notes: "izq 6 1era" }, { reps:12, weight:5, notes: "izq 6 2da" }, { reps:12, weight:5, notes: "izq 6 3era" } ] },
            { slug: "abdominales-cortos", sets: [ { reps:20, weight:0 }, { reps:20, weight:0 }, { reps:20, weight:0 } ] },
          ],
        },

        {
          name: "Miércoles",
          dayName: "Miércoles",
          exercises: [
            // notas: Hack 12x3 15kg (2da 9, 3era 10kg)
            { slug: "hack", sets: [ { reps:12, weight:9 }, { reps:12, weight:9 }, { reps:12, weight:10 } ] },
            { slug: "prensa-nueva", sets: [ { reps:12, weight:80 }, { reps:12, weight:80 }, { reps:12, weight:80 } ] },
            { slug: "sillon-cuadriceps", sets: [ { reps:12, weight:20 }, { reps:12, weight:15 }, { reps:12, weight:15 } ] },
            { slug: "camilla-femoral", sets: [ { reps:12, weight:20 }, { reps:12, weight:20 }, { reps:12, weight:20 } ] },
          ],
        },

        {
          name: "Viernes",
          dayName: "Viernes",
          exercises: [
            { slug: "pecho-inclinado", sets: [ { reps:12, weight:0 }, { reps:8, weight:0, notes: "3era 8" } ] },
            { slug: "pecho-plano", sets: [ { reps:12, weight:0 }, { reps:12, weight:0 }, { reps:8, weight:2.5, notes: "3era con 2.5kg cada lado, 4ta 2.5kg 8" } ] },
            { slug: "pecho-hammer", sets: [ { reps:12, weight:10 }, { reps:12, weight:10 }, { reps:12, weight:10 }, { reps:11, weight:10, notes: "4ta 11" } ] },
            { slug: "apertura-maquina", sets: [ { reps:12, weight:15 }, { reps:12, weight:20 }, { reps:12, weight:20 }, { reps:12, weight:25 } ] },
            { slug: "press-frances-mancuernas", sets: [ { reps:12, weight:10, notes: "3era 8" } ] },
            { slug: "triceps-polea-barra", sets: [ { reps:12, weight:10 }, { reps:12, weight:10 }, { reps:12, weight:10 }, { reps:12, weight:15 } ] },
            { slug: "triceps-mancuerna", sets: [ { reps:12, weight:7.5 }, { reps:12, weight:7.5 }, { reps:12, weight:7.5 } ] },
          ],
        },
      ],
    },

    // Semana 6 (weekIndex 4)
    {
      weekIndex: 4,
      days: [
        {
          name: "Lunes",
          dayName: "Lunes",
          exercises: [
            { slug: "jalon-pecho", sets: [ { reps:12, weight:35 }, { reps:12, weight:40 }, { reps:12, weight:40 }, { reps:12, weight:40, notes: "4ta costo" } ] },
            { slug: "remo-t", sets: [ { reps:12, weight:15 }, { reps:12, weight:15 }, { reps:12, weight:15 }, { reps:12, weight:17.5 } ] },
            { slug: "remo-roja", sets: [ { reps:12, weight:12.5 }, { reps:12, weight:12.5 }, { reps:12, weight:12.5 }, { reps:12, weight:12.5 } ] },
            { slug: "biceps-scott", sets: [ { reps:12, weight:0 }, { reps:12, weight:0 }, { reps:12, weight:0 }, { reps:12, weight:0 } ] },
            { slug: "biceps-martillo", sets: [ { reps:12, weight:5 }, { reps:12, weight:5 }, { reps:12, weight:5 }, { reps:12, weight:5 } ] },
            { slug: "biceps-sentado", sets: [ { reps:12, weight:5, notes: "izq 7 1era" }, { reps:12, weight:5, notes: "izq 7 2da" }, { reps:12, weight:5, notes: "izq 7 3era" }, { reps:12, weight:5, notes: "izq 7 4ta" } ] },
            { slug: "abdominales-cortos", sets: [ { reps:20, weight:5 }, { reps:20, weight:5 }, { reps:20, weight:5 } ] },
          ],
        },
        {
          name: "Miércoles",
          dayName: "Miércoles",
          exercises: [
            { slug: "hack", sets: [ { reps:12, weight:10 }, { reps:12, weight:10 }, { reps:12, weight:15 } ] },
            { slug: "prensa-nueva", sets: [ { reps:12, weight:80 }, { reps:12, weight:80 }, { reps:12, weight:80 } ] },
            { slug: "sillon-cuadriceps", sets: [ { reps:12, weight:20 }, { reps:12, weight:20 }, { reps:12, weight:25 }, { reps:12, weight:25 } ] },
            { slug: "camilla-femoral", sets: [ { reps:12, weight:20 }, { reps:12, weight:25 }, { reps:12, weight:25 }, { reps:12, weight:25 } ] },
            { slug: "adductor-maquina", sets: [ { reps:15, weight:40 }, { reps:15, weight:45 }, { reps:15, weight:45 }, { reps:15, weight:45 } ] },
            { slug: "gemelos-prensa", sets: [ { reps:20, weight:40 }, { reps:20, weight:40 }, { reps:20, weight:40 } ] },
          ],
        },
      ],
    },

    // Semana 7 (weekIndex 5) — your notes had Tue-Fri
    {
      weekIndex: 5,
      days: [
        {
          name: "Martes",
          dayName: "Martes",
          exercises: [
            { slug: "jalon-pecho", sets: [ { reps:12, weight:40 }, { reps:12, weight:40 }, { reps:12, weight:40 }, { reps:12, weight:40, notes: "costo la ultima" } ] },
            { slug: "remo-t", sets: [ { reps:12, weight:15 }, { reps:12, weight:15 }, { reps:12, weight:12.5, notes: "3era 12,5" }, { reps:12, weight:17.5 } ] },
            { slug: "remo-roja", sets: [ { reps:12, weight:12.5 }, { reps:12, weight:12.5 }, { reps:12, weight:12.5 }, { reps:12, weight:12.5 } ] },
            { slug: "biceps-scott", sets: [ { reps:12, weight:0 }, { reps:12, weight:0 }, { reps:12, weight:0, notes: "3era costo, 4ta 9" }, { reps:9, weight:0 } ] },
            { slug: "biceps-martillo", sets: [ { reps:12, weight:5 }, { reps:10, weight:5 }, { reps:11, weight:5 }, { reps:12, weight:5 } ] },
            { slug: "biceps-sentado", sets: [ { reps:7, weight:5, notes: "izq 7 1era" }, { reps:7, weight:5, notes: "izq 7 2da" }, { reps:6, weight:5, notes: "izq 6 3era" }, { reps:6, weight:5, notes: "izq 6 4ta" } ] },
            { slug: "abdominales-cortos", sets: [ { reps:20, weight:5 }, { reps:20, weight:5 }, { reps:20, weight:5 } ] },
          ],
        },
        {
          name: "Miércoles",
          dayName: "Miércoles",
          exercises: [
            { slug: "hack", sets: [ { reps:12, weight:10 } ] },
            { slug: "prensa-nueva", sets: [ { reps:12, weight:80 }, { reps:12, weight:80 }, { reps:12, weight:80 } ] },
            { slug: "sillon-cuadriceps", sets: [ { reps:12, weight:25 }, { reps:12, weight:30 }, { reps:12, weight:30 }, { reps:12, weight:35 } ] },
            { slug: "camilla-femoral", sets: [ { reps:12, weight:20 }, { reps:12, weight:25 }, { reps:12, weight:25 }, { reps:12, weight:25 } ] },
            { slug: "adductor-maquina", sets: [ { reps:15, weight:40 }, { reps:15, weight:40 }, { reps:15, weight:40 } ] },
            { slug: "gemelos-prensa", sets: [ { reps:20, weight:60 }, { reps:20, weight:60 }, { reps:20, weight:60 } ] },
          ],
        },
        {
          name: "Jueves",
          dayName: "Jueves",
          exercises: [
            { slug: "pecho-inclinado", sets: [ { reps:12, weight:0 }, { reps:12, weight:0 }, { reps:12, weight:0 } ] },
            { slug: "pecho-plano", sets: [ { reps:12, weight:0 }, { reps:12, weight:2.5 }, { reps:12, weight:2.5 }, { reps:8, weight:2.5, notes: "4ta 2.5kg c/ lado 8" } ] },
            { slug: "apertura-maquina", sets: [ { reps:12, weight:20 }, { reps:12, weight:25 }, { reps:12, weight:25 }, { reps:12, weight:25 } ] },
            { slug: "pecho-hammer", sets: [ { reps:12, weight:10 }, { reps:12, weight:10 }, { reps:12, weight:10 }, { reps:11, weight:10 } ] },
            { slug: "press-frances-mancuernas", sets: [ { reps:10, weight:5 }, { reps:6, weight:5 }, { reps:5, weight:5 } ] },
            { slug: "triceps-polea-barra", sets: [ { reps:10, weight:10 }, { reps:9, weight:15 }, { reps:7, weight:15 } ] },
            { slug: "triceps-mancuerna", sets: [ { reps:12, weight:7.5 }, { reps:12, weight:7.5 }, { reps:12, weight:7.5 } ] },
            { slug: "apertura-polea", sets: [ { reps:11, weight:5, notes: "1era 11 izq" }, { reps:11, weight:5, notes: "2da 11 izq" }, { reps:11, weight:5, notes: "3era 11" } ] },
          ],
        },
        {
          name: "Viernes",
          dayName: "Viernes",
          exercises: [
            { slug: "press-militar-maquina", sets: [ { reps:12, weight:10 }, { reps:10, weight:15 }, { reps:8, weight:20 }, { reps:12, weight:10 } ] },
            { slug: "vuelos-mancuernas", sets: [ { reps:12, weight:5 }, { reps:12, weight:5 }, { reps:12, weight:5 }, { reps:0, weight:0, notes: "últimas costaron" } ] },
            { slug: "press-frontal-polea", sets: [ { reps:12, weight:5 }, { reps:10, weight:5 }, { reps:8, weight:5 } ] },
            { slug: "facepull-polea", sets: [ { reps:12, weight:10 }, { reps:10, weight:10 }, { reps:10, weight:15 } ] },
            { slug: "elevacion-hombros", sets: [ { reps:12, weight:50 }, { reps:10, weight:50 }, { reps:8, weight:50 }, { reps:12, weight:60, notes: "4ta 60kg" } ] },
            { slug: "abdominales-cortos", sets: [ { reps:20, weight:0 }, { reps:20, weight:0 }, { reps:20, weight:0 } ] },
          ],
        },
      ],
    },

    // Semana 8 (weekIndex 6) — you indicated this is current week (15/09 - 18/09)
    // Note: Week indexes: week2(0),3(1),4(2),5(3),6(4),7(5),8(6)
    {
      weekIndex: 6,
      days: [
        {
          name: "Lunes",
          dayName: "Lunes",
          exercises: [
            // Semana 8 Lunes exact per your notes
            { slug: "jalon-pecho", sets: [ { reps:12, weight:35, notes: "1era 35kg" }, { reps:12, weight:40 }, { reps:10, weight:40 }, { reps:8, weight:40 } ] },
            { slug: "remo-t", sets: [ { reps:12, weight:12.5 }, { reps:12, weight:15 }, { reps:10, weight:17.5 }, { reps:8, weight:20 } ] },
            // Remo (maquina roja) crossed out in your notes - skip
            { slug: "remo-cerrado", sets: [ { reps:12, weight:30 }, { reps:12, weight:30 }, { reps:10, weight:30 }, { reps:8, weight:35 } ] },
            { slug: "biceps-barra-w", sets: [ { reps:12, weight:15 }, { reps:12, weight:15 }, { reps:10, weight:15 }, { reps:8, weight:15 } ] },
            { slug: "biceps-martillo", sets: [ { reps:12, weight:5 }, { reps:12, weight:5 }, { reps:10, weight:5 }, { reps:8, weight:7.5, notes: "4ta 6 c/ 7.5kg" } ] },
            { slug: "biceps-sentado", sets: [ { reps:8, weight:5, notes: "izq en 8 1era" }, { reps:11, weight:5, notes: "izq 11 en 2da" }, { reps:8, weight:5, notes: "izq 8 en 3era" } ] },
            { slug: "abdominales-cortos", sets: [ { reps:20, weight:0 }, { reps:20, weight:0 }, { reps:20, weight:0 } ] },
          ],
        },
        {
          name: "Martes",
          dayName: "Martes",
          exercises: [
            { slug: "hack", sets: [ { reps:12, weight:10 }, { reps:12, weight:10 }, { reps:10, weight:10 }, { reps:8, weight:15 } ] },
            { slug: "prensa-vieja", sets: [ { reps:12, weight:80 }, { reps:12, weight:80 }, { reps:10, weight:90 }, { reps:8, weight:100 } ] },
            { slug: "sillon-cuadriceps", sets: [ { reps:12, weight:25 }, { reps:12, weight:25 }, { reps:10, weight:35 }, { reps:8, weight:40 } ] },
            { slug: "camilla-femoral", sets: [ { reps:12, weight:20 }, { reps:12, weight:20 }, { reps:10, weight:30 }, { reps:8, weight:35 } ] },
            { slug: "adductor-maquina", sets: [ { reps:15, weight:40 }, { reps:15, weight:45 }, { reps:15, weight:50 } ] },
            { slug: "gemelos-prensa", sets: [ { reps:20, weight:50 }, { reps:20, weight:50 }, { reps:15, weight:50, notes: "3era 15" } ] },
          ],
        },
        {
          name: "Miércoles",
          dayName: "Miércoles",
          exercises: [
            { slug: "pecho-inclinado", sets: [ { reps:12, weight:0 }, { reps:12, weight:0 }, { reps:8, weight:0, notes: "3era 8" } ] },
            { slug: "pecho-plano", sets: [ { reps:12, weight:0 }, { reps:12, weight:5, notes: "3era con 2.5kg de cada lado" }, { reps:8, weight:5, notes: "4ta 2.5kg c/ lado 8" } ] },
            { slug: "apertura-maquina", sets: [ { reps:12, weight:20 }, { reps:12, weight:20 }, { reps:8, weight:25 }, { reps:7, weight:25 } ] },
            { slug: "pecho-hammer", sets: [ { reps:12, weight:10 }, { reps:12, weight:10 }, { reps:12, weight:10 }, { reps:11, weight:10 } ] },
            { slug: "press-frances-mancuernas", sets: [ { reps:10, weight:5 }, { reps:6, weight:5 }, { reps:5, weight:5 } ] },
            { slug: "triceps-polea-barra", sets: [ { reps:10, weight:10, notes: "1er 10kg" }, { reps:9, weight:15, notes: "3era 9" }, { reps:7, weight:15, notes: "4ta 7" } ] },
            { slug: "triceps-mancuerna", sets: [ { reps:12, weight:7.5 }, { reps:12, weight:7.5 }, { reps:12, weight:7.5 } ] },
            { slug: "apertura-polea", sets: [ { reps:11, weight:5, notes: "1era 11 izq" }, { reps:11, weight:5, notes: "2da 11 izq" }, { reps:11, weight:5, notes: "3era 11" } ] },
          ],
        },
        {
          name: "Jueves",
          dayName: "Jueves",
          exercises: [
            { slug: "press-militar-maquina", sets: [ { reps:12, weight:10 }, { reps:10, weight:15 }, { reps:8, weight:20 }, { reps:10, weight:10 } ] },
            { slug: "vuelos-mancuernas", sets: [ { reps:12, weight:5 }, { reps:10, weight:5 }, { reps:8, weight:5 } ] },
            { slug: "press-frontal-polea", sets: [ { reps:12, weight:10 }, { reps:10, weight:10 }, { reps:8, weight:10 } ] },
            { slug: "facepull-polea", sets: [ { reps:12, weight:10 }, { reps:10, weight:10 }, { reps:10, weight:15 } ] },
            { slug: "elevacion-hombros", sets: [ { reps:12, weight:50 }, { reps:12, weight:50 }, { reps:12, weight:50 }, { reps:12, weight:60 } ] },
            { slug: "abdominales-cortos", sets: [ { reps:20, weight:0 }, { reps:20, weight:0 }, { reps:20, weight:0 } ] },
          ],
        },
      ],
    },
  ];

  // Create sessions and set entries
  let totalSessions = 0;
  for (const week of weeksData) {
    for (const day of week.days) {
      const sessionDate = getDate(week.weekIndex, day.dayName);
      const session = await prisma.workoutSession.create({
        data: {
          userId: user.id,
          date: sessionDate,
          routineId: routine.id,
          notes: `${day.name} - Semana ${week.weekIndex + 2}`, // weekIndex 0 -> Semana 2
        },
      });

      for (const exEntry of day.exercises) {
        const exercise = allExercises.find((e) => e.slug === exEntry.slug);
        if (!exercise) {
          console.warn("Missing exercise for slug:", exEntry.slug);
          continue;
        }

        // Create workout exercise first
        const workoutExercise = await prisma.workoutExercise.create({
          data: {
            sessionId: session.id,
            exerciseId: exercise.id,
            order: 0, // Will be updated later
            notes: null,
          },
        });

        // iterate sets
        let setNumber = 1;
        for (const s of exEntry.sets) {
          await prisma.setEntry.create({
            data: {
              workoutExerciseId: workoutExercise.id,
              exerciseId: exercise.id,
              setNumber,
              repsDone: s.reps || 0,
              weightKg: s.weight !== undefined ? s.weight : 0,
              notes: s.notes || null,
              rpe: s.rpe || null,
            },
          });
          setNumber++;
        }
      }

      totalSessions++;
    }
  }

  console.log(`✅ Seed finished: created ${totalSessions} sessions (weeks 2→8)`);
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
