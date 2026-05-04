# PRD: Exercise Module Redesign — Professional Classification System

**ID**: features/exercise-module-redesign  
**Estado**: Draft  
**Fecha**: 2026-03-28  
**Autor**: product-manager  
**Versión**: 1.0

---

## 1. Executive Summary

### What We're Building

A professional, standardized exercise classification system that eliminates duplicate exercises and enables accurate progress tracking across all training styles and gym types.

### Why

The current exercise model is a "draft" with no standardization. Users create duplicate exercises with slightly different names (e.g., "Press de Banca" vs "Press Banca" vs "Bench Press"), making it impossible to analyze progress consistently. This redesign establishes a canonical exercise taxonomy that serves beginners and advanced users alike.

### Key Outcomes

- Zero duplicate exercises through canonical names with aliases
- Accurate progress analytics by exercise, muscle group, and movement pattern
- Support for multiple training styles (powerlifting, bodybuilding, calisthenics, etc.)
- Equipment-aware exercise recommendations based on gym type

---

## 2. Contexto y Problema

### Problema Actual

El sistema actual de ejercicios carece de estandarización:

1. **Duplicados de datos**: Los usuarios crean el mismo ejercicio con nombres ligeramente diferentes
2. **Analíticas rotas**: No se puede trackear progreso porque "Press de Banca", "Press Banca" y "Bench Press" se tratan como ejercicios distintos
3. **Sin taxonomía profesional**: No hay clasificación por patrones de movimiento, músculos secundarios, o vectores de fuerza
4. **Inconsistencia entre gimnasios**: Un usuario que entrena en diferentes gimnasios no puede filtrar por equipamiento disponible

### Consecuencias si NO se construye

- Los usuarios continuarán creando duplicados, degradando la calidad de datos
- Las métricas de progreso (1RM, volumen) serán inexactas e inútiles
- No se podrá ofrecer recomendaciones de ejercicios inteligentes
- El producto no escalará para soportar coaches o gimnasios comerciales

---

## 3. Objetivos

| Objetivo                                    | Métrica de éxito                                             |
| ------------------------------------------- | ------------------------------------------------------------ |
| Eliminar duplicados de ejercicios           | 0 ejercicios duplicados detectados por análisis de similitud |
| Mejorar descubrimiento de ejercicios        | Tiempo para encontrar un ejercicio < 10 segundos             |
| Habilitar analíticas precisas               | 100% de ejercicios con clasificación canónica                |
| Soportar múltiples estilos de entrenamiento | Cobertura de 5+ estilos de entrenamiento                     |
| Reducir fricción en creación                | < 3 clicks para encontrar o crear un ejercicio válido        |

---

## 4. Non-goals (Fuera de alcance)

| No incluye                                    | Justificación                                       |
| --------------------------------------------- | --------------------------------------------------- |
| Videos instructivos propios                   | MVP usa recursos externos (YouTube embeds)          |
| Integración con wearables (Apple Watch, etc.) | Post-MVP, requiere investigación técnica            |
| Biblioteca de ejercicios 3D/animaciones       | Costo de desarrollo alto, bajo impacto en MVP       |
| Sistema de votación/comunidad                 | Complejidad social, post-MVP                        |
| Traducción automática de nombres              | Los nombres canónicos serán en español inicialmente |
| Ejercicios de rehabilitación/fisioterapia     | Enfoque en fitness/performance, no médico           |

---

## 5. Usuarios Afectados

### Persona 1: "Principiante Consciente"

- **Contexto**: Recién empieza en el gimnasio, no conoce los nombres de los ejercicios
- **Necesidades**: Descubrir ejercicios por grupo muscular, ver instrucciones, entender qué equipamiento necesita
- **Frustración actual**: No sabe si "curl de bíceps" y "curl con barra" son lo mismo

### Persona 2: "Lifter Avanzado"

- **Contexto**: Entrena hace años, conoce variaciones y alternativas
- **Necesidades**: Encontrar ejercicios rápidamente, descubrir variaciones, filtrar por equipamiento disponible
- **Frustración actual**: Creó "Press Inclinado" pero el sistema no lo relaciona con "Incline Bench Press"

### Persona 3: "Coach/Personal Trainer" (Futuro)

- **Contexto**: Crea rutinas para múltiples clientes
- **Necesidades**: Biblioteca estandarizada, consistencia entre clientes, reportes por patrones de movimiento
- **Frustración actual**: No puede analizar progreso de clientes porque cada uno nombra ejercicios diferente

---

## 6. User Stories

### Descubrimiento y Búsqueda

- Como **principiante**, quiero buscar ejercicios por grupo muscular para descubrir qué puedo entrenar hoy
- Como **usuario avanzado**, quiero buscar ejercicios por patrón de movimiento (ej: "empuje horizontal") para diseñar rutinas balanceadas
- Como **usuario**, quiero ver ejercicios alternativos cuando una máquina está ocupada

### Creación y Estándares

- Como **usuario**, quiero que el sistema sugiera el ejercicio canónico cuando escribo un nombre similar para evitar duplicados
- Como **usuario**, quiero crear variaciones personalizadas (ej: "Press Banca con agarre cerrado") ligadas al ejercicio base
- Como **usuario**, quiero marcar ejercicios como favoritos para acceder rápidamente

### Filtrado y Equipamiento

- Como **usuario de gym pequeño**, quiero filtrar ejercicios por equipamiento disponible para no ver opciones que no puedo hacer
- Como **usuario**, quiero guardar la configuración de equipamiento de mi gym para filtrado automático

### Analíticas

- Como **usuario**, quiero ver mi progreso en "Press de Banca" incluyendo todas sus variaciones (inclinado, mancuerna, etc.)
- Como **usuario**, quiero ver volumen total por grupo muscular para asegurar balance en mi programa

---

## 7. Flujo Principal

### Flujo 1: Encontrar un ejercicio (Happy Path)

1. Usuario abre selector de ejercicios (desde creación de rutina o sesión activa)
2. Sistema muestra ejercicios populares y recientes
3. Usuario escribe "press banca" en el buscador
4. Sistema muestra:
   - Press de Banca (canónico)
   - Press de Banca Inclinado (variación)
   - Press de Banca con Mancuernas (variación)
5. Usuario selecciona el ejercicio deseado
6. Sistema muestra detalles: músculos, equipamiento, instrucciones
7. Usuario confirma selección

### Flujo 2: Crear una variación personalizada

1. Usuario busca ejercicio base "Press de Banca"
2. No encuentra variación específica deseada
3. Selecciona "Crear variación"
4. Sistema pre-llena datos del ejercicio base
5. Usuario modifica: nombre "Press Banca con Agarre Cerrado", ajusta músculos secundarios
6. Sistema valida que no exista duplicado
7. Sistema guarda como variación ligada al ejercicio base

### Flujo 3: Configurar equipamiento de gym

1. Usuario accede a perfil > configuración de gym
2. Selecciona equipamiento disponible: Barra olímpica, Rack, Mancuernas hasta 30kg, etc.
3. Sistema guarda configuración
4. En futuras búsquedas, ejercicios que requieren equipamiento no disponible aparecen marcados o filtrados

---

## 8. Criterios de Aceptación

### Funcionalidad Core

- [ ] El sistema debe detectar y prevenir creación de ejercicios duplicados mediante matching de similitud
- [ ] Cada ejercicio debe tener un nombre canónico único y opcionalmente aliases (sinónimos)
- [ ] Los ejercicios deben clasificarse por: grupo muscular primario, músculos secundarios, patrón de movimiento, tipo de ejercicio
- [ ] Debe existir relación de "variación" entre ejercicios (ej: Press Banca → Press Inclinado)
- [ ] El sistema debe soportar 100+ ejercicios canónicos en el lanzamiento

### Búsqueda y Filtrado

- [ ] Búsqueda debe funcionar por nombre canónico, aliases, grupo muscular, o equipamiento
- [ ] Filtros disponibles: grupo muscular, patrón de movimiento, equipamiento requerido, nivel de dificultad
- [ ] Resultados de búsqueda deben mostrarse en < 500ms
- [ ] Búsqueda debe tolerar faltas de ortografía básicas

### Integración

- [ ] Los ejercicios existentes deben migrarse al nuevo sistema (asignación a ejercicios canónicos)
- [ ] Las rutinas existentes deben seguir funcionando post-migración
- [ ] El historial de entrenamientos debe mantenerse y ser consultable

### UX

- [ ] Creación de ejercicio debe requerir < 3 clicks desde sesión activa
- [ ] Selector de ejercicios debe ser usable en móvil (pantalla táctil)
- [ ] Debe existir indicador visual de ejercicios con equipamiento no disponible

---

## 9. Datos y Entidades Involucradas

### Entidades Principales

**Exercise (Ejercicio Canónico)**

- Identificador único y nombre canónico
- Descripción e instrucciones
- Grupo muscular primario
- Músculos secundarios (array)
- Patrón de movimiento
- Tipo de ejercicio (compuesto, aislado, cardio, movilidad)
- Vector de fuerza (empuje/tracción vertical/horizontal)
- Equipamiento requerido
- Nivel de dificultad
- Metadata (tags, URLs de video)

**ExerciseAlias (Alias/Sinónimos)**

- Relación a ejercicio canónico
- Nombre alternativo
- Fuente/idioma del alias

**ExerciseVariation (Variaciones)**

- Ejercicio base (canónico)
- Ejercicio variación
- Tipo de variación (agravante, alternativa, regresión)

**Equipment (Equipamiento)**

- Nombre del equipamiento
- Categoría (barra, máquina, mancuerna, peso corporal, etc.)
- Descripción

**MuscleGroup (Grupos Musculares)**

- Nombre del grupo
- Región corporal (superior, inferior, core)
- Tipo (primario, secundario, estabilizador)

**UserGymConfig (Configuración de Gym por Usuario)**

- Usuario
- Lista de equipamiento disponible
- Nombre del gym (opcional)

### Relaciones

```
Exercise 1--* ExerciseAlias
Exercise 1--* ExerciseVariation (como base)
Exercise 1--* ExerciseVariation (como variación)
Exercise *--* MuscleGroup (primario y secundarios)
Exercise *--* Equipment
User 1--* UserGymConfig
UserGymConfig *--* Equipment
```

---

## 10. Modelo de Datos Propuesto

### Enums

```typescript
// Patrones de movimiento
enum MovementPattern {
  SQUAT = 'squat', // Sentadilla/patterns de rodilla
  HINGE = 'hinge', // Patrón de cadera (peso muerto)
  PUSH_HORIZONTAL = 'push_horizontal',
  PUSH_VERTICAL = 'push_vertical',
  PULL_HORIZONTAL = 'pull_horizontal',
  PULL_VERTICAL = 'pull_vertical',
  LUNGE = 'lunge', // Estocada/paso
  ROTATION = 'rotation', // Rotación
  CARRY = 'carry', // Transporte
  ISOLATION = 'isolation', // Aislamiento (curl, extensión)
  CARDIO = 'cardio',
  MOBILITY = 'mobility',
}

// Tipo de ejercicio
enum ExerciseType {
  COMPOUND = 'compound', // Multi-articular
  ISOLATION = 'isolation', // Single-joint
  CARDIO = 'cardio',
  MOBILITY = 'mobility',
  PLYOMETRIC = 'plyometric', // Pliométrico
}

// Vector de fuerza
enum ForceVector {
  PUSH_VERTICAL = 'push_vertical',
  PUSH_HORIZONTAL = 'push_horizontal',
  PULL_VERTICAL = 'pull_vertical',
  PULL_HORIZONTAL = 'pull_horizontal',
  ISOMETRIC = 'isometric',
}

// Nivel de dificultad
enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

// Categorías de equipamiento
enum EquipmentCategory {
  BARBELL = 'barbell',
  DUMBBELL = 'dumbbell',
  MACHINE = 'machine',
  CABLE = 'cable',
  BODYWEIGHT = 'bodyweight',
  KETTLEBELL = 'kettlebell',
  SMITH = 'smith',
  MEDICINE_BALL = 'medicine_ball',
  RESISTANCE_BAND = 'resistance_band',
  OTHER = 'other',
}
```

### Schema (Prisma/Drizzle)

```prisma
model Exercise {
  id                String           @id @default(uuid())
  canonicalName     String           @unique
  slug              String           @unique
  description       String?
  instructions      String?
  primaryMuscleId   String
  primaryMuscle     MuscleGroup      @relation("PrimaryMuscle", fields: [primaryMuscleId], references: [id])
  secondaryMuscles  MuscleGroup[]    @relation("SecondaryMuscles")
  movementPattern   MovementPattern
  exerciseType      ExerciseType
  forceVector       ForceVector?
  difficulty        DifficultyLevel  @default(INTERMEDIATE)
  equipmentIds      String[]
  equipment         Equipment[]      @relation(fields: [equipmentIds], references: [id])
  videoUrl          String?
  imageUrl          String?
  tags              String[]
  isCanonical       Boolean          @default(true)
  baseExerciseId    String?
  baseExercise      Exercise?        @relation("Variations", fields: [baseExerciseId], references: [id])
  variations        Exercise[]       @relation("Variations")
  aliases           ExerciseAlias[]
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt

  // Relaciones existentes (backward compatibility)
  routineExercises  RoutineExercise[]
  workoutExercises  WorkoutExercise[]
}

model ExerciseAlias {
  id          String    @id @default(uuid())
  exerciseId  String
  exercise    Exercise  @relation(fields: [exerciseId], references: [id], onDelete: Cascade)
  alias       String
  language    String    @default('es')
  createdAt   DateTime  @default(now())

  @@unique([exerciseId, alias])
}

model MuscleGroup {
  id                String      @id @default(uuid())
  name              String      @unique
  slug              String      @unique
  bodyRegion        BodyRegion
  muscleType        MuscleType
  description       String?
  primaryExercises  Exercise[]  @relation("PrimaryMuscle")
  secondaryExercises Exercise[] @relation("SecondaryMuscles")
}

model Equipment {
  id          String            @id @default(uuid())
  name        String            @unique
  slug        String            @unique
  category    EquipmentCategory
  description String?
  exercises   Exercise[]
  userConfigs UserGymConfig[]
}

model UserGymConfig {
  id            String      @id @default(uuid())
  userId        String      @unique
  name          String?
  equipmentIds  String[]
  equipment     Equipment[] @relation(fields: [equipmentIds], references: [id])
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

enum BodyRegion {
  UPPER_BODY
  LOWER_BODY
  CORE
  FULL_BODY
}

enum MuscleType {
  PRIMARY
  SECONDARY
  STABILIZER
}
```

---

## 11. Fases de Implementación

### Fase 1 — MVP (Core Classification)

**Alcance:**

- [ ] Definir schema de base de datos con taxonomía completa
- [ ] Crear 50 ejercicios canónicos iniciales (los más comunes)
- [ ] Implementar sistema de aliases para prevenir duplicados
- [ ] Migrar ejercicios existentes al nuevo sistema
- [ ] Actualizar UI de selección de ejercicios con búsqueda y filtros
- [ ] Implementar detección de duplicados en tiempo real

**Criterio de éxito:**

- Usuarios pueden buscar y seleccionar ejercicios canónicos
- No se permiten crear ejercicios duplicados
- Rutinas y sesiones existentes funcionan correctamente

### Fase 2 — Variaciones y Equipamiento

**Alcance:**

- [ ] Expandir a 100+ ejercicios canónicos
- [ ] Implementar sistema de variaciones de ejercicios
- [ ] Crear modelo de equipamiento y configuración por usuario
- [ ] Agregar filtros por equipamiento disponible
- [ ] Mostrar ejercicios alternativos cuando uno no está disponible

**Criterio de éxito:**

- Usuarios pueden crear variaciones personalizadas
- Filtro por equipamiento funciona correctamente
- Sistema sugiere alternativas inteligentemente

### Fase 3 — Analíticas Avanzadas

**Alcance:**

- [ ] Reportes de volumen por grupo muscular
- [ ] Reportes de progreso por patrón de movimiento
- [ ] Dashboard de balance muscular (empuje vs tracción, superior vs inferior)
- [ ] Sugerencias de ejercicios basadas en historial

**Criterio de éxito:**

- Usuarios pueden ver análisis de sus patrones de entrenamiento
- Sistema identifica desequilibrios en programas

### Fase 4 — Escalabilidad y Comunidad

**Alcance:**

- [ ] Sistema de contribución de ejercicios (reviewed)
- [ ] Soporte multi-idioma (i18n completo)
- [ ] Integración con videos instructivos externos
- [ ] API pública para integraciones

---

## 12. Métricas de Éxito

### Métricas de Negocio

| Métrica                               | Baseline | Target (3 meses) |
| ------------------------------------- | -------- | ---------------- |
| Ejercicios duplicados creados         | ~30%     | < 5%             |
| Tiempo para encontrar ejercicio       | 45s      | < 10s            |
| Ejercicios con clasificación completa | 0%       | 100%             |
| Satisfacción con búsqueda (encuesta)  | N/A      | > 4/5            |

### Métricas Técnicas

| Métrica                           | Target  |
| --------------------------------- | ------- |
| Tiempo de respuesta búsqueda      | < 500ms |
| Precisión detección de duplicados | > 95%   |
| Uptime del sistema de ejercicios  | > 99.9% |

### Métricas de Adopción

| Métrica                                           | Target (3 meses) |
| ------------------------------------------------- | ---------------- |
| % usuarios usando filtros                         | > 40%            |
| % ejercicios seleccionados de biblioteca canónica | > 90%            |
| Variaciones creadas por usuarios                  | > 100            |

---

## 13. Riesgos y Mitigaciones

| Riesgo                                     | Probabilidad | Impacto | Mitigación                                                                                            |
| ------------------------------------------ | ------------ | ------- | ----------------------------------------------------------------------------------------------------- |
| **Migración de datos fallida**             | Media        | Alto    | Backup completo antes de migración; script de migración reversible; pruebas en staging                |
| **Usuarios rechazan nuevo sistema**        | Baja         | Alto    | Mantener compatibilidad hacia atrás; comunicación clara de beneficios; opción de feedback             |
| **Complejidad de UI aumenta**              | Media        | Medio   | Diseño mobile-first; testing de usabilidad; iteración basada en feedback                              |
| **Performance de búsqueda**                | Media        | Medio   | Indexación full-text; caché de resultados populares; paginación                                       |
| **Definición de taxonomía incorrecta**     | Baja         | Alto    | Research de sistemas existentes (ExRx, MuscleWiki); validación con usuarios reales; diseño extensible |
| **Carga inicial de ejercicios incompleta** | Baja         | Medio   | Priorizar ejercicios más comunes; sistema de solicitud de nuevos ejercicios; iteración rápida         |

---

## 14. Preguntas Abiertas

- [ ] ¿Se debe permitir a usuarios editar ejercicios canónicos o solo crear variaciones?
- [ ] ¿Cómo manejar ejercicios con nombres diferentes en diferentes países (ej: "sentadilla" vs "squat")?
- [ ] ¿Se necesita aprobación manual para nuevos ejercicios creados por usuarios?
- [ ] ¿Debe haber un sistema de "ejercicios verificados" vs "ejercicios de comunidad"?
- [ ] ¿Cómo integrar con futuro sistema de coaches (ejercicios privados vs públicos)?

---

## 15. Apéndice

### A. Sistemas de Referencia

**ExRx.net**

- Taxonomía por músculos y movimientos
- Clasificación por equipamiento
- Biblioteca extensa y bien organizada

**MuscleWiki**

- Selección visual por grupo muscular
- Enfoque en descubrimiento
- Buena para principiantes

**StrengthLog / Strong**

- Biblioteca curada de ejercicios
- Sistema de variaciones
- Enfoque en tracking

### B. Taxonomía de Grupos Musculares Propuesta

**Upper Body — Push**

- Pecho (Pectoral Mayor, Pectoral Menor)
- Hombro Anterior (Deltoides Anterior)
- Tríceps (Cabeza Larga, Lateral, Medial)

**Upper Body — Pull**

- Espalda (Dorsal Ancho, Romboides, Trapecio)
- Hombro Posterior (Deltoides Posterior)
- Bíceps (Cabeza Larga, Corta)
- Antebrazo (Braquial, Braquiorradial)

**Lower Body — Quad Dominant**

- Cuádriceps (Recto Femoral, Vasto Lateral, Medial, Intermedio)

**Lower Body — Hip Dominant**

- Isquiotibiales (Bíceps Femoral, Semitendinoso, Semimembranoso)
- Glúteos (Mayor, Medio, Menor)
- Aductores

**Core**

- Recto Abdominal
- Oblicuos
- Erectores Espinales
- Transverso Abdominal

### C. Ejemplos de Ejercicios Canónicos (MVP)

| Ejercicio                 | Grupo Primario   | Patrón          | Tipo      | Equipamiento      |
| ------------------------- | ---------------- | --------------- | --------- | ----------------- |
| Press de Banca            | Pecho            | Push Horizontal | Compuesto | Barra, Banco      |
| Sentadilla                | Cuádriceps       | Squat           | Compuesto | Barra, Rack       |
| Peso Muerto               | Isquiotibiales   | Hinge           | Compuesto | Barra             |
| Dominadas                 | Dorsal Ancho     | Pull Vertical   | Compuesto | Barra fija        |
| Press Militar             | Hombro           | Push Vertical   | Compuesto | Barra, Rack       |
| Curl de Bíceps            | Bíceps           | Isolation       | Aislado   | Barra, Mancuernas |
| Extensiones de Cuádriceps | Cuádriceps       | Isolation       | Aislado   | Máquina           |
| Remo con Barra            | Espalda          | Pull Horizontal | Compuesto | Barra, Discos     |
| Hip Thrust                | Glúteos          | Hinge           | Compuesto | Barra, Banco      |
| Face Pull                 | Hombro Posterior | Pull Horizontal | Aislado   | Polea             |

### D. Estrategia de Migración

**Paso 1: Mapeo**

- Analizar ejercicios existentes en producción
- Crear tabla de mapeo: ejercicio existente → ejercicio canónico
- Identificar ejercicios sin equivalente canónico (requieren creación)

**Paso 2: Migración de Datos**

- Ejecutar script de migración en batch
- Actualizar foreign keys en RoutineExercise y WorkoutExercise
- Mantener tabla de backup por seguridad

**Paso 3: Validación**

- Verificar integridad de datos post-migración
- Validar que todas las rutinas funcionan
- Verificar que historial de entrenamientos es accesible

**Paso 4: Limpieza**

- Eliminar ejercicios duplicados (manteniendo canónicos)
- Archivar ejercicios no mapeados para revisión manual

---

## Historial de Cambios

| Versión | Fecha      | Cambio          |
| ------- | ---------- | --------------- |
| 1.0     | 2026-03-28 | Versión inicial |
