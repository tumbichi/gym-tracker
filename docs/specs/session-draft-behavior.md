# Especificación de Comportamiento: Gestión de Sesiones y Drafts

## Estados del Sistema

### 1. Sin Draft Activo

- **Condición:** No hay datos en localStorage
- **Comportamiento:**
  - Usuario clickea "Comenzar sesión" → **Loading** → Nueva sesión iniciada
  - No se muestra ningún modal

### 2. Con Draft Activo

- **Condición:** Hay datos guardados en localStorage
- **Sub-casos:**

#### 2a. Reanudar Sesión

- **Trigger:** Usuario clickea "Reanudar sesión activa"
- **Flujo:**
  ```
  /log-workout/session?recover=true → [Loading] → Sesión reanudada
  ```
- **NUNCA se muestra:** "No hay entrenamiento activo"
- **NUNCA se muestra:** Modal de "Borrador de sesión encontrado"

#### 2b. Iniciar Nueva Sesión

- **Trigger:** Usuario clickea "Comenzar sesión nueva"
- **Flujo:**
  ```
  /log-workout/session → [Loading] → Modal "Borrador de sesión encontrado"
  ```
- **Modal opciones:**
  - **"Continuar borrador"** → Recupera draft existente
  - **"Descartar e iniciar nueva"** → **Elimina draft** → Inicia sesión nueva limpia

## Diagrama de Estados

```
[Sin Draft]
  └─→ "Comenzar" → [Loading] → Nueva sesión

[Con Draft]
  ├─→ "Reanudar" → [Loading] → Sesión reanudada
  └─→ "Nueva" → [Loading] → Modal → (Continuar | Descartar→Nueva)
```

## Reglas Críticas

1. **Siempre Loading primero:** Antes de determinar el estado, mostrar loader
2. **Nunca "No hay entrenamiento activo" intermedio:** Ese mensaje solo si definitivamente no hay draft
3. **Descartar = Eliminar draft:** Cuando se elige "Descartar", el draft se borra de localStorage
4. **No side-effects:** Cada acción debe tener un resultado predecible

## Tests E2E Requeridos

- [ ] Sin draft → Iniciar sesión → Sesión nueva
- [ ] Con draft → Reanudar → Sesión recuperada (sin modal)
- [ ] Con draft → Nueva → Modal → Continuar → Draft recuperado
- [ ] Con draft → Nueva → Modal → Descartar → Nueva sesión (draft eliminado)
- [ ] Persistencia: Completar set → Reload → Valor persistido
