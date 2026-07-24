# Gym Tracker

Aplicación web de seguimiento de entrenamiento construida con Next.js 14, TypeScript, Tailwind CSS y Prisma sobre PostgreSQL.

## 🚀 Resumen

Gym Tracker permite gestionar ejercicios, rutinas y sesiones de entrenamiento. El proyecto sigue una arquitectura de módulos y un patrón de feature-based structure con una capa de datos centralizada usando Prisma.

## 🧰 Tecnologías principales

- Next.js 14 (App Router)
- React 18
- TypeScript 5
- Tailwind CSS v4
- Prisma + PostgreSQL
- Playwright para pruebas E2E
- Docker Compose para base de datos local

## ⚡ Requisitos

- Node.js 20+ (recomendado)
- pnpm
- Docker y Docker Compose (para la base de datos local)

## 🧩 Primeros pasos

1. Clona el repositorio:

```bash
git clone https://github.com/<tu-org>/gym-tracker.git
cd gym-tracker
```

2. Instala dependencias:

```bash
pnpm install
```

3. Inicia la base de datos local con Docker Compose:

```bash
docker compose -f docker/docker-compose.yml up -d
```

4. Crea un archivo `.env` en la raíz del proyecto con la siguiente variable:

```bash
DATABASE_URL="postgresql://user:password@localhost:5438/gym_tracker_db?schema=public"
```

> El contenedor de PostgreSQL se levanta con el usuario `user`, contraseña `password` y base de datos `gym_tracker_db`.

5. Aplica las migraciones existentes y ejecuta el seed inicial:

```bash
pnpx prisma migrate deploy
pnpx prisma db seed
```

6. Ejecuta la app en modo desarrollo:

```bash
pnpm dev
```

Abre `http://localhost:3000` en tu navegador.

## 🧪 Scripts útiles

- `pnpm dev` — Levanta el servidor de desarrollo
- `pnpm build` — Compila la aplicación para producción
- `pnpm start` — Inicia el servidor Next.js en modo producción
- `pnpm lint` — Corre ESLint
- `pnpm lint:fix` — Arregla problemas de lint automáticamente
- `pnpm format` — Formatea el código con Prettier
- `pnpm check-types` — Comprueba tipos TypeScript
- `pnpm test:e2e` — Ejecuta pruebas E2E con Playwright
- `pnpm test:e2e:ui` — Abre la interfaz de Playwright

## 🗄️ Base de datos local

El proyecto incluye un archivo de Docker Compose en `docker/docker-compose.yml` que levanta:

- PostgreSQL en `localhost:5438`
- pgAdmin en `localhost:5050`

### Acceso pgAdmin

- URL: `http://localhost:5050`
- Usuario: `admin@admin.com`
- Contraseña: `admin`

## 🏛️ Arquitectura del proyecto

- `src/app/` — Rutas y páginas del App Router
- `src/core/` — Componentes UI compartidos, hooks globales, utilidades y cliente Prisma
- `src/modules/` — Dominios del negocio organizados por módulos (`exercises`, `routines`, `log-workout`)

Para más detalles internos revisa `AGENTS.md` y la documentación en `docs/`.

## 📦 Configuración de Prisma

- Esquema: `prisma/schema.prisma`
- Seed: `prisma/seed.ts`
- Cliente Prisma generado automáticamente con `pnpm install` gracias al script `postinstall`

## 📚 Documentación adicional

- `AGENTS.md` — Guía del codebase y convenciones de arquitectura
- `docs/` — Documentación de arquitectura, especificaciones y tareas

## 💡 Notas

- La UI está en español.
- El proyecto usa aliases de rutas definidos en `tsconfig.json`:
  - `@app/*`
  - `@core/*`
  - `@modules/*`
- Usa siempre `pnpm` para instalar y ejecutar scripts.

---

Si necesitas un entorno limpio, ejecuta:

```bash
docker compose -f docker/docker-compose.yml down -v
```

y vuelve a levantar los contenedores.
