import { useRef } from "react";
import type { MonacoEditorInstance } from "@/components/code-editor";
import EditorActions from "@/components/dashboard/document/code-doc/editor-actions";
import EditorMain from "@/components/dashboard/document/code-doc/editor-main";
import FileSidebar from "@/components/dashboard/document/code-doc/file-sidebar";
import { OutputPanel } from "@/components/dashboard/document/code-doc/output-panel";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
	useCodeDocAutoRun,
	useCodeDocWrap,
} from "@/hooks/use-code-doc-settings";
import { useCodeRunner } from "@/hooks/use-code-runner";
import { useEditorLayout } from "@/hooks/use-editor-layout";
import { useEditorState } from "@/hooks/use-editor-state";
import { useFiles } from "@/hooks/use-file";
import { useAppContext } from "@/providers/app-provider";
import type { Document, File } from "@/server/db/schema";

export default function CodeDocument({
	doc,
	files,
}: {
	doc: Document;
	files: File[];
}) {
	const {
		files: liveFiles,
		createFile,
		updateFile,
		deleteFile,
		isCreating,
		isDeleting,
	} = useFiles(doc.id);
	const [layout, setLayout] = useEditorLayout();
	const [wrapCode, setWrapCode] = useCodeDocWrap(doc.id);
	const [autoRun, setAutoRun] = useCodeDocAutoRun(doc.id);
	const monacoEditorInstanceRef = useRef<MonacoEditorInstance | null>(null);
	const effectiveFiles = liveFiles.length > 0 ? liveFiles : files;

	const {
		openFileIds,
		setOpenFileIds,
		activeFileId,
		setActiveFileId,
		openFiles,
		activeFile,
	} = useEditorState(doc.id, effectiveFiles);

	const { mode } = useAppContext();
	const {
		runCode,
		isRunning,
		error,
		logs,
		isRunnable,
		runtime,
		setRuntime,
		previewIframe,
	} = useCodeRunner(activeFile, monacoEditorInstanceRef);

	function createNewFile() {
		const fileName = `file-${effectiveFiles.length + 1}.ts`;
		createFile(
			{
				data: {
					documentId: doc.id,
					name: fileName,
					content: "",
				},
			},
			{
				onSuccess: (newFile) => {
					setOpenFileIds((prev) => [...prev, newFile.id]);
					setActiveFileId(newFile.id);
				},
			},
		);
	}

	async function handleDeleteFile(fileId: string) {
		await deleteFile({ data: { id: fileId } });
		setOpenFileIds(openFileIds.filter((id) => id !== fileId));
		if (activeFileId === fileId) {
			const remainingOpenFileIds = openFileIds.filter((id) => id !== fileId);
			setActiveFileId(remainingOpenFileIds.at(-1) ?? null);
		}
	}

	return (
		<>
			<EditorActions
				isRunning={isRunning}
				isRunnable={isRunnable}
				onRun={runCode}
				layout={layout}
				onLayoutChange={setLayout}
				wrapCode={wrapCode}
				onWrapCodeChange={setWrapCode}
				autoRun={autoRun}
				onAutoRunChange={setAutoRun}
			/>
			<div className="h-full w-full p-2 flex flex-col min-h-0">
				<div className="border h-full w-full rounded-lg bg-background shadow-sm overflow-hidden flex flex-col min-h-0">
					<ResizablePanelGroup orientation="horizontal">
						<ResizablePanel defaultSize={25} minSize={25}>
							<FileSidebar
								files={effectiveFiles}
								createNewFile={createNewFile}
								isCreating={isCreating}
								isDeleting={isDeleting}
								openFileIds={openFileIds}
								setOpenFileIds={setOpenFileIds}
								activeFileId={activeFileId}
								setActiveFileId={setActiveFileId}
								onSaveFileName={(id, newName) => {
									return updateFile({
										data: { id, name: newName },
									});
								}}
								onDeleteFile={handleDeleteFile}
							/>
						</ResizablePanel>
						<ResizableHandle />
						<ResizablePanel defaultSize={80} minSize={30} className="min-h-0">
							<ResizablePanelGroup orientation={layout}>
								<ResizablePanel defaultSize={70} minSize={20}>
									<EditorMain
										activeFile={activeFile}
										openFiles={openFiles}
										openFileIds={openFileIds}
										activeFileId={activeFileId}
										setActiveFileId={setActiveFileId}
										setOpenFileIds={setOpenFileIds}
										onMount={(editor, monaco) => {
											monacoEditorInstanceRef.current = {
												editor,
												monaco,
											};
										}}
										onUpdateFile={(id, content) => {
											updateFile({
												data: { id, content },
											});
										}}
										themeMode={mode}
										onRunCode={runCode}
										wrapCode={wrapCode}
										autoRun={autoRun}
									/>
								</ResizablePanel>

								<ResizableHandle withHandle />

								<ResizablePanel
									defaultSize={30}
									minSize={30}
									className="flex flex-col min-h-0"
								>
									<OutputPanel
										logs={logs}
										error={error}
										isRunnable={isRunnable}
										runtime={runtime}
										onRuntimeChange={setRuntime}
										previewIframe={previewIframe}
									/>
								</ResizablePanel>
							</ResizablePanelGroup>
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			</div>
		</>
	);
}
