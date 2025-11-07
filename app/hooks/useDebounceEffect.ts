import { useEffect } from "react";

export function useDebounceEffect(
  effect: React.EffectCallback,
  deps: React.DependencyList,
  delay: number,
) {
  useEffect(() => {
    const handler = setTimeout(() => {
      effect();
    }, delay);

    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}
