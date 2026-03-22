import { ClientOnly } from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";
import { lazy, Suspense, useCallback, useState } from "react";
import type { Document, File } from "@/server/db/schema";

const MermaidDocument = lazy(
	() => import("@/components/dashboard/document/mermaid-doc"),
);
const ExcalidrawDocument = lazy(
	() => import("@/components/dashboard/document/excalidraw-doc"),
);
const CodeDocument = lazy(
	() => import("@/components/dashboard/document/code-doc"),
);

function DocumentLoading() {
	return (
		<div className="absolute inset-0 flex items-center justify-center bg-background text-muted-foreground">
			<div className="flex items-center gap-2 text-sm">
				<Loader2Icon className="size-4 animate-spin" />
				<span>Loading document</span>
			</div>
		</div>
	);
}

export function DocumentView({ doc, files }: { doc: Document; files: File[] }) {
	const documentKey = `${doc.id}:${doc.type}`;

	return (
		<ClientOnly fallback={<DocumentLoading />}>
			<DocumentShell key={documentKey} doc={doc} files={files} />
		</ClientOnly>
	);
}

function DocumentShell({ doc, files }: { doc: Document; files: File[] }) {
	const [isReady, setIsReady] = useState(false);
	const markReady = useCallback(() => {
		setIsReady(true);
	}, []);

	return (
		<div className="relative flex-1 min-h-0 overflow-hidden">
			<Suspense fallback={<DocumentLoading />}>
				<div className="h-full min-h-0 overflow-hidden">
					{/*{createPortal(
					<div className="flex" id="header-title">
						<EditableText
							initialValue={doc.title}
							onSave={(v) => {
								return updateDocument({ data: { id: docId, title: v } });
							}}
							className="text-sm"
						/>
					</div>,
					document.getElementById("header-actions") as HTMLElement,
				)}*/}
					{doc.type === "excalidraw" && (
						<ExcalidrawDocument doc={doc} onReady={markReady} />
					)}
					{doc.type === "mermaid" && (
						<MermaidDocument doc={doc} onReady={markReady} />
					)}
					{doc.type === "code" && (
						<CodeDocument doc={doc} files={files} onReady={markReady} />
					)}
				</div>
			</Suspense>
			{!isReady && <DocumentLoading />}
		</div>
	);
}
