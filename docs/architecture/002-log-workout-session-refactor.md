# RFC-002: Log Workout Session Refactor (v0.2.0)

**ID**: RFC-002  
**Estado**: Borrador  
**Fecha**: 2026-03-17  
**Autor**: architect  
**PRD de referencia**: `docs/product/features/v0.2.0-log-workout-session.md`  
**Reporte de exploración**: Engram #43

---

## 1. Resumen Ejecutivo

Este RFC define la arquitectura técnica para implementar el **modo borrador** en el módulo `log-workout`, permitiendo que las sesiones de entrenamiento persistan localmente durante toda la sesión y se guarden en la base de datos mediante una única transacción atómica al finalizar.

### Cambios Principales

| Área | Cambio |
|------|--------|
| Persistencia local | `localStorage` con sincronización automática |
| Estado del cliente | Refactor de `WorkoutSessionProvider` para leer/escribir en localStorage |
| Server Action | Nueva acción `commitWorkoutSession` con `prisma.$transaction` |
| Tipos | Nuevos tipos `DraftSession` y `CommitSessionPayload` |
| UI | Mejoras en `WorkoutExerciseItem` para edición de series completadas |

---

## 2. Contexto y Problema

### 2.1 Estado Actual

El módulo `log-workout/modules/session/` maneja el estado de la sesión activa mediante:

```
WorkoutSessionProvider.tsx (useState) → workout-session.tsx (feature) → WorkoutExerciseItem.tsx (UI)
```

**Problemas identificados:**

1. **Sin persistencia**: El estado vive solo en memoria. Cualquier recarga/minimización pierde el progreso.
2. **Guardado no atómico**: `saveWorkoutSession` crea `WorkoutSession` primero, luego `SetEntry` con `createMany`. Si el segundo falla, queda una sesión huérfana.
3. **Sin modelo intermedio**: No existe `WorkoutExercise` en BD. Las series (`SetEntry`) referencian directamente al ejercicio del catálogo, perdiendo el orden dentro de la sesión.

### 2.2 Requisitos del PRD

- **Modo borrador**: Persistencia local durante toda la sesión, sin escritura en BD.
- **Commit único**: Transacción atómica al finalizar.
- **Edición libre**: Permitir modificar series ya completadas.
- **Claridad visual**: Indicadores de progreso, peso anterior, siguiente ejercicio.

---

## 3. Decisiones Técnicas Clave

### 3.1 Tecnología de Persistencia Local

**Decisión: `localStorage`**

| Opción | Pros | Contras | Veredicto |
|--------|------|---------|-----------|
| `localStorage` | Simple, síncrono, soporte universal, sin dependencias | Límite ~5MB, síncrono (bloquea main thread) | ✅ **Elegido** |
| `IndexedDB` | Asíncrono, sin límite práctico, mejor para datos grandes | API compleja, requiere librería wrapper, overkill | ❌ Rechazado |
| `react-query` + persist | Cache automático, sincronización | Dependencia adicional, complejidad innecesaria | ❌ Rechazado |
| `zustand` + persist | Simple, integrado con estado global | Nueva dependencia, migración de contexto | ❌ Rechazado |

**Justificación:**

- El estado de una sesión típica (5-8 ejercicios × 4 series × datos) ocupa ~2-5KB, muy por debajo del límite de 5MB.
- La simplicidad de `localStorage` reduce la superficie de bugs.
- No se requiere una nueva dependencia.
- El bloqueo del main thread es despreciable para este volumen de datos.

### 3.2 Estrategia de Sincronización

**Decisión: Sincronización automática con `useEffect`**

```typescript
// En WorkoutSessionProvider
useEffect(() => {
  if (exercises.length > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draftSession));
  }
}, [exercises, timer.startDate, sessionNotes]);
```

**Alternativa considerada y rechazada:** Debounce con `useDebouncedEffect`. No es necesario porque las actualizaciones son discretas (clicks en steppers), no continuas (typing en input).

### 3.3 Modelo de Datos en BD

**Decisión: Agregar modelo `WorkoutExercise` al schema**

El schema actual no tiene un modelo intermedio entre `WorkoutSession` y `SetEntry`. Esto impide:
- Conocer el orden de ejercicios dentro de una sesión
- Asociar series a un "ejercicio de la sesión" específico
- Manejar ejercicios repetidos en la misma sesión

**Nuevo modelo:**

```prisma
model WorkoutExercise {
  id         Int        @id @default(autoincrement())
  sessionId  Int
  exerciseId Int
  order      Int        // Posición en la sesión
  notes      String?
  sets       SetEntry[]
  
  session    WorkoutSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  exercise   Exercise       @relation(fields: [exerciseId], references: [id])
  
  @@index([sessionId])
  @@index([sessionId, order])
}
```

**Modificación a `SetEntry`:**

```prisma
model SetEntry {
  id               Int             @id @default(autoincrement())
  workoutExerciseId Int            // Nuevo: referencia al ejercicio de la sesión
  setNumber        Int
  repsDone         Int
  weightKg         Float
  rpe              Int?
  notes            String?
  createdAt        DateTime        @default(now())
  
  workoutExercise  WorkoutExercise @relation(fields: [workoutExerciseId], references: [id], onDelete: Cascade)
  
  @@index([workoutExerciseId])
}
```

**Nota:** Mantener `exerciseId` en `SetEntry` como redundancia para queries directos (opcional, evaluar en implementación).

---

## 4. Contratos de Datos

### 4.1 Tipo: `DraftSession` (Cliente - localStorage)

```typescript
// src/modules/log-workout/modules/session/types/draft-session.ts

import { WorkoutExercise } from "@core/types";

export interface DraftSession {
  // Metadata
  id: string;                    // UUID generado al iniciar
  version: number;               // Para migraciones futuras
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
  
  // Origen
  source: {
    type: "routine" | "free";
    routineId?: number;
    routineDayId?: number;
    routineDayName?: string;
  };
  
  // Estado del timer
  timer: {
    startDate: string | null;    // ISO timestamp
    elapsedTime: number;         // Segundos
  };
  
  // Datos de la sesión
  exercises: WorkoutExercise[];
  sessionNotes: string;
  
  // Metadatos de UI
  activeExerciseId: number | null;
  lastCompletedSetId: string | null;
}

// Constantes
export const DRAFT_SESSION_STORAGE_KEY = "gym-tracker:draft-session";
export const DRAFT_SESSION_VERSION = 1;
```

### 4.2 Tipo: `CommitSessionPayload` (Cliente → Server Action)

```typescript
// src/modules/log-workout/modules/session/types/commit-payload.ts

export interface CommitSetEntryPayload {
  exerciseId: number;
  setNumber: number;
  repsDone: number;
  weightKg: number;
  rpe?: number;
  notes?: string;
}

export interface CommitWorkoutExercisePayload {
  exerciseId: number;
  order: number;
  notes?: string;
  sets: CommitSetEntryPayload[];
}

export interface CommitSessionPayload {
  // Metadata de sesión
  startedAt: Date;
  finishedAt: Date;
  durationSeconds: number;
  
  // Origen
  routineId?: number;
  
  // Notas
  notes?: string;
  
  // Ejercicios y series
  exercises: CommitWorkoutExercisePayload[];
}
```

### 4.3 Tipo: `CommitSessionResult` (Server Action → Cliente)

```typescript
// src/modules/log-workout/modules/session/types/commit-result.ts

export type CommitSessionResult = 
  | { success: true; sessionId: number }
  | { success: false; error: string; code: "TRANSACTION_FAILED" | "VALIDATION_ERROR" | "UNKNOWN" };
```

---

## 5. Diseño de la Server Action Atómica

### 5.1 Ubicación

```
src/modules/log-workout/actions/commit-workout-session.actions.ts
```

### 5.2 Implementación

```typescript
// src/modules/log-workout/actions/commit-workout-session.actions.ts

"use server";

import { prisma } from "@core/lib/prisma";
import { revalidatePath } from "next/cache";
import { CommitSessionPayload, CommitSessionResult } from "../modules/session/types/commit-payload";

export async function commitWorkoutSession(
  payload: CommitSessionPayload
): Promise<CommitSessionResult> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear WorkoutSession
      const session = await tx.workoutSession.create({
        data: {
          userId: 1, // TODO: Obtener del contexto de auth
          date: payload.startedAt,
          routineId: payload.routineId,
          notes: payload.notes,
        },
      });

      // 2. Crear WorkoutExercises y SetEntries
      for (const exercise of payload.exercises) {
        const workoutExercise = await tx.workoutExercise.create({
          data: {
            sessionId: session.id,
            exerciseId: exercise.exerciseId,
            order: exercise.order,
            notes: exercise.notes,
          },
        });

        // 3. Crear SetEntries para este ejercicio
        if (exercise.sets.length > 0) {
          await tx.setEntry.createMany({
            data: exercise.sets.map((set) => ({
              workoutExerciseId: workoutExercise.id,
              exerciseId: exercise.exerciseId, // Redundancia para queries
              setNumber: set.setNumber,
              repsDone: set.repsDone,
              weightKg: set.weightKg,
              rpe: set.rpe,
              notes: set.notes,
            })),
          });
        }
      }

      return session;
    });

    // Revalidar rutas afectadas
    revalidatePath("/log-workout");
    revalidatePath("/statistics");
    revalidatePath("/history");

    return { success: true, sessionId: result.id };
  } catch (error) {
    console.error("[commitWorkoutSession] Transaction failed:", error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      code: "TRANSACTION_FAILED",
    };
  }
}
```

### 5.3 Manejo de Errores

| Escenario | Acción |
|-----------|--------|
| Transacción falla | Retornar `{ success: false }`, mantener borrador en localStorage |
| Validación falla | Retornar `{ success: false, code: "VALIDATION_ERROR" }` |
| Error desconocido | Loguear, retornar error genérico, mantener borrador |

---

## 6. Flujo de Datos y Componentes

### 6.1 Diagrama de Secuencia

```mermaid
sequenceDiagram
    participant U as Usuario
    participant WS as workout-session.tsx
    participant WSP as WorkoutSessionProvider
    participant LS as localStorage
    participant SA as commitWorkoutSession
    participant DB as PostgreSQL

    Note over U,DB: INICIO DE SESIÓN
    
    U->>WS: Selecciona rutina/día
    WS->>WSP: Props: routineDay
    WSP->>WSP: Inicializa exercises desde routineDay
    WSP->>LS: Guarda DraftSession inicial
    WSP->>WS: Renderiza UI
    
    Note over U,DB: DURANTE LA SESIÓN (MODO BORRADOR)
    
    U->>WS: Completa serie (click)
    WS->>WSP: updateSet(exerciseId, setId, { completed: true })
    WSP->>WSP: Actualiza state
    WSP->>LS: Guarda DraftSession actualizado
    WSP->>WS: Re-renderiza
    
    Note: ... más interacciones ...
    
    Note over U,DB: FINALIZACIÓN (COMMIT)
    
    U->>WS: Click "Finalizar entrenamiento"
    WS->>WS: Construye CommitSessionPayload
    WS->>SA: commitWorkoutSession(payload)
    SA->>DB: prisma.$transaction()
    
    alt Transacción exitosa
        DB-->>SA: Session creada
        SA-->>WS: { success: true, sessionId }
        WS->>LS: Limpia DraftSession
        WS->>U: Muestra resumen
    else Transacción falla
        DB-->>SA: Error
        SA-->>WS: { success: false, error }
        WS->>U: Muestra error, permite reintentar
        Note: Borrador permanece en LS
    end
```

### 6.2 Arquitectura de Componentes

```
src/modules/log-workout/modules/session/
├── features/
│   └── workout-session.tsx          # Smart: orquesta el flujo
├── components/
│   ├── WorkoutExerciseItem.tsx      # Dumb: ejercicio activo (expandido)
│   ├── WorkoutExerciseCompactItem.tsx # Dumb: ejercicio compacto
│   ├── AddExerciseToWorkout.tsx     # Dumb: selector de ejercicios
│   ├── SessionActiveIndicator.tsx   # Dumb: badge en navegación
│   └── DraftRecoveryModal.tsx       # Dumb: modal "Continuar sesión"
├── contexts/
│   └── WorkoutSessionContext/
│       ├── index.ts
│       ├── WorkoutSessionProvider.tsx  # Smart: estado + persistencia
│       └── hooks/
│           ├── useWorkoutSessionContext.ts
│           ├── useWorkoutSessionActions.ts
│           └── useDraftSession.ts       # Nuevo: hook de persistencia
├── hooks/
│   ├── useRestTimer.ts
│   └── useElapsedTime.ts
├── types/
│   ├── draft-session.ts             # Nuevo: tipos del borrador
│   ├── commit-payload.ts            # Nuevo: tipos del commit
│   └── commit-result.ts             # Nuevo: resultado del commit
└── utils/
    └── draft-session-storage.ts     # Nuevo: helpers de localStorage
```

### 6.3 Contratos entre Componentes

#### `WorkoutSessionProvider` → `workout-session.tsx`

```typescript
interface WorkoutSessionContextValue {
  // Estado
  exercises: WorkoutExercise[];
  availableExercises: Exercise[];
  routineDay: RoutineDay | null;
  timer: { startDate: Date | null; elapsedTime: number; isActive: boolean };
  restTimer: UseRestTimerReturn;
  sessionNotes: string;
  
  // Estado del borrador
  draftStatus: "idle" | "active" | "recovering" | "committing";
  hasDraft: boolean;
  
  // Acciones
  actions: {
    startWorkout: () => void;
    finishWorkout: (notes: string) => Promise<CommitSessionResult>;
    cancelWorkout: () => void;
    recoverDraft: () => void;
    discardDraft: () => void;
    addExercise: (exerciseId: number, targetSeries?: number) => void;
    removeExercise: (exerciseId: number) => void;
    moveExercise: (index: number, direction: "up" | "down") => void;
    updateSet: (exerciseId: number, setId: string, updates: Partial<SetEntry>) => void;
    addSet: (exerciseId: number) => void;
    removeSet: (exerciseId: number, setId: string) => void;
    undoLastChange: () => void;
    setSessionNotes: (notes: string) => void;
  };
}
```

#### `workout-session.tsx` → `WorkoutExerciseItem.tsx`

```typescript
interface WorkoutExerciseItemProps {
  // Datos
  exercise: WorkoutExercise;
  exerciseIndex: number;
  isLastItem: boolean;
  
  // Estado derivado
  isActive: boolean;
  completedSets: number;
  totalSets: number;
  previousWeight?: number;  // Peso de la última sesión
  
  // Callbacks
  onUpdateSet: (setId: string, updates: Partial<SetEntry>) => void;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}
```

---

## 7. Mejoras de UI/UX

### 7.1 Modificaciones a `WorkoutExerciseItem.tsx`

**Cambios requeridos:**

1. **Indicador de progreso prominente:**
   ```tsx
   <div className="flex items-center gap-2 mb-4">
     <Badge variant="default" className="text-lg px-4 py-2">
       Serie {completedSets + 1} de {totalSets}
     </Badge>
   </div>
   ```

2. **Peso de sesión anterior:**
   ```tsx
   {previousWeight && (
     <div className="text-sm text-muted-foreground mb-2">
       Última sesión: {previousWeight}kg
     </div>
   )}
   ```

3. **Edición de series completadas:**
   - Actualmente: el botón de completar togglea `completed`
   - Nuevo: series completadas permanecen editables, con indicador visual
   ```tsx
   <div className={cn(
     "p-4 space-y-4 rounded-lg transition-colors",
     set.completed ? "bg-primary/10 border border-primary/20" : "bg-muted/30"
   )}>
     {set.completed && (
       <Badge variant="secondary" className="mb-2">Completada</Badge>
     )}
     {/* Controles de edición siempre visibles */}
   </div>
   ```

4. **Botón de deshacer:**
   ```tsx
   <Button
     variant="ghost"
     size="sm"
     onClick={onUndo}
     disabled={!canUndo}
   >
     <Undo2 className="w-4 h-4 mr-1" />
     Deshacer
   </Button>
   ```

5. **Agregar/eliminar series:**
   ```tsx
   <div className="flex gap-2 mt-4">
     <Button variant="outline" size="sm" onClick={onAddSet}>
       <Plus className="w-4 h-4 mr-1" />
       Agregar serie
     </Button>
   </div>
   ```

### 7.2 Nuevo Componente: `DraftRecoveryModal.tsx`

Modal que aparece al iniciar la app si existe un borrador:

```tsx
interface DraftRecoveryModalProps {
  draft: DraftSession;
  onRecover: () => void;
  onDiscard: () => void;
}

// Muestra:
// - "Tienes una sesión en progreso"
// - Fecha de inicio
// - Ejercicios completados/total
// - Botones: "Continuar" | "Descartar"
```

### 7.3 Nuevo Componente: `SessionActiveIndicator.tsx`

Badge en la navegación principal:

```tsx
// En sidebar o header
{hasActiveSession && (
  <Badge variant="default" className="animate-pulse">
    <Dumbbell className="w-3 h-3 mr-1" />
    Sesión activa
  </Badge>
)}
```

### 7.4 Vista Previa del Siguiente Ejercicio

En `workout-session.tsx`, después del ejercicio activo:

```tsx
{nextExercise && (
  <Card className="border-dashed opacity-60">
    <CardHeader className="py-3">
      <CardTitle className="text-sm font-medium">
        Siguiente: {nextExercise.name}
      </CardTitle>
      <p className="text-xs text-muted-foreground">
        {nextExercise.targetSeries} series
      </p>
    </CardHeader>
  </Card>
)}
```

---

## 8. Implementación del Undo

### 8.1 Estrategia

**Decisión: Historial de estados en memoria (máximo 10 estados)**

```typescript
// En WorkoutSessionProvider
const [stateHistory, setStateHistory] = useState<WorkoutExercise[][]>([]);
const [historyIndex, setHistoryIndex] = useState(-1);

const saveToHistory = (newExercises: WorkoutExercise[]) => {
  setStateHistory((prev) => {
    const newHistory = [...prev.slice(historyIndex + 1), newExercises].slice(-10);
    return newHistory;
  });
  setHistoryIndex((prev) => Math.min(prev + 1, 9));
};

const undoLastChange = () => {
  if (historyIndex > 0) {
    setHistoryIndex((prev) => prev - 1);
    setExercises(stateHistory[historyIndex - 1]);
  }
};
```

**Alternativa rechazada:** Undo por acción individual (complejo, propenso a inconsistencias).

---

## 9. Migración de Datos

### 9.1 Schema Migration

```bash
# Crear migración
npx prisma migrate dev --name add_workout_exercise_model

# Contenido de la migración:
# 1. Crear tabla WorkoutExercise
# 2. Agregar workoutExerciseId a SetEntry
# 3. Migrar datos existentes (si los hay)
# 4. Eliminar sessionId y exerciseId de SetEntry (o mantener como redundancia)
```

### 9.2 Migración de Código

| Archivo | Cambio |
|---------|--------|
| `WorkoutSessionProvider.tsx` | Agregar persistencia localStorage, undo, nuevos actions |
| `workout-session.tsx` | Manejar recuperación de borrador, construir payload de commit |
| `WorkoutExerciseItem.tsx` | UI para edición de completadas, indicadores |
| `workoutActions.ts` | Deprecar, reemplazar por `commit-workout-session.actions.ts` |
| `src/core/types/index.ts` | Agregar tipos de draft y commit |

---

## 10. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| localStorage lleno | Baja | Medio | Validar tamaño antes de guardar, limpiar sesiones antiguas |
| Transacción muy grande | Media | Alto | Limitar series por sesión (máx 100), monitorear performance |
| Borrador corrupto | Baja | Medio | Validar schema al recuperar, ofrecer descartar si falla |
| Usuario cierra antes de commit | Alta | Crítico | Auto-guardado continuo en localStorage |
| Migración de BD falla | Baja | Crítico | Backup antes de migrar, rollback plan |

---

## 11. Checklist de Implementación

### Fase 1: Infraestructura

- [ ] Crear tipos `DraftSession`, `CommitSessionPayload`, `CommitSessionResult`
- [ ] Crear utilidad `draft-session-storage.ts`
- [ ] Crear hook `useDraftSession.ts`
- [ ] Agregar modelo `WorkoutExercise` al schema Prisma
- [ ] Ejecutar migración de BD

### Fase 2: Server Action

- [ ] Crear `commit-workout-session.actions.ts`
- [ ] Implementar transacción atómica
- [ ] Agregar validación de payload
- [ ] Manejo de errores robusto

### Fase 3: Contexto y Estado

- [ ] Refactorizar `WorkoutSessionProvider.tsx` para usar localStorage
- [ ] Implementar recuperación de borrador al iniciar
- [ ] Implementar undo (historial de estados)
- [ ] Agregar nuevos actions: `addSet`, `removeSet`, `undoLastChange`

### Fase 4: UI

- [ ] Modificar `WorkoutExerciseItem.tsx` para edición de completadas
- [ ] Crear `DraftRecoveryModal.tsx`
- [ ] Crear `SessionActiveIndicator.tsx`
- [ ] Agregar vista previa del siguiente ejercicio
- [ ] Mejorar indicadores de progreso

### Fase 5: Integración

- [ ] Conectar `workout-session.tsx` con nueva server action
- [ ] Manejar flujo de finalización (commit → limpieza → resumen)
- [ ] Manejar errores de commit con reintento
- [ ] Deprecar `workoutActions.ts`

---

## 12. Referencias

- PRD: `docs/product/features/v0.2.0-log-workout-session.md`
- Reporte de exploración: Engram #43
- Schema actual: `prisma/schema.prisma`
- Contexto actual: `src/modules/log-workout/modules/session/contexts/WorkoutSessionContext/`

---

## Historial de Cambios

| Versión | Fecha | Cambio |
|---------|-------|--------|
| 1.0 | 2026-03-17 | Versión inicial del RFC |
