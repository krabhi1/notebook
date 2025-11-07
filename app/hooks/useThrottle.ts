import { useCallback, useRef, useState, useEffect } from "react";

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): T {
  const lastCall = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastCall.current >= delay) {
        // Immediate execution
        lastCall.current = now;
        return callback(...args);
      } else {
        // Clear existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Schedule execution
        timeoutRef.current = setTimeout(
          () => {
            lastCall.current = Date.now();
            callback(...args);
            timeoutRef.current = null;
          },
          delay - (now - lastCall.current),
        );
      }
    },
    [callback, delay],
  ) as T;

  return throttledCallback;
}

export function useThrottleValue<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdate = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const now = Date.now();

    if (now - lastUpdate.current >= delay) {
      // Immediate update
      lastUpdate.current = now;
      setThrottledValue(value);
    } else {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Schedule update
      timeoutRef.current = setTimeout(
        () => {
          lastUpdate.current = Date.now();
          setThrottledValue(value);
          timeoutRef.current = null;
        },
        delay - (now - lastUpdate.current),
      );
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return throttledValue;
}

// Hook for throttling localStorage writes
export function useThrottledLocalStorage<T>(
  key: string,
  value: T,
  delay: number = 1000,
) {
  const throttledWrite = useThrottle((data: T) => {
    try {
      if (data === null || data === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (error) {
      console.warn(`Failed to write to localStorage for key "${key}":`, error);
    }
  }, delay);

  useEffect(() => {
    throttledWrite(value);
  }, [value, throttledWrite]);
}
