# RFC: Gestión de Rutinas v1

> **Autor:** Architect  
> **Fecha:** 2026-03-15  
> **Estado:** Draft  
> **PRD:** `docs/product/features/001-gestion-rutinas.md` (v1.1)  
> **Módulo:** `src/modules/routines/`

---

## Tabla de Contenidos

1. [Decisiones de Schema](#1-decisiones-de-schema)
2. [Migraciones Necesarias](#2-migraciones-necesarias)
3. [Tipos TypeScript del Dominio](#3-tipos-typescript-del-dominio)
4. [Contratos de Server Actions](#4-contratos-de-server-actions)
5. [Estructura de Archivos](#5-estructura-de-archivos)
6. [Interfaces de Props de Componentes Clave](#6-interfaces-de-props-de-componentes-clave)
7. [Flujo de Datos](#7-flujo-de-datos)
8. [Riesgos y Dependencias](#8-riesgos-y-dependencias)

---

## 1. Decisiones de Schema

### 1.1 Reps: JSON array en String vs nueva tabla `RoutineSet`

**Decisión: JSON array en el campo `reps` String existente.**

Formato: `"[12,10,10,8]"` — un JSON array de enteros serializado como string.

**Justificación:**

| Criterio                      | JSON array en `reps` String                                                                                                                    | Nueva tabla `RoutineSet`                                                                                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Migración**                 | Solo cambiar el contenido del campo existente. No requiere nueva tabla. Migración de datos simple: `"12"` → `"[12,12,12]"` basado en `series`. | Requiere crear tabla, migrar datos existentes a filas, eliminar campo `reps` y `series` de `RoutineExercise`. Migración compleja con riesgo de pérdida de datos. |
| **Queries**                   | Un solo `findMany` con include trae todo. Sin JOINs adicionales.                                                                               | JOIN extra en cada query de rutina. Más filas en BD.                                                                                                             |
| **Complejidad de código**     | Parse/stringify en la capa de tipos TS. Validación con Zod.                                                                                    | Prisma relations adicionales. Más código en actions para CRUD de sets.                                                                                           |
| **Flexibilidad futura**       | Si necesitamos más campos por set (ej. tempo, descanso), migrar a tabla es posible.                                                            | Ya está preparado para campos adicionales por set.                                                                                                               |
| **Consistencia con `series`** | `series` se vuelve derivado: `series = reps.length`. Podemos mantener `series` como campo computado o eliminarlo.                              | `series` se elimina, se cuenta por `COUNT(RoutineSet)`.                                                                                                          |
| **Estrategia update**         | La estrategia actual de delete-all + recreate sigue funcionando sin cambios.                                                                   | Requiere lógica de diff para sets individuales o también delete-all + recreate.                                                                                  |

**Decisión sobre el campo `series`:** MANTENER `series` como campo en `RoutineExercise`. Es redundante con `reps.length` pero sirve como fuente de verdad rápida para queries que solo necesitan el conteo (ej. vista de lista, badges). La validación en el action garantiza `series === JSON.parse(reps).length`.

**Formato de migración de datos existentes:**

- `"12"` con `series: 3` → `"[12,12,12]"`
- `"12-10-8"` con `series: 3` → `"[12,10,8]"`
- `"10-12"` con `series: 3` → `"[10,12,12]"` (pad con último valor)
- `"AMRAP"` → `"[0]"` (caso edge, 0 = AMRAP — fuera de scope MVP, documentar)

### 1.2 Borrado suave: `archivedAt DateTime?` vs campo `status` enum

**Decisión: `archivedAt DateTime?`**

**Justificación:**

| Criterio           | `archivedAt DateTime?`                                           | `status` enum                                    |
| ------------------ | ---------------------------------------------------------------- | ------------------------------------------------ |
| **Simplicidad**    | Un campo nullable. `null` = activa, `!null` = archivada.         | Requiere definir enum en Prisma, más verboso.    |
| **Query**          | `where: { archivedAt: null }` — simple y eficiente.              | `where: { status: 'ACTIVE' }` — igual de simple. |
| **Información**    | Sabemos CUÁNDO se archivó. Útil para auditoría.                  | Solo sabemos el estado actual, no cuándo cambió. |
| **Extensibilidad** | Si necesitamos más estados (ej. `DRAFT`), hay que migrar a enum. | Ya soporta N estados.                            |
| **MVP fit**        | Solo necesitamos 2 estados: activa/archivada. Perfecto.          | Over-engineering para 2 estados.                 |

Para el MVP con solo 2 estados, `archivedAt` es más simple, más informativo (timestamp) y suficiente. Si en el futuro necesitamos más estados, la migración a enum es trivial.

### 1.3 Schema Prisma Completo y Actualizado

```prisma
model Routine {
  id         Int              @id @default(autoincrement())
  name       String           @db.VarChar(100)
  userId     Int
  user       User             @relation(fields: [userId], references: [id])
  weeks      Int              @default(1)
  days       RoutineDay[]
  sessions   WorkoutSession[]
  createdAt  DateTime         @default(now())
  updatedAt  DateTime         @updatedAt
  archivedAt DateTime?

  @@index([userId])
  @@index([userId, archivedAt])
}

model RoutineDay {
  id        Int               @id @default(autoincrement())
  name      String            @db.VarChar(50)
  order     Int
  items     RoutineExercise[]
  routineId Int
  routine   Routine           @relation(fields: [routineId], references: [id], onDelete: Cascade)

  @@index([routineId])
}

model RoutineExercise {
  id           Int        @id @default(autoincrement())
  routineDayId Int
  exerciseId   Int
  order        Int
  series       Int        // Redundante con reps.length, mantenido para queries rápidas
  reps         String     // JSON array: "[12,10,10,8]"
  notes        String?
  exercise     Exercise   @relation(fields: [exerciseId], references: [id])
  routineDay   RoutineDay @relation(fields: [routineDayId], references: [id], onDelete: Cascade)

  @@index([routineDayId])
}
```

**Cambios respecto al schema actual:**

En `Routine`:

- `name`: agregar `@db.VarChar(100)` — constraint de longitud
- Agregar `updatedAt DateTime @updatedAt`
- Agregar `archivedAt DateTime?`
- Agregar `@@index([userId])` y `@@index([userId, archivedAt])`

En `RoutineDay`:

- `name`: agregar `@db.VarChar(50)` — constraint de longitud
- Agregar `onDelete: Cascade` en relación con `Routine`
- Agregar `@@index([routineId])`

En `RoutineExercise`:

- Eliminar `targetWeight Float?`
- `reps`: cambiar formato de `"12-10-8"` a `"[12,10,8]"` (JSON array)
- Agregar `onDelete: Cascade` en relación con `RoutineDay`
- Agregar `@@index([routineDayId])`

**Modelos NO modificados:** `User`, `Exercise`, `WorkoutSession`, `SetEntry` — sin cambios.

---

## 2. Migraciones Necesarias

### Migración: `add_routine_management_v1`

Ejecutar con: `npx prisma migrate dev --name add_routine_management_v1`

**Cambios DDL:**

#### Campos a AGREGAR

| Tabla     | Campo        | Tipo           | Default | Nullable | Notas                                                                                        |
| --------- | ------------ | -------------- | ------- | -------- | -------------------------------------------------------------------------------------------- |
| `Routine` | `updatedAt`  | `TIMESTAMP(3)` | `now()` | NO       | `@updatedAt` — Prisma lo gestiona automáticamente. Para datos existentes, default = `now()`. |
| `Routine` | `archivedAt` | `TIMESTAMP(3)` | —       | SÍ       | `null` = rutina activa                                                                       |

#### Campos a ELIMINAR

| Tabla             | Campo          | Tipo actual        | Notas                                                                                                               |
| ----------------- | -------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `RoutineExercise` | `targetWeight` | `DOUBLE PRECISION` | Verificar que no hay código que lo lea fuera del módulo routines. El campo `targetWeight` en `SetEntry` NO se toca. |

#### Campos a MODIFICAR (tipo/constraint)

| Tabla             | Campo | Antes  | Después        | Notas                                                |
| ----------------- | ----- | ------ | -------------- | ---------------------------------------------------- |
| `Routine.name`    | —     | `TEXT` | `VARCHAR(100)` | Truncar datos existentes > 100 chars antes de migrar |
| `RoutineDay.name` | —     | `TEXT` | `VARCHAR(50)`  | Truncar datos existentes > 50 chars antes de migrar  |

#### Datos a MIGRAR (en la misma migración, SQL custom)

```sql
-- Migrar formato de reps: "12" → "[12,12,12]", "12-10-8" → "[12,10,8]"
-- NOTA: Esto requiere un script de migración custom en el archivo .sql generado.
-- Prisma no genera esto automáticamente. El backend-coder debe:
-- 1. Generar la migración con prisma migrate dev --create-only
-- 2. Agregar el SQL de transformación de datos ANTES del ALTER que cambia constraints
-- 3. Luego aplicar con prisma migrate dev
```

**Script SQL de migración de reps (agregar manualmente al .sql):**

```sql
-- Paso 1: Migrar reps de formato string a JSON array
-- Caso "12" (número simple) → "[12,12,12]" (repetido por series)
-- Caso "12-10-8" (guiones) → "[12,10,8]"
UPDATE "RoutineExercise"
SET reps = CASE
  -- Si ya es un JSON array (empieza con [), no tocar
  WHEN reps LIKE '[%' THEN reps
  -- Si contiene guiones, split y convertir a JSON array
  WHEN reps LIKE '%-%' THEN
    '[' || REPLACE(reps, '-', ',') || ']'
  -- Si es un número simple, repetir N veces según series
  WHEN reps ~ '^\d+$' THEN
    '[' || ARRAY_TO_STRING(ARRAY_FILL(reps::int, ARRAY[series]), ',') || ']'
  -- Fallback: mantener como está envuelto en array
  ELSE '[0]'
END;

-- Paso 2: Sincronizar series con la longitud real del array
UPDATE "RoutineExercise"
SET series = JSONB_ARRAY_LENGTH(reps::jsonb)
WHERE reps LIKE '[%';
```

#### Índices a AGREGAR

| Tabla             | Índice                             | Columnas               | Justificación                                  |
| ----------------- | ---------------------------------- | ---------------------- | ---------------------------------------------- |
| `Routine`         | `Routine_userId_idx`               | `(userId)`             | Filtrar rutinas por usuario                    |
| `Routine`         | `Routine_userId_archivedAt_idx`    | `(userId, archivedAt)` | Query principal: rutinas activas de un usuario |
| `RoutineDay`      | `RoutineDay_routineId_idx`         | `(routineId)`          | FK lookup al cargar días                       |
| `RoutineExercise` | `RoutineExercise_routineDayId_idx` | `(routineDayId)`       | FK lookup al cargar ejercicios                 |

#### Cascade deletes a AGREGAR

| Relación                                    | onDelete  |
| ------------------------------------------- | --------- |
| `RoutineDay.routine` → `Routine`            | `Cascade` |
| `RoutineExercise.routineDay` → `RoutineDay` | `Cascade` |

**IMPORTANTE:** Los cascade deletes simplifican `deleteRoutine` — ya no necesitamos borrar manualmente RoutineExercise y RoutineDay antes de borrar Routine. Prisma + PostgreSQL lo hacen automáticamente.

#### Orden de ejecución de la migración

1. Agregar campos nuevos (`updatedAt`, `archivedAt`) con defaults
2. Ejecutar script de migración de datos de `reps`
3. Eliminar campo `targetWeight`
4. Modificar constraints de `VARCHAR`
5. Agregar índices
6. Agregar cascade deletes (Prisma lo maneja via schema)

---

## 3. Tipos TypeScript del Dominio

Archivo: `src/modules/routines/types/index.ts`

```typescript
// =============================================================================
// DOMAIN TYPES — Representan datos como vienen de la BD (con relaciones)
// =============================================================================

import type {
  Exercise,
  Routine as PrismaRoutine,
  RoutineDay as PrismaRoutineDay,
  RoutineExercise as PrismaRoutineExercise,
} from '@prisma/client'

/** RoutineExercise con la relación exercise incluida */
export type RoutineExercise = PrismaRoutineExercise & {
  exercise: Exercise
}

/** RoutineDay con sus ejercicios (items) incluidos */
export type RoutineDay = PrismaRoutineDay & {
  items: RoutineExercise[]
}

/** Routine completa con días y ejercicios anidados */
export type Routine = PrismaRoutine & {
  days: RoutineDay[]
}

// =============================================================================
// FORM TYPES — Estado local del editor (lo que maneja React state)
// =============================================================================

/** Una fila de ejercicio en el formulario del editor */
export interface ExerciseFormItem {
  /** ID del ejercicio seleccionado, null si aún no se eligió */
  exerciseId: number | null
  /** Posición dentro del día (1-based) */
  order: number
  /** Número de series (1-10). Debe coincidir con repsPerSet.length */
  series: number
  /** Reps por cada serie. Array de enteros, ej: [12, 10, 10, 8] */
  repsPerSet: number[]
  /** Notas opcionales del ejercicio */
  notes: string
}

/** Un día en el formulario del editor */
export interface DayFormData {
  /** Nombre editable del día, max 50 chars. Default: "Día N" */
  name: string
  /** Posición del día (1-based) */
  order: number
  /** Ejercicios del día */
  items: ExerciseFormItem[]
}

/** Estado completo del formulario de rutina (crear o editar) */
export interface RoutineFormData {
  /** Nombre de la rutina, max 100 chars */
  name: string
  /** Días de la rutina (1-7) */
  days: DayFormData[]
}

// =============================================================================
// ACTION PAYLOAD TYPES — Lo que se envía al server action
// =============================================================================

/** Payload para crear una rutina (server action input) */
export interface CreateRoutinePayload {
  name: string
  days: {
    name: string
    order: number
    items: {
      exerciseId: number
      order: number
      series: number
      /** JSON string: "[12,10,10,8]" */
      reps: string
      notes: string | null
    }[]
  }[]
}

/** Payload para actualizar una rutina (server action input) */
export interface UpdateRoutinePayload extends CreateRoutinePayload {}

/** Payload para crear un ejercicio on-the-fly */
export interface CreateExercisePayload {
  name: string
  primaryGroup?: string
  equipment?: string
  notes?: string
}

// =============================================================================
// VIEW TYPES — Tipos derivados para renderizado
// =============================================================================

/** Resumen de rutina para la tarjeta en la lista */
export interface RoutineCardData {
  id: number
  name: string
  daysCount: number
  activeDaysCount: number
  totalExercises: number
  isArchived: boolean
  createdAt: Date
  /** Preview de los primeros 3 días */
  dayPreviews: {
    name: string
    exerciseCount: number
  }[]
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/** Resultado de una acción de mutación */
export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}
```

### Funciones de conversión (ubicar en `src/modules/routines/types/index.ts` o `utils/`)

```typescript
// =============================================================================
// CONVERSION HELPERS — Entre formatos de BD y formulario
// =============================================================================

/** Parsea el campo reps de la BD (JSON string) a array de números */
export function parseReps(repsJson: string): number[] {
  try {
    const parsed = JSON.parse(repsJson)
    if (Array.isArray(parsed) && parsed.every((n) => typeof n === 'number')) {
      return parsed
    }
  } catch {
    // Fallback para formato legacy "12-10-8"
    const parts = repsJson
      .split('-')
      .map(Number)
      .filter((n) => !isNaN(n))
    if (parts.length > 0) return parts
  }
  return [10] // Default fallback
}

/** Serializa array de reps a JSON string para la BD */
export function serializeReps(repsPerSet: number[]): string {
  return JSON.stringify(repsPerSet)
}

/** Convierte una Routine de BD a RoutineFormData para el editor */
export function routineToFormData(routine: Routine): RoutineFormData {
  return {
    name: routine.name,
    days: routine.days.map((day) => ({
      name: day.name,
      order: day.order,
      items: day.items.map((item) => ({
        exerciseId: item.exerciseId,
        order: item.order,
        series: item.series,
        repsPerSet: parseReps(item.reps),
        notes: item.notes ?? '',
      })),
    })),
  }
}

/** Convierte RoutineFormData del editor a CreateRoutinePayload para el action */
export function formDataToPayload(
  formData: RoutineFormData
): CreateRoutinePayload {
  return {
    name: formData.name.trim(),
    days: formData.days.map((day) => ({
      name: day.name.trim(),
      order: day.order,
      items: day.items
        .filter((item) => item.exerciseId !== null)
        .map((item) => ({
          exerciseId: item.exerciseId as number,
          order: item.order,
          series: item.repsPerSet.length,
          reps: serializeReps(item.repsPerSet),
          notes: item.notes.trim() || null,
        })),
    })),
  }
}

/** Convierte una Routine a RoutineCardData para la vista de lista */
export function routineToCardData(routine: Routine): RoutineCardData {
  return {
    id: routine.id,
    name: routine.name,
    daysCount: routine.days.length,
    activeDaysCount: routine.days.filter((d) => d.items.length > 0).length,
    totalExercises: routine.days.reduce((sum, d) => sum + d.items.length, 0),
    isArchived: routine.archivedAt !== null,
    createdAt: routine.createdAt,
    dayPreviews: routine.days.slice(0, 3).map((d) => ({
      name: d.name,
      exerciseCount: d.items.length,
    })),
  }
}
```

---

## 4. Contratos de Server Actions

Archivo: `src/modules/routines/actions/routines.actions.ts`

Todas las funciones llevan `"use server"` al inicio del archivo.

---

### 4.1 `getRoutines()`

```typescript
export async function getRoutines(): Promise<Routine[]>
```

**Descripción:** Obtiene todas las rutinas ACTIVAS (no archivadas) del usuario, con días y ejercicios anidados, ordenadas por fecha de creación descendente.

**Cambios respecto a la versión actual:**

- Agregar filtro `archivedAt: null` al `where`
- Agregar `userId` al `where` (actualmente no filtra por usuario)

**Query:**

```typescript
database.routine.findMany({
  where: { userId, archivedAt: null },
  include: {
    days: {
      include: {
        items: {
          include: { exercise: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    },
  },
  orderBy: { createdAt: 'desc' },
})
```

**`revalidatePath`:** N/A (solo lectura).

**Notas:** El `userId` sigue hardcodeado a `1` hasta que se implemente auth. Documentar con `// TODO: obtener userId de la sesión de auth`.

---

### 4.2 `getRoutineById(id)`

```typescript
export async function getRoutineById(id: number): Promise<Routine | null>
```

**Descripción:** Obtiene una rutina por ID con todos sus días y ejercicios. Incluye rutinas archivadas (para poder ver/desarchivar).

**Cambios respecto a la versión actual:** Sin cambios funcionales. Agregar validación de que `id` es un entero positivo.

**`revalidatePath`:** N/A (solo lectura).

---

### 4.3 `createRoutine(payload)`

```typescript
export async function createRoutine(
  payload: CreateRoutinePayload
): Promise<Routine>
```

**Descripción:** Crea una nueva rutina con sus días y ejercicios. Valida el payload con Zod antes de persistir.

**Cambios respecto a la versión actual:**

- Recibe `CreateRoutinePayload` en vez de `RoutineFormData` (tipos limpios, sin `targetWeight`)
- Eliminar `weeks` del create (siempre 1 en MVP)
- Agregar validación Zod server-side
- El campo `reps` ya viene como JSON string `"[12,10,8]"` desde el payload

**Validación Zod (server-side):**

```typescript
const CreateRoutineSchema = z.object({
  name: z.string().min(1).max(100),
  days: z
    .array(
      z.object({
        name: z.string().min(1).max(50),
        order: z.number().int().positive(),
        items: z.array(
          z.object({
            exerciseId: z.number().int().positive(),
            order: z.number().int().positive(),
            series: z.number().int().min(1).max(10),
            reps: z.string().refine((val) => {
              try {
                const arr = JSON.parse(val)
                return (
                  Array.isArray(arr) &&
                  arr.length >= 1 &&
                  arr.length <= 10 &&
                  arr.every(
                    (n: unknown) => typeof n === 'number' && n >= 1 && n <= 50
                  )
                )
              } catch {
                return false
              }
            }, 'Formato de reps inválido'),
            notes: z.string().nullable(),
          })
        ),
      })
    )
    .min(1)
    .max(7),
})
```

**`revalidatePath`:** `/routines`

**Notas:**

- `userId` hardcodeado a `1` (TODO: auth)
- `weeks` hardcodeado a `1` (MVP: solo 1 semana)
- Validar que `series === JSON.parse(reps).length` en el schema Zod

---

### 4.4 `updateRoutine(id, payload)`

```typescript
export async function updateRoutine(
  id: number,
  payload: UpdateRoutinePayload
): Promise<Routine>
```

**Descripción:** Actualiza una rutina existente. Usa estrategia delete-all + recreate para días y ejercicios.

**¿Sigue siendo válida la estrategia delete-all + recreate?**

**SÍ, con los cascade deletes.** Justificación:

- Los IDs de `RoutineDay` y `RoutineExercise` NO son referenciados por otras tablas (no hay FK apuntando a ellos desde fuera del módulo).
- `WorkoutSession` referencia `Routine.id`, no `RoutineDay.id` ni `RoutineExercise.id`.
- `SetEntry` referencia `Exercise.id`, no `RoutineExercise.id`.
- Con cascade deletes en el schema, basta con borrar los `RoutineDay` del routine y Prisma borra los `RoutineExercise` automáticamente.

**Simplificación con cascades:**

```typescript
// Antes (actual): 3 operaciones manuales
await database.routineExercise.deleteMany({
  where: { routineDayId: { in: dayIds } },
})
await database.routineDay.deleteMany({ where: { routineId: id } })
// + update con create

// Después (con cascade): 1 operación + update
await database.routineDay.deleteMany({ where: { routineId: id } })
// Los RoutineExercise se borran automáticamente por cascade
// + update con create
```

**Validación:** Misma validación Zod que `createRoutine`. Adicionalmente verificar que la rutina existe y no está archivada.

**`revalidatePath`:** `/routines`, `/routines/${id}`

---

### 4.5 `deleteRoutine(id)`

```typescript
export async function deleteRoutine(
  id: number
): Promise<{ deleted: boolean; archived: boolean }>
```

**Descripción:** Elimina una rutina. Si tiene sesiones de entrenamiento históricas, la ARCHIVA en vez de eliminarla. Retorna qué acción se tomó.

**Lógica:**

```typescript
// 1. Verificar que la rutina existe
const routine = await database.routine.findUnique({
  where: { id },
  include: { sessions: { select: { id: true }, take: 1 } },
})
if (!routine) throw new Error('Rutina no encontrada')

// 2. Si tiene sesiones históricas → archivar
if (routine.sessions.length > 0) {
  await database.routine.update({
    where: { id },
    data: { archivedAt: new Date() },
  })
  revalidatePath('/routines')
  return { deleted: false, archived: true }
}

// 3. Si NO tiene sesiones → hard delete (cascade borra days + exercises)
await database.routine.delete({ where: { id } })
revalidatePath('/routines')
return { deleted: true, archived: false }
```

**Cambios respecto a la versión actual:**

- Agrega verificación de sesiones históricas
- Usa cascade deletes (ya no necesita borrar manualmente days/exercises)
- Retorna resultado tipado para que el UI muestre el toast correcto

**`revalidatePath`:** `/routines`

---

### 4.6 `archiveRoutine(id)` — NUEVA

```typescript
export async function archiveRoutine(id: number): Promise<Routine>
```

**Descripción:** Archiva una rutina (soft delete). La rutina deja de aparecer en la lista pero sus datos se preservan.

**Lógica:**

```typescript
const routine = await database.routine.update({
  where: { id },
  data: { archivedAt: new Date() },
  include: {
    /* full include */
  },
})
revalidatePath('/routines')
revalidatePath(`/routines/${id}`)
return routine
```

**`revalidatePath`:** `/routines`, `/routines/${id}`

---

### 4.7 `unarchiveRoutine(id)` — NUEVA

```typescript
export async function unarchiveRoutine(id: number): Promise<Routine>
```

**Descripción:** Desarchiva una rutina. Vuelve a aparecer en la lista activa.

**Lógica:**

```typescript
const routine = await database.routine.update({
  where: { id },
  data: { archivedAt: null },
  include: {
    /* full include */
  },
})
revalidatePath('/routines')
revalidatePath(`/routines/${id}`)
return routine
```

**`revalidatePath`:** `/routines`, `/routines/${id}`

**Nota:** En el MVP, no hay UI para listar rutinas archivadas. Esta action existe para completitud y para que el desarchivar funcione desde la vista de detalle (si el usuario navega directamente a `/routines/${id}` de una rutina archivada).

---

### 4.8 `getAllExercises()`

```typescript
export async function getAllExercises(): Promise<Exercise[]>
```

**Descripción:** Obtiene el catálogo completo de ejercicios, ordenados alfabéticamente.

**Cambios:** Agregar `orderBy: { name: "asc" }`.

**`revalidatePath`:** N/A (solo lectura).

---

### 4.9 `createExercise(payload)` — NUEVA

```typescript
export async function createExercise(
  payload: CreateExercisePayload
): Promise<Exercise>
```

**Descripción:** Crea un ejercicio on-the-fly desde el editor de rutinas. Genera el slug automáticamente.

**Lógica:**

```typescript
const slug = payload.name
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')

// Verificar slug único, agregar sufijo si existe
let finalSlug = slug
let counter = 1
while (await database.exercise.findUnique({ where: { slug: finalSlug } })) {
  finalSlug = `${slug}-${counter}`
  counter++
}

const exercise = await database.exercise.create({
  data: {
    name: payload.name.trim(),
    slug: finalSlug,
    primaryGroup: payload.primaryGroup?.trim() || null,
    equipment: payload.equipment?.trim() || null,
    notes: payload.notes?.trim() || null,
  },
})

revalidatePath('/routines') // Para refrescar el catálogo en el picker
return exercise
```

**Validación Zod:**

```typescript
const CreateExerciseSchema = z.object({
  name: z.string().min(1).max(100),
  primaryGroup: z.string().max(50).optional(),
  equipment: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
})
```

**`revalidatePath`:** `/routines`

**Nota:** Esta action puede vivir en `routines.actions.ts` o en un futuro `exercises.actions.ts` en el módulo exercises. Para el MVP, co-ubicar en routines es aceptable. Si el módulo exercises crece, mover allí.

---

### 4.10 Sobre `addDayToRoutine` y `removeDayFromRoutine`

**Decisión: NO crear actions separadas. Manejar inline en `updateRoutine`.**

**Justificación:**

- Agregar/eliminar días es parte del flujo de edición, no una operación independiente.
- El editor maneja el estado local completo de la rutina. Al guardar, `updateRoutine` recibe el estado final con los días agregados/eliminados.
- Crear actions granulares (add/remove day) requeriría sincronizar estado local con estado de BD en cada operación, añadiendo complejidad sin beneficio.
- La estrategia delete-all + recreate ya maneja esto naturalmente.

**Flujo:**

1. Usuario agrega día → se agrega al state local `RoutineFormData.days`
2. Usuario elimina día (si no tiene ejercicios) → se elimina del state local
3. Usuario guarda → `updateRoutine` recibe el estado final completo

---

## 5. Estructura de Archivos

### Archivos del módulo `src/modules/routines/`

| Estado        | Ruta                                        | Responsabilidad                                                                                                                   |
| ------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **CREAR**     | `types/index.ts`                            | Tipos de dominio, formulario, payload, vista y helpers de conversión                                                              |
| **MODIFICAR** | `actions/routines.actions.ts`               | Server actions refactorizados con nuevos tipos, validación Zod, archive/unarchive, createExercise                                 |
| **MODIFICAR** | `features/routine-list.feature.tsx`         | Orquestador de lista: usar nuevos tipos, manejar resultado de delete (archived vs deleted), toast diferenciado                    |
| **MODIFICAR** | `features/routine-editor.feature.tsx`       | Refactor completo: manejar create + update, estado con `RoutineFormData` tipado, agregar/eliminar días, reps por serie como array |
| **MODIFICAR** | `features/routine-details.tsx`              | Adaptar a nuevos tipos. Mostrar banner si rutina archivada con botón desarchivar                                                  |
| **ELIMINAR**  | `features/routine-detail.feature.tsx`       | Duplicado de `routine-details.tsx`. Consolidar en uno solo                                                                        |
| **MODIFICAR** | `components/RoutineCard.tsx`                | Eliminar import de feature (viola Smart/Dumb). Usar solo props. Eliminar import de `@core/lib/db`                                 |
| **CREAR**     | `components/DayEditor.tsx`                  | Editor de un día: nombre editable (Input), lista de ExerciseRow, botón agregar ejercicio, botón eliminar día                      |
| **CREAR**     | `components/ExerciseRow.tsx`                | Fila de ejercicio: picker, stepper series, N filas de stepper reps, notas, botones ↑↓, eliminar                                   |
| **MODIFICAR** | `components/ExercisePicker.tsx`             | Selector con CommandDialog (evita conflicto con Dialog padre). Formulario inline para crear ejercicios                            |
| **ELIMINAR**  | `components/CreateExerciseModal.tsx`        | Reemplazado por formulario inline en ExercisePicker                                                                               |
| **MODIFICAR** | `components/CreateRoutineDialog.tsx`        | Adaptar a nuevos tipos. Corregir props (actualmente recibe `onExercisesUpdate` que no usa el padre)                               |
| **MODIFICAR** | `components/routine-details-display.tsx`    | Adaptar a nuevos tipos. Mostrar reps como lista por serie en vez de string                                                        |
| **MODIFICAR** | `components/RoutineExerciseDetailsItem.tsx` | Adaptar a nuevos tipos. Mostrar reps parseados, eliminar targetWeight                                                             |
| **ELIMINAR**  | `components/RoutineDayCard.tsx`             | Reemplazado por `DayEditor.tsx`                                                                                                   |
| **ELIMINAR**  | `components/RoutineExerciseItem.tsx`        | Reemplazado por `ExerciseRow.tsx`                                                                                                 |

### Archivos fuera del módulo

| Estado        | Ruta                                                               | Responsabilidad                                                                                |
| ------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| **MODIFICAR** | `prisma/schema.prisma`                                             | Cambios de schema documentados en Sección 2                                                    |
| **CREAR**     | `prisma/migrations/XXXXXX_add_routine_management_v1/migration.sql` | Migración generada + SQL custom para datos                                                     |
| **MODIFICAR** | `src/core/types/index.ts`                                          | Eliminar `RoutineDay` type (mover al módulo routines). Mantener `SetEntry` y `WorkoutExercise` |
| **VERIFICAR** | `src/app/routines/page.tsx`                                        | Verificar que usa `getRoutines()` y pasa datos a `RoutineListFeature`                          |
| **VERIFICAR** | `src/app/routines/[id]/page.tsx`                                   | Verificar que usa `getRoutineById()` y pasa datos a `RoutineDetailsFeature`                    |

### Archivos a NO tocar

- `src/core/components/ui/*` — Componentes shadcn/ui generados
- `src/core/components/exercise-form.tsx` — Formulario de ejercicio existente (evaluar reusar en `CreateExerciseModal`)
- `src/modules/log-workout/*` — Módulo separado, fuera de scope
- `src/modules/exercises/*` — Módulo separado, fuera de scope

---

## 6. Interfaces de Props de Componentes Clave

### 6.1 `RoutineCard` (Dumb)

```typescript
interface RoutineCardProps {
  /** Datos de la rutina para mostrar */
  routine: Routine
  /** Callback al presionar eliminar. Recibe el ID de la rutina */
  onDelete: (routineId: number) => void
  /** Callback al presionar editar. Recibe la rutina completa */
  onEdit: (routine: Routine) => void
  /** Callback al presionar ver detalle. Recibe el ID */
  onView: (routineId: number) => void
  /** Si la tarjeta está en estado de carga (eliminando) */
  isDeleting?: boolean
}
```

**Notas:**

- ELIMINAR el import de `RoutineEditor` (un Dumb no debe importar un Feature)
- ELIMINAR el import de `@core/lib/db` (import roto, Exercise viene de `@prisma/client`)
- ELIMINAR el `useState` interno para `isDeleting` — el padre controla el estado
- El `AlertDialog` de confirmación de borrado se mantiene dentro del componente (es UI pura)
- Eliminar referencia a `weeks` en el badge (MVP = siempre 1 semana)

---

### 6.2 `RoutineListFeature` (Smart)

```typescript
interface RoutineListFeatureProps {
  /** Rutinas iniciales cargadas desde el server component */
  initialRoutines: Routine[]
  /** Catálogo de ejercicios para el editor */
  initialExercises: Exercise[]
}
```

**Estado interno:**

```typescript
// Estado
const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
const [isCreateOpen, setIsCreateOpen] = useState(false);
const [isEditOpen, setIsEditOpen] = useState(false);
const [deletingId, setDeletingId] = useState<number | null>(null);

// Handlers
handleDelete(id: number): Promise<void>
  → llama deleteRoutine(id)
  → si result.archived: toast.info("Rutina archivada (tiene sesiones históricas)")
  → si result.deleted: toast.success("Rutina eliminada")
  → actualiza state local

handleEdit(routine: Routine): void
  → setEditingRoutine(routine), setIsEditOpen(true)

handleCreate(): void
  → setIsCreateOpen(true)

handleRoutineCreated(routine: Routine): void
  → agrega al state, cierra dialog

handleRoutineUpdated(routine: Routine): void
  → actualiza en state, cierra dialog

handleExerciseCreated(exercise: Exercise): void
  → agrega al catálogo local de exercises
```

---

### 6.3 `RoutineEditorFeature` (Smart)

```typescript
interface RoutineEditorFeatureProps {
  /** Rutina existente para editar, o null para crear nueva */
  routine: Routine | null
  /** Catálogo de ejercicios disponibles */
  exercises: Exercise[]
  /** Callback cuando se guarda exitosamente (create o update) */
  onSaved: (routine: Routine) => void
  /** Callback cuando se cancela */
  onCancel: () => void
  /** Callback cuando se crea un ejercicio on-the-fly */
  onExerciseCreated: (exercise: Exercise) => void
}
```

**Estado interno:**

```typescript
// Estado del formulario
const [formData, setFormData] = useState<RoutineFormData>(
  routine ? routineToFormData(routine) : { name: "", days: [defaultDay(1)] }
);
const [isSubmitting, setIsSubmitting] = useState(false);
const [isCreateExerciseOpen, setIsCreateExerciseOpen] = useState(false);
const [createExerciseContext, setCreateExerciseContext] = useState<{
  dayIndex: number;
  itemIndex: number;
  initialName: string;
} | null>(null);

// Handlers de formulario
handleNameChange(name: string): void
handleAddDay(): void
  → valida max 7 días
  → agrega { name: `Día ${days.length + 1}`, order: days.length + 1, items: [] }
handleRemoveDay(dayIndex: number): void
  → valida que el día no tenga ejercicios (si tiene, toast.error)
  → elimina del array, recalcula orders
handleDayNameChange(dayIndex: number, name: string): void
handleAddExercise(dayIndex: number): void
  → agrega ExerciseFormItem con defaults: { exerciseId: null, series: 3, repsPerSet: [10,10,10], ... }
handleRemoveExercise(dayIndex: number, itemIndex: number): void
handleMoveExercise(dayIndex: number, itemIndex: number, direction: "up" | "down"): void
handleExerciseChange(dayIndex: number, itemIndex: number, field: string, value: any): void
handleSeriesChange(dayIndex: number, itemIndex: number, newSeries: number): void
  → VER SECCIÓN 7.2 para lógica detallada
handleRepChange(dayIndex: number, itemIndex: number, setIndex: number, reps: number): void
handleSubmit(): Promise<void>
  → convierte formData a payload con formDataToPayload()
  → llama createRoutine o updateRoutine según corresponda
  → llama onSaved con el resultado

// Handler de ejercicio on-the-fly
handleCreateExerciseRequest(dayIndex: number, itemIndex: number, name: string): void
  → abre modal, guarda contexto
handleExerciseCreated(exercise: Exercise): void
  → cierra modal
  → asigna exerciseId al item correspondiente
  → llama onExerciseCreated para actualizar catálogo en el padre
```

---

### 6.4 `DayEditor` (Dumb)

```typescript
interface DayEditorProps {
  /** Datos del día */
  day: DayFormData
  /** Índice del día en el array (para display "Día N" si nombre vacío) */
  dayIndex: number
  /** Catálogo de ejercicios para los pickers */
  exercises: Exercise[]
  /** Si es el único día (no se puede eliminar) */
  isOnlyDay: boolean
  /** Callback al cambiar el nombre del día */
  onNameChange: (name: string) => void
  /** Callback al eliminar el día */
  onRemove: () => void
  /** Callback al agregar un ejercicio */
  onAddExercise: () => void
  /** Callback al eliminar un ejercicio */
  onRemoveExercise: (itemIndex: number) => void
  /** Callback al mover un ejercicio */
  onMoveExercise: (itemIndex: number, direction: 'up' | 'down') => void
  /** Callback al cambiar el ejercicio seleccionado */
  onExerciseSelect: (itemIndex: number, exerciseId: number) => void
  /** Callback al cambiar el número de series */
  onSeriesChange: (itemIndex: number, series: number) => void
  /** Callback al cambiar las reps de una serie específica */
  onRepChange: (itemIndex: number, setIndex: number, reps: number) => void
  /** Callback al cambiar las notas de un ejercicio */
  onNotesChange: (itemIndex: number, notes: string) => void
  /** Callback al solicitar crear un ejercicio on-the-fly */
  onCreateExercise: (itemIndex: number, name: string) => void
}
```

**Notas:**

- El nombre del día es un `Input` editable con placeholder `Día ${dayIndex + 1}`
- El botón eliminar día está deshabilitado si `isOnlyDay` es true O si `day.items.length > 0`
- Cuando `day.items.length > 0` y se intenta eliminar, mostrar tooltip "Eliminá los ejercicios primero"

---

### 6.5 `ExerciseRow` (Dumb)

```typescript
interface ExerciseRowProps {
  /** Datos del ejercicio en el formulario */
  item: ExerciseFormItem
  /** Índice del item dentro del día */
  itemIndex: number
  /** Si es el primer item (deshabilita ↑) */
  isFirst: boolean
  /** Si es el último item (deshabilita ↓) */
  isLast: boolean
  /** Catálogo de ejercicios para el picker */
  exercises: Exercise[]
  /** Callback al seleccionar un ejercicio */
  onExerciseSelect: (exerciseId: number) => void
  /** Callback al cambiar el número de series */
  onSeriesChange: (series: number) => void
  /** Callback al cambiar las reps de una serie específica */
  onRepChange: (setIndex: number, reps: number) => void
  /** Callback al cambiar las notas */
  onNotesChange: (notes: string) => void
  /** Callback al eliminar este ejercicio */
  onRemove: () => void
  /** Callback al mover este ejercicio */
  onMove: (direction: 'up' | 'down') => void
  /** Callback al solicitar crear ejercicio on-the-fly */
  onCreateExercise: (name: string) => void
}
```

**Layout del componente:**

```
┌─────────────────────────────────────────────────┐
│ [⋮]  [ExercisePicker ▼]              [↑][↓][🗑] │
│                                                  │
│  Series: [−] 4 [+]                               │
│                                                  │
│  Serie 1: [−] 12 reps [+]                       │
│  Serie 2: [−] 10 reps [+]                       │
│  Serie 3: [−] 10 reps [+]                       │
│  Serie 4: [−]  8 reps [+]                       │
│                                                  │
│  [Notas (opcional)                             ] │
└─────────────────────────────────────────────────┘
```

**Notas:**

- Las filas de reps se renderizan dinámicamente según `item.repsPerSet.length`
- Cada fila usa `NumberInputStepper` con min=1, max=50
- El stepper de series usa `NumberInputStepper` con min=1, max=10
- Al cambiar series, el Feature padre maneja la lógica de agregar/eliminar filas (ver Sección 7.2)

---

### 6.6 `ExercisePicker` (Dumb)

```typescript
interface ExercisePickerProps {
  /** Lista de ejercicios disponibles */
  exercises: Exercise[]
  /** ID del ejercicio seleccionado actualmente */
  value: number | null
  /** Callback al seleccionar un ejercicio */
  onSelect: (exerciseId: number) => void
  /** Callback al solicitar crear un ejercicio nuevo */
  onCreate: (name: string) => void
}
```

**Notas:** Sin cambios respecto al componente actual. La interfaz ya es correcta.

---

### 6.7 `CreateExerciseModal` (Dumb)

```typescript
interface CreateExerciseModalProps {
  /** Si el modal está abierto */
  open: boolean
  /** Callback al cambiar el estado del modal */
  onOpenChange: (open: boolean) => void
  /** Nombre inicial del ejercicio (pre-llenado desde el picker) */
  initialName: string
  /** Callback al enviar el formulario. Recibe el payload, el padre llama al action */
  onSubmit: (payload: CreateExercisePayload) => void
  /** Si el formulario está en estado de envío */
  isSubmitting?: boolean
}
```

**Notas:**

- Evaluar si se puede reusar `src/core/components/exercise-form.tsx` existente dentro de este modal
- Si `exercise-form.tsx` ya maneja la creación, este componente es solo un wrapper de Dialog + ExerciseForm
- Campos: nombre (requerido), grupo muscular (select con opciones predefinidas), equipamiento (select con opciones predefinidas), notas (textarea opcional)

---

## 7. Flujo de Datos

### 7.1 Escenario A — Editar una rutina existente

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. SERVER COMPONENT: src/app/routines/[id]/page.tsx             │
│    ┌──────────────────────────────────────────────────────────┐ │
│    │ const routine = await getRoutineById(id);                │ │
│    │ const exercises = await getAllExercises();                │ │
│    │ return <RoutineDetails                                   │ │
│    │   initialRoutine={routine}                               │ │
│    │   initialExercises={exercises}                           │ │
│    │ />;                                                      │ │
│    └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. FEATURE (Smart): RoutineDetails                              │
│    ┌──────────────────────────────────────────────────────────┐ │
│    │ const [isEditing, setIsEditing] = useState(false);       │ │
│    │ const [routine, setRoutine] = useState(initialRoutine);  │ │
│    │ const [exercises, setExercises] = useState(initial...);  │ │
│    │                                                          │ │
│    │ {isEditing ? (                                           │ │
│    │   <RoutineEditorFeature                                  │ │
│    │     routine={routine}                                    │ │
│    │     exercises={exercises}                                │ │
│    │     onSaved={(r) => { setRoutine(r); setIsEditing(false) }}│
│    │     onCancel={() => setIsEditing(false)}                 │ │
│    │     onExerciseCreated={(e) => setExercises([...ex, e])}  │ │
│    │   />                                                     │ │
│    │ ) : (                                                    │ │
│    │   <RoutineDetailsDisplay routine={routine} />            │ │
│    │ )}                                                       │ │
│    └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. FEATURE (Smart): RoutineEditorFeature                        │
│    ┌──────────────────────────────────────────────────────────┐ │
│    │ const [formData, setFormData] = useState(                │ │
│    │   routineToFormData(routine)                             │ │
│    │ );                                                       │ │
│    │                                                          │ │
│    │ <Input value={formData.name} onChange={handleNameChange} │ │
│    │ {formData.days.map((day, i) => (                         │ │
│    │   <DayEditor                                             │ │
│    │     day={day}                                            │ │
│    │     onSeriesChange={(itemIdx, s) =>                      │ │
│    │       handleSeriesChange(i, itemIdx, s)}                 │ │
│    │     onRepChange={(itemIdx, setIdx, r) =>                 │ │
│    │       handleRepChange(i, itemIdx, setIdx, r)}            │ │
│    │     ...                                                  │ │
│    │   />                                                     │ │
│    │ ))}                                                      │ │
│    └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. SUBMIT: handleSubmit()                                       │
│    ┌──────────────────────────────────────────────────────────┐ │
│    │ const payload = formDataToPayload(formData);             │ │
│    │ // payload.days[].items[].reps = "[12,10,10,8]"          │ │
│    │                                                          │ │
│    │ const result = await updateRoutine(routine.id, payload); │ │
│    │ // Server action:                                        │ │
│    │ //   1. Valida con Zod                                   │ │
│    │ //   2. deleteMany RoutineDay (cascade → exercises)      │ │
│    │ //   3. update Routine + create days + create exercises   │ │
│    │ //   4. revalidatePath("/routines", "/routines/${id}")    │ │
│    │ //   5. return Routine completa                          │ │
│    │                                                          │ │
│    │ onSaved(result);                                         │ │
│    │ toast.success("Rutina actualizada con éxito");           │ │
│    └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Escenario B — Cambiar número de series de un ejercicio

Este es el flujo más crítico del editor. La lógica vive en `RoutineEditorFeature.handleSeriesChange()`.

**Invariante:** Al cambiar el número de series, las filas de reps existentes NUNCA pierden sus valores.

```typescript
function handleSeriesChange(
  dayIndex: number,
  itemIndex: number,
  newSeries: number
): void {
  setFormData((prev) => {
    const newDays = structuredClone(prev.days)
    const item = newDays[dayIndex].items[itemIndex]
    const currentReps = item.repsPerSet
    const currentLength = currentReps.length

    if (newSeries > currentLength) {
      // AGREGAR filas: el valor default = última fila existente
      const lastValue = currentReps[currentLength - 1] ?? 10
      const newReps = [
        ...currentReps,
        ...Array(newSeries - currentLength).fill(lastValue),
      ]
      item.repsPerSet = newReps
    } else if (newSeries < currentLength) {
      // ELIMINAR filas: truncar desde el final, preservar las primeras
      item.repsPerSet = currentReps.slice(0, newSeries)
    }
    // Si newSeries === currentLength, no hacer nada

    item.series = newSeries
    return { ...prev, days: newDays }
  })
}
```

**Ejemplo visual:**

```
Estado inicial: series=3, repsPerSet=[12, 10, 10]

  Serie 1: [−] 12 reps [+]
  Serie 2: [−] 10 reps [+]
  Serie 3: [−] 10 reps [+]

→ Usuario incrementa series a 5:

  Serie 1: [−] 12 reps [+]    ← preservada
  Serie 2: [−] 10 reps [+]    ← preservada
  Serie 3: [−] 10 reps [+]    ← preservada
  Serie 4: [−] 10 reps [+]    ← NUEVA (copia de última = 10)
  Serie 5: [−] 10 reps [+]    ← NUEVA (copia de última = 10)

→ Usuario decrementa series a 2:

  Serie 1: [−] 12 reps [+]    ← preservada
  Serie 2: [−] 10 reps [+]    ← preservada
  (Serie 3, 4, 5 eliminadas)

→ Usuario incrementa series a 4:

  Serie 1: [−] 12 reps [+]    ← preservada
  Serie 2: [−] 10 reps [+]    ← preservada
  Serie 3: [−] 10 reps [+]    ← NUEVA (copia de última = 10)
  Serie 4: [−] 10 reps [+]    ← NUEVA (copia de última = 10)
```

**Flujo de cambio de rep individual:**

```typescript
function handleRepChange(
  dayIndex: number,
  itemIndex: number,
  setIndex: number,
  reps: number
): void {
  setFormData((prev) => {
    const newDays = structuredClone(prev.days)
    newDays[dayIndex].items[itemIndex].repsPerSet[setIndex] = reps
    return { ...prev, days: newDays }
  })
}
```

**Nota sobre `structuredClone`:** Usamos `structuredClone` en vez de `JSON.parse(JSON.stringify(...))` para deep copy. Es nativo, más rápido y maneja más tipos. Disponible en todos los browsers modernos y Node 17+.

---

## 8. Riesgos y Dependencias

### 8.1 Riesgos Técnicos

| #   | Riesgo                                                                                                                                                                      | Severidad | Mitigación                                                                                                                                                                                       |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R1  | **Migración de datos de `reps`**: El SQL custom para convertir `"12-10-8"` a `"[12,10,8]"` puede fallar con formatos inesperados (ej. `"AMRAP"`, strings vacíos, `null`)    | **Alta**  | Agregar `ELSE '[0]'` como fallback. Ejecutar `SELECT DISTINCT reps FROM "RoutineExercise"` antes de migrar para auditar todos los formatos existentes. Hacer backup de la tabla antes de migrar. |
| R2  | **Cascade deletes rompen `deleteRoutine` existente**: Si el código actual intenta borrar RoutineExercise manualmente y luego Prisma intenta cascade, puede haber conflictos | **Media** | Actualizar `deleteRoutine` ANTES de aplicar la migración de cascade. O aplicar la migración y el código en el mismo deploy.                                                                      |
| R3  | **`RoutineCard` importa Feature (`RoutineEditor`)**: Viola la regla Smart/Dumb. Si no se corrige, el refactor del editor rompe la card                                      | **Media** | Priorizar la limpieza de `RoutineCard` como primera tarea del frontend-coder.                                                                                                                    |
| R4  | **Import duplicado en `RoutineExerciseItem.tsx`**: Línea 3 y línea 7 importan `RoutineExercise` del mismo path. Puede causar error de compilación                           | **Baja**  | Corregir al refactorizar el archivo.                                                                                                                                                             |
| R5  | **`userId` hardcodeado a 1**: Todas las actions asumen user 1. Si se agrega auth antes de terminar este módulo, hay conflicto                                               | **Baja**  | Mantener el hardcode con `// TODO: auth`. No bloquea el MVP.                                                                                                                                     |
| R6  | **`CreateRoutineDialog` recibe `onExercisesUpdate` que el padre no pasa**: La interfaz del componente no coincide con cómo se usa en `RoutineList`                          | **Baja**  | Corregir al refactorizar.                                                                                                                                                                        |
| R7  | **Performance del editor con muchos ejercicios**: `structuredClone` en cada cambio de rep puede ser lento con rutinas grandes (7 días × muchos ejercicios)                  | **Baja**  | Para el MVP es aceptable. Si se detecta lag, optimizar con `useReducer` o updates inmutables más granulares.                                                                                     |

### 8.2 Dependencias entre Tareas (orden de ejecución)

```
FASE 1: Schema y Tipos (backend-coder)
  ├── T1: Actualizar prisma/schema.prisma
  ├── T2: Generar migración con --create-only
  ├── T3: Agregar SQL custom de migración de reps
  ├── T4: Aplicar migración (prisma migrate dev)
  ├── T5: Crear src/modules/routines/types/index.ts
  └── T6: Refactorizar routines.actions.ts con nuevos tipos y validación

FASE 2: Componentes Dumb (frontend-coder) — puede empezar T7-T9 en paralelo con FASE 1
  ├── T7: Crear ExerciseRow.tsx (nuevo, reemplaza RoutineExerciseItem)
  ├── T8: Crear DayEditor.tsx (nuevo, reemplaza RoutineDayCard)
  ├── T9: Crear CreateExerciseModal.tsx
  ├── T10: Refactorizar RoutineCard.tsx (eliminar imports de features)
  ├── T11: Actualizar routine-details-display.tsx
  └── T12: Actualizar RoutineExerciseDetailsItem.tsx

FASE 3: Features Smart (frontend-coder) — requiere FASE 1 + FASE 2
  ├── T13: Refactorizar routine-editor.feature.tsx
  ├── T14: Refactorizar routine-list.feature.tsx
  ├── T15: Refactorizar routine-details.tsx
  └── T16: Eliminar archivos obsoletos (routine-detail.feature.tsx, RoutineDayCard, RoutineExerciseItem)

FASE 4: Verificación (tester)
  ├── T17: Verificar migración de datos existentes
  ├── T18: Test manual de flujos CRUD completos
  └── T19: Verificar que log-workout no se rompió
```

**Dependencias críticas:**

- T6 (actions) BLOQUEA T13-T15 (features)
- T5 (types) BLOQUEA T6-T12 (todo lo que usa tipos)
- T1-T4 (migración) BLOQUEA T6 (actions necesitan el schema nuevo)
- T7-T8 (componentes dumb) pueden empezar en paralelo si usan los tipos de T5 como contrato

### 8.3 Deuda Técnica Existente que Puede Interferir

| Deuda                                                                                                                                                               | Impacto                                      | Acción                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------- |
| **`RoutineCard` importa `RoutineEditor` (Feature)**: Viola Smart/Dumb. El componente Dumb tiene lógica de estado y llama a un Feature.                              | Alto — Bloquea el refactor limpio del editor | Corregir en T10 como prerequisito                                                  |
| **`routine-detail.feature.tsx` vs `routine-details.tsx`**: Dos features para la misma vista. `routine-detail.feature.tsx` parece ser una versión anterior no usada. | Medio — Confusión sobre cuál es el canónico  | Eliminar `routine-detail.feature.tsx` en T16. `routine-details.tsx` es el canónico |
| **`JSON.parse(JSON.stringify(...))` para deep copy**: Usado en el editor actual. Lento y no type-safe.                                                              | Bajo — Funciona pero es subóptimo            | Reemplazar con `structuredClone` en T13                                            |
| **`any` casts en el editor**: `day as any`, `item: any` en varios handlers                                                                                          | Bajo — Funciona pero pierde type safety      | Corregir con los nuevos tipos en T13                                               |
| **`database` vs `prisma` inconsistencia**: Algunas actions usan `database` (wrapper con fallback mock) y `getAllExercises` usa `prisma` directamente                | Bajo — Ambos funcionan                       | Estandarizar en `prisma` directamente en T6                                        |
| **`RoutineDay` type duplicado**: Existe en `@core/types/index.ts` y en `routines.actions.ts`                                                                        | Bajo — Puede causar confusión de imports     | Consolidar en `@modules/routines/types/index.ts` en T5. Eliminar de `@core/types`  |

---

## Apéndice: Decisiones Descartadas

### A. Nueva tabla `RoutineSet` para reps por serie

**Descartada.** Aunque es más normalizada y extensible, agrega complejidad innecesaria para el MVP:

- JOIN adicional en cada query
- Lógica de CRUD más compleja en actions
- La migración de datos es más riesgosa (crear filas nuevas vs transformar un campo)
- No hay requerimiento futuro confirmado que necesite campos adicionales por set en la rutina (tempo, descanso, etc.)

Si en el futuro se necesita, la migración de JSON array a tabla es straightforward: parsear el JSON y crear filas.

### B. Campo `status` enum para borrado suave

**Descartado.** Over-engineering para 2 estados. `archivedAt DateTime?` es más simple, más informativo (incluye timestamp) y suficiente para el MVP.

### C. Actions granulares `addDay`/`removeDay`

**Descartado.** Agregar/eliminar días es parte del flujo de edición. El editor maneja estado local completo y `updateRoutine` persiste el estado final. Actions granulares requerirían sincronización bidireccional innecesaria.

### D. Eliminar campo `series` (derivar de `reps.length`)

**Descartado.** Mantener `series` como campo explícito permite queries rápidas sin parsear JSON (ej. badges, conteos). La validación en el action garantiza consistencia.

---

## 9. Mejoras de UX Implementadas

### 9.1 Indicador visual de campos requeridos

- **Componente**: `ExerciseRow.tsx`
- **Implementación**: Badge rojo con ícono `AlertCircle` cuando `exerciseId === null`
- **Objetivo**: Indicar visualmente que el ejercicio es un campo requerido

### 9.2 Tooltips en controles de reordenamiento

- **Componente**: `ExerciseRow.tsx`
- **Implementación**: Tooltips de shadcn/ui en botones ↑↓ y eliminar
- **Textos**: "Mover arriba", "Mover abajo", "Eliminar ejercicio"
- **Objetivo**: Hacer más intuitivos los controles de acción

### 9.3 Feedback visual al mover ejercicios

- **Componente**: `ExerciseRow.tsx`
- **Implementación**: Cambio de background a `bg-primary/10` brevemente (300ms) al mover
- **Objetivo**: Confirmar visualmente que la acción se realizó

### 9.4 Animación en filas de series

- **Componente**: `ExerciseRow.tsx`
- **Implementación**: Clases `animate-in fade-in slide-in-from-top-2` en cada fila de reps
- **Objetivo**: Suavizar la aparición de nuevas filas al cambiar número de series

### 9.5 Creación inline de ejercicios

- **Componente**: `ExercisePicker.tsx`
- **Implementación**: Formulario inline dentro del `CommandDialog` con campos: nombre, grupo muscular, equipamiento
- **Cambio arquitectónico**: Eliminado `CreateExerciseModal.tsx` separado
- **Objetivo**: Flujo más fluido sin interrupciones por modales anidados

### 9.6 CommandDialog en lugar de Popover

- **Componente**: `ExercisePicker.tsx`
- **Implementación**: Uso de `CommandDialog` en lugar de `Popover`
- **Motivo técnico**: Evitar conflicto de stacking context cuando el picker está dentro de un `Dialog` padre
- **Objetivo**: Garantizar que el selector funcione correctamente en el editor de rutinas
