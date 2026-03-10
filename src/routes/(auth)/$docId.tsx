import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { useDocument } from "@/hooks/use-document";

const MermaidEditor = lazy(
	() => import("@/components/dashboard/document/mermaid-editor"),
);
const ExcalidrawEditor = lazy(
	() => import("@/components/dashboard/document/excalidraw-editor"),
);

export const Route = createFileRoute("/(auth)/$docId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { docId } = Route.useParams();
	const { doc, isLoading } = useDocument(docId);

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
		<Suspense fallback={<div>Loading suspense</div>}>
			{doc.type === "mermaid" ? (
				<MermaidEditor docId={docId} />
			) : (
				<ExcalidrawEditor docId={docId} />
			)}
		</Suspense>
	);
}
