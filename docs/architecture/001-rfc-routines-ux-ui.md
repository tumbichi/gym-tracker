# RFC: Mejoras de UX/UI para el Módulo de Rutinas

**ID**: rfc-routines-ux-ui
**Estado**: Borrador
**Fecha**: 2026-03-16
**Autor**: architect
**PRD de referencia**: `docs/product/features/001-gestion-rutinas.md`

---

## 1. Resumen Ejecutivo

Este RFC documenta los problemas de UX/UI identificados en el módulo de Gestión de Rutinas y propone soluciones específicas para mejorar la experiencia de usuario, con especial énfasis en usabilidad móvil y accesibilidad.

### Problemas críticos identificados

| #   | Problema                                            | Severidad | Impacto                              |
| --- | --------------------------------------------------- | --------- | ------------------------------------ |
| 1   | Editor en Dialog es muy incómodo para móvil         | Alta      | Bloquea el flujo de creación/edición |
| 2   | Nombre del día no es editable en móvil (hover-only) | Alta      | Confusión del usuario                |
| 3   | Botones de acción requieren mucho scroll            | Media     | Fricción en rutinas largas           |
| 4   | Pérdida de datos al crear ejercicio inline          | Alta      | Datos incompletos                    |
| 5   | Tooltips no funcionan en móvil                      | Media     | Acciones no descubribles             |
| 6   | Falta de feedback visual para acciones              | Media     | Incertidumbre del usuario            |
| 7   | Jerarquía visual confusa en ExerciseRow             | Media     | Carga cognitiva                      |

---

## 2. Análisis Detallado de Problemas

### 2.1 Editor en Dialog (Problema Crítico #1)

**Ubicación**: `routine-list.feature.tsx` líneas 113-128, `routine-details.feature.tsx` líneas 77-92

**Descripción actual**:

```tsx
<Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
  <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-4xl'>
    {/* Editor completo */}
  </DialogContent>
</Dialog>
```

**Problemas específicos**:

- El Dialog limita el espacio vertical a 90vh con scroll interno
- En móvil (375px de ancho), el contenido se comprime excesivamente
- El usuario pierde contexto de dónde está (lista vs editor)
- No hay forma de "ver" la rutina mientras se edita
- El teclado virtual en móvil reduce aún más el espacio disponible

**Impacto en el usuario**:

- Crear una rutina de 4 días con 5 ejercicios cada uno requiere ~20 scrolls
- El usuario no puede comparar lo que está editando con otras rutinas
- La sensación es de "encierro" en un espacio reducido

### 2.2 Nombre del día no editable en móvil (Problema Crítico #2)

**Ubicación**: `DayEditor.tsx` líneas 66-75

**Descripción actual**:

```tsx
<div className='group relative mr-4 flex-1'>
  <Input
    value={day.name}
    className='border-none p-0 pr-8 text-2xl font-bold shadow-none focus-visible:ring-0'
  />
  <Pencil className='text-muted-foreground absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 transform opacity-0 transition-opacity group-hover:opacity-100' />
</div>
```

**Problemas específicos**:

- El icono de lápiz tiene `opacity-0 group-hover:opacity-100`
- En dispositivos táctiles no existe el estado hover
- El Input parece texto estático, no un campo editable
- El usuario asume que el nombre del día no se puede cambiar

**Impacto en el usuario**:

- El PRD especifica que el usuario puede editar el nombre del día
- Sin esta funcionalidad descubrible, el feature es inutilizable en móvil

### 2.3 Botones de acción requieren scroll (Problema #3)

**Ubicación**: `routine-editor.feature.tsx` líneas 247-260

**Descripción actual**:

```tsx
<Button variant="outline" onClick={handleAddDay} disabled={...}>
  Agregar día
</Button>

<div className="flex justify-end gap-2 pt-4">
  <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
  <Button onClick={handleSubmit}>Guardar cambios</Button>
</div>
```

**Problemas específicos**:

- Los botones están al final del formulario
- En rutinas con múltiples días, el usuario debe scrollear hasta el final
- No hay atajo para guardar sin scrollear
- El botón "Agregar día" está separado de los días existentes

**Impacto en el usuario**:

- Fricción innecesaria en cada edición
- Riesgo de perder cambios si el usuario cierra sin guardar

### 2.4 Pérdida de datos al crear ejercicio inline (Problema Crítico #4)

**Ubicación**:

- `ExercisePicker.tsx` líneas 41-44, 58-65
- `routine-editor.feature.tsx` líneas 165-186

**Descripción actual**:

```tsx
// ExercisePicker permite seleccionar grupo muscular y equipamiento
<Select value={newExerciseGroup} onValueChange={setNewExerciseGroup}>
  {/* opciones */}
</Select>
<Select value={newExerciseEquipment} onValueChange={setNewExerciseEquipment}>
  {/* opciones */}
</Select>

// Pero onCreate solo recibe el nombre
const handleCreateExerciseRequest = async (dayIndex: number, itemIndex: number, name: string) => {
  const payload: CreateExercisePayload = {
    name: name.trim(), // Solo el nombre!
  };
  // ...
}
```

**Problemas específicos**:

- El usuario completa grupo muscular y equipamiento
- Estos datos se pierden porque `onCreate` solo acepta un string
- El ejercicio se crea con datos incompletos
- El usuario debe ir al catálogo de ejercicios para completar la info

**Impacto en el usuario**:

- Frustración por trabajo perdido
- Datos incompletos en el catálogo
- Flujo interrumpido

### 2.5 Tooltips no funcionan en móvil (Problema #5)

**Ubicación**: `ExerciseRow.tsx` líneas 82-115

**Descripción actual**:

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant='ghost'
        size='icon'
        disabled={isFirst}
        onClick={() => handleMove('up')}
      >
        <ArrowUp className='h-4 w-4' />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Mover arriba</p>
    </TooltipContent>
  </Tooltip>
  {/* más tooltips... */}
</TooltipProvider>
```

**Problemas específicos**:

- Los tooltips de Radix UI requieren hover para mostrarse
- En móvil, el touch no activa el tooltip
- Los botones de mover/eliminar no tienen label visible
- El usuario debe adivinar la función de cada botón

**Impacto en el usuario**:

- Acciones no descubribles
- Posibles errores por tocar el botón equivocado

### 2.6 Falta de feedback visual (Problema #6)

**Ubicación**: Múltiple

**Problemas específicos**:

- No hay indicador de "cambios sin guardar"
- No hay animación al agregar/eliminar días o ejercicios
- El toast de éxito aparece pero no hay feedback inline
- No hay indicador de carga mientras se guardan cambios

**Impacto en el usuario**:

- Incertidumbre sobre el estado del sistema
- Posible pérdida de cambios por cerrar sin guardar

### 2.7 Jerarquía visual en ExerciseRow (Problema #7)

**Ubicación**: `ExerciseRow.tsx` líneas 60-158

**Descripción actual**:

```tsx
<div className='bg-muted/20 space-y-4 rounded-lg border p-4'>
  {/* Selector de ejercicio */}
  {/* Botones de acción (mover, eliminar) */}
  {/* Stepper de series */}
  {/* Filas de reps por serie */}
  {/* Input de notas */}
</div>
```

**Problemas específicos**:

- Demasiada información en un solo contenedor
- Las filas de reps se multiplican (3 series = 3 filas)
- El campo de notas compite visualmente con los steppers
- No hay separación visual clara entre ejercicio y configuración

**Impacto en el usuario**:

- Carga cognitiva alta
- Difícil de escanear visualmente
- En móvil, cada ejercicio ocupa mucha pantalla

---

## 3. Propuestas de Solución

### 3.1 Editor en página dedicada (Solución al Problema #1)

**Propuesta**: Mover el editor de rutinas a una página dedicada en lugar de un Dialog.

**Ruta propuesta**: `/routines/new` para crear, `/routines/[id]/edit` para editar

**Ventajas**:

- Espacio completo de la pantalla disponible
- URL compartible (útil para soporte/debugging)
- Navegación natural con botón "atrás" del navegador
- Mejor SEO potencial (aunque no crítico para esta feature)
- El usuario puede ver la lista de rutinas en otra pestaña

**Implementación**:

```
src/app/(index)/routines/
├── page.tsx                    # Lista de rutinas
├── new/
│   └── page.tsx               # Crear nueva rutina
├── [id]/
│   ├── page.tsx               # Ver detalle de rutina
│   ├── layout.tsx             # Layout compartido
│   └── edit/
│       └── page.tsx           # Editar rutina existente
```

**Comportamiento responsive**:

- Desktop: Layout de 2 columnas (lista de días | editor del día seleccionado)
- Mobile: Navegación por tabs o accordion para días

**Alternativa considerada**: Sheet (drawer) en móvil

- Descartada porque no resuelve el problema de espacio en tablets
- La página dedicada es más consistente entre dispositivos

### 3.2 Input de nombre de día siempre editable (Solución al Problema #2)

**Propuesta**: Rediseñar el header del día para hacer evidente que el nombre es editable.

**Opción A - Input con borde visible**:

```tsx
<Input
  value={day.name}
  className='focus:border-primary border-b-2 border-transparent text-xl font-semibold'
  placeholder={`Día ${dayIndex + 1}`}
/>
```

**Opción B - Botón de edición explícito** (RECOMENDADA):

```tsx
<div className='flex items-center gap-2'>
  <h3 className='text-xl font-semibold'>{day.name}</h3>
  <Button
    variant='ghost'
    size='sm'
    onClick={() => setIsEditingName(true)}
    className='h-8 px-2'
  >
    <Pencil className='h-3.5 w-3.5' />
    <span className='ml-1 text-xs'>Editar</span>
  </Button>
</div>
```

**Justificación de la Opción B**:

- El botón es visible y táctil
- El label "Editar" elimina ambigüedad
- Sigue el patrón de otros editores (ej: Google Docs)
- No requiere hover

### 2.3 Acciones fijas en footer (Solución al Problema #3)

**Propuesta**: Usar un footer sticky para las acciones principales.

**Implementación**:

```tsx
// En el editor de rutinas
<div className='flex min-h-screen flex-col'>
  {/* Header con nombre de rutina */}
  <div className='bg-background sticky top-0 z-10 border-b p-4'>
    <Input
      placeholder='Nombre de la rutina'
      className='text-xl font-semibold'
    />
  </div>

  {/* Contenido scrolleable */}
  <div className='flex-1 overflow-y-auto p-4 pb-24'>
    {/* Días y ejercicios */}
  </div>

  {/* Footer fijo */}
  <div className='bg-background fixed right-0 bottom-0 left-0 flex gap-2 border-t p-4'>
    <Button variant='outline' onClick={handleAddDay} className='flex-1'>
      <Plus className='mr-2 h-4 w-4' />
      Agregar día
    </Button>
    <Button onClick={handleSubmit} className='flex-1'>
      Guardar
    </Button>
  </div>
</div>
```

**Consideraciones**:

- El footer debe tener `safe-area-inset-bottom` para dispositivos con notch
- En desktop, el footer puede ser sticky en lugar de fixed
- El botón "Cancelar" puede ir en el header como una X

### 3.4 Callback completo para creación de ejercicio (Solución al Problema #4)

**Propuesta**: Modificar la interfaz de `onCreate` para aceptar el objeto completo.

**Nueva interfaz**:

```tsx
interface CreateExerciseData {
  name: string
  primaryGroup?: string
  equipment?: string
}

interface ExercisePickerProps {
  // ...
  onCreate: (data: CreateExerciseData) => void
}
```

**Implementación en ExercisePicker**:

```tsx
const handleConfirmCreate = () => {
  if (newExerciseName.trim()) {
    onCreate({
      name: newExerciseName.trim(),
      primaryGroup: newExerciseGroup,
      equipment: newExerciseEquipment,
    })
    setOpen(false)
    handleCancelCreate()
  }
}
```

**Implementación en RoutineEditorFeature**:

```tsx
const handleCreateExerciseRequest = async (
  dayIndex: number,
  itemIndex: number,
  data: CreateExerciseData
) => {
  const newExercise = await createExercise({
    name: data.name,
    primaryGroup: data.primaryGroup,
    equipment: data.equipment,
  })
  // ...
}
```

### 3.5 Botones con labels para móvil (Solución al Problema #5)

**Propuesta**: Reemplazar tooltips con botones que tengan labels visibles.

**Opción A - Botones con texto** (RECOMENDADA para móvil):

```tsx
<div className='flex items-center gap-2'>
  <Button
    variant='ghost'
    size='sm'
    disabled={isFirst}
    onClick={() => onMove('up')}
    className='h-9'
  >
    <ArrowUp className='mr-1 h-4 w-4' />
    <span className='text-xs'>Subir</span>
  </Button>
  <Button
    variant='ghost'
    size='sm'
    disabled={isLast}
    onClick={() => onMove('down')}
    className='h-9'
  >
    <ArrowDown className='mr-1 h-4 w-4' />
    <span className='text-xs'>Bajar</span>
  </Button>
  <Button
    variant='ghost'
    size='sm'
    className='text-destructive hover:text-destructive h-9'
    onClick={onRemove}
  >
    <Trash2 className='mr-1 h-4 w-4' />
    <span className='text-xs'>Eliminar</span>
  </Button>
</div>
```

**Opción B - Responsive (iconos en desktop, texto en móvil)**:

```tsx
<Button
  variant='ghost'
  size='sm'
  disabled={isFirst}
  onClick={() => onMove('up')}
>
  <ArrowUp className='h-4 w-4 sm:mr-0 md:mr-1' />
  <span className='hidden text-xs md:inline'>Subir</span>
</Button>
```

**Justificación**:

- Los labels eliminan ambigüedad
- El área táctil aumenta (mejor para móvil)
- Sigue las guidelines de accesibilidad (WCAG 2.1)

### 3.6 Sistema de feedback visual (Solución al Problema #6)

**Propuesta**: Implementar múltiples capas de feedback.

**3.6.1 Indicador de cambios sin guardar**:

```tsx
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

// En el header
;<div className='flex items-center gap-2'>
  <h1>Editar Rutina</h1>
  {hasUnsavedChanges && (
    <Badge variant='outline' className='border-amber-600 text-amber-600'>
      Cambios sin guardar
    </Badge>
  )}
</div>

// Prevenir navegación con cambios sin guardar
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault()
      e.returnValue = ''
    }
  }
  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}, [hasUnsavedChanges])
```

**3.6.2 Animaciones de transición**:

```tsx
// Al agregar ejercicio
<div className="animate-in fade-in slide-in-from-top-2 duration-200">
  <ExerciseRow ... />
</div>

// Al eliminar ejercicio
<div className="animate-out fade-out slide-out-to-right-2 duration-200">
  <ExerciseRow ... />
</div>
```

**3.6.3 Estado de carga inline**:

```tsx
<Button onClick={handleSubmit} disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
      Guardando...
    </>
  ) : (
    'Guardar'
  )}
</Button>
```

### 3.7 Rediseño de ExerciseRow (Solución al Problema #7)

**Propuesta**: Dividir el ejercicio en secciones colapsables y optimizar el layout.

**Estructura propuesta**:

```
┌─────────────────────────────────────────────────────────┐
│ [Selector de ejercicio]              [⋮ Más opciones]  │
├─────────────────────────────────────────────────────────┤
│  Series: [−] 3 [+]     Reps: [−] 10 [+] (todas)        │
├─────────────────────────────────────────────────────────┤
│  ▼ Configurar reps por serie                            │
│    Serie 1: [−] 10 [+]                                  │
│    Serie 2: [−] 10 [+]                                  │
│    Serie 3: [−] 10 [+]                                  │
├─────────────────────────────────────────────────────────┤
│  ▼ Notas (opcional)                                     │
│    [Input de notas]                                     │
└─────────────────────────────────────────────────────────┘
```

**Implementación con secciones colapsables**:

```tsx
function ExerciseRow({ item, ... }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showNotes, setShowNotes] = useState(!!item.notes);

  return (
    <div className="border rounded-lg divide-y">
      {/* Header: Selector + acciones */}
      <div className="p-3 flex items-center gap-2">
        <div className="flex-1">
          <ExercisePicker ... />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onMove("up")} disabled={isFirst}>
              <ArrowUp className="h-4 w-4 mr-2" /> Subir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMove("down")} disabled={isLast}>
              <ArrowDown className="h-4 w-4 mr-2" /> Bajar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onRemove} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Configuración básica: Series + Reps globales */}
      <div className="p-3 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Series</span>
          <NumberInputStepper value={item.series} onChange={onSeriesChange} min={1} max={10} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Reps</span>
          <NumberInputStepper
            value={item.repsPerSet[0]}
            onChange={(v) => {/* igualar todas */}}
            min={1} max={50}
          />
        </div>
      </div>

      {/* Sección avanzada: Reps por serie */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger className="w-full p-3 flex items-center justify-between text-sm text-muted-foreground hover:bg-muted/50">
          <span>Configurar reps por serie</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", showAdvanced && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent className="p-3 pt-0 space-y-2">
          {item.repsPerSet.map((reps, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-sm w-16">Serie {idx + 1}</span>
              <NumberInputStepper value={reps} onChange={(v) => onRepChange(idx, v)} min={1} max={50} />
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Notas */}
      <Collapsible open={showNotes} onOpenChange={setShowNotes}>
        <CollapsibleTrigger className="w-full p-3 flex items-center justify-between text-sm text-muted-foreground hover:bg-muted/50">
          <span>Notas {item.notes && "(1)"}</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", showNotes && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent className="p-3 pt-0">
          <Input placeholder="Ej: Pausa de 2 seg en el fondo" value={item.notes} onChange={...} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
```

**Ventajas**:

- Vista inicial compacta (solo ejercicio + series/reps)
- Funcionalidad avanzada disponible pero no intrusiva
- Mejor uso del espacio vertical
- Acciones agrupadas en menú desplegable

---

## 4. Especificaciones de Componentes Rediseñados

### 4.1 RoutineEditorPage (nuevo)

**Ubicación**: `src/app/(index)/routines/new/page.tsx` y `src/app/(index)/routines/[id]/edit/page.tsx`

**Props**:

```tsx
interface RoutineEditorPageProps {
  routine?: Routine // undefined para nueva rutina
  exercises: Exercise[]
}
```

**Layout**:

```
┌─────────────────────────────────────────────────────────┐
│ [← Volver]                    Nueva Rutina              │
├─────────────────────────────────────────────────────────┤
│ [Nombre de la rutina________________]                   │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Día 1: Empuje                              [Editar] │ │
│ │ ─────────────────────────────────────────────────── │ │
│ │ [ExerciseRow]                                       │ │
│ │ [ExerciseRow]                                       │ │
│ │ [+ Agregar ejercicio]                               │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Día 2: Tirón                               [Editar] │ │
│ │ ...                                                 │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ [Agregar día]                              [Guardar]    │
└─────────────────────────────────────────────────────────┘
```

### 4.2 DayEditor (rediseñado)

**Cambios principales**:

1. Header con nombre visible y botón de edición explícito
2. Indicador de cantidad de ejercicios
3. Botón de eliminar día con confirmación
4. Animación al agregar/eliminar ejercicios

**Props actualizadas**:

```tsx
interface DayEditorProps {
  day: DayFormData
  dayIndex: number
  exercises: Exercise[]
  isOnlyDay: boolean
  onNameChange: (name: string) => void
  onRemove: () => void
  onAddExercise: () => void
  onRemoveExercise: (itemIndex: number) => void
  onMoveExercise: (itemIndex: number, direction: 'up' | 'down') => void
  onExerciseSelect: (itemIndex: number, exerciseId: number) => void
  onSeriesChange: (itemIndex: number, series: number) => void
  onRepChange: (itemIndex: number, setIndex: number, reps: number) => void
  onNotesChange: (itemIndex: number, notes: string) => void
  onCreateExercise: (itemIndex: number, data: CreateExerciseData) => void
  isExpanded?: boolean // NUEVO: para accordion
  onToggleExpand?: () => void // NUEVO: para accordion
}
```

### 4.3 ExerciseRow (rediseñado)

**Cambios principales**:

1. Acciones en DropdownMenu en lugar de botones inline
2. Secciones colapsables para reps avanzadas y notas
3. Layout de 2 columnas para series/reps básicos
4. Animaciones de entrada/salida

**Props actualizadas**:

```tsx
interface ExerciseRowProps {
  item: ExerciseFormItem
  itemIndex: number
  isFirst: boolean
  isLast: boolean
  exercises: Exercise[]
  existingExerciseIds: number[] // NUEVO: para deshabilitar en el picker
  onExerciseSelect: (exerciseId: number) => void
  onSeriesChange: (series: number) => void
  onRepChange: (setIndex: number, reps: number) => void
  onRepChangeAll: (reps: number) => void // NUEVO: igualar todas las series
  onNotesChange: (notes: string) => void
  onRemove: () => void
  onMove: (direction: 'up' | 'down') => void
  onCreateExercise: (data: CreateExerciseData) => void // ACTUALIZADO
}
```

### 4.4 ExercisePicker (actualizado)

**Cambios principales**:

1. Callback `onCreate` recibe objeto completo
2. Filtrar ejercicios ya presentes en el día
3. Mejor UX para creación inline

**Props actualizadas**:

```tsx
interface ExercisePickerProps {
  exercises: Exercise[]
  value: number | null
  excludedIds?: number[] // NUEVO: IDs a deshabilitar
  onSelect: (value: number) => void
  onCreate: (data: CreateExerciseData) => void // ACTUALIZADO
}
```

---

## 5. Mejoras de Accesibilidad

### 5.1 Áreas táctiles mínimas

Todos los elementos interactivos deben tener un área táctil mínima de 44x44px según WCAG 2.1.

**Implementación**:

```tsx
// Botones de icono
<Button variant="ghost" size="icon" className="h-11 w-11">
  {/* icon */}
</Button>

// Steppers
<Button className="p-0 w-11 h-11 shrink-0">
  <Minus className="w-5 h-5" />
</Button>
```

### 5.2 Focus visible

Todos los elementos interactivos deben tener un indicador de focus visible.

```tsx
// En globals.css o tailwind.config
.focus-visible:ring-2
.focus-visible:ring-ring
.focus-visible:ring-offset-2
```

### 5.3 Labels para screen readers

```tsx
<Button aria-label="Mover ejercicio hacia arriba">
  <ArrowUp className="h-4 w-4" />
</Button>

<Input aria-label="Nombre del día" />
```

### 5.4 Navegación por teclado

- Tab: Navegar entre elementos
- Enter/Space: Activar botones
- Escape: Cerrar modales/dropdowns
- Arrow keys: Navegar en listas

---

## 6. Mejoras para Móvil

### 6.1 Safe areas

```tsx
// Footer fijo
<div className='fixed right-0 bottom-0 left-0 pb-[env(safe-area-inset-bottom)]'>
  {/* contenido */}
</div>
```

### 6.2 Viewport meta tag

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover"
/>
```

### 6.3 Touch feedback

```tsx
<Button className='transition-transform active:scale-95'>
  {/* contenido */}
</Button>
```

### 6.4 Evitar zoom accidental en inputs

```tsx
<Input
  type='text' // NO usar type="number" que causa zoom en iOS
  inputMode='numeric'
  pattern='[0-9]*'
/>
```

---

## 7. Plan de Implementación

### Fase 1: Correcciones Críticas (1-2 días)

1. **Fix: Callback de creación de ejercicio** (Problema #4)
   - Modificar `CreateExerciseData` interface
   - Actualizar `ExercisePicker.tsx`
   - Actualizar `routine-editor.feature.tsx`
   - Actualizar `routines.actions.ts`

2. **Fix: Nombre de día editable en móvil** (Problema #2)
   - Rediseñar header de `DayEditor.tsx`
   - Agregar botón de edición explícito

3. **Fix: Botones con labels** (Problema #5)
   - Reemplazar tooltips por botones con texto
   - O implementar DropdownMenu para acciones

### Fase 2: Rediseño del Editor (3-5 días)

1. **Mover editor a página dedicada** (Problema #1)
   - Crear `/routines/new/page.tsx`
   - Crear `/routines/[id]/edit/page.tsx`
   - Actualizar navegación desde `RoutineCard`
   - Actualizar navegación desde `routine-details.feature.tsx`

2. **Footer sticky con acciones** (Problema #3)
   - Implementar footer fijo
   - Agregar safe-area-inset-bottom

3. **Sistema de feedback visual** (Problema #6)
   - Indicador de cambios sin guardar
   - Animaciones de transición
   - Estados de carga

### Fase 3: Rediseño de ExerciseRow (2-3 días)

1. **Secciones colapsables** (Problema #7)
   - Implementar Collapsible para reps avanzadas
   - Implementar Collapsible para notas
   - Mover acciones a DropdownMenu

2. **Layout optimizado**
   - Grid de 2 columnas para series/reps
   - Reducir padding en móvil

### Fase 4: Testing y Refinamiento (1-2 días)

1. Testing en dispositivos reales (iOS, Android)
2. Testing de accesibilidad (VoiceOver, TalkBack)
3. Ajustes de espaciado y tipografía
4. Documentación de cambios

---

## 8. Métricas de Éxito

| Métrica                                    | Baseline  | Target      |
| ------------------------------------------ | --------- | ----------- |
| Tiempo para crear rutina de 4 días         | ~5 min    | <3 min      |
| Tasa de abandono en editor                 | ~30%      | <15%        |
| Errores de usuario (ej: borrar sin querer) | No medido | <5%         |
| Satisfacción de usuario (NPS)              | No medido | >8          |
| Cobertura de accesibilidad                 | Parcial   | WCAG 2.1 AA |

---

## 9. Riesgos y Mitigaciones

| Riesgo                          | Probabilidad | Impacto | Mitigación                        |
| ------------------------------- | ------------ | ------- | --------------------------------- |
| Regresión en flujo existente    | Media        | Alto    | Tests E2E antes de deploy         |
| Rechazo del usuario al cambio   | Baja         | Medio   | Feature flag para rollout gradual |
| Performance en móviles antiguos | Baja         | Medio   | Lazy loading de componentes       |
| Conflictos con PRD existente    | Baja         | Alto    | Revisar con product-manager       |

---

## 10. Decisiones Pendientes

1. **¿Mantener Dialog como alternativa?**
   - Podría ser útil para ediciones rápidas
   - Agregaría complejidad al código

2. **¿Auto-guardado vs guardado explícito?**
   - Auto-guardado reduce fricción
   - Guardado explícito da más control

3. **¿Drag & drop en Fase 2?**
   - El PRD lo menciona como Fase 2
   - Podría implementarse junto con el rediseño

---

## 11. Aprobación

| Rol             | Nombre | Fecha      | Estado    |
| --------------- | ------ | ---------- | --------- |
| Architect       | -      | 2026-03-16 | Borrador  |
| Product Manager | -      | -          | Pendiente |
| Tech Lead       | -      | -          | Pendiente |

---

## Historial de Cambios

| Versión | Fecha      | Cambio                  |
| ------- | ---------- | ----------------------- |
| 1.0     | 2026-03-16 | Versión inicial del RFC |
