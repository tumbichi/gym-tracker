import { Page, expect, Locator, BrowserContext } from '@playwright/test'

export class WorkoutSessionPage {
  readonly page: Page
  readonly context: BrowserContext
  readonly draftModal: Locator
  readonly emptySessionMessage: Locator
  readonly loadingScreen: Locator // Added for loading screen

  constructor(page: Page) {
    this.page = page
    this.context = page.context()
    this.draftModal = page.locator('[data-test-id="draft-modal"]')
    this.emptySessionMessage = page.getByText(
      'Agrega tu primer ejercicio para comenzar'
    )
    this.loadingScreen = page.locator(
      'div.flex.flex-col.items-center.justify-center.h-screen.bg-background'
    ) // Selector for the entire LoadingScreen div
  }

  async goto() {
    await this.page.goto('/log-workout')
    await this.page.waitForLoadState('domcontentloaded') // Ensure DOM is loaded
    // Removed waitForMainContent here, will handle in tests
  }

  async startWorkout(expectModal: boolean = false) {
    await this.page
      .getByRole('button', { name: 'Comenzar Sesión Libre' })
      .click()
    await this.page.waitForURL('**/log-workout/session**', { timeout: 30000 })
    await this.page.waitForLoadState('networkidle') // Ensure all network requests are done
    // Removed waitForMainContent here, will handle in tests
    await this.page
      .getByText('Entrenamiento Libre')
      .waitFor({ state: 'visible', timeout: 10000 }) // Wait for the main title to be visible
    if (!expectModal) {
      await this.expectModalNotVisible()
    }
  }

  async startNewSessionWithDraft() {
    await this.page.goto('/log-workout/session')
    await this.page.waitForLoadState('networkidle') // Ensure all network requests are done
    // Removed waitForMainContent here, will handle in tests
    await this.page
      .getByText('Entrenamiento Libre')
      .waitFor({ state: 'visible', timeout: 10000 }) // Wait for the main title to be visible
    await this.expectModalVisible()
  }

  async resumeSessionFromDraft() {
    await this.page.goto('/log-workout/session?recover=true')
    await this.page.waitForLoadState('networkidle') // Ensure all network requests are done
    // Removed waitForMainContent here, will handle in tests
    await this.page
      .getByText('Entrenamiento Libre')
      .waitFor({ state: 'visible', timeout: 10000 }) // Wait for the main title to be visible
    await this.expectModalNotVisible()
  }

  async setDraftInLocalStorageBeforeNavigation(data: any) {
    // This script runs before any of the page's scripts
    // Use the correct key that the app expects
    await this.context.addInitScript((draftData) => {
      localStorage.setItem(
        'gym-tracker:draft-session',
        JSON.stringify(draftData)
      )
    }, data)
  }

  async clearLocalStorageDraft() {
    // This clears the specific draft item after a test, if needed.
    // Playwright's test isolation should provide a fresh context for each test,
    // so addInitScript effects won't leak between tests.
    await this.page.evaluate(() => {
      localStorage.removeItem('gym-tracker:draft-session')
    })
  }

  async waitForLoadingScreenToDisappear() {
    await this.loadingScreen.waitFor({ state: 'hidden', timeout: 15000 })
  }

  async expectModalVisible() {
    await this.draftModal.waitFor({ state: 'visible', timeout: 10000 }) // Wait for the modal to be visible
    await expect(this.draftModal).toBeVisible({ timeout: 10000 })
    await expect(
      this.page.getByText('Borrador de sesión encontrado')
    ).toBeVisible({ timeout: 10000 })
  }

  async expectModalNotVisible() {
    await expect(this.draftModal).not.toBeVisible({ timeout: 10000 })
    await expect(
      this.page.getByText('Borrador de sesión encontrado')
    ).not.toBeVisible({ timeout: 10000 })
  }

  async continueDraft() {
    await this.page.getByRole('button', { name: 'Continuar borrador' }).click()
    await this.draftModal.waitFor({ state: 'hidden', timeout: 10000 }) // Wait for the modal to disappear
    await this.expectModalNotVisible()
  }

  async discardDraft() {
    await this.page
      .getByRole('button', { name: 'Descartar e iniciar nueva' })
      .click()
    await this.draftModal.waitFor({ state: 'hidden', timeout: 10000 }) // Wait for the modal to disappear
    await this.expectModalNotVisible()
  }

  async expectDraftToExist() {
    await this.expectModalVisible()
  }

  async expectDraftToBeCleared() {
    const draft = await this.page.evaluate(() =>
      localStorage.getItem('gym-tracker:draft-session')
    )
    expect(draft).toBeNull()
  }

  async addExercise(exerciseName: string) {
    await this.page.getByRole('button', { name: 'Agregar Ejercicio' }).click()
    await this.page.getByPlaceholder('Buscar ejercicio...').fill(exerciseName)
    await this.page.getByText(exerciseName).click()
    await expect(this.page.getByText(exerciseName)).toBeVisible()
    await this.page.waitForLoadState('networkidle') // Wait for exercise to be added and rendered
  }

  // Helper function to normalize exercise name for data-test-id (remove accents and special chars)
  private normalizeExerciseNameForTestId(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .replace(/[^a-z0-9-]/g, '') // Remove any remaining special characters
  }

  async completeSet(
    exerciseName: string,
    setIndex: number,
    reps: string,
    weight: string
  ) {
    const normalizedName = this.normalizeExerciseNameForTestId(exerciseName)
    const exerciseSection = this.page.locator(
      `[data-test-id="exercise-section-${normalizedName}"]`
    )
    const setRow = exerciseSection.locator(
      `[data-test-id="set-row-${setIndex}"]`
    )

    await setRow.locator('[data-test-id="reps-input"]').fill(reps)
    await setRow.locator('[data-test-id="weight-input"]').fill(weight)
    await setRow.locator('[data-test-id="complete-set-button"]').click()
    await expect(
      setRow.locator('[data-test-id="completed-set-indicator"]')
    ).toBeVisible()
    await this.page.waitForLoadState('networkidle') // Wait for set to be completed and rendered
  }

  async editSet(
    exerciseName: string,
    setIndex: number,
    newReps: string,
    newWeight: string
  ) {
    const normalizedName = this.normalizeExerciseNameForTestId(exerciseName)
    const exerciseSection = this.page.locator(
      `[data-test-id="exercise-section-${normalizedName}"]`
    )
    const setRow = exerciseSection.locator(
      `[data-test-id="set-row-${setIndex}"]`
    )

    await setRow.locator('[data-test-id="edit-set-button"]').click()
    await setRow.locator('[data-test-id="reps-input"]').fill(newReps)
    await setRow.locator('[data-test-id="weight-input"]').fill(newWeight)
    await setRow.locator('[data-test-id="save-set-button"]').click()
    await expect(setRow.locator('[data-test-id="reps-display"]')).toHaveText(
      newReps
    )
    await expect(setRow.locator('[data-test-id="weight-display"]')).toHaveText(
      newWeight
    )
    await this.page.waitForLoadState('networkidle') // Wait for set to be edited and rendered
  }

  async finalizeWorkout() {
    const finishButton = this.page.getByRole('button', { name: 'Finalizar' })
    await this.page.waitForLoadState('networkidle') // Ensure all network requests are done before waiting for button
    await finishButton.waitFor({ state: 'visible', timeout: 10000 }) // Wait for the button to be visible
    await finishButton.click()
    await this.page.waitForURL('**/log-workout', { timeout: 30000 }) // Wait for navigation to log-workout page
    await expect(this.page.url()).toContain('/log-workout')
  }

  async expectExerciseAndSetData(
    exerciseName: string,
    setIndex: number,
    reps: string,
    weight: string
  ) {
    const normalizedName = this.normalizeExerciseNameForTestId(exerciseName)
    const exerciseSection = this.page.locator(
      `[data-test-id="exercise-section-${normalizedName}"]`
    )
    await exerciseSection.waitFor({ state: 'attached', timeout: 15000 }) // Wait for the exercise section to be in DOM
    await exerciseSection.scrollIntoViewIfNeeded()
    await expect(exerciseSection).toBeVisible({ timeout: 15000 }) // Wait for visible
    const setRow = exerciseSection.locator(
      `[data-test-id="set-row-${setIndex}"]`
    )
    await setRow.waitFor({ state: 'visible', timeout: 10000 }) // Wait for the set row to be visible
    await expect(setRow.locator('input[type="number"]').nth(0)).toHaveValue(
      weight,
      { timeout: 10000 }
    )
    await expect(setRow.locator('input[type="number"]').nth(1)).toHaveValue(
      reps,
      { timeout: 10000 }
    )
    await expect(
      setRow.locator('[data-test-id="completed-set-indicator"]')
    ).toBeVisible({ timeout: 10000 })
  }
}
