# Checklist de Tareas: Refactor de Log Workout

## Fase 1: Infraestructura y Tipos

-   [ ] **(Backend)** Tarea 1.1: Modificar `prisma/schema.prisma` para agregar el modelo `WorkoutExercise` con `id`, `sessionId`, `exerciseId`, `order`, `notes`, `sets` y relaciones.
    *   **Archivos:** `prisma/schema.prisma`
-   [ ] **(Backend)** Tarea 1.2: Modificar `prisma/schema.prisma` para actualizar el modelo `SetEntry` agregando `workoutExerciseId` y su relación, y manteniendo `exerciseId` como redundancia.
    *   **Archivos:** `prisma/schema.prisma`
-   [ ] **(Backend)** Tarea 1.3: Ejecutar `npx prisma migrate dev --name add_workout_exercise_model` para generar y aplicar la migración de la base de datos.
    *   **Archivos:** `prisma/migrations/*`
-   [ ] **(Frontend)** Tarea 1.4: Crear el archivo `src/modules/log-workout/modules/session/types/draft-session.ts` con la interfaz `DraftSession` y constantes `DRAFT_SESSION_STORAGE_KEY`, `DRAFT_SESSION_VERSION`.
    *   **Archivos:** `src/modules/log-workout/modules/session/types/draft-session.ts`
-   [ ] **(Frontend)** Tarea 1.5: Crear el archivo `src/modules/log-workout/modules/session/types/commit-payload.ts` con las interfaces `CommitSetEntryPayload`, `CommitWorkoutExercisePayload`, `CommitSessionPayload`.
    *   **Archivos:** `src/modules/log-workout/modules/session/types/commit-payload.ts`
-   [ ] **(Frontend)** Tarea 1.6: Crear el archivo `src/modules/log-workout/modules/session/types/commit-result.ts` con el tipo `CommitSessionResult`.
    *   **Archivos:** `src/modules/log-workout/modules/session/types/commit-result.ts`
-   [ ] **(Frontend)** Tarea 1.7: Crear la utilidad `src/modules/log-workout/modules/session/utils/draft-session-storage.ts` para abstraer la lógica de `localStorage` (guardar, cargar, limpiar).
    *   **Archivos:** `src/modules/log-workout/modules/session/utils/draft-session-storage.ts`
-   [ ] **(Frontend)** Tarea 1.8: Crear el hook `src/modules/log-workout/modules/session/contexts/WorkoutSessionContext/hooks/useDraftSession.ts` para manejar la persistencia del borrador con `localStorage`.
    *   **Archivos:** `src/modules/log-workout/modules/session/contexts/WorkoutSessionContext/hooks/useDraftSession.ts`

## Fase 2: Server Action

-   [ ] **(Backend)** Tarea 2.1: Crear el archivo `src/modules/log-workout/actions/commit-workout-session.actions.ts`.
    *   **Archivos:** `src/modules/log-workout/actions/commit-workout-session.actions.ts`
-   [ ] **(Backend)** Tarea 2.2: Implementar la función `commitWorkoutSession` en `commit-workout-session.actions.ts` con la lógica de transacción atómica usando `prisma.$transaction` para crear `WorkoutSession`, `WorkoutExercise` y `SetEntry`.
    *   **Archivos:** `src/modules/log-workout/actions/commit-workout-session.actions.ts`
-   [ ] **(Backend)** Tarea 2.3: Añadir la lógica para revalidar las rutas `/log-workout`, `/statistics`, `/history` después de un commit exitoso.
    *   **Archivos:** `src/modules/log-workout/actions/commit-workout-session.actions.ts`
-   [ ] **(Backend)** Tarea 2.4: Implementar el manejo de errores robusto en `commitWorkoutSession` para retornar `CommitSessionResult` adecuado en caso de fallo de transacción, validación o error desconocido.
    *   **Archivos:** `src/modules/log-workout/actions/commit-workout-session.actions.ts`
-   [ ] **(Backend)** Tarea 2.5: (Opcional, si aplica) Implementar validación de `CommitSessionPayload` usando Zod u otra librería de validación.
    *   **Archivos:** `src/modules/log-workout/actions/commit-workout-session.actions.ts`

## Fase 3: Contexto y Estado Frontend

-   [ ] **(Frontend)** Tarea 3.1: Refactorizar `src/modules/log-workout/modules/session/contexts/WorkoutSessionContext/WorkoutSessionProvider.tsx` para integrar la carga y guardado del borrador desde/hacia `localStorage` usando el hook `useDraftSession`.
    *   **Archivos:** `src/modules/log-workout/modules/session/contexts/WorkoutSessionContext/WorkoutSessionProvider.tsx`
-   [ ] **(Frontend)** Tarea 3.2: Implementar la lógica de recuperación de borrador (`recoverDraft`) al iniciar el `WorkoutSessionProvider` si existe un borrador en `localStorage`.
    *   **Archivos:** `src/modules/log-workout/modules/session/contexts/WorkoutSessionContext/WorkoutSessionProvider.tsx`
-   [ ] **(Frontend)** Tarea 3.3: Implementar la funcionalidad de "undo" en `WorkoutSessionProvider.tsx` manteniendo un historial de estados en memoria (máximo 10 estados).
    *   **Archivos:** `src/modules/log-workout/modules/session/contexts/WorkoutSessionContext/WorkoutSessionProvider.tsx`
-   [ ] **(Frontend)** Tarea 3.4: Agregar las nuevas acciones `addSet`, `removeSet`, `undoLastChange`, `setSessionNotes` a la interfaz del contexto y su implementación en `WorkoutSessionProvider.tsx`.
    *   **Archivos:** `src/modules/log-workout/modules/session/contexts/WorkoutSessionContext/WorkoutSessionProvider.tsx`
-   [ ] **(Frontend)** Tarea 3.5: Actualizar `src/modules/log-workout/modules/session/contexts/WorkoutSessionContext/hooks/useWorkoutSessionActions.ts` para exponer las nuevas acciones.
    *   **Archivos:** `src/modules/log-workout/modules/session/contexts/WorkoutSessionContext/hooks/useWorkoutSessionActions.ts`
-   [ ] **(Frontend)** Tarea 3.6: Actualizar `src/modules/log-workout/modules/session/contexts/WorkoutSessionContext/index.ts` para reflejar los cambios en la interfaz del contexto.
    *   **Archivos:** `src/modules/log-workout/modules/session/contexts/WorkoutSessionContext/index.ts`

## Fase 4: UI

-   [ ] **(Frontend)** Tarea 4.1: Modificar `src/modules/log-workout/modules/session/components/WorkoutExerciseItem.tsx` para mostrar un indicador de progreso prominente (`Serie X de Y`).
    *   **Archivos:** `src/modules/log-workout/modules/session/components/WorkoutExerciseItem.tsx`
-   [ ] **(Frontend)** Tarea 4.2: Modificar `src/modules/log-workout/modules/session/components/WorkoutExerciseItem.tsx` para mostrar el peso de la última sesión (`previousWeight`).
    *   **Archivos:** `src/modules/log-workout/modules/session/components/WorkoutExerciseItem.tsx`
-   [ ] **(Frontend)** Tarea 4.3: Modificar `src/modules/log-workout/modules/session/components/WorkoutExerciseItem.tsx` para permitir la edición de series completadas y añadir un indicador visual de "Completada".
    *   **Archivos:** `src/modules/log-workout/modules/session/components/WorkoutExerciseItem.tsx`
-   [ ] **(Frontend)** Tarea 4.4: Modificar `src/modules/log-workout/modules/session/components/WorkoutExerciseItem.tsx` para integrar el botón de "Deshacer" (`undoLastChange`).
    *   **Archivos:** `src/modules/log-workout/modules/session/components/WorkoutExerciseItem.tsx`
-   [ ] **(Frontend)** Tarea 4.5: Modificar `src/modules/log-workout/modules/session/components/WorkoutExerciseItem.tsx` para integrar los botones de "Agregar serie" y "Eliminar serie".
    *   **Archivos:** `src/modules/log-workout/modules/session/components/WorkoutExerciseItem.tsx`
-   [ ] **(Frontend)** Tarea 4.6: Crear el componente `src/modules/log-workout/modules/session/components/DraftRecoveryModal.tsx` para mostrar el modal de recuperación de borrador.
    *   **Archivos:** `src/modules/log-workout/modules/session/components/DraftRecoveryModal.tsx`
-   [ ] **(Frontend)** Tarea 4.7: Crear el componente `src/modules/log-workout/modules/session/components/SessionActiveIndicator.tsx` para mostrar un badge en la navegación principal si hay una sesión activa.
    *   **Archivos:** `src/modules/log-workout/modules/session/components/SessionActiveIndicator.tsx`
-   [ ] **(Frontend)** Tarea 4.8: Modificar `src/modules/log-workout/modules/session/features/workout-session.tsx` para mostrar la vista previa del siguiente ejercicio.
    *   **Archivos:** `src/modules/log-workout/modules/session/features/workout-session.tsx`

## Fase 5: Integración y Limpieza

-   [ ] **(Frontend)** Tarea 5.1: Modificar `src/modules/log-workout/modules/session/features/workout-session.tsx` para construir el `CommitSessionPayload` a partir del estado del borrador.
    *   **Archivos:** `src/modules/log-workout/modules/session/features/workout-session.tsx`
-   [ ] **(Frontend)** Tarea 5.2: Conectar `src/modules/log-workout/modules/session/features/workout-session.tsx` con la nueva server action `commitWorkoutSession`.
    *   **Archivos:** `src/modules/log-workout/modules/session/features/workout-session.tsx`
-   [ ] **(Frontend)** Tarea 5.3: Implementar el flujo de finalización en `workout-session.tsx`: llamar a `commitWorkoutSession`, limpiar el borrador de `localStorage` si es exitoso, y mostrar resumen/error.
    *   **Archivos:** `src/modules/log-workout/modules/session/features/workout-session.tsx`
-   [ ] **(Frontend)** Tarea 5.4: Integrar `DraftRecoveryModal.tsx` en `src/modules/log-workout/modules/session/features/workout-session.tsx` o en un layout superior para que aparezca al cargar la app.
    *   **Archivos:** `src/modules/log-workout/modules/session/features/workout-session.tsx`, `src/app/layout.tsx` (o similar)
-   [ ] **(Frontend)** Tarea 5.5: Integrar `SessionActiveIndicator.tsx` en el layout principal de la aplicación (sidebar o header).
    *   **Archivos:** `src/app/layout.tsx` (o similar)
-   [ ] **(Backend)** Tarea 5.6: Deprecar y eliminar el archivo `src/modules/log-workout/actions/workoutActions.ts` (o el archivo equivalente que manejaba el guardado anterior).
    *   **Archivos:** `src/modules/log-workout/actions/workoutActions.ts` (o el archivo a reemplazar)
-   [ ] **(Frontend)** Tarea 5.7: Actualizar cualquier referencia a `workoutActions.ts` en el frontend para usar la nueva server action o las acciones del contexto.
    *   **Archivos:** Varios archivos en `src/modules/log-workout/`