import { useState, useCallback, useRef } from "react";

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  backoffMultiplier?: number;
  maxDelay?: number;
  onRetry?: (attempt: number, error: Error) => void;
  onMaxAttemptsReached?: (error: Error) => void;
}

export interface RetryState {
  isRetrying: boolean;
  attemptCount: number;
  lastError: Error | null;
  canRetry: boolean;
}

export function useRetry<T extends (...args: any[]) => Promise<any>>(
  asyncFunction: T,
  options: RetryOptions = {},
) {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    backoffMultiplier = 2,
    maxDelay = 10000,
    onRetry,
    onMaxAttemptsReached,
  } = options;

  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attemptCount: 0,
    lastError: null,
    canRetry: true,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculateDelay = useCallback(
    (attempt: number): number => {
      const delay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
      return Math.min(delay, maxDelay);
    },
    [initialDelay, backoffMultiplier, maxDelay],
  );

  const executeWithRetry = useCallback(
    async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
      setState((prev) => ({
        ...prev,
        isRetrying: true,
        canRetry: prev.attemptCount < maxAttempts,
      }));

      let lastError: Error;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const result = await asyncFunction(...args);

          // Success - reset state
          setState({
            isRetrying: false,
            attemptCount: 0,
            lastError: null,
            canRetry: true,
          });

          return result;
        } catch (error) {
          lastError = error as Error;

          setState((prev) => ({
            ...prev,
            attemptCount: attempt,
            lastError,
            canRetry: attempt < maxAttempts,
          }));

          // If this isn't the last attempt, wait before retrying
          if (attempt < maxAttempts) {
            onRetry?.(attempt, lastError);

            const delay = calculateDelay(attempt);
            await new Promise((resolve) => {
              timeoutRef.current = setTimeout(resolve, delay);
            });
          }
        }
      }

      // All attempts failed
      setState((prev) => ({
        ...prev,
        isRetrying: false,
        canRetry: false,
      }));

      onMaxAttemptsReached?.(lastError!);
      throw lastError!;
    },
    [asyncFunction, maxAttempts, onRetry, onMaxAttemptsReached, calculateDelay],
  );

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setState({
      isRetrying: false,
      attemptCount: 0,
      lastError: null,
      canRetry: true,
    });
  }, []);

  const manualRetry = useCallback(
    (...args: Parameters<T>) => {
      if (state.canRetry || state.attemptCount === 0) {
        return executeWithRetry(...args);
      }
      throw new Error("Maximum retry attempts reached. Call reset() first.");
    },
    [executeWithRetry, state.canRetry, state.attemptCount],
  );

  return {
    execute: executeWithRetry,
    retry: manualRetry,
    reset,
    state,
  };
}

// Specialized hook for save operations with network awareness
export function useSaveWithRetry<T extends (...args: any[]) => Promise<any>>(
  saveFunction: T,
  options: RetryOptions & {
    onNetworkError?: () => void;
    onConflictError?: () => void;
  } = {},
) {
  const { onNetworkError, onConflictError, ...retryOptions } = options;

  const retry = useRetry(saveFunction, {
    ...retryOptions,
    onRetry: (attempt, error) => {
      console.log(`Save attempt ${attempt} failed:`, error.message);

      // Handle specific error types
      if (
        error.message.includes("NetworkError") ||
        error.message.includes("fetch")
      ) {
        onNetworkError?.();
      } else if (error.message.includes("Conflict detected")) {
        onConflictError?.();
      }

      options.onRetry?.(attempt, error);
    },
  });

  return retry;
}

// Hook for batch retry operations
export function useBatchRetry<T>(
  items: T[],
  processor: (item: T) => Promise<void>,
  options: RetryOptions = {},
) {
  const [progress, setProgress] = useState({
    completed: 0,
    failed: 0,
    total: items.length,
    isProcessing: false,
  });

  const [failedItems, setFailedItems] = useState<T[]>([]);

  const processAll = useCallback(async () => {
    setProgress((prev) => ({
      ...prev,
      isProcessing: true,
      completed: 0,
      failed: 0,
    }));
    setFailedItems([]);

    const failed: T[] = [];

    for (const item of items) {
      try {
        const retryProcessor = useRetry(processor, options);
        await retryProcessor.execute(item);
        setProgress((prev) => ({ ...prev, completed: prev.completed + 1 }));
      } catch (error) {
        failed.push(item);
        setProgress((prev) => ({ ...prev, failed: prev.failed + 1 }));
      }
    }

    setFailedItems(failed);
    setProgress((prev) => ({ ...prev, isProcessing: false }));

    return {
      completed: items.length - failed.length,
      failed: failed.length,
      failedItems: failed,
    };
  }, [items, processor, options]);

  const retryFailed = useCallback(async () => {
    if (failedItems.length === 0) return;

    setProgress((prev) => ({
      ...prev,
      isProcessing: true,
      total: failedItems.length,
      completed: 0,
      failed: 0,
    }));

    const stillFailed: T[] = [];

    for (const item of failedItems) {
      try {
        const retryProcessor = useRetry(processor, options);
        await retryProcessor.execute(item);
        setProgress((prev) => ({ ...prev, completed: prev.completed + 1 }));
      } catch (error) {
        stillFailed.push(item);
        setProgress((prev) => ({ ...prev, failed: prev.failed + 1 }));
      }
    }

    setFailedItems(stillFailed);
    setProgress((prev) => ({ ...prev, isProcessing: false }));

    return {
      completed: failedItems.length - stillFailed.length,
      failed: stillFailed.length,
      failedItems: stillFailed,
    };
  }, [failedItems, processor, options]);

  return {
    processAll,
    retryFailed,
    progress,
    failedItems,
  };
}
