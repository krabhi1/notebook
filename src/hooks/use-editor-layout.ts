import { useEffect, useState } from "react";

/**
 * Hook to manage the editor's layout orientation (horizontal or vertical)
 * with persistence to localStorage.
 */
export function useEditorLayout() {
	const [layout, setLayout] = useState<"horizontal" | "vertical">("horizontal");

	useEffect(() => {
		// Load the layout preference from local storage on mount
		const savedLayout = localStorage.getItem("editor-layout");
		if (savedLayout === "horizontal" || savedLayout === "vertical") {
			setLayout(savedLayout);
		}
	}, []);

	const updateLayout = (newLayout: "horizontal" | "vertical") => {
		setLayout(newLayout);
		localStorage.setItem("editor-layout", newLayout);
	};

	return [layout, updateLayout] as const;
}
