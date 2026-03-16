import { useCallback, useEffect, useState } from "react";
import type { File } from "@/server/db/schema";

/**
 * Hook for managing the state of open files (tabs) and the active file
 * in the code editor, with persistence to localStorage.
 */
export function useEditorState(docId: string, files: File[]) {
	const [openFileIds, setOpenFileIds] = useState<string[]>([]);
	const [activeFileId, setActiveFileId] = useState<string | null>(null);

	const storageKey = `editor-state-${docId}`;

	// 1. Hydrate from LocalStorage on mount or when docId changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: this run only needs to run when files length changes to validate saved IDs, not on every files change
	useEffect(() => {
		const saved = localStorage.getItem(storageKey);
		if (saved) {
			try {
				const { openIds, activeId } = JSON.parse(saved);

				// Verify that the saved IDs still exist in the current 'files' list
				// to avoid trying to open deleted files.
				const validIds = (openIds as string[]).filter((id) =>
					files.some((f) => f.id === id),
				);

				setOpenFileIds(validIds);

				if (validIds.includes(activeId)) {
					setActiveFileId(activeId);
				} else if (validIds.length > 0) {
					setActiveFileId(validIds[0]);
				}
			} catch (e) {
				console.error("Failed to parse editor state from localStorage", e);
			}
		} else if (files.length > 0 && openFileIds.length === 0) {
			// Fallback: If no saved state exists, open the first file
			setOpenFileIds([files[0].id]);
			setActiveFileId(files[0].id);
		}
	}, []);

	// 2. Persist to LocalStorage whenever state changes
	useEffect(() => {
		// Avoid saving empty state if we haven't hydrated yet or have no tabs
		if (openFileIds.length === 0 && !activeFileId) return;

		const stateToSave = {
			openIds: openFileIds,
			activeId: activeFileId,
		};
		localStorage.setItem(storageKey, JSON.stringify(stateToSave));
	}, [openFileIds, activeFileId, storageKey]);

	// 3. Helper Actions
	const openFile = useCallback((id: string) => {
		setOpenFileIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
		setActiveFileId(id);
	}, []);

	const closeFile = useCallback(
		(id: string) => {
			setOpenFileIds((prev) => {
				const next = prev.filter((fid) => fid !== id);

				// If we're closing the active file, switch to the last remaining tab
				if (activeFileId === id) {
					setActiveFileId(next.length > 0 ? next[next.length - 1] : null);
				}

				return next;
			});
		},
		[activeFileId],
	);

	// Computed values for convenience
	const openFiles = files.filter((f) => openFileIds.includes(f.id));
	const activeFile = files.find((f) => f.id === activeFileId);

	return {
		openFileIds,
		setOpenFileIds,
		activeFileId,
		setActiveFileId,
		openFiles,
		activeFile,
		openFile,
		closeFile,
	};
}
