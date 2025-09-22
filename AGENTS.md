# Gym Tracker App 🏋️

**Versión:** v0.0.0  
**Stack:** Next.js · TailwindCSS · shadcn/ui · Prisma · SQLite  

---

## 🚀 Introducción
Esta es la primera versión (v0.0.0) de **Gym Tracker App**, una aplicación web pensada para **registrar y trackear entrenamientos de gimnasio**.  
El objetivo principal es simplificar la carga de ejercicios y rutinas, permitir registrar sesiones reales y obtener estadísticas de progreso.

---

## 🎯 Objetivos de la v0.0.0
- ✅ Layout con sidebar (Dashboard, Rutinas, Ejercicios, Registro, Estadísticas, Ajustes).  
- ✅ CRUD de **Ejercicios**.  
- ✅ CRUD de **Rutinas semanales** con días y ejercicios configurables.  
- ✅ Registro de **sesiones de entrenamiento** (log workout) con sets reales.  
- ✅ Cálculo automático de volumen total por ejercicio/sesión.  
- ✅ Historial de progresión con gráficas básicas.  
- ✅ Base de datos inicial con ejercicios y rutinas de ejemplo.  

---

## 🗂️ Modelo de Datos (Prisma)
```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String?
  email     String?  @unique
  createdAt DateTime @default(now())
  sessions  WorkoutSession[]
  routines  Routine[]
}

model Exercise {
  id           Int      @id @default(autoincrement())
  name         String
  slug         String   @unique
  primaryGroup String?
  equipment    String?
  notes        String?
  createdAt    DateTime @default(now())
  routineItems RoutineExercise[]
  setEntries   SetEntry[]
}

model Routine {
  id        Int               @id @default(autoincrement())
  name      String
  userId    Int
  user      User              @relation(fields: [userId], references: [id])
  weeks     Int               @default(1)
  days      RoutineDay[]
  createdAt DateTime          @default(now())
}

model RoutineDay {
  id        Int               @id @default(autoincrement())
  routineId Int
  name      String
  order     Int
  items     RoutineExercise[]
  routine   Routine           @relation(fields: [routineId], references: [id])
}

model RoutineExercise {
  id           Int      @id @default(autoincrement())
  routineDayId Int
  exerciseId   Int
  order        Int
  series       Int
  reps         String
  targetWeight Float?
  notes        String?
  exercise     Exercise   @relation(fields: [exerciseId], references: [id])
  routineDay   RoutineDay @relation(fields:[routineDayId], references:[id])
}

model WorkoutSession {
  id        Int       @id @default(autoincrement())
  userId    Int
  date      DateTime
  routineId Int?
  notes     String?
  setEntries SetEntry[]
  createdAt DateTime  @default(now())
  user      User      @relation(fields:[userId], references:[id])
  routine   Routine?  @relation(fields:[routineId], references:[id])
}

model SetEntry {
  id             Int       @id @default(autoincrement())
  sessionId      Int
  exerciseId     Int
  setNumber      Int
  repsDone       Int
  weightKg       Float
  rpe            Int?
  notes          String?
  createdAt      DateTime  @default(now())
  workoutSession WorkoutSession @relation(fields:[sessionId], references:[id])
  exercise       Exercise       @relation(fields:[exerciseId], references:[id])
}
