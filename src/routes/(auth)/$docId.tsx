import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { createPortal } from "react-dom";
import { EditableText } from "@/components/ui/editable-text";
import { useDocument } from "@/hooks/use-document";

const MermaidEditor = lazy(
	() => import("@/components/dashboard/document/mermaid-editor"),
);
const ExcalidrawEditor = lazy(
	() => import("@/components/dashboard/document/excalidraw-editor"),
);

export const Route = createFileRoute("/(auth)/$docId")({
	component: RouteComponent,
	ssr: false,
});

function RouteComponent() {
	const { docId } = Route.useParams();
	const { doc, isLoading, updateDocument } = useDocument(docId);

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
		<ClientOnly>
			<Suspense>
				{createPortal(
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
				)}
				{doc.type === "mermaid" ? (
					<MermaidEditor doc={doc} />
				) : (
					<ExcalidrawEditor doc={doc} />
				)}
			</Suspense>
		</ClientOnly>
	);
}
