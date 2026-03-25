import { Page, expect } from '@playwright/test'

export class LogWorkoutPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/log-workout')
    await expect(
      this.page.getByRole('heading', { name: 'Registrar Entrenamiento' })
    ).toBeVisible()
  }

  // Elements for starting a new workout
  get startTodayWorkoutButton() {
    return this.page.getByRole('button', {
      name: 'Comenzar Entrenamiento de Hoy',
    })
  }

  get startFreeSessionButton() {
    return this.page.getByRole('button', { name: 'Comenzar Sesión Libre' })
  }

  get startRoutineDayButton() {
    // This will return the first "Iniciar" button for a routine day
    return this.page.getByRole('button', { name: 'Iniciar' }).first()
  }

  // Elements for resuming an active session
  get resumeActiveSessionButton() {
    return this.page.getByRole('link', { name: 'Reanudar Sesión Activa' })
  }

  // Elements for the Draft Recovery Modal
  get draftRecoveryModalTitle() {
    return this.page.getByRole('heading', {
      name: 'Borrador de sesión encontrado',
    })
  }

  get draftRecoveryModalContinueButton() {
    return this.page.getByRole('button', { name: 'Continuar borrador' })
  }

  get draftRecoveryModalDiscardButton() {
    return this.page.getByRole('button', { name: 'Descartar' })
  }

  async expectDraftRecoveryModalToBeVisible() {
    await expect(this.draftRecoveryModalTitle).toBeVisible()
  }

  async expectDraftRecoveryModalToBeHidden() {
    await expect(this.draftRecoveryModalTitle).toBeHidden()
  }
}
