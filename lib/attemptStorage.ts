import type { AttemptAnswer } from '@/components/types';

/**
 * Persisted exam attempt state structure
 * Includes answers, navigation state, and UI state
 */
export interface AttemptState {
  version: number; // For future schema migrations
  attemptId: string;
  answers: Record<number, AttemptAnswer>;
  currentQuestionIndex: number;
  isPaletteOpen: boolean;
  savedAt: number; // timestamp for debugging
}

/**
 * Storage key prefix for exam attempts
 * Format: exam-attempt-${attemptId}
 */
const STORAGE_KEY_PREFIX = 'exam-attempt-';
const CURRENT_VERSION = 1;

/**
 * Serialize and save attempt state to localStorage
 * @param attemptId - The unique attempt identifier
 * @param state - The current attempt state to save
 * @returns true if save was successful, false if quota exceeded or error occurred
 */
export function saveAttemptState(attemptId: string, state: Omit<AttemptState, 'version' | 'attemptId' | 'savedAt'>): boolean {
  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${attemptId}`;
    const persistedState: AttemptState = {
      version: CURRENT_VERSION,
      attemptId,
      ...state,
      savedAt: Date.now(),
    };

    localStorage.setItem(storageKey, JSON.stringify(persistedState));
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.code === 22) {
      // QuotaExceededError: localStorage is full
      console.warn(`[attemptStorage] localStorage quota exceeded for attemptId: ${attemptId}`);
      return false;
    }
    console.error(`[attemptStorage] Failed to save state:`, error);
    return false;
  }
}

/**
 * Load and deserialize attempt state from localStorage
 * @param attemptId - The unique attempt identifier
 * @returns The saved state if found and valid, null otherwise
 */
export function loadAttemptState(attemptId: string): AttemptState | null {
  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${attemptId}`;
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as AttemptState;

    // Validate structure
    if (!isValidAttemptState(parsed)) {
      console.warn(`[attemptStorage] Invalid state structure for attemptId: ${attemptId}`);
      return null;
    }

    // Verify attemptId matches to prevent cross-attempt contamination
    if (parsed.attemptId !== attemptId) {
      console.warn(`[attemptStorage] attemptId mismatch: stored=${parsed.attemptId}, requested=${attemptId}`);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error(`[attemptStorage] Failed to load state:`, error);
    return null;
  }
}

/**
 * Clear attempt state from localStorage
 * @param attemptId - The unique attempt identifier
 */
export function clearAttemptState(attemptId: string): void {
  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${attemptId}`;
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error(`[attemptStorage] Failed to clear state:`, error);
  }
}

/**
 * Clear all exam attempt states from localStorage
 * Useful for emergency cleanup or quota recovery
 */
export function clearAllAttemptStates(): void {
  try {
    const keysToRemove: string[] = [];

    // Iterate through localStorage and find all attempt keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    // Remove all found keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`[attemptStorage] Cleared ${keysToRemove.length} attempt state(s)`);
  } catch (error) {
    console.error(`[attemptStorage] Failed to clear all states:`, error);
  }
}

/**
 * Validate the structure of a persisted state object
 * Ensures all required fields are present and have correct types
 */
function isValidAttemptState(data: unknown): data is AttemptState {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const state = data as Record<string, unknown>;

  // Check required fields
  if (typeof state.version !== 'number') return false;
  if (typeof state.attemptId !== 'string') return false;
  if (typeof state.currentQuestionIndex !== 'number') return false;
  if (typeof state.isPaletteOpen !== 'boolean') return false;
  if (typeof state.savedAt !== 'number') return false;

  // Validate answers object
  if (!state.answers || typeof state.answers !== 'object') {
    return false;
  }

  const answers = state.answers as Record<string, unknown>;
  for (const [key, answer] of Object.entries(answers)) {
    if (!isValidAttemptAnswer(answer)) {
      console.warn(`[attemptStorage] Invalid answer structure for questionId: ${key}`);
      return false;
    }
  }

  return true;
}

/**
 * Validate the structure of an individual answer
 */
function isValidAttemptAnswer(data: unknown): data is AttemptAnswer {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const answer = data as Record<string, unknown>;

  // Check required fields
  if (typeof answer.questionId !== 'number') return false;
  if (typeof answer.isMarkedForReview !== 'boolean') return false;
  if (typeof answer.visited !== 'boolean') return false;
  if (typeof answer.answered !== 'boolean') return false;

  // Optional fields
  if (answer.selectedOptionId !== undefined && answer.selectedOptionId !== null && typeof answer.selectedOptionId !== 'number') {
    return false;
  }
  if (answer.numericalAnswer !== undefined && answer.numericalAnswer !== null && typeof answer.numericalAnswer !== 'string') {
    return false;
  }

  return true;
}

/**
 * Check if storage is available (not disabled by browser)
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the approximate size of a stored state in bytes
 * Useful for monitoring quota usage
 */
export function getAttemptStateSize(attemptId: string): number {
  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${attemptId}`;
    const stored = localStorage.getItem(storageKey);
    if (!stored) return 0;
    return new Blob([stored]).size;
  } catch {
    return 0;
  }
}
