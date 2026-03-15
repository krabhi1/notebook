import { SplitSquareHorizontal, SplitSquareVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CodeEditor from "@/components/code-editor";
import { MermaidViewer } from "@/components/mermaid-viewer";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDocument } from "@/hooks/use-document";
import { useDebounceCallback } from "@/lib/utils";
import type { Document } from "@/server/db/schema";

export default function MermaidDocument({ doc }: { doc: Document }) {
	// Everything comes from one place
	const { updateDocument } = useDocument(doc.id);
	const debounceSave = useDebounceCallback(1000);
	const [layout, setLayout] = useState<"horizontal" | "vertical">("horizontal");
	useEffect(() => {
		//load the layout preference from local storage
		const savedLayout = localStorage.getItem("mermaid-editor-layout");
		if (savedLayout === "horizontal" || savedLayout === "vertical") {
			setLayout(savedLayout);
		}
	}, []);

	const [code, setCode] = useState("");

	//Inital load of the document content into the editor
	useEffect(() => {
		if (doc?.content) setCode(doc.content);
	}, [doc?.content]);

	return (
		<>
			{createPortal(
				<ToggleGroup
					type="single"
					size="sm"
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
				</ToggleGroup>,

				document.getElementById("header-right-actions") as HTMLElement,
			)}
			<div className="h-full w-full p-2 flex flex-col min-h-0">
				<div className="border h-full w-full rounded-lg bg-background shadow-sm overflow-hidden flex flex-col min-h-0">
					<ResizablePanelGroup className="flex-1 min-h-0" orientation={layout}>
						<ResizablePanel
							defaultSize={40}
							minSize={20}
							className="flex flex-col min-h-0"
						>
							<div className="h-full flex flex-col min-h-0">
								<div className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b bg-muted/30 shrink-0">
									Editor
								</div>
								<div className="flex-1 min-h-0 w-full overflow-hidden">
									<CodeEditor
										defaultValue={code}
										onChange={(val) => {
											debounceSave(() => {
												setCode(val || "");
												updateDocument({ data: { id: doc.id, content: val } });
											});
										}}
										language="mermaid"
									/>
								</div>
							</div>
						</ResizablePanel>

						<ResizableHandle withHandle />

						<ResizablePanel
							defaultSize={60}
							minSize={30}
							className="flex flex-col min-h-0"
						>
							<div className="h-full flex flex-col min-h-0">
								<div className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b bg-muted/30 shrink-0">
									Preview
								</div>
								<div className="flex-1 min-h-0 overflow-hidden relative">
									<MermaidViewer code={code} />
								</div>
							</div>
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			</div>
		</>
	);
}
