"use client";

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";

const STORAGE_KEY = "notebook-theme-mode";

type ThemeMode = "dark" | "light";

type AppContextValue = {
	mode: ThemeMode;
	isDark: boolean;
	toggleMode: () => void;
	setMode: (mode: ThemeMode) => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
	const [mode, setMode] = useState<ThemeMode>(() => {
		if (typeof window === "undefined") return "light";
		const stored = window.localStorage.getItem(STORAGE_KEY);
		return stored === "dark" || stored === "light" ? stored : "light";
	});

	const toggleMode = useCallback(() => {
		setMode((prev) => {
			const next = prev === "dark" ? "light" : "dark";
			window.localStorage.setItem(STORAGE_KEY, next);
			return next;
		});
	}, []);

	const setModeHandler = useCallback((next: ThemeMode) => {
		window.localStorage.setItem(STORAGE_KEY, next);
		setMode(next);
	}, []);

	const value = useMemo(
		() => ({
			mode,
			isDark: mode === "dark",
			toggleMode,
			setMode: setModeHandler,
		}),
		[mode, toggleMode, setModeHandler],
	);

	if (typeof document !== "undefined") {
		document.documentElement.classList.toggle("dark", mode === "dark");
	}

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error("useAppContext must be used inside AppProvider");
	}
	return context;
}
