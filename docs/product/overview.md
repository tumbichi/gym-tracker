# Product Overview

**Producto**: Gym Tracker
**Descripción**: Aplicación web progresiva (mobile-first) para registrar entrenamientos de fuerza, gestionar rutinas y medir el progreso sin fricción durante la sesión.
**Público objetivo**: El "Entrenador Consciente". Usuarios enfocados en la sobrecarga progresiva y ganancia de fuerza bruta, que autorregulan sus cargas y necesitan precisión sin perder tiempo en el gimnasio.

---

## Visión

Gym Tracker existe para eliminar la fricción de registrar entrenamientos pesados en el gimnasio (reemplazando a Notion, Excel o libretas). Resuelve el problema de las apps rígidas que obligan a seguir un plan exacto y son difíciles de usar entre series. Permite al usuario usar la rutina solo como una guía, registrar la realidad de su sesión (pesos levantados, RPE, cambios de ejercicios on-the-fly) con una interfaz táctil rápida, y tener la tranquilidad de que su sesión es "indestructible" frente a recargas del navegador. A largo plazo, transforma estos datos en métricas clave (Volumen y 1RM Estimado) para garantizar el progreso neurológico y muscular.

## Módulos principales

| Módulo                      | Descripción                                                                                                        | Estado                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| Gestión de Rutinas          | CRUD de plantillas semanales. Permite reordenar ejercicios y configurar series/reps base sin atar a un peso fijo.  | En progreso            |
| Gestión de Ejercicios       | Catálogo de movimientos base con capacidad de buscar y añadir variaciones personalizadas al vuelo.                 | En progreso            |
| Log Workout (Sesión Activa) | Vista en vivo indestructible para ejecutar la rutina, registrar series reales (peso/reps/RPE) y manejar descansos. | En progreso (Refactor) |
| Historial de Entrenamientos | Registro cronológico para consultar sesiones pasadas y verificar cargas anteriores por ejercicio.                  | Planeado               |
| Estadísticas de Rendimiento | Dashboard enfocado en evolución del 1RM estimado y volumen total por grupo muscular.                               | Planeado               |
| Perfil y Configuración      | Gestión básica del usuario, preferencias de tema (Dark/Light) y ajustes generales.                                 | Planeado               |

## Stack tecnológico

- Frontend: Next.js 14 (App Router), shadcn/ui, Tailwind CSS v4, React Hook Form, Zod
- Backend: Server Actions, Supabase, PostgreSQL
- ORM: Prisma (con futura estandarización a Drizzle)
- Arquitectura: Domain-Driven Design (DDD) separando `src/core`, `src/modules` y `src/app`
- Testing: Vitest, Playwright

## Decisiones de producto tomadas

| Decisión                                               | Justificación                                                                                                                                                                  | Fecha      |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| Eliminar `targetWeight` de las rutinas                 | Fomenta la autorregulación. La rutina es solo una estructura; el peso real se decide en el momento según la capacidad del día.                                                 | 2026-03-15 |
| Priorizar controles UI táctiles (`NumberInputStepper`) | Fricción cero en el gimnasio. Evita que el usuario tenga que usar el teclado numérico del celular con las manos sudadas entre series.                                          | 2026-03-15 |
| Arquitectura de "Sesión Indestructible"                | Una sesión activa debe sincronizarse con `localStorage`/DB. Evita la pérdida catastrófica de datos si el navegador se cierra o recarga por falta de memoria RAM en el celular. | 2026-03-15 |
| Creación de ejercicios "On-the-fly"                    | Si un usuario encuentra una máquina ocupada y debe cambiar el ejercicio, puede crearlo desde un modal sin perder el progreso de su sesión activa.                              | 2026-03-15 |
| Refactor a arquitectura por dominios (DDD)             | Aislar la lógica de `log-workout` en features específicas para asegurar que el proyecto sea escalable y fácil de mantener por los agentes de IA.                               | 2026-03-15 |
