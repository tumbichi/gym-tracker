# Informe de auditoría: mejoras UX/UI del módulo de rutinas

## 1. Evaluación general

**Resultado**: ❌ NECESITA_CORRECCIÓN

**Resumen**: Si bien muchas de las mejoras de UI a nivel de componentes están correctamente implementadas, existen múltiples fallas arquitectónicas críticas y funcionalidades incompletas que impiden aprobar esta auditoría. En particular, el editor antiguo basado en diálogos no fue eliminado completamente, el nuevo editor no implementa el footer fijo requerido por el RFC, y se introdujo un antipatrón arquitectónico al hacer fetch de datos en el cliente.

---

## 2. Cumplimiento del PRD (requisitos de negocio)

- ✅ **Cumplido**: La mayoría de las reglas de negocio están correctamente implementadas: creación de rutinas (nombre, días), gestión de días (agregar, renombrar), gestión de ejercicios (agregar, eliminar, reordenar), configuración de series y repeticiones.
- ✅ **Cumplido**: La lógica para archivar rutinas con historial de sesiones en lugar de eliminarlas está correctamente implementada.
- ❌ **No cumplido**: Falta validación en `ExercisePicker.tsx` para evitar agregar ejercicios duplicados en un mismo día. Este es un requisito del PRD.
- ⚠️ **Inconsistencia menor**: En el schema de Zod (`routines.actions.ts`), el límite máximo de repeticiones está en `200`, pero el PRD define un máximo de `50`.

---

## 3. Cumplimiento del RFC (UX/UI)

- ❌ **No cumplido (crítico)**: **Editor como página (Problema #1)**  
  El nuevo editor (`/new`, `/[id]/edit`) existe, pero el editor antiguo basado en diálogos sigue activo y se puede abrir desde la lista y el detalle. El refactor está incompleto.

- ✅ **Cumplido**: **Edición de nombre de día (Problema #2)**  
  `DayEditor.tsx` implementa correctamente un botón explícito de edición.

- ❌ **No cumplido (crítico)**: **Footer fijo (Problema #3)**  
  No está implementado el footer fijo con acciones (“Agregar día”, “Guardar”) en el nuevo editor.

- ✅ **Cumplido**: **Pérdida de datos al crear ejercicios (Problema #4)**  
  Se corrigió el pasaje de `primaryGroup` y `equipment`.

- ✅ **Cumplido**: **Etiquetas de botones (Problema #5)**  
  `ExerciseRow.tsx` usa `DropdownMenu` en lugar de tooltips, mejorando la UX en mobile.

- ⚠️ **Parcialmente cumplido**: **Feedback visual (Problema #6)**  
  Hay estados de loading y animaciones, pero falta indicar “cambios sin guardar”.

- ✅ **Cumplido**: **Rediseño de ExerciseRow (Problema #7)**  
  Implementación completa según RFC (colapsable + menú de acciones).

---

## 4. Arquitectura (SDD)

- ⚠️ **Problema (crítico)**: **Fetch en cliente**  
  Las páginas (`new/page.tsx`, `edit/page.tsx`) usan `useEffect` para obtener datos. Esto viola las buenas prácticas de Next.js App Router.  
  → Debe hacerse en server components y pasar por props.

- ✅ **Cumplido**: Separación Smart/Dumb components correcta en general.

- ✅ **Cumplido**: Páginas “thin” bien implementadas en listados y detalle.

- ⚠️ **Problema menor**: Duplicación de `parseReps`.

---

## 5. Accesibilidad

- ⚠️ **Problema menor**: Tamaño de targets táctiles  
  `DropdownMenuTrigger` es de 36x36px (debería ser 44x44px).

- ✅ **Cumplido**: Uso correcto de `aria-label` y textos accesibles.

---

## 6. Acciones requeridas

### 🔴 Alta prioridad

1. **Eliminar completamente el editor por diálogo**
   - Cambiar navegación:
     - Lista → `/routines/new`
     - Detalle → `/routines/[id]/edit`
   - Eliminar código legacy basado en `Dialog`.

2. **Implementar footer fijo**
   - Extraer acciones del editor y colocarlas en layout con posición fija.

3. **Refactor de data fetching**
   - Convertir páginas a server components (`async`).
   - Eliminar `useEffect`.
   - Usar:
     - `getAllExercises()`
     - `getRoutineById()`

---

### 🟠 Prioridad media

4. **Evitar ejercicios duplicados**
   - Deshabilitar u ocultar ejercicios ya agregados en el mismo día.
   - Pasar `excludedIds` como prop.

5. **Indicador de cambios sin guardar**
   - Implementar `hasUnsavedChanges`.
   - Mostrar badge en header.
   - Advertir al salir (`beforeunload`).

---

### 🟡 Baja prioridad

6. **Mejoras de calidad**
   - Ajustar máximo de reps a `50`.
   - Eliminar duplicación de `parseReps`.
   - Aumentar tamaño de botones a `44x44px`.
