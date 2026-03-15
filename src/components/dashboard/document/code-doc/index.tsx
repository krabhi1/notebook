/** biome-ignore-all lint/suspicious/noArrayIndexKey: ignore */
import { SplitSquareHorizontal, SplitSquareVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CodeEditor from "@/components/code-editor";
import FileSidebar from "@/components/dashboard/document/code-doc/file-sidebar";
import TabBar from "@/components/dashboard/document/code-doc/tabbar";
import { Button } from "@/components/ui/button";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useFiles } from "@/hooks/use-file";
import { useRunJsWorker } from "@/hooks/use-runjs";
import { type Log, useDebounceCallback } from "@/lib/utils";
import type { Document, File } from "@/server/db/schema";

export default function CodeDocument({
	doc,
	files,
}: {
	doc: Document;
	files: File[];
}) {
	const { createFile, updateFile, isCreating } = useFiles(doc.id);
	const debounceSave = useDebounceCallback(800);
	const [layout, setLayout] = useState<"horizontal" | "vertical">("horizontal");
	const { run, error, logs } = useRunJsWorker();
	useEffect(() => {
		//load the layout preference from local storage
		const savedLayout = localStorage.getItem("mermaid-editor-layout");
		if (savedLayout === "horizontal" || savedLayout === "vertical") {
			setLayout(savedLayout);
		}
	}, []);

	const [openFileIds, setOpenFileIds] = useState<string[]>([]);
	const [activeFileId, setActiveFileId] = useState<string | null>(null);
	const activeFile = files.find((f) => f.id === activeFileId);
	const openFiles = files.filter((f) => openFileIds.includes(f.id));

	function createNewFile() {
		const fileName = `file-${Date.now()}.js`;
		createFile({
			data: {
				documentId: doc.id,
				name: fileName,
				content: "",
				meta: {
					language: "javascript",
				},
			},
		});
	}

	return (
		<>
			{createPortal(
				<div className="flex items-center space-x-2">
					<Button
						size="sm"
						onClick={() => {
							run(activeFile?.content || "");
						}}
						className="mr-2"
					>
						Run
					</Button>
					<ToggleGroup
						type="single"
						size="sm"
						variant="outline"
						onValueChange={(v) => {
							if (v === "horizontal" || v === "vertical") {
								setLayout(v);
								localStorage.setItem("mermaid-editor-layout", v);
							}
						}}
						value={layout}
					>
						<ToggleGroupItem value="horizontal">
							<SplitSquareHorizontal />
						</ToggleGroupItem>
						<ToggleGroupItem value="vertical">
							<SplitSquareVertical />
						</ToggleGroupItem>
					</ToggleGroup>
				</div>,

				document.getElementById("header-right-actions") as HTMLElement,
			)}
			<div className="h-full w-full p-2 flex flex-col min-h-0">
				<div className="border h-full w-full rounded-lg bg-background shadow-sm overflow-hidden flex flex-col min-h-0">
					<ResizablePanelGroup orientation="horizontal">
						<ResizablePanel defaultSize={20} minSize={10}>
							<FileSidebar
								files={files}
								createNewFile={createNewFile}
								isCreating={isCreating}
								openFileIds={openFileIds}
								setOpenFileIds={setOpenFileIds}
								activeFileId={activeFileId}
								setActiveFileId={setActiveFileId}
							/>
						</ResizablePanel>
						<ResizableHandle />
						<ResizablePanel defaultSize={80} minSize={30} className="min-h-0">
							<ResizablePanelGroup orientation={layout}>
								<ResizablePanel defaultSize={70} minSize={20}>
									<div className="h-full flex flex-col min-h-0">
										<TabBar
											openFiles={openFiles}
											openFileIds={openFileIds}
											activeFileId={activeFileId}
											setActiveFileId={setActiveFileId}
											setOpenFileIds={setOpenFileIds}
										/>
										<div className="flex-1 min-h-0 w-full overflow-hidden">
											{(() => {
												const activeFile = openFiles.find(
													(f) => f.id === activeFileId,
												);
												if (!activeFile) {
													return (
														<div className="flex-1 flex items-center justify-center text-muted-foreground">
															No file open
														</div>
													);
												}
												return (
													<CodeEditor
														path={activeFile.name}
														defaultValue={activeFile.content || ""}
														onChange={(val) => {
															debounceSave(() => {
																updateFile({
																	data: { id: activeFile.id, content: val },
																});
															});
														}}
														language={activeFile.meta.language as string}
													/>
												);
											})()}
										</div>
									</div>
								</ResizablePanel>

								<ResizableHandle withHandle />

								<ResizablePanel
									defaultSize={30}
									minSize={30}
									className="flex flex-col min-h-0"
								>
									<OutputPanel logs={logs} error={error} />
								</ResizablePanel>
							</ResizablePanelGroup>
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			</div>
		</>
	);
}

function OutputPanel({ logs, error }: { logs: Log[]; error: string | null }) {
	return (
		<div className="h-full flex flex-col min-h-0">
			<div className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b bg-muted/30 shrink-0">
				Output
			</div>
			<div className="flex-1 min-h-0 relative text-sm font-mono p-2 overflow-auto text-">
				{error ? (
					<div className="text-red-500">{error}</div>
				) : (
					logs.map((log, index) => (
						<div key={index}>
							{log.content.map((item, i) => (
								<div key={i}>
									{typeof item === "string" ? item : JSON.stringify(item)}
								</div>
							))}
						</div>
					))
				)}
			</div>
		</div>
	);
}
