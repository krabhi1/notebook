import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import CodeEditor from "@/components/code-editor";
import { MermaidViewer } from "@/components/mermaid-viewer";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useDocument } from "@/hooks/use-document";
import { useDebounce } from "@/lib/utils";
export const Route = createFileRoute("/(auth)/$docId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { docId } = Route.useParams();

	// Everything comes from one place
	const { document, isLoading, updateDocument } = useDocument(docId);

	const [code, setCode] = useState("");
	const debouncedCode = useDebounce(code, 1000);

	// Sync initial load
	useEffect(() => {
		if (document?.content && !code) setCode(document.content);
	}, [document?.content, code]);

	// Simple auto-save logic
	useEffect(() => {
		if (code && code !== document?.content) {
			updateDocument({ data: { id: docId, content: code } });
		}
	}, [code, docId, document?.content, updateDocument]);
	if (isLoading) {
		return (
			<div className="h-full w-full flex items-center justify-center">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}
	if (!document) {
		return (
			<div className="h-full w-full flex items-center justify-center">
				<p className="text-muted-foreground">Document not found</p>
			</div>
		);
	}
	const text = document.content;

	return (
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
									defaultValue={text}
									onChange={(val) => {
										setCode(val || "");
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
						<div className="h-full flex flex-col min-h-0 p-2">
							<div className="px-3 py-1 text-xs font-medium text-muted-foreground mb-2 shrink-0">
								Preview
							</div>
							<div className="flex-1 min-h-0 overflow-hidden relative">
								<MermaidViewer code={debouncedCode} />
							</div>
						</div>
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
		</div>
	);
}
