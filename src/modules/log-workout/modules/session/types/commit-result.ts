export type CommitSessionResult =
  | { success: true; sessionId: number }
  | {
      success: false
      error: string
      code: 'TRANSACTION_FAILED' | 'VALIDATION_ERROR' | 'UNKNOWN'
    }
