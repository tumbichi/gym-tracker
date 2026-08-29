# Exercise Module Redesign - Task Checklist

## Table of Contents

1.  [Definition of Done](#definition-of-done)
2.  [Dependency Graph](#dependency-graph)
3.  [Database & Migration Tasks](#database--migration-tasks)
4.  [Backend Services Tasks](#backend-services-tasks)
5.  [Frontend Types & Utilities Tasks](#frontend-types--utilities-tasks)
6.  [Frontend Components Tasks](#frontend-components-tasks)
7.  [Frontend Hooks Tasks](#frontend-hooks-tasks)
8.  [Frontend Features Tasks](#frontend-features-tasks)
9.  [Integration & Testing Tasks](#integration--testing-tasks)

---

## Definition of Done

The Exercise Module Redesign is considered complete when:

- All new database schemas (enums, models, relations) are implemented and migrated.
- Initial reference data (Muscle Groups, Equipment) is seeded.
- Existing exercise data is successfully migrated to the new canonical system.
- All backend services (`exerciseService.ts`, `exercises.actions.ts`) are implemented, tested, and handle CRUD operations, search, duplicate detection, and alias management.
- All new frontend components are developed, styled, and unit-tested.
- All new React hooks are implemented, tested, and provide necessary state management and data fetching logic.
- All frontend features (`exercise-list`, `exercise-detail`, `exercise-form`, `exercise-picker`) are implemented and integrated.
- The existing `src/app/(index)/exercises/client.tsx` page is refactored to use the new feature components.
- The `exercise-form.tsx` component is moved to the new module structure.
- Critical user flows (e.g., creating an exercise, searching, filtering, viewing details) are covered by E2E tests.
- All unit and integration tests pass.
- The application functions correctly with the new exercise module, and no regressions are introduced in existing functionalities (routines, workout logging).
- Performance metrics (e.g., search response time < 500ms) are met.

---

## Dependency Graph

```mermaid
graph TD
    subgraph Database & Migration
        DB-001[EX-DB-001: Define Enums & Models] --> DB-002
        DB-002[EX-DB-002: Generate & Apply Migration (Phase 1)] --> DB-003
        DB-003[EX-DB-003: Create & Run Seed Script (Phase 2)] --> DB-004
        DB-004[EX-DB-004: Create & Run Migration Script (Phase 3)] --> DB-005
        DB-005[EX-DB-005: Update FKs & Generate Migration (Phase 4)] --> DB-006
        DB-006[EX-DB-006: Cleanup Exercise Model (Phase 5)]
    end

    subgraph Backend Services
        BS-001[EX-BS-001: Implement exercise-helpers.ts] --> BS-002
        BS-001 --> BS-003
        BS-002[EX-BS-002: Implement taxonomy.ts] --> BS-003
        BS-003[EX-BS-003: Implement exerciseService.ts] --> BS-004
        BS-004[EX-BS-004: Implement exercises.actions.ts]
    end

    subgraph Frontend Types & Utilities
        FTU-001[EX-FTU-001: Create types/index.ts]
    end

    subgraph Frontend Components
        FC-001[EX-FC-001: Create MuscleGroupBadge.tsx] --> FC-005
        FC-002[EX-FC-002: Create EquipmentBadge.tsx] --> FC-005
        FC-003[EX-FC-003: Create ExerciseCard.tsx] --> FC-005
        FC-004[EX-FC-004: Create ExerciseSearch.tsx] --> FC-007
        FC-005[EX-FC-005: Create ExerciseDetailPanel.tsx] --> FC-006
        FC-006[EX-FC-006: Create ExerciseAliasList.tsx]
        FC-006 --> FC-007
        FC-007[EX-FC-007: Create ExerciseVariationTree.tsx]
        FC-007 --> FH-004
    end

    subgraph Frontend Hooks
        FH-001[EX-FH-001: Implement useExercises.ts] --> FF-001
        FH-002[EX-FH-002: Implement useExerciseSearch.ts] --> FF-001
        FH-002 --> FF-003
        FH-003[EX-FH-003: Implement useExerciseFilters.ts] --> FF-001
        FH-004[EX-FH-004: Implement useDuplicateDetection.ts] --> FF-003
        FH-005[EX-FH-005: Implement useExerciseAliases.ts] --> FF-003
    end

    subgraph Frontend Features
        FF-001[EX-FF-001: Create exercise-list.feature.tsx] --> FF-005
        FF-002[EX-FF-002: Create exercise-detail.feature.tsx] --> FF-005
        FF-003[EX-FF-003: Create exercise-form.feature.tsx] --> FF-005
        FF-004[EX-FF-004: Create exercise-picker.feature.tsx] --> FF-005
        FF-005[EX-FF-005: Refactor app/exercises/client.tsx]
        FF-006[EX-FF-006: Move exercise-form.tsx]
    end

    subgraph Integration & Testing
        IT-001[EX-IT-001: Unit Tests for Backend Services]
        IT-002[EX-IT-002: Unit Tests for Frontend Hooks]
        IT-003[EX-IT-003: Unit Tests for Frontend Components]
        IT-004[EX-IT-004: Integration Tests for Frontend Features]
        IT-005[EX-IT-005: E2E Tests for Core Flows]
        IT-006[EX-IT-006: Performance Testing]
    end

    DB-006 --> BS-003
    BS-004 --> FH-001
    BS-004 --> FH-002
    BS-004 --> FH-003
    BS-004 --> FH-004
    BS-004 --> FH-005
    FTU-001 --> BS-003
    FTU-001 --> BS-004
    FTU-001 --> FH-001
    FTU-001 --> FH-002
    FTU-001 --> FH-003
    FTU-001 --> FC-001
    FTU-001 --> FC-002
    FTU-001 --> FC-003
    FTU-001 --> FC-004
    FTU-001 --> FC-005
    FTU-001 --> FC-006
    FTU-001 --> FC-007

    FF-005 --> IT-005
    FF-006 --> IT-005
    IT-001 --> IT-004
    IT-002 --> IT-004
    IT-003 --> IT-004
    IT-004 --> IT-005
    IT-005 --> IT-006
```

---

## Database & Migration Tasks

### EX-DB-001: Define Enums & Models (Phase 1 Prep)

**Description**: Define all 7 new enums (`MovementPattern`, `ExerciseType`, `ForceVector`, `DifficultyLevel`, `EquipmentCategory`, `BodyRegion`, `MuscleType`) and the 4 new models (`ExerciseAlias`, `MuscleGroup`, `Equipment`, `UserGymConfig`) in `prisma/schema.prisma`. Update the `Exercise` model with new nullable fields and `legacyId`.

**Files**:

- `prisma/schema.prisma` (modify)

**Dependencies**: None

**Acceptance Criteria**:

- [ ] All 7 enums are correctly defined in `prisma/schema.prisma`.
- [ ] `ExerciseAlias`, `MuscleGroup`, `Equipment`, `UserGymConfig` models are defined.
- [ ] `Exercise` model includes `canonicalName`, `slug`, `description`, `instructions`, `primaryMuscleId`, `secondaryMuscles`, `movementPattern`, `exerciseType`, `forceVector`, `difficulty`, `equipment`, `videoUrl`, `imageUrl`, `tags`, `isCanonical`, `isActive`, `baseExerciseId`, `aliases`, `legacyId` fields, all new fields are nullable.
- [ ] Relationships between new models and `Exercise` are correctly defined (e.g., `Exercise 1--* ExerciseAlias`, `Exercise *--* MuscleGroup`).

**Effort**: Medium
**Assigned To**: backend-coder

### EX-DB-002: Generate & Apply Migration (Phase 1)

**Description**: Generate and apply the first Prisma migration to add the new enums, models, and updated `Exercise` fields to the database. This migration should not break existing functionality.

**Files**:

- `prisma/migrations/<timestamp>_add_exercise_taxonomy_tables/migration.sql` (create)

**Dependencies**: EX-DB-001

**Acceptance Criteria**:

- [ ] `pnpm prisma migrate dev --name add_exercise_taxonomy_tables` runs successfully.
- [ ] New tables (`MuscleGroup`, `Equipment`, `ExerciseAlias`, `UserGymConfig`) are created in the database.
- [ ] `Exercise` table schema is updated with new nullable columns.
- [ ] Existing application functionality remains intact.

**Effort**: Small
**Assigned To**: backend-coder

### EX-DB-003: Create & Run Seed Script (Phase 2)

**Description**: Create a seed script (`prisma/seed-exercise-taxonomy.ts`) to populate the `MuscleGroup` and `Equipment` tables with initial, canonical data as defined in the RFC.

**Files**:

- `prisma/seed-exercise-taxonomy.ts` (create)

**Dependencies**: EX-DB-002

**Acceptance Criteria**:

- [ ] `prisma/seed-exercise-taxonomy.ts` is created with data for muscle groups and equipment.
- [ ] `pnpm exec prisma db seed` runs successfully.
- [ ] `MuscleGroup` and `Equipment` tables are populated with the specified data.

**Effort**: Medium
**Assigned To**: backend-coder

### EX-DB-004: Create & Run Migration Script (Phase 3)

**Description**: Develop a script (`scripts/migrate-exercises-to-canonical.ts`) to migrate existing exercises to the new canonical system. This involves populating `canonicalName`, `slug`, `primaryMuscleId`, `movementPattern`, `exerciseType`, `difficulty`, `equipment` and `legacyId` for existing `Exercise` entries.

**Files**:

- `scripts/migrate-exercises-to-canonical.ts` (create)

**Dependencies**: EX-DB-003

**Acceptance Criteria**:

- [ ] `scripts/migrate-exercises-to-canonical.ts` is created and correctly maps old exercise data to new fields.
- [ ] The script runs successfully and updates existing `Exercise` records.
- [ ] `legacyId` field is populated for all migrated exercises.
- [ ] Existing routines and workout logs still reference the correct exercises.

**Effort**: Large
**Assigned To**: backend-coder

### EX-DB-005: Update FKs & Generate Migration (Phase 4)

**Description**: Modify the `RoutineExercise`, `WorkoutExercise`, and `SetEntry` models in `prisma/schema.prisma` to change the `exerciseId` field type from `Int` to `String`, and update their relations to the `Exercise` model. Generate and apply the corresponding Prisma migration.

**Files**:

- `prisma/schema.prisma` (modify)
- `prisma/migrations/<timestamp>_update_exercise_fks/migration.sql` (create)

**Dependencies**: EX-DB-004

**Acceptance Criteria**:

- [ ] `exerciseId` in `RoutineExercise`, `WorkoutExercise`, and `SetEntry` is `String`.
- [ ] Relations to `Exercise` model are updated to use the new `String` `id`.
- [ ] `pnpm prisma migrate dev --name update_exercise_fks` runs successfully.
- [ ] Data integrity is maintained, and existing routines/workouts function correctly.

**Effort**: Medium
**Assigned To**: backend-coder

### EX-DB-006: Cleanup Exercise Model (Phase 5)

**Description**: After successful migration and verification, remove the `legacyId` field from the `Exercise` model in `prisma/schema.prisma` as it's no longer needed.

**Files**:

- `prisma/schema.prisma` (modify)
- `prisma/migrations/<timestamp>_remove_legacy_id/migration.sql` (create)

**Dependencies**: EX-DB-005

**Acceptance Criteria**:

- [ ] `legacyId` field is removed from `Exercise` model.
- [ ] `pnpm prisma migrate dev --name remove_legacy_id` runs successfully.
- [ ] All exercise-related functionality continues to work without issues.

**Effort**: Small
**Assigned To**: backend-coder

---

## Backend Services Tasks

### EX-BS-001: Implement exercise-helpers.ts

**Description**: Create `src/modules/exercises/utils/exercise-helpers.ts` to include utility functions like `generateSlug` and `calculateSimilarity` (for duplicate detection).

**Files**:

- `src/modules/exercises/utils/exercise-helpers.ts` (create)

**Dependencies**: None

**Acceptance Criteria**:

- [ ] `generateSlug(name: string)` correctly converts a string to a URL-friendly slug.
- [ ] `calculateSimilarity(s1: string, s2: string)` returns a similarity score (e.g., using Levenshtein distance or similar algorithm).

**Effort**: Small
**Assigned To**: backend-coder

### EX-BS-002: Implement taxonomy.ts

**Description**: Create `src/modules/exercises/utils/taxonomy.ts` to define constants or helper functions related to muscle groups, equipment, movement patterns, etc., if needed for consistent data handling across the backend.

**Files**:

- `src/modules/exercises/utils/taxonomy.ts` (create)

**Dependencies**: None

**Acceptance Criteria**:

- [ ] `taxonomy.ts` exists and contains relevant constants or helper functions.

**Effort**: Small
**Assigned To**: backend-coder

### EX-BS-003: Implement exerciseService.ts

**Description**: Implement `src/modules/exercises/services/exerciseService.ts` with all necessary CRUD operations for `Exercise`, `ExerciseAlias`, `MuscleGroup`, `Equipment`, and `UserGymConfig`. Include functions for searching, filtering, duplicate detection, and fetching lookup data as defined in the RFC.

**Files**:

- `src/modules/exercises/services/exerciseService.ts` (create)

**Dependencies**: EX-DB-006, EX-BS-001, EX-BS-002, EX-FTU-001

**Acceptance Criteria**:

- [ ] `getExercises`, `getExercisesPaginated`, `getExerciseById`, `getExerciseBySlug`, `searchExercises` are implemented.
- [ ] `createExercise`, `updateExercise`, `deleteExercise` (soft delete) are implemented.
- [ ] `checkForDuplicates` is implemented using `calculateSimilarity`.
- [ ] `addAlias`, `removeAlias` are implemented.
- [ ] `getMuscleGroups`, `getEquipment` are implemented.
- [ ] All functions interact correctly with Prisma and the database.

**Effort**: Large
**Assigned To**: backend-coder

### EX-BS-004: Implement exercises.actions.ts

**Description**: Implement `src/modules/exercises/actions/exercises.actions.ts` as Next.js Server Actions. These actions will call the `exerciseService` functions and handle `revalidatePath` for data consistency. Include actions for all CRUD, search, duplicate check, alias management, and lookup data operations.

**Files**:

- `src/modules/exercises/actions/exercises.actions.ts` (create)

**Dependencies**: EX-BS-003, EX-FTU-001

**Acceptance Criteria**:

- [ ] All read and write actions (e.g., `getExercises`, `createExercise`, `checkDuplicateExercise`, `addExerciseAlias`) are implemented.
- [ ] Actions correctly call `exerciseService` functions.
- [ ] `revalidatePath` is used appropriately after write operations.
- [ ] Error handling is implemented for all actions.

**Effort**: Medium
**Assigned To**: backend-coder

---

## Frontend Types & Utilities Tasks

### EX-FTU-001: Create types/index.ts

**Description**: Create `src/modules/exercises/types/index.ts` to define all TypeScript interfaces and types for the exercise module, including Prisma type exports, enums, relation types, form types, search/filter types, action result types, and view types as specified in the RFC.

**Files**:

- `src/modules/exercises/types/index.ts` (create)

**Dependencies**: None

**Acceptance Criteria**:

- [ ] All Prisma types are re-exported.
- [ ] All enums are re-exported.
- [ ] `ExerciseWithMuscle`, `ExerciseDetail`, `ExerciseCard` types are defined.
- [ ] `CreateExercisePayload`, `UpdateExercisePayload`, `CreateAliasPayload` are defined.
- [ ] `ExerciseFilters`, `ExerciseSortOption`, `PaginationParams`, `PaginatedResult` are defined.
- [ ] `ActionResult`, `DuplicateCheckResult` are defined.
- [ ] `ExerciseOption`, `MuscleGroupWithCount`, `EquipmentWithCount` are defined.

**Effort**: Small
**Assigned To**: frontend-coder

---

## Frontend Components Tasks

### EX-FC-001: Create MuscleGroupBadge.tsx

**Description**: Create a presentational component `src/modules/exercises/components/MuscleGroupBadge.tsx` to display muscle group information.

**Files**:

- `src/modules/exercises/components/MuscleGroupBadge.tsx` (create)

**Dependencies**: EX-FTU-001

**Acceptance Criteria**:

- [ ] Component renders muscle group name and potentially body region/type.
- [ ] Accepts `MuscleGroup` as props.
- [ ] Styled appropriately.

**Effort**: Small
**Assigned To**: frontend-coder

### EX-FC-002: Create EquipmentBadge.tsx

**Description**: Create a presentational component `src/modules/exercises/components/EquipmentBadge.tsx` to display equipment information.

**Files**:

- `src/modules/exercises/components/EquipmentBadge.tsx` (create)

**Dependencies**: EX-FTU-001

**Acceptance Criteria**:

- [ ] Component renders equipment name and category.
- [ ] Accepts `Equipment` as props.
- [ ] Styled appropriately.

**Effort**: Small
**Assigned To**: frontend-coder

### EX-FC-003: Create ExerciseCard.tsx

**Description**: Create a presentational component `src/modules/exercises/components/ExerciseCard.tsx` to display a summary of an exercise for list views. It should use `MuscleGroupBadge` and `EquipmentBadge`.

**Files**:

- `src/modules/exercises/components/ExerciseCard.tsx` (create)

**Dependencies**: EX-FTU-001, EX-FC-001, EX-FC-002

**Acceptance Criteria**:

- [ ] Component displays exercise canonical name, primary muscle, and equipment.
- [ ] Accepts `ExerciseCard` type as props.
- [ ] Uses `MuscleGroupBadge` and `EquipmentBadge`.
- [ ] Styled for list/grid display.

**Effort**: Medium
**Assigned To**: frontend-coder

### EX-FC-004: Create ExerciseSearch.tsx

**Description**: Create a presentational component `src/modules/exercises/components/ExerciseSearch.tsx` for searching exercises, including an input field and displaying search results.

**Files**:

- `src/modules/exercises/components/ExerciseSearch.tsx` (create)

**Dependencies**: EX-FTU-001

**Acceptance Criteria**:

- [ ] Renders a search input.
- [ ] Displays search results (e.g., a list of `ExerciseCard`s).
- [ ] Handles input changes and passes them to a search hook.

**Effort**: Medium
**Assigned To**: frontend-coder

### EX-FC-005: Create ExerciseDetailPanel.tsx

**Description**: Create a presentational component `src/modules/exercises/components/ExerciseDetailPanel.tsx` to display the full details of an exercise, including description, instructions, muscles, equipment, and media.

**Files**:

- `src/modules/exercises/components/ExerciseDetailPanel.tsx` (create)

**Dependencies**: EX-FTU-001, EX-FC-001, EX-FC-002, EX-FC-003

**Acceptance Criteria**:

- [ ] Displays all fields from `ExerciseDetail` type.
- [ ] Uses `MuscleGroupBadge` and `EquipmentBadge` for relevant data.
- [ ] Presents information clearly and legibly.

**Effort**: Medium
**Assigned To**: frontend-coder

### EX-FC-006: Create ExerciseAliasList.tsx

**Description**: Create a presentational component `src/modules/exercises/components/ExerciseAliasList.tsx` to display and manage aliases for an exercise.

**Files**:

- `src/modules/exercises/components/ExerciseAliasList.tsx` (create)

**Dependencies**: EX-FTU-001

**Acceptance Criteria**:

- [ ] Lists existing aliases for an exercise.
- [ ] Provides UI to add and remove aliases.
- [ ] Accepts `ExerciseAlias[]` as props and callbacks for actions.

**Effort**: Medium
**Assigned To**: frontend-coder

### EX-FC-007: Create ExerciseVariationTree.tsx

**Description**: Create a presentational component `src/modules/exercises/components/ExerciseVariationTree.tsx` to visualize the hierarchy of an exercise and its variations.

**Files**:

- `src/modules/exercises/components/ExerciseVariationTree.tsx` (create)

**Dependencies**: EX-FTU-001, EX-FC-003

**Acceptance Criteria**:

- [ ] Displays the base exercise and its variations in a tree-like structure.
- [ ] Each variation is clickable to view its details.
- [ ] Accepts `ExerciseDetail` (with variations) as props.

**Effort**: Medium
**Assigned To**: frontend-coder

---

## Frontend Hooks Tasks

### EX-FH-001: Implement useExercises.ts

**Description**: Implement `src/modules/exercises/hooks/useExercises.ts` to fetch and cache exercise data using SWR, including paginated and non-paginated lists.

**Files**:

- `src/modules/exercises/hooks/useExercises.ts` (create)

**Dependencies**: EX-BS-004, EX-FTU-001

**Acceptance Criteria**:

- [ ] `useExercises()` fetches all exercises.
- [ ] `useExercisesPaginated()` fetches exercises with pagination and filters.
- [ ] SWR caching and revalidation are correctly configured.
- [ ] Returns `exercises`, `isLoading`, `isError`, `error`, `mutate` (for non-paginated) and `data`, `pagination`, `isLoading`, `isError`, `error`, `mutate` (for paginated).

**Effort**: Medium
**Assigned To**: frontend-coder

### EX-FH-002: Implement useExerciseSearch.ts

**Description**: Implement `src/modules/exercises/hooks/useExerciseSearch.ts` to handle exercise search logic, including debouncing the search input and fetching results.

**Files**:

- `src/modules/exercises/hooks/useExerciseSearch.ts` (create)

**Dependencies**: EX-BS-004, EX-FTU-001

**Acceptance Criteria**:

- [ ] `useExerciseSearch()` provides `query`, `setQuery`, `results`, `isLoading`, `isError`, `error`.
- [ ] Search input is debounced to prevent excessive API calls.
- [ ] Fetches search results using `searchExercises` action.

**Effort**: Medium
**Assigned To**: frontend-coder

### EX-FH-003: Implement useExerciseFilters.ts

**Description**: Implement `src/modules/exercises/hooks/useExerciseFilters.ts` to manage exercise filtering state, synchronize with URL search parameters, and provide functions to update filters, sort options, and pagination.

**Files**:

- `src/modules/exercises/hooks/useExerciseFilters.ts` (create)

**Dependencies**: EX-FTU-001

**Acceptance Criteria**:

- [ ] Hook reads filters, sort, page, and pageSize from URL.
- [ ] Provides `updateFilters`, `updateSort`, `updatePage`, `clearFilters` functions.
- [ ] Updates URL search parameters correctly.
- [ ] Resets page to 1 when filters change.

**Effort**: Medium
**Assigned To**: frontend-coder

### EX-FH-004: Implement useDuplicateDetection.ts

**Description**: Implement `src/modules/exercises/hooks/useDuplicateDetection.ts` to provide real-time duplicate detection for exercise names, debouncing the input and calling the backend action. This can be a separate hook or integrated into `useExerciseSearch.ts` as per RFC. For clarity, it's listed separately here.

**Files**:

- `src/modules/exercises/hooks/useDuplicateDetection.ts` (create)

**Dependencies**: EX-BS-004, EX-FTU-001

**Acceptance Criteria**:

- [ ] Hook provides `name`, `setName`, `duplicateCheck`, `isChecking`.
- [ ] Input is debounced.
- [ ] Calls `checkDuplicateExercise` action and returns its result.

**Effort**: Small
**Assigned To**: frontend-coder

### EX-FH-005: Implement useExerciseAliases.ts

**Description**: Implement `src/modules/exercises/hooks/useExerciseAliases.ts` to manage aliases for a given exercise, including adding and removing aliases.

**Files**:

- `src/modules/exercises/hooks/useExerciseAliases.ts` (create)

**Dependencies**: EX-BS-004, EX-FTU-001

**Acceptance Criteria**:

- [ ] Hook provides functions to add and remove aliases.
- [ ] Manages loading and error states for alias operations.
- [ ] Revalidates exercise data after alias changes.

**Effort**: Small
**Assigned To**: frontend-coder

---

## Frontend Features Tasks

### EX-FF-001: Create exercise-list.feature.tsx

**Description**: Create the smart component `src/modules/exercises/features/exercise-list.feature.tsx`. This feature will orchestrate `useExercises`, `useExerciseSearch`, `useExerciseFilters`, `ExerciseFilters.tsx`, `ExerciseSearch.tsx`, and `ExerciseCard.tsx` to display a paginated, filterable, and searchable list of exercises.

**Files**:

- `src/modules/exercises/features/exercise-list.feature.tsx` (create)
- `src/modules/exercises/components/ExerciseFilters.tsx` (create)

**Dependencies**: EX-FH-001, EX-FH-002, EX-FH-003, EX-FC-003, EX-FC-004

**Acceptance Criteria**:

- [ ] Displays a list of exercises using `ExerciseCard`.
- [ ] Integrates `ExerciseSearch` for searching.
- [ ] Integrates `ExerciseFilters` for filtering.
- [ ] Handles pagination.
- [ ] Manages loading and error states.

**Effort**: Large
**Assigned To**: frontend-coder

### EX-FF-002: Create exercise-detail.feature.tsx

**Description**: Create the smart component `src/modules/exercises/features/exercise-detail.feature.tsx` to display the detailed view of a single exercise, including its variations and aliases. It will use `ExerciseDetailPanel`, `ExerciseAliasList`, and `ExerciseVariationTree`.

**Files**:

- `src/modules/exercises/features/exercise-detail.feature.tsx` (create)

**Dependencies**: EX-BS-004, EX-FTU-001, EX-FC-005, EX-FC-006, EX-FC-007

**Acceptance Criteria**:

- [ ] Fetches exercise details by ID or slug.
- [ ] Displays details using `ExerciseDetailPanel`.
- [ ] Shows aliases using `ExerciseAliasList`.
- [ ] Shows variations using `ExerciseVariationTree`.
- [ ] Handles loading and error states.

**Effort**: Medium
**Assigned To**: frontend-coder

### EX-FF-003: Create exercise-form.feature.tsx

**Description**: Create the smart component `src/modules/exercises/features/exercise-form.feature.tsx` for creating and editing exercises. This form will integrate `useDuplicateDetection`, `useExerciseAliases`, and interact with `exercises.actions.ts`.

**Files**:

- `src/modules/exercises/features/exercise-form.feature.tsx` (create)

**Dependencies**: EX-BS-004, EX-FTU-001, EX-FH-004, EX-FH-005, EX-FC-006

**Acceptance Criteria**:

- [ ] Form for creating/editing exercise details (name, description, muscles, equipment, etc.).
- [ ] Real-time duplicate detection using `useDuplicateDetection`.
- [ ] Integration with `useExerciseAliases` for managing aliases.
- [ ] Submits data using `createExercise` or `updateExercise` actions.
- [ ] Handles form validation and error display.

**Effort**: Large
**Assigned To**: frontend-coder

### EX-FF-004: Create exercise-picker.feature.tsx

**Description**: Create the smart component `src/modules/exercises/features/exercise-picker.feature.tsx`. This component will serve as the public interface for other modules (e.g., routines, workout logging) to select exercises. It will integrate search and filtering capabilities.

**Files**:

- `src/modules/exercises/features/exercise-picker.feature.tsx` (create)

**Dependencies**: EX-FF-001, EX-FH-002, EX-FH-003

**Acceptance Criteria**:

- [ ] Provides a UI for searching and filtering exercises.
- [ ] Allows selection of one or more exercises.
- [ ] Emits selected exercise(s) via a callback.
- [ ] Reusable by other modules.

**Effort**: Medium
**Assigned To**: frontend-coder

### EX-FF-005: Refactor app/exercises/client.tsx

**Description**: Refactor the existing `src/app/(index)/exercises/client.tsx` page to use the new `exercise-list.feature.tsx` component. This page should become "thin" and primarily render the feature.

**Files**:

- `src/app/(index)/exercises/client.tsx` (modify)

**Dependencies**: EX-FF-001

**Acceptance Criteria**:

- [ ] `client.tsx` imports and renders `exercise-list.feature.tsx`.
- [ ] Minimal logic remains in `client.tsx`.
- [ ] The exercises page functions as expected with the new feature.

**Effort**: Small
**Assigned To**: frontend-coder

### EX-FF-006: Move exercise-form.tsx

**Description**: Move the existing `exercise-form.tsx` from `src/core/components/` to `src/modules/exercises/features/exercise-form.feature.tsx` and adapt it to the new module structure and `exercises.actions.ts`.

**Files**:

- `src/core/components/exercise-form.tsx` (delete)
- `src/modules/exercises/features/exercise-form.feature.tsx` (modify/create based on existing code)

**Dependencies**: EX-FF-003

**Acceptance Criteria**:

- [ ] Original `exercise-form.tsx` is removed from `src/core/components/`.
- [ ] The new `exercise-form.feature.tsx` incorporates the logic and UI from the old component.
- [ ] Any existing references to the old component are updated to the new feature.

**Effort**: Medium
**Assigned To**: frontend-coder

---

## Integration & Testing Tasks

### EX-IT-001: Unit Tests for Backend Services

**Description**: Write comprehensive unit tests for `src/modules/exercises/services/exerciseService.ts` to ensure all CRUD, search, filter, duplicate detection, and alias management functions work as expected.

**Files**:

- `src/modules/exercises/__tests__/exercise-service.test.ts` (create)

**Dependencies**: EX-BS-003

**Acceptance Criteria**:

- [ ] Test coverage for all public functions in `exerciseService.ts`.
- [ ] Tests cover edge cases and error conditions.
- [ ] All tests pass.

**Effort**: Large
**Assigned To**: backend-coder

### EX-IT-002: Unit Tests for Frontend Hooks

**Description**: Write unit tests for `src/modules/exercises/hooks/useExercises.ts`, `useExerciseSearch.ts`, `useExerciseFilters.ts`, `useDuplicateDetection.ts`, and `useExerciseAliases.ts`.

**Files**:

- `src/modules/exercises/__tests__/hooks/useExercises.test.ts` (create)
- `src/modules/exercises/__tests__/hooks/useExerciseSearch.test.ts` (create)
- `src/modules/exercises/__tests__/hooks/useExerciseFilters.test.ts` (create)
- `src/modules/exercises/__tests__/hooks/useDuplicateDetection.test.ts` (create)
- `src/modules/exercises/__tests__/hooks/useExerciseAliases.test.ts` (create)

**Dependencies**: EX-FH-001, EX-FH-002, EX-FH-003, EX-FH-004, EX-FH-005

**Acceptance Criteria**:

- [ ] Test coverage for all logic within the hooks.
- [ ] Tests simulate component rendering and hook usage.
- [ ] All tests pass.

**Effort**: Medium
**Assigned To**: frontend-coder

### EX-IT-003: Unit Tests for Frontend Components

**Description**: Write unit tests for `src/modules/exercises/components/ExerciseCard.tsx`, `ExerciseFilters.tsx`, `ExerciseSearch.tsx`, `ExerciseAliasList.tsx`, `ExerciseVariationTree.tsx`, `MuscleGroupBadge.tsx`, `EquipmentBadge.tsx`, and `ExerciseDetailPanel.tsx`.

**Files**:

- `src/modules/exercises/__tests__/components/ExerciseCard.test.tsx` (create)
- `src/modules/exercises/__tests__/components/ExerciseFilters.test.tsx` (create)
- `src/modules/exercises/__tests__/components/ExerciseSearch.test.tsx` (create)
- `src/modules/exercises/__tests__/components/ExerciseAliasList.test.tsx` (create)
- `src/modules/exercises/__tests__/components/ExerciseVariationTree.test.tsx` (create)
- `src/modules/exercises/__tests__/components/MuscleGroupBadge.test.tsx` (create)
- `src/modules/exercises/__tests__/components/EquipmentBadge.test.tsx` (create)
- `src/modules/exercises/__tests__/components/ExerciseDetailPanel.test.tsx` (create)

**Dependencies**: EX-FC-001, EX-FC-002, EX-FC-003, EX-FC-004, EX-FC-005, EX-FC-006, EX-FC-007

**Acceptance Criteria**:

- [ ] Tests verify correct rendering based on props.
- [ ] Tests simulate user interactions (e.g., button clicks, input changes).
- [ ] All tests pass.

**Effort**: Large
**Assigned To**: frontend-coder

### EX-IT-004: Integration Tests for Frontend Features

**Description**: Write integration tests for `src/modules/exercises/features/exercise-list.feature.tsx`, `exercise-detail.feature.tsx`, `exercise-form.feature.tsx`, and `exercise-picker.feature.tsx` to ensure they integrate correctly with their respective hooks and components.

**Files**:

- `src/modules/exercises/__tests__/features/exercise-list.feature.test.tsx` (create)
- `src/modules/exercises/__tests__/features/exercise-detail.feature.test.tsx` (create)
- `src/modules/exercises/__tests__/features/exercise-form.feature.test.tsx` (create)
- `src/modules/exercises/__tests__/features/exercise-picker.feature.test.tsx` (create)

**Dependencies**: EX-FF-001, EX-FF-002, EX-FF-003, EX-FF-004, EX-IT-002, EX-IT-003

**Acceptance Criteria**:

- [ ] Tests verify the correct behavior of features, including data fetching, state updates, and user interactions.
- [ ] All tests pass.

**Effort**: Large
**Assigned To**: frontend-coder

### EX-IT-005: E2E Tests for Core Flows

**Description**: Develop end-to-end tests using Playwright for critical user flows within the exercise module, such as:

- Creating a new canonical exercise with aliases.
- Searching and filtering exercises.
- Viewing exercise details and variations.
- Selecting an exercise using the picker.
- Verifying duplicate detection during exercise creation.

**Files**:

- `tests/e2e/exercise-module.spec.ts` (create)

**Dependencies**: EX-FF-005, EX-FF-006, EX-IT-004

**Acceptance Criteria**:

- [ ] E2E tests cover the main user journeys.
- [ ] Tests run successfully in a headless browser.
- [ ] No regressions are introduced in related modules (routines, workout logging).

**Effort**: Large
**Assigned To**: tester-e2e

### EX-IT-006: Performance Testing

**Description**: Conduct performance testing, especially for exercise search and list loading, to ensure the application meets the target response times (< 500ms for search).

**Files**:

- (No specific file creation, but may involve profiling tools and reports)

**Dependencies**: EX-IT-005

**Acceptance Criteria**:

- [ ] Search response time is consistently below 500ms.
- [ ] Exercise list loading is performant.
- [ ] Any identified performance bottlenecks are addressed.

**Effort**: Medium
**Assigned To**: backend-coder, frontend-coder
