# Arquitectura y Convenciones del Proyecto (Next.js)

Este documento describe la arquitectura de software y la estructura de carpetas utilizada en este proyecto y estandarizada para nuestros desarrollos en Next.js.

El objetivo principal es lograr una base de código **escalable, mantenible y desacoplada**. Para ello, utilizamos una combinación de **Module Pattern** (separación por dominios de negocio) y **Feature Pattern** (una evolución semántica del patrón Container/Presentational).

## 🏗️ Conceptos Core

1. **Agnosticismo del Framework:** La lógica de negocio y las vistas principales no deben saber si estamos usando Next.js App Router o Pages Router. El enrutador solo sirve como punto de entrada.
2. **Module Pattern:** El código se divide verticalmente por "Dominios" o "Módulos" (ej. `Auth`, `Budget`, `Portfolio`). Cada módulo es un micro-ecosistema independiente.
3. **Feature Pattern (Smart/Dumb):**
   - **Features (Smart):** Componentes inteligentes que manejan estado, hacen fetching de datos, usan hooks complejos y orquestan la UI.
   - **Components (Dumb/Presentacionales):** Componentes tontos que solo reciben `props` y emiten eventos (`callbacks`). No tienen idea de dónde vienen los datos.

---

## 📂 Estructura de Carpetas

La carpeta principal es `src/` y se divide en tres grandes capas, además de una carpeta externa para tests E2E:

```text
src/
├── app/          # 1. Capa de Enrutamiento (Next.js)
├── core/         # 2. Capa Global / Compartida
└── modules/      # 3. Capa de Dominio / Negocio
tests/
└── e2e/          # Tests end-to-end y flujos críticos (Playwright)
```

### 1. Capa de Enrutamiento (`src/app/`)

Es la capa más externa. Pertenece exclusivamente a Next.js.

- **Responsabilidad:** Definir rutas, layouts, metadatos (SEO) y manejar los endpoints del servidor (Rutas API).
- **Regla de oro:** Aquí **NO** va lógica de negocio ni UI compleja. Las páginas (`page.tsx`) deben ser lo más finas posible, limitándose a recibir parámetros de la URL y renderizar un `Feature` del módulo correspondiente.

### 2. Capa Compartida (`src/core/`)

Contiene todo el código que es **transversal a toda la aplicación** y agnóstico a cualquier dominio de negocio específico.

- `components/`: Componentes UI genéricos (botones, inputs, modales). Usualmente manejados con librerías como shadcn/ui.
- `hooks/`: Custom hooks globales (ej. `use-mobile`, `use-toast`).
- `lib/` / `utils/`: Funciones utilitarias genéricas, formateadores de fecha, configuración de librerías.
- `layout/`: Componentes estructurales de la app (Navbar, Sidebar, Footer).
- `data/` o `services/`: Clientes de bases de datos o servicios globales (ej. `supabaseClient`).

### 3. Capa de Dominio (`src/modules/`)

Es el corazón de la aplicación. Aquí el código se agrupa por contexto de negocio (ej. `Budget`, `Auth`, `Reports`).

Cada módulo tiene su propia estructura interna encapsulada:

```text
src/modules/Budget/
├── __tests__/      # Tests unitarios y de integración locales
├── components/     # Dumb components (UI específica del módulo)
├── features/       # Smart components (Orquestadores)
├── hooks/          # Lógica de React específica del módulo
├── services/       # Comunicación con APIs externas o base de datos
├── types/          # Interfaces y tipos de TypeScript
└── utils/          # Funciones auxiliares del módulo
```

#### Anatomía de un Módulo:

- **`features/` (Smart Components):**
  Son los puntos de entrada para las páginas. Un feature (ej. `BudgetBoard.tsx`) se encarga de llamar a los hooks de fetching (`useBudgetData`), manejar estados de carga/error y pasar los datos limpios a los componentes hijos.
- **`components/` (Dumb Components):**
  Componentes puramente visuales (ej. `ExpenseItem.tsx`, `CategoryBadge.tsx`). Reciben `data` e invocan funciones como `onDelete`, `onUpdate`. Son altamente testeables y predecibles.
- **`services/`:**
  Funciones asíncronas que se comunican con el backend/BFF (`api/`) o servicios externos (Supabase, Firebase, etc.). Ningún componente debería hacer un `fetch` directo sin pasar por un service.
- **`hooks/`:**
  Si un `Feature` tiene mucha lógica de estado o requiere procesar múltiples llamadas a servicios, esa lógica se extrae a un custom hook dentro del módulo (ej. `useExpenseCrud.ts`).

---

## 🔄 Flujo de Datos y Reglas de Dependencia

Para mantener la arquitectura limpia, existen reglas estrictas sobre qué puede importar a qué:

1. **Regla de la Página:** Los archivos de `src/app` **solo** pueden importar desde `features/` (de los módulos) o layouts de `core/`.
2. **Regla de los Módulos:**
   - Un módulo no debería importar cosas de la carpeta interna de otro módulo. Si dos módulos necesitan compartir algo, ese algo probablemente pertenece a `src/core/`.
   - Si un módulo necesita utilizar un "Feature" de otro módulo, debe importarlo por su interfaz pública (el archivo Feature mismo), pero evitando el acoplamiento circular.
3. **Regla del Feature:** Un `Feature` importa `components`, `hooks` y `services` de su propio módulo, y componentes base de `core/`.
4. **Regla del Componente (Dumb):** Los `components/` dentro de un módulo **NO** pueden importar de `features/`, `hooks/` o `services/`. Son componentes puros.

## 💡 Ejemplo de Flujo:

1. El usuario entra a `/admin/budgets`.
2. `src/app/admin/budgets/page.tsx` renderiza `<BudgetBoard />`.
3. `BudgetBoard` (en `src/modules/Budget/features/`) llama al hook `useBudgetData`.
4. `useBudgetData` interactúa con `expenses.services.ts`.
5. Una vez que la data llega, `BudgetBoard` renderiza componentes tontos como `<ExpensesBoard expenses={data} />` e `<ExpenseItem />` pasándole los callbacks necesarios.
