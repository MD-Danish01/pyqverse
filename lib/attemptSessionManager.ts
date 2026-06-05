'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { 
  loadAttemptState, 
  saveAttemptState, 
  clearAttemptState, 
  type AttemptState 
} from './attemptStorage';
import type { AttemptAnswer } from '@/components/types';

/**
 * Result of attempting to recover saved attempt state
 */
export interface RecoveryResult {
  savedState: Omit<AttemptState, 'version' | 'attemptId' | 'savedAt'> | null;
  isExpired: boolean;
  recoveredAt?: Date;
}

/**
 * Hook: Recover exam attempt state from localStorage on mount
 * Validates expiry time and state consistency
 * 
 * @param attemptId - The unique attempt identifier
 * @param examStartedAt - When the exam started (ISO string or Date)
 * @param durationSeconds - Total duration of exam in seconds (optional, used for validation)
 * @returns RecoveryResult with saved state and expiry status
 */
export function useAttemptSessionRecovery(
  attemptId: string,
  examStartedAt: string | Date,
  durationSeconds?: number
): RecoveryResult {
  const [result, setResult] = useState<RecoveryResult>({ savedState: null, isExpired: false });

  // Only run recovery once on mount
  useEffect(() => {
    let newResult: RecoveryResult = { savedState: null, isExpired: false };

    const startTime = new Date(examStartedAt).getTime();
    const now = Date.now();
    const elapsedSeconds = (now - startTime) / 1000;

    // Check if exam time has expired
    const hasExpired = durationSeconds ? elapsedSeconds > durationSeconds : false;

    if (hasExpired) {
      console.log(`[attemptSessionManager] Exam expired (${Math.floor(elapsedSeconds)}s > ${durationSeconds}s), discarding saved state`);
      newResult = { savedState: null, isExpired: true };
    } else {
      // Attempt to load saved state
      const loadedState = loadAttemptState(attemptId);

      if (loadedState) {
        // Validate state consistency
        if (validateAttemptStateConsistency(loadedState)) {
          // Extract state without metadata fields
          const { savedAt, ...stateData } = loadedState;

          console.log(`[attemptSessionManager] Successfully recovered attempt state (saved ${new Date(savedAt).toLocaleTimeString()})`);
          newResult = {
            savedState: stateData as Omit<AttemptState, 'version' | 'attemptId' | 'savedAt'>,
            isExpired: false,
            recoveredAt: new Date(),
          };
        } else {
          console.warn(`[attemptSessionManager] Loaded state failed validation, discarding`);
          clearAttemptState(attemptId);
        }
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResult(newResult);
  }, [attemptId, examStartedAt, durationSeconds]);

  return result;
}

/**
 * Hook: Auto-save exam attempt state to localStorage with debouncing
 * Saves whenever state changes, but debounced to prevent excessive writes
 * 
 * @param attemptId - The unique attempt identifier
 * @param answers - Current answer state (Record of questionId -> AttemptAnswer)
 * @param currentQuestionIndex - Current question being viewed
 * @param isPaletteOpen - Whether question palette is open
 * @param debounceMs - Debounce delay in milliseconds (default: 500ms)
 */
export function useAttemptAutoSave(
  attemptId: string,
  answers: Record<number, AttemptAnswer>,
  currentQuestionIndex: number,
  isPaletteOpen: boolean,
  debounceMs: number = 500
): void {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounced save
    debounceTimerRef.current = setTimeout(() => {
      const success = saveAttemptState(attemptId, {
        answers,
        currentQuestionIndex,
        isPaletteOpen,
      });

      if (!success) {
        console.warn(`[attemptSessionManager] Failed to save attempt state (quota exceeded?)`);
        // Try to free up space by clearing old attempts
        // This is a best-effort operation
      }
    }, debounceMs);

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [attemptId, answers, currentQuestionIndex, isPaletteOpen, debounceMs]);
}

/**
 * Hook: Register cleanup handlers for various attempt exit scenarios
 * - On beforeunload (tab close)
 * - On component unmount (navigation away)
 * - On manual exit handler
 * 
 * @param attemptId - The unique attempt identifier
 * @param cleanupTriggers - Optional: array of specific scenarios to handle
 */
export function useAttemptCleanup(
  attemptId: string,
  cleanupTriggers: Array<'beforeunload' | 'unmount'> = ['beforeunload', 'unmount']
): void {
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear state when user closes tab/window
      clearAttemptState(attemptId);
      console.log(`[attemptSessionManager] Cleared attempt state on beforeunload`);
    };

    // Register beforeunload handler if requested
    if (cleanupTriggers.includes('beforeunload')) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    // Cleanup on unmount (navigation away)
    return () => {
      if (cleanupTriggers.includes('beforeunload')) {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }

      // Optional: Clear on unmount (if navigating within same app)
      if (cleanupTriggers.includes('unmount')) {
        // Don't auto-clear on unmount - only on beforeunload or explicit submit
        // This allows React navigation without losing state
      }
    };
  }, [attemptId, cleanupTriggers]);
}

/**
 * Hook: Register a manual cleanup handler for explicit exit/submit scenarios
 * Call the returned function when you want to manually trigger cleanup
 * 
 * @param attemptId - The unique attempt identifier
 * @returns Function to call for manual cleanup
 */
export function useManualAttemptCleanup(attemptId: string): () => void {
  return useCallback(() => {
    clearAttemptState(attemptId);
    console.log(`[attemptSessionManager] Cleared attempt state on manual cleanup`);
  }, [attemptId]);
}

/**
 * Validate that loaded state is consistent with expectations
 * Ensures the state structure is intact and not corrupted
 */
function validateAttemptStateConsistency(state: AttemptState): boolean {
  try {
    // Check that answers is a valid object
    if (!state.answers || typeof state.answers !== 'object') {
      return false;
    }

    // Check that question indices are valid
    const questionIds = Object.keys(state.answers).map(Number);
    if (questionIds.length === 0) {
      // Empty answers is OK (user hasn't answered anything yet)
      return true;
    }

    // All question IDs should be valid numbers
    if (!questionIds.every(id => Number.isInteger(id) && id > 0)) {
      return false;
    }

    // currentQuestionIndex should be non-negative
    if (state.currentQuestionIndex < 0) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Hook: Track unsaved changes and warn user before leaving
 * Shows confirmation dialog if there are unsaved answers
 * 
 * @param attemptId - The unique attempt identifier
 * @param hasUnsavedChanges - Whether there are changes not yet synced to localStorage
 */
export function useUnsavedChangesWarning(
  attemptId: string,
  hasUnsavedChanges: boolean
): void {
  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Modern browsers ignore the custom message for security reasons
      // but the event handler still prevents navigation
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [attemptId, hasUnsavedChanges]);
}
