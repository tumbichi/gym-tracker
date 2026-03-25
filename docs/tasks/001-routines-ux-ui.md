# Checklist de Tareas: Mejoras de UX/UI para el Módulo de Rutinas

Este documento detalla las tareas de implementación para las mejoras de UX/UI del módulo de rutinas, siguiendo el RFC `rfc-routines-ux-ui.md` y el PRD `001-gestion-rutinas.md`.

## 🚀 Fase 1: Correcciones Críticas (1-2 días)

### 1.1. Actualizar Callback de Creación de Ejercicio (Problema #4)

- [ ] **ID**: F1-T1.1
- **Descripción**: Modificar la interfaz `CreateExerciseData` para incluir `primaryGroup` y `equipment`. Actualizar `ExercisePicker.tsx` para pasar estos datos en el callback `onCreate` y `routine-editor.feature.tsx` para recibirlos y usarlos al crear el ejercicio. Finalmente, actualizar `routines.actions.ts` para que la acción de crear ejercicio pueda recibir y persistir estos nuevos campos.
- **Archivos a modificar/crear**:
  - `src/modules/routines/types/index.ts` (o archivo de tipos relevante)
  - `src/modules/routines/components/ExercisePicker.tsx`
  - `src/modules/routines/features/routine-editor.feature.tsx`
  - `src/modules/routines/actions/routines.actions.ts`
- **Dependencias**: Ninguna.
- **Criterios de aceptación**:
  - Al crear un ejercicio desde el `ExercisePicker` en el editor de rutinas, los campos de "grupo muscular principal" y "equipamiento" seleccionados en el picker se guardan correctamente con el nuevo ejercicio en la base de datos.
  - El ejercicio creado aparece con su `primaryGroup` y `equipment` en el catálogo de ejercicios.
- **Notas técnicas**: Asegurarse de que la validación de `name` en `CreateExerciseData` siga siendo obligatoria.

### 1.2. Nombre de Día Editable en Móvil (Problema #2)

- [ ] **ID**: F1-T1.2
- **Descripción**: Rediseñar el header del componente `DayEditor.tsx` para que el nombre del día sea claramente editable en dispositivos móviles. Implementar la "Opción B - Botón de edición explícito" del RFC, mostrando un botón "Editar" junto al nombre del día que, al hacer clic, convierta el `h3` en un `Input` editable.
- **Archivos a modificar/crear**:
  - `src/modules/routines/components/DayEditor.tsx`
- **Dependencias**: Ninguna.
- **Criterios de aceptación**:
  - En móvil, el nombre del día en el `DayEditor` muestra un botón "Editar" visible y táctil.
  - Al hacer clic en "Editar", el nombre del día se convierte en un campo de texto editable.
  - Al salir del campo de texto (blur o Enter), el nombre se guarda y vuelve a mostrarse como texto estático.
  - El nombre del día se actualiza correctamente en el estado de la rutina.
- **Notas técnicas**: Considerar el uso de un estado local (`isEditingName`) dentro de `DayEditor` para controlar la visibilidad del `Input`.

### 1.3. Botones de Acción con Labels para Móvil (Problema #5)

- [ ] **ID**: F1-T1.3
- **Descripción**: Reemplazar los `Tooltip`s en `ExerciseRow.tsx` por botones con labels de texto visibles para las acciones de mover (arriba/abajo) y eliminar. Implementar la "Opción A - Botones con texto" del RFC.
- **Archivos a modificar/crear**:
  - `src/modules/routines/components/ExerciseRow.tsx`
- **Dependencias**: Ninguna.
- **Criterios de aceptación**:
  - Los botones de "Subir", "Bajar" y "Eliminar" en cada `ExerciseRow` son visibles y contienen texto descriptivo.
  - Los botones tienen un área táctil mínima de 44x44px.
  - Las acciones de mover y eliminar funcionan correctamente.
- **Notas técnicas**: Asegurarse de que los iconos (`ArrowUp`, `ArrowDown`, `Trash2`) se mantengan junto al texto para una mejor comprensión visual.

## 🚧 Fase 2: Rediseño del Editor (3-5 días)

### 2.1. Mover Editor a Página Dedicada (Problema #1)

- [ ] **ID**: F2-T2.1
- **Descripción**: Refactorizar el editor de rutinas para que funcione como una página dedicada en lugar de un `Dialog`. Esto implica crear nuevas rutas y componentes de página para la creación (`/routines/new`) y edición (`/routines/[id]/edit`) de rutinas.
- **Archivos a modificar/crear**:
  - `src/app/(index)/routines/new/page.tsx` (nuevo)
  - `src/app/(index)/routines/[id]/edit/page.tsx` (nuevo)
  - `src/app/(index)/routines/[id]/layout.tsx` (nuevo, si es necesario para compartir lógica o UI entre `page.tsx` y `edit/page.tsx`)
  - `src/modules/routines/features/routine-list.feature.tsx` (actualizar navegación)
  - `src/modules/routines/features/routine-details.feature.tsx` (actualizar navegación)
  - `src/modules/routines/components/RoutineCard.tsx` (actualizar navegación)
  - `src/modules/routines/features/routine-editor.feature.tsx` (adaptar para ser una página)
- **Dependencias**: F1-T1.1, F1-T1.2, F1-T1.3 (para que el editor refactorizado ya incluya las correcciones críticas).
- **Criterios de aceptación**:
  - Al hacer clic en "Nueva Rutina" o "Editar" desde la lista de rutinas, el usuario es redirigido a una página completa de edición/creación.
  - La URL refleja el estado de creación o edición (ej. `/routines/new`, `/routines/123/edit`).
  - El editor ocupa todo el espacio disponible de la pantalla.
  - La navegación "atrás" del navegador funciona correctamente.
- **Notas técnicas**: Considerar cómo manejar el estado de la rutina en la nueva estructura de páginas (Server Components vs Client Components, `useState`, `useReducer`, etc.).

### 2.2. Footer Sticky con Acciones (Problema #3)

- [ ] **ID**: F2-T2.2
- **Descripción**: Implementar un footer fijo en la parte inferior de la página del editor de rutinas que contenga los botones principales de acción ("Agregar día", "Guardar"). Asegurarse de que el footer sea responsive y maneje `safe-area-inset-bottom` para dispositivos móviles.
- **Archivos a modificar/crear**:
  - `src/app/(index)/routines/new/page.tsx`
  - `src/app/(index)/routines/[id]/edit/page.tsx`
  - `src/modules/routines/features/routine-editor.feature.tsx` (o el componente que contenga la estructura principal del editor)
- **Dependencias**: F2-T2.1.
- **Criterios de aceptación**:
  - Los botones "Agregar día" y "Guardar" son siempre visibles en la parte inferior de la pantalla, incluso al hacer scroll en el contenido principal.
  - En dispositivos móviles, el footer respeta las "safe areas" (ej. no se solapa con la barra de gestos).
  - El botón "Cancelar" se mueve al header (ej. como un icono de "X" o "Volver").
- **Notas técnicas**: Utilizar clases de Tailwind CSS como `fixed`, `bottom-0`, `left-0`, `right-0`, `p-4`, `bg-background`, `border-t` y la variable CSS `pb-[env(safe-area-inset-bottom)]`.

### 2.3. Sistema de Feedback Visual (Problema #6)

- [ ] **ID**: F2-T2.3
- **Descripción**: Implementar un sistema de feedback visual en el editor de rutinas que incluya:
  1.  **Indicador de cambios sin guardar**: Mostrar una `Badge` o similar en el header cuando haya cambios pendientes.
  2.  **Animaciones de transición**: Añadir animaciones sutiles al agregar o eliminar días/ejercicios.
  3.  **Estados de carga inline**: Mostrar un spinner o texto "Guardando..." en el botón de guardar mientras se realiza la operación.
- **Archivos a modificar/crear**:
  - `src/modules/routines/features/routine-editor.feature.tsx`
  - `src/modules/routines/components/DayEditor.tsx`
  - `src/modules/routines/components/ExerciseRow.tsx`
  - `src/core/components/ui/badge.tsx` (si se necesita personalizar)
- **Dependencias**: F2-T2.1, F2-T2.2.
- **Criterios de aceptación**:
  - Una `Badge` "Cambios sin guardar" aparece en el header cuando el usuario modifica la rutina y desaparece al guardar.
  - Al agregar un nuevo día o ejercicio, este aparece con una animación de entrada.
  - Al eliminar un día o ejercicio, este desaparece con una animación de salida.
  - El botón "Guardar" muestra un estado de carga visual (spinner, texto) mientras la operación de guardado está en curso.
  - Se previene la navegación si hay cambios sin guardar (usando `beforeunload`).
- **Notas técnicas**: Para las animaciones, se pueden usar clases de Tailwind CSS como `animate-in`, `fade-in`, `slide-in-from-top-2`, `duration-200`, etc. Para el indicador de cambios sin guardar, se puede usar un `useState` y un `useEffect` para el `beforeunload` event.

## 🏗️ Fase 3: Rediseño de ExerciseRow (2-3 días)

### 3.1. Secciones Colapsables y DropdownMenu en ExerciseRow (Problema #7)

- [ ] **ID**: F3-T3.1
- **Descripción**: Rediseñar el componente `ExerciseRow.tsx` para mejorar la jerarquía visual y reducir la carga cognitiva. Esto incluye:
  1.  Mover las acciones de mover y eliminar a un `DropdownMenu` accesible desde un icono "Más opciones" (`MoreVertical`).
  2.  Implementar secciones colapsables (`Collapsible`) para la configuración avanzada de repeticiones por serie y para el campo de notas.
- **Archivos a modificar/crear**:
  - `src/modules/routines/components/ExerciseRow.tsx`
  - `src/core/components/ui/collapsible.tsx` (si no existe, añadirlo via shadcn/ui)
  - `src/core/components/ui/dropdown-menu.tsx` (si no existe, añadirlo via shadcn/ui)
- **Dependencias**: F1-T1.3 (los botones de acción ya deben estar refactorizados).
- **Criterios de aceptación**:
  - Las acciones de "Subir", "Bajar" y "Eliminar" para un ejercicio están agrupadas en un `DropdownMenu`.
  - La configuración de repeticiones por serie (individuales) está oculta por defecto y se muestra al expandir una sección colapsable.
  - El campo de notas está oculto por defecto y se muestra al expandir una sección colapsable.
  - La `ExerciseRow` es más compacta visualmente cuando las secciones colapsables están cerradas.
- **Notas técnicas**: Asegurarse de que el estado de las secciones colapsables (`showAdvanced`, `showNotes`) se maneje correctamente y persista si el componente se re-renderiza.

### 3.2. Layout Optimizado en ExerciseRow

- [ ] **ID**: F3-T3.2
- **Descripción**: Optimizar el layout de la `ExerciseRow` para un mejor uso del espacio, especialmente en móvil. Esto incluye:
  1.  Implementar un layout de 2 columnas para los steppers de "Series" y "Reps" básicos.
  2.  Reducir el padding general de la `ExerciseRow` en dispositivos móviles.
- **Archivos a modificar/crear**:
  - `src/modules/routines/components/ExerciseRow.tsx`
- **Dependencias**: F3-T3.1.
- **Criterios de aceptación**:
  - Los steppers de "Series" y "Reps" (globales) se muestran en una disposición de 2 columnas.
  - En pantallas pequeñas, la `ExerciseRow` ocupa menos espacio vertical, permitiendo ver más ejercicios sin scroll.
- **Notas técnicas**: Utilizar clases de Tailwind CSS como `grid`, `grid-cols-2`, `gap-4`, y clases responsivas como `sm:p-X`, `md:p-Y` para ajustar el padding.

## ✅ Fase 4: Testing y Refinamiento (1-2 días)

### 4.1. Testing en Dispositivos Reales

- [ ] **ID**: F4-T4.1
- **Descripción**: Realizar pruebas exhaustivas del módulo de rutinas en dispositivos móviles iOS y Android, así como en diferentes navegadores de escritorio, para identificar y corregir cualquier problema de UX/UI, rendimiento o compatibilidad.
- **Archivos a modificar/crear**: Ninguno (solo reporte de bugs).
- **Dependencias**: Todas las fases anteriores completadas.
- **Criterios de aceptación**:
  - El editor de rutinas es completamente funcional y usable en iOS y Android.
  - No hay problemas de layout, scroll, o interacción en diferentes tamaños de pantalla.
  - El rendimiento es fluido en todos los dispositivos probados.
- **Notas técnicas**: Documentar cualquier bug encontrado con capturas de pantalla y pasos para reproducir.

### 4.2. Testing de Accesibilidad

- [ ] **ID**: F4-T4.2
- **Descripción**: Realizar pruebas de accesibilidad utilizando herramientas como VoiceOver (iOS/macOS) y TalkBack (Android) para asegurar que el editor de rutinas sea usable por personas con discapacidades visuales. Verificar el orden de tabulación, los `aria-label`s y la semántica de los elementos.
- **Archivos a modificar/crear**:
  - `src/modules/routines/components/DayEditor.tsx` (revisar `aria-label`s)
  - `src/modules/routines/components/ExerciseRow.tsx` (revisar `aria-label`s)
  - `src/modules/routines/components/ExercisePicker.tsx` (revisar `aria-label`s)
  - Otros componentes interactivos que se hayan modificado.
- **Dependencias**: Todas las fases anteriores completadas.
- **Criterios de aceptación**:
  - Todos los elementos interactivos son correctamente anunciados por los lectores de pantalla.
  - La navegación por teclado es lógica y predecible.
  - No hay elementos inaccesibles o con información faltante para usuarios de lectores de pantalla.
- **Notas técnicas**: Consultar las guías WCAG 2.1 para asegurar el cumplimiento de los estándares de accesibilidad.

### 4.3. Ajustes de Espaciado y Tipografía

- [ ] **ID**: F4-T4.3
- **Descripción**: Realizar un pase final de refinamiento visual, ajustando el espaciado, los tamaños de fuente y los colores para asegurar una estética consistente y agradable en todo el módulo de rutinas.
- **Archivos a modificar/crear**:
  - `src/modules/routines/**/*.tsx` (componentes visuales)
  - `src/core/styles/globals.css` (si se necesitan ajustes globales)
- **Dependencias**: Todas las fases anteriores completadas.
- **Criterios de aceptación**:
  - El espaciado entre elementos es consistente y equilibrado.
  - La tipografía es legible y jerárquica.
  - Los colores son coherentes con el diseño general de la aplicación.
  - No hay "pixel-perfect" issues evidentes.
- **Notas técnicas**: Prestar especial atención a la consistencia entre los diferentes componentes y vistas del módulo.

### 4.4. Documentación de Cambios

- [ ] **ID**: F4-T4.4
- **Descripción**: Actualizar la documentación relevante (ej. `ARCHITECTURE.md`, `AGENTS.md`, `README.md` si aplica) con los cambios significativos introducidos por estas mejoras de UX/UI, incluyendo nuevas convenciones, patrones o componentes.
- **Archivos a modificar/crear**:
  - `docs/architecture/ARCHITECTURE.md`
  - `AGENTS.md`
  - `README.md`
- **Dependencias**: Todas las fases anteriores completadas.
- **Criterios de aceptación**:
  - La documentación refleja con precisión los cambios implementados.
  - Otros desarrolladores pueden entender la nueva estructura y patrones sin dificultad.
- **Notas técnicas**: Enfocarse en los cambios de alto nivel y las decisiones de diseño, no en cada línea de código.
