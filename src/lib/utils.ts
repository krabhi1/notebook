import { type ClassValue, clsx } from "clsx";
import { useCallback, useRef } from "react";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
export function useDebounceCallback(timeout: number) {
	const debounceRef = useRef<number | undefined>(undefined);
	const callback = useCallback(
		(fn: () => void) => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
			debounceRef.current = window.setTimeout(() => {
				fn();
			}, timeout);
		},
		[timeout],
	);
	return callback;
}

export type Log = {
	level: "log" | "error" | "warn";
	// biome-ignore lint/suspicious/noExplicitAny:  ignore
	content: Array<any>;
};
