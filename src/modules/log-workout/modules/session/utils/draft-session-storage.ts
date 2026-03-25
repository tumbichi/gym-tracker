"use client";

import {
  DraftSession,
  DRAFT_SESSION_STORAGE_KEY,
  DRAFT_SESSION_VERSION,
} from "../types/draft-session";

/**
 * Loads the draft session from localStorage.
 * @returns The draft session if it exists and is valid, otherwise null.
 */
export function loadDraftSession(): DraftSession | null {
  try {
    const storedItem = localStorage.getItem(DRAFT_SESSION_STORAGE_KEY);
    if (!storedItem) {
      return null;
    }

    const draft = JSON.parse(storedItem) as DraftSession;

    // Basic validation
    if (draft.version !== DRAFT_SESSION_VERSION) {
      console.warn(
        `Draft session version mismatch. Expected ${DRAFT_SESSION_VERSION}, found ${draft.version}. Discarding draft.`
      );
      clearDraftSession();
      return null;
    }

    if (!draft.id || !Array.isArray(draft.exercises)) {
      console.error("Invalid draft session format. Discarding draft.");
      clearDraftSession();
      return null;
    }

    return draft;
  } catch (error) {
    console.error("Failed to load draft session from localStorage:", error);
    return null;
  }
}

/**
 * Saves the draft session to localStorage.
 * @param draft The draft session to save.
 */
export function saveDraftSession(draft: DraftSession): void {
  try {
    const serialized = JSON.stringify(draft);
    localStorage.setItem(DRAFT_SESSION_STORAGE_KEY, serialized);
  } catch (error) {
    console.error("Failed to save draft session to localStorage:", error);
  }
}

/**
 * Clears the draft session from localStorage.
 */
export function clearDraftSession(): void {
  try {
    localStorage.removeItem(DRAFT_SESSION_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear draft session from localStorage:", error);
  }
}
