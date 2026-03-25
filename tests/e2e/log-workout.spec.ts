import { test, expect } from '@playwright/test'
import { WorkoutSessionPage } from './pages/WorkoutSessionPage'
import { PrismaClient } from '@prisma/client'
import { DRAFT_SESSION_VERSION } from '../../src/modules/log-workout/modules/session/types/draft-session'

let prisma: PrismaClient
let exercises: { id: number; name: string }[] = []

test.beforeAll(async () => {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://user:password@localhost:5438/gym_tracker_db?sslmode=disable',
      },
    },
  })
  exercises = await prisma.exercise.findMany({
    select: {
      id: true,
      name: true,
    },
    take: 5,
  })
  console.log('Fetched exercises:', exercises)
})

test.afterAll(async () => {
  await prisma.$disconnect()
})

test.describe('Log Workout Session E2E Tests', () => {
  test.setTimeout(60000) // Increase timeout for the entire describe block

  let workoutSessionPage: WorkoutSessionPage
  let dummyDraftData: any

  test.beforeEach(async ({ page, context }) => {
    workoutSessionPage = new WorkoutSessionPage(page)
    // Clear localStorage before each test using init script
    // This ensures a clean state for localStorage for each test
    await context.addInitScript(() => localStorage.clear())

    // Initialize dummyDraftData here to ensure exercises are fetched
    dummyDraftData = {
      id: 'test-session-id',
      version: DRAFT_SESSION_VERSION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: { type: 'free' }, // Assuming a free workout for the draft
      timer: {
        startDate: new Date().toISOString(),
        elapsedTime: 0,
      },
      exercises: [
        {
          id: exercises[0].id,
          name: exercises[0].name,
          targetSeries: 3, // Example value
          targetReps: '8-12', // Example value
          sets: [
            {
              id: 'set-1',
              exerciseId: exercises[0].id,
              exerciseName: exercises[0].name,
              setNumber: 1,
              repsDone: 10,
              weightKg: 50,
              completed: true,
            },
          ],
        },
      ],
      sessionNotes: 'Test notes from draft',
      activeExerciseId: null,
      lastCompletedSetId: null,
    }
  })

  // 1. Sin draft → Iniciar sesión → Sesión nueva
  test('should initiate free workout session successfully (no draft, no modal)', async ({
    page,
  }) => {
    await workoutSessionPage.goto() // Navigate to dashboard first
    await workoutSessionPage.waitForLoadingScreenToDisappear() // Wait for loading to finish
    await workoutSessionPage.startWorkout()
    await workoutSessionPage.waitForLoadingScreenToDisappear() // Wait for loading to finish after starting workout
    await expect(page.url()).toContain('/log-workout/session')
    await expect(page.getByText('Entrenamiento Libre')).toBeVisible()
    await workoutSessionPage.expectModalNotVisible() // Explicitly check no modal
  })

  // 2. Con draft → Reanudar → Sesión recuperada (sin modal)
  test('should resume session from draft without modal when using recover=true', async ({
    page,
  }) => {
    await workoutSessionPage.setDraftInLocalStorageBeforeNavigation(
      dummyDraftData
    )
    await page.goto('/log-workout/session?recover=true')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500) // Wait for draft recovery to complete
    await workoutSessionPage.waitForLoadingScreenToDisappear() // Wait for loading to finish
    await workoutSessionPage.expectModalNotVisible()
    // Use normalized exercise name for the test (without accents and with dashes for spaces)
    const normalizedExerciseName = dummyDraftData.exercises[0].name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
    await workoutSessionPage.expectExerciseAndSetData(
      normalizedExerciseName,
      1,
      dummyDraftData.exercises[0].sets[0].repsDone.toString(),
      dummyDraftData.exercises[0].sets[0].weightKg.toString()
    )
  })

  // 3. Con draft → Nueva → Modal → Continuar → Draft recuperado
  test('should show modal, then continue draft when starting new session with existing draft', async ({
    page,
  }) => {
    await workoutSessionPage.setDraftInLocalStorageBeforeNavigation(
      dummyDraftData
    )
    await page.goto('/log-workout/session')
    // Wait for the page to be fully loaded and for draft detection
    await page.waitForLoadState('networkidle')
    // Wait longer for the Provider to detect the draft and show modal
    await page.waitForTimeout(3000)
    // In this case, the modal should appear, so we don't wait for loading screen to disappear
    // Instead, we wait for the modal to be visible
    await workoutSessionPage.expectModalVisible()
    await workoutSessionPage.continueDraft() // Clicks continue, expects modal to disappear
    await workoutSessionPage.waitForLoadingScreenToDisappear() // Wait for loading to finish after continuing draft
    await workoutSessionPage.expectExerciseAndSetData(
      dummyDraftData.exercises[0].name,
      1,
      dummyDraftData.exercises[0].sets[0].repsDone.toString(),
      dummyDraftData.exercises[0].sets[0].weightKg.toString()
    )
  })

  // 4. Con draft → Nueva → Modal → Descartar → Nueva sesión (draft eliminado)
  test('should show modal, then discard draft and start new session', async ({
    page,
  }) => {
    await workoutSessionPage.setDraftInLocalStorageBeforeNavigation(
      dummyDraftData
    )
    await page.goto('/log-workout/session')
    // Wait for the page to be fully loaded and for draft detection
    await page.waitForLoadState('networkidle')
    // Wait longer for the Provider to detect the draft and show modal
    await page.waitForTimeout(2000)
    // In this case, the modal should appear, so we don't wait for loading screen to disappear
    // Instead, we wait for the modal to be visible
    await workoutSessionPage.expectModalVisible()
    await workoutSessionPage.discardDraft() // Clicks discard, expects modal to disappear
    await workoutSessionPage.waitForLoadingScreenToDisappear() // Wait for loading to finish after discarding draft
    await workoutSessionPage.expectDraftToBeCleared() // Verify draft is removed from localStorage
    await expect(workoutSessionPage.emptySessionMessage).toBeVisible() // Verify new empty session
  })

  // 5. Persistencia: Completar set → Reload → Valor persistido
  test('should persist draft after reload', async ({ page }) => {
    await workoutSessionPage.goto() // Navigate to dashboard first
    await workoutSessionPage.waitForLoadingScreenToDisappear() // Wait for loading to finish
    await workoutSessionPage.startWorkout() // Starts a new clean session
    await workoutSessionPage.waitForLoadingScreenToDisappear() // Wait for loading to finish after starting workout
    const exerciseName = exercises[0].name
    await workoutSessionPage.addExercise(exerciseName)
    await workoutSessionPage.completeSet(exerciseName, 1, '10', '50')

    // After reload, we need to navigate with ?recover=true to auto-recover the draft
    // First get the current URL and add recover=true
    const currentUrl = await page.url()
    const newUrl = currentUrl.includes('?')
      ? `${currentUrl}&recover=true`
      : `${currentUrl}?recover=true`

    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Wait for draft recovery to complete
    await workoutSessionPage.waitForLoadingScreenToDisappear() // Wait for loading to finish after reload
    // After reload with recover=true, the app should automatically recover the draft
    // So we expect the modal NOT to be visible and the data to be there.
    await workoutSessionPage.expectModalNotVisible()
    // Normalize exercise name for the test (without accents)
    const normalizedExerciseName = exerciseName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
    await workoutSessionPage.expectExerciseAndSetData(
      normalizedExerciseName,
      1,
      '10',
      '50'
    )
  })

  // Existing tests, potentially modified for clarity or consistency
  test('should show empty session state for free workout', async ({ page }) => {
    await workoutSessionPage.goto() // Navigate to dashboard first
    await workoutSessionPage.waitForLoadingScreenToDisappear() // Wait for loading to finish
    await workoutSessionPage.startWorkout()
    await workoutSessionPage.waitForLoadingScreenToDisappear() // Wait for loading to finish after starting workout
    await expect(workoutSessionPage.emptySessionMessage).toBeVisible()
  })

  test('should add an exercise to the session', async () => {
    await workoutSessionPage.goto() // Navigate to dashboard first
    await workoutSessionPage.waitForLoadingScreenToDisappear() // Wait for loading to finish
    await workoutSessionPage.startWorkout()
    await workoutSessionPage.waitForLoadingScreenToDisappear() // Wait for loading to finish after starting workout
    const exerciseName = exercises[0].name
    await workoutSessionPage.addExercise(exerciseName)
    await expect(workoutSessionPage.page.getByText(exerciseName)).toBeVisible()
  })

  test('should complete a set for an exercise', async () => {
    await workoutSessionPage.goto() // Navigate to dashboard first
    await workoutSessionPage.waitForLoadingScreenToDisappear() // Wait for loading to finish
    await workoutSessionPage.startWorkout()
    await workoutSessionPage.waitForLoadingScreenToDisappear() // Wait for loading to finish after starting workout
    const exerciseName = exercises[0].name
    await workoutSessionPage.addExercise(exerciseName)

    await workoutSessionPage.completeSet(exerciseName, 1, '10', '50')
    // Normalize exercise name for data-test-id (remove accents and replace spaces with dashes)
    const normalizedName = exerciseName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
    const exerciseSection = workoutSessionPage.page.locator(
      `[data-test-id="exercise-section-${normalizedName}"]`
    )
    const setRow = exerciseSection.locator(`[data-test-id="set-row-1"]`)
    await expect(
      setRow.locator('[data-test-id="completed-set-indicator"]')
    ).toBeVisible()
  })

  test('should finalize workout session and save to DB', async ({ page }) => {
    await workoutSessionPage.goto() // Navigate to dashboard first
    await workoutSessionPage.waitForLoadingScreenToDisappear() // Wait for loading to finish
    await workoutSessionPage.startWorkout()
    await workoutSessionPage.waitForLoadingScreenToDisappear() // Wait for loading to finish after starting workout
    const exerciseName = exercises[0].name
    await workoutSessionPage.addExercise(exerciseName)
    await workoutSessionPage.completeSet(exerciseName, 1, '10', '50')
    await workoutSessionPage.completeSet(exerciseName, 2, '10', '50')
    await workoutSessionPage.completeSet(exerciseName, 3, '10', '50')

    await workoutSessionPage.finalizeWorkout()
    await expect(page.url()).toContain('/log-workout')
    await expect(page.getByText('Sesión guardada con éxito')).toBeVisible()
  })
})
