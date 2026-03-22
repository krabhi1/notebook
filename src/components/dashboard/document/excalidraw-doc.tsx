import {
	Excalidraw,
	hashString,
	MainMenu,
	serializeAsJSON,
} from "@excalidraw/excalidraw";
import { useDocument } from "@/hooks/use-document";
import "@excalidraw/excalidraw/index.css";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { useRef, useState } from "react";
import { useDebounceCallback } from "@/lib/utils";
import { useAppContext } from "@/providers/app-provider";
import type { Document } from "@/server/db/schema";

export default function ExcalidrawDocument({
	doc,
	onReady,
}: {
	doc: Document;
	onReady?: () => void;
}) {
	const { updateDocument } = useDocument(doc.id);
	const debounceSave = useDebounceCallback(1000);
	const { isDark } = useAppContext();
	// Seed the hash so it doesn't auto-save on mount
	const lastVersion = useRef(doc.content ? hashString(doc.content) : -1);

	const [_excalidrawAPI, setExcalidrawAPI] =
		useState<ExcalidrawImperativeAPI | null>(null);

	return (
		<div className="h-full w-full  flex flex-col min-h-0">
			<Excalidraw
				initialData={() => {
					if (!doc.content) return;
					try {
						const data = JSON.parse(doc.content);
						return data;
					} catch (e) {
						console.error("Failed to parse excalidraw content", e);
						return;
					}
				}}
				onChange={(elements, appState, files) => {
					console.log("change", files);
					debounceSave(() => {
						// Filter for "database" to exclude volatile UI state (zoom/scroll)
						const jsonData = serializeAsJSON(
							elements,
							appState,
							{},
							"database",
						);
						const currentVersion = hashString(jsonData);

						if (currentVersion !== lastVersion.current) {
							lastVersion.current = currentVersion;
							console.log("Saving document");
							updateDocument({ data: { id: doc.id, content: jsonData } });
						}
					});
				}}
				theme={isDark ? "dark" : "light"}
				excalidrawAPI={(api) => {
					setExcalidrawAPI(api);
					onReady?.();
				}}
			>
				<MainMenu>
					<MainMenu.DefaultItems.LoadScene />
					<MainMenu.DefaultItems.SaveToActiveFile />
					<MainMenu.DefaultItems.SaveAsImage />
					<MainMenu.DefaultItems.Export />
					<MainMenu.DefaultItems.CommandPalette />
					<MainMenu.DefaultItems.SearchMenu />
					<MainMenu.DefaultItems.ClearCanvas />
					<MainMenu.Separator />
					<MainMenu.DefaultItems.ToggleTheme />
					<MainMenu.DefaultItems.ChangeCanvasBackground />
				</MainMenu>
			</Excalidraw>
		</div>
	);
}
