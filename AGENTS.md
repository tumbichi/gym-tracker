# AGENTS.md — Guia del Codebase Gym Tracker

> Fuente de verdad para agentes de IA operando en este repo. Leer completo antes de hacer cambios.

## Referencia Rapida

- **Stack:** Next.js 14 (App Router), React 18, TypeScript 5, Tailwind CSS v4, Prisma (PostgreSQL), shadcn/ui (estilo New York)
- **Package manager:** pnpm
- **Target:** ES6, strict mode habilitado

## Comandos de Build / Lint / Test

```bash
pnpm dev              # Servidor de desarrollo (next dev)
pnpm build            # Build de produccion (next build)
pnpm build:vercel     # Deploy Vercel: prisma migrate deploy && next build
pnpm lint             # ESLint via next lint
pnpm check-types      # Chequeo de tipos TypeScript (tsc --noEmit)
pnpm postinstall      # Ejecuta prisma generate (automatico tras pnpm install)
```

### Base de Datos

```bash
# Postgres local via Docker (puerto 5438)
docker compose -f docker/docker-compose.yml up -d

# Comandos Prisma
pnpx prisma generate          # Generar cliente tras cambios al schema
pnpx prisma migrate dev       # Crear y aplicar migracion
pnpx prisma migrate deploy    # Aplicar migraciones pendientes (produccion)
pnpx prisma db seed           # Ejecutar seed (prisma/seed.ts)
pnpx prisma studio            # Navegador visual de la BD
```

### Testing

No hay test runner configurado aun (ni vitest/jest/playwright en dependencias). Al agregar tests:
- Tests unitarios/integracion: ubicar en `src/modules/[dominio]/__tests__/`
- Tests E2E: ubicar en `tests/e2e/` (segun ARCHITECTURE.md)

## Arquitectura del Proyecto (Module + Feature Pattern)

```
src/
  app/            # Capa de enrutamiento — paginas thin, layouts, metadata
  core/           # Compartido: componentes UI, hooks, lib, types, styles
  modules/        # Capa de dominio — logica de negocio agrupada por dominio
    exercises/    # Dominio de catalogo de ejercicios
    routines/     # Dominio de gestion de rutinas
    log-workout/  # Dominio de sesion de entrenamiento (tiene sub-modulos)
```

### Tres Capas (flujo unidireccional estricto)

1. **`src/app/`** — Solo definiciones de rutas. Las paginas llaman server actions para datos y renderizan un unico Feature. Sin logica de negocio.
2. **`src/core/`** — Codigo compartido agnostico al framework: primitivos UI (`components/ui/`), hooks globales, utils, cliente Prisma, tipos.
3. **`src/modules/[dominio]/`** — Modulos de dominio auto-contenidos:
   - `features/` (Smart) — Orquestadores: estado, fetching, hooks. Puntos de entrada para paginas.
   - `components/` (Dumb) — Puramente presentacionales. Props de entrada, callbacks de salida. **PROHIBIDO importar hooks/services.**
   - `actions/` — Server Actions (`"use server"`). Fetching y mutaciones con Prisma.
   - `hooks/` — Hooks de React especificos del dominio.
   - `contexts/` — Providers de React context (ver `log-workout/modules/session/contexts/`).
   - `types/`, `utils/` — Definiciones de tipos y helpers locales.

### Reglas de Dependencia

- Paginas en `src/app/` importan SOLO de `modules/*/features`, `modules/*/actions` o `core/`.
- Los modulos NO importan internos de otros modulos. Compartir via `core/`.
- Componentes Dumb (`components/`) NUNCA importan hooks, services ni actions.
- Features (`features/`) importan de su propio modulo (components, hooks, actions) y de `core/`.

## Alias de Rutas (tsconfig.json)

```
@app/*      → ./src/app/*
@core/*     → ./src/core/*
@modules/*  → ./src/modules/*
```

Usar siempre estos alias. Nunca usar rutas relativas que crucen capas (ej. `../../../core`).

## Estilo de Codigo y Convenciones

### Nombres de Archivos

- **Features:** `kebab-case.feature.tsx` (ej. `routine-editor.feature.tsx`)
- **Componentes:** `PascalCase.tsx` (ej. `RoutineCard.tsx`, `WorkoutExerciseItem.tsx`)
- **Hooks:** `camelCase.ts` con prefijo `use` (ej. `useRestTimer.ts`)
- **Actions:** `kebab-case.actions.ts` (ej. `routines.actions.ts`)
- **Contexts:** Patron directorio: `contexts/[Nombre]/index.ts` + `Provider.tsx` + `hooks/`
- **Utils/lib:** `camelCase.ts` (ej. `formatTime.ts`)

### TypeScript

- Modo strict activado. Respetarlo.
- Usar `interface` para props de componentes y formas de objetos. Usar `type` para uniones, intersecciones y tipos derivados de Prisma.
- Interfaces de props: `NombreComponenteProps` (ej. `RoutineEditorProps`, `RoutineCardProps`).
- Extender tipos Prisma con `&` para relaciones: `type Routine = PrismaRoutine & { days: RoutineDay[] }`.
- Exportar tipos de dominio desde archivos de actions (co-ubicados con la capa de datos).
- Tipos compartidos viven en `src/core/types/index.ts`.
- Evitar `any` — usarlo solo como ultimo recurso con un comentario explicando por que.

### Orden de Imports

1. Directiva `"use client"` o `"use server"` (primera linea, si es necesario)
2. Imports de React / Next.js (`import type React from "react"`, `import { useState }`)
3. Librerias de terceros (`lucide-react`, `sonner`, `zod`, `date-fns`)
4. Imports de `@core/` (componentes UI, lib, hooks, types)
5. Imports de `@modules/` (actions, tipos del mismo u otros modulos)
6. Imports relativos (components, hooks del mismo modulo)

Usar `import type` para imports que solo son de tipos.

### Componentes

- Componentes cliente: agregar `"use client"` como primera linea del archivo.
- Componentes servidor: por defecto (sin directiva). Las paginas en `app/` son server components.
- Componentes presentacionales (Dumb) reciben datos via props y emiten eventos via callbacks (`onDelete`, `onChange`, etc.).
- Features (Smart) manejan estado, llaman hooks/actions y componen componentes Dumb.
- Usar `export default function` para componentes (no arrow functions).

### Estilos

- Tailwind CSS v4 con plugin `@tailwindcss/postcss`.
- Usar la utilidad `cn()` de `@core/lib/utils` para clases condicionales.
- Variables CSS definidas en `src/core/styles/globals.css` (espacio de color oklch).
- Componentes shadcn/ui en `src/core/components/ui/` — **no modificar** archivos generados.
- Iconos: `lucide-react` exclusivamente.

### Manejo de Errores

- Server Actions: usar try/catch, dejar que los errores propaguen al cliente.
- Client-side: usar try/catch en handlers async. Mostrar errores via `toast.error()` de `sonner`.
- Loguear errores con `console.error()` antes de mostrar feedback al usuario.

### Capa de Datos

- `@core/lib/prisma.ts` — Cliente Prisma singleton (cache global en dev).
- `@core/lib/database.ts` — Abstraccion hibrida: intenta Prisma, cae a datos mock (`db.ts`).
- Server Actions (en `modules/*/actions/`) usan `database` o `prisma` directamente.
- Siempre llamar `revalidatePath()` despues de mutaciones para mantener la UI fresca.

### Base de Datos (Prisma)

- Schema: `prisma/schema.prisma` (PostgreSQL, IDs autoincrement).
- Modelos: `User`, `Exercise`, `Routine`, `RoutineDay`, `RoutineExercise`, `WorkoutSession`, `SetEntry`.
- Seeds: `prisma/seed.ts`. Backups locales SQLite existen en `prisma/*.bak.db`.
- Variable de entorno: `DATABASE_URL` (ver `docker/docker-compose.yml` para defaults locales: puerto 5438).

### Idioma de la UI

La app esta en **espanol**. Todo texto visible al usuario (labels, toasts, descripciones) debe estar en espanol.

## Flujo de Trabajo SDD (9 Especialistas)

1. **orchestrator** — Planifica y delega. Nunca programa.
2. **product-manager** — Discovery y PRDs en `docs/product/features/`.
3. **architect** — RFCs, limites de modulos, contratos de datos.
4. **tester-unit** — Tests unitarios e integracion.
5. **frontend-coder** — Implementacion UI (separacion Smart/Dumb).
6. **backend-coder** — Server Actions y services. No toca archivos `.tsx` visuales.
7. **tester-e2e** — Tests E2E con Playwright en `tests/e2e/`.
8. **debugger** — Analisis de causa raiz via logs y DevTools.
9. **seo-docs** — Auditoria SEO y documentacion.

## Archivos Clave

| Archivo | Proposito |
|---|---|
| `src/core/lib/prisma.ts` | Cliente Prisma singleton |
| `src/core/lib/database.ts` | Capa BD hibrida (Prisma + fallback mock) |
| `src/core/lib/utils.ts` | Utilidad `cn()` para merge de clases |
| `src/core/types/index.ts` | Interfaces TypeScript compartidas |
| `src/core/styles/globals.css` | Tailwind + variables CSS |
| `components.json` | Config shadcn/ui (estilo New York, aliases `@core/`) |
| `prisma/schema.prisma` | Schema de base de datos |
| `docker/docker-compose.yml` | PostgreSQL local (puerto 5438) |
