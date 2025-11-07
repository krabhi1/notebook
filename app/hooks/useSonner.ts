import { toast } from "sonner";

export interface SonnerHelpers {
  success: (
    message: string,
    options?: Parameters<typeof toast.success>[1],
  ) => void;
  error: (message: string, options?: Parameters<typeof toast.error>[1]) => void;
  warning: (
    message: string,
    options?: Parameters<typeof toast.warning>[1],
  ) => void;
  info: (message: string, options?: Parameters<typeof toast.info>[1]) => void;
  loading: (
    message: string,
    options?: Parameters<typeof toast.loading>[1],
  ) => void;
  promise: typeof toast.promise;
  dismiss: typeof toast.dismiss;
  custom: typeof toast.custom;
}

export function useSonner(): SonnerHelpers {
  return {
    success: (message, options) => toast.success(message, options),
    error: (message, options) => toast.error(message, options),
    warning: (message, options) => toast.warning(message, options),
    info: (message, options) => toast.info(message, options),
    loading: (message, options) => toast.loading(message, options),
    promise: toast.promise,
    dismiss: toast.dismiss,
    custom: toast.custom,
  };
}

// Convenience function for creating toast helpers
export const createSonnerHelpers = (): SonnerHelpers => ({
  success: (message, options) => toast.success(message, options),
  error: (message, options) => toast.error(message, options),
  warning: (message, options) => toast.warning(message, options),
  info: (message, options) => toast.info(message, options),
  loading: (message, options) => toast.loading(message, options),
  promise: toast.promise,
  dismiss: toast.dismiss,
  custom: toast.custom,
});
