import CodeEditor, {
	type MonacoEditorInstance,
} from "@/components/code-editor";
import TabBar from "@/components/dashboard/document/code-doc/tabbar";
import { useDebounceCallback } from "@/lib/utils";
import type { File } from "@/server/db/schema";

interface EditorMainProps {
	activeFile: File | undefined;
	openFiles: File[];
	openFileIds: string[];
	activeFileId: string | null;
	setActiveFileId: (id: string | null) => void;
	setOpenFileIds: (ids: string[]) => void;
	onMount: (
		editor: MonacoEditorInstance["editor"],
		monaco: MonacoEditorInstance["monaco"],
	) => void;
	onUpdateFile: (id: string, content: string) => void;
	onRunCode: () => void;
	onReady?: () => void;
	themeMode?: "dark" | "light";
	wrapCode: boolean;
	autoRun: boolean;
}

/**
 * Component to handle the main editor area including the tab bar and Monaco instance.
 * Encapsulates the logic for file paths, saving, and auto-running code.
 */
export default function EditorMain({
	activeFile,
	openFiles,
	openFileIds,
	activeFileId,
	setActiveFileId,
	setOpenFileIds,
	onMount,
	onUpdateFile,
	onRunCode,
	onReady,
	themeMode = "light",
	wrapCode,
	autoRun,
}: EditorMainProps) {
	const debounceSave = useDebounceCallback(2000);
	const debounceRun = useDebounceCallback(1000);

	if (!activeFile) {
		return (
			<div className="h-full flex flex-col min-h-0">
				<TabBar
					openFiles={openFiles}
					openFileIds={openFileIds}
					activeFileId={activeFileId}
					setActiveFileId={setActiveFileId}
					setOpenFileIds={setOpenFileIds}
				/>
				<div className="flex-1 flex items-center justify-center text-muted-foreground bg-muted/5">
					No file open
				</div>
			</div>
		);
	}
	const editorPath = `${activeFile.documentId}/${activeFile.id}/${activeFile.name}`;

	return (
		<div className="h-full flex flex-col min-h-0">
			<TabBar
				openFiles={openFiles}
				openFileIds={openFileIds}
				activeFileId={activeFileId}
				setActiveFileId={setActiveFileId}
				setOpenFileIds={setOpenFileIds}
			/>
			<div className="flex-1 min-h-0 w-full overflow-hidden">
				<CodeEditor
					path={editorPath}
					defaultValue={activeFile.content || ""}
					options={{ wordWrap: wrapCode ? "on" : "off" }}
					onMount={(editor, monaco) => {
						onMount(editor, monaco);
						onReady?.();
					}}
					onChange={(val) => {
						const content = val || "";

						if (autoRun) {
							// Automatically trigger the runner after a short delay
							debounceRun(() => {
								onRunCode();
							});
						}

						// Save the file content to the database after a longer delay
						debounceSave(() => {
							onUpdateFile(activeFile.id, content);
						});
					}}
					themeMode={themeMode}
				/>
			</div>
		</div>
	);
}
