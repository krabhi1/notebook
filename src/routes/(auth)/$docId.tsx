import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import CodeEditor from "@/components/code-editor";
import { MermaidViewer } from "@/components/mermaid-viewer";
import { EditableText } from "@/components/ui/editable-text";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useDocument } from "@/hooks/use-document";
export const Route = createFileRoute("/(auth)/$docId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { docId } = Route.useParams();

	// Everything comes from one place
	const { document: doc, isLoading, updateDocument } = useDocument(docId);
	const debounceRef = useRef<number | undefined>(undefined);

	const [code, setCode] = useState("");
	//Inital load of the document content into the editor
	useEffect(() => {
		if (doc?.content) setCode(doc.content);
	}, [doc?.content]);
	if (isLoading) {
		return (
			<div className="h-full w-full flex items-center justify-center">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}
	if (!doc) {
		return (
			<div className="h-full w-full flex items-center justify-center">
				<p className="text-muted-foreground">Document not found</p>
			</div>
		);
	}

	return (
		<>
			{createPortal(
				<div className="flex" id="header-title">
					<EditableText
						initialValue={doc.title}
						onSave={(v) => {
							//todo save
							updateDocument({ data: { id: docId, title: v } });
						}}
					/>
				</div>,
				document.getElementById("header-actions") as HTMLElement,
			)}
			<div className="h-full w-full p-2 flex flex-col min-h-0">
				<div className="border h-full w-full rounded-lg bg-background shadow-sm overflow-hidden flex flex-col min-h-0">
					<ResizablePanelGroup className="flex-1 min-h-0">
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
											if (debounceRef.current) {
												clearTimeout(debounceRef.current);
											}
											debounceRef.current = window.setTimeout(() => {
												setCode(val || "");
												updateDocument({ data: { id: docId, content: val } });
											}, 600);
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
