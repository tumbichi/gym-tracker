'use client'

import { useCallback } from 'react'
import { DraftSession } from '../../../types/draft-session'
import {
  loadDraftSession,
  saveDraftSession,
  clearDraftSession,
} from '../../../utils/draft-session-storage'

/**
 * Hook to manage the draft session persistence in localStorage.
 * It provides memoized functions to interact with the storage.
 */
export function useDraftSession() {
  const getDraft = useCallback(() => {
    return loadDraftSession()
  }, [])

  const saveDraft = useCallback((draft: DraftSession) => {
    saveDraftSession(draft)
  }, [])

  const clearDraft = useCallback(() => {
    clearDraftSession()
  }, [])

  return { getDraft, saveDraft, clearDraft }
}
