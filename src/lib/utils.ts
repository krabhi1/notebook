import { type ClassValue, clsx } from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
export function useDebounceCallback(timeout: number) {
	const timeoutRef = useRef<number | undefined>(undefined);
	const callback = useCallback(
		(fn: () => void) => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			timeoutRef.current = window.setTimeout(() => {
				fn();
			}, timeout);
		},
		[timeout],
	);
	return callback;
}

export function useDebounce<T>(value: T, delay: number) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		// 1. Set the timeout
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		// 2. Clean up: This runs every time 'value' or 'delay' changes
		// It automatically cancels the previous timeout
		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

export type Log = {
	level: "log" | "error" | "warn";
	// biome-ignore lint/suspicious/noExplicitAny:  ignore
	content: Array<any>;
};
