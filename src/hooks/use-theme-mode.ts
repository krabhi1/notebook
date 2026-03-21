"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "notebook-theme-mode";

export function useThemeMode() {
	const [mode, setMode] = useState<"dark" | "light">(() => {
		if (typeof window === "undefined") return "light";
		return (
			(window.localStorage.getItem(STORAGE_KEY) as "dark" | "light" | null) ??
			"light"
		);
	});

	useEffect(() => {
		document.documentElement.classList.toggle("dark", mode === "dark");
		window.localStorage.setItem(STORAGE_KEY, mode);
	}, [mode]);

	const isDark = mode === "dark";

	const toggle = useCallback(() => {
		setMode((prev) => (prev === "dark" ? "light" : "dark"));
	}, []);

	return useMemo(
		() => ({
			mode,
			isDark,
			toggle,
			setMode,
		}),
		[mode, isDark, toggle],
	);
}
