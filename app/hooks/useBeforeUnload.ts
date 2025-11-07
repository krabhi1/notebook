import { useEffect, useCallback } from "react";

export interface BeforeUnloadOptions {
  hasUnsavedChanges: boolean;
  message?: string;
}

export function useBeforeUnload({
  hasUnsavedChanges,
  message,
}: BeforeUnloadOptions) {
  const defaultMessage =
    message || "You have unsaved changes. Are you sure you want to leave?";

  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // Modern browsers ignore the custom message and show their own
        event.preventDefault();
        event.returnValue = defaultMessage;
        return defaultMessage;
      }
    },
    [hasUnsavedChanges, defaultMessage],
  );

  useEffect(() => {
    if (hasUnsavedChanges) {
      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [hasUnsavedChanges, handleBeforeUnload]);
}

// Hook for React Router navigation blocking
export function useNavigationGuard({
  hasUnsavedChanges,
  message,
}: BeforeUnloadOptions) {
  const defaultMessage =
    message ||
    "You have unsaved changes. Are you sure you want to navigate away?";

  // For React Router v7, we can use the useBlocker hook when it's available
  // For now, we'll provide a simple confirmation function
  const confirmNavigation = useCallback(() => {
    if (hasUnsavedChanges) {
      return window.confirm(defaultMessage);
    }
    return true;
  }, [hasUnsavedChanges, defaultMessage]);

  return { confirmNavigation };
}

// Combined hook for comprehensive data loss prevention
export function useDataLossPrevention(options: BeforeUnloadOptions) {
  useBeforeUnload(options);
  const { confirmNavigation } = useNavigationGuard(options);

  return { confirmNavigation };
}
