import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { useFiles } from "@/hooks/use-file";
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
export function DocumentView({
	doc,
	initialFiles,
}: {
	doc: Document;
	initialFiles: File[];
}) {
	const { files } = useFiles(doc.id as string);
	const _currentFiles = files.length > 0 ? files : initialFiles;

	return (
		<ClientOnly>
			<Suspense>
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
				{doc.type === "excalidraw" && <ExcalidrawDocument doc={doc} />}
				{doc.type === "mermaid" && <MermaidDocument doc={doc} />}
				{doc.type === "code" && <CodeDocument doc={doc} files={files} />}
			</Suspense>
		</ClientOnly>
	);
}
