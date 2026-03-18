import { createFileRoute } from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";
import { DocumentView } from "@/components/dashboard/document-view";
import { FolderView } from "@/components/dashboard/folder-view";
import { useResource } from "@/hooks/use-resource";

export const Route = createFileRoute("/(home)/$")({
	component: RouteComponent,
});

function RouteComponent() {
	const { _splat } = Route.useParams();
	const splat = _splat || "";
	const pathSegments = splat.split("/").filter(Boolean);
	const targetId = pathSegments[pathSegments.length - 1];
	const { resource, isLoading } = useResource(targetId);
	if (isLoading) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<Loader2Icon className="animate-spin" />
			</div>
		);
	}
	if (!resource) {
		return <div>Resource not found</div>;
	}
	if (resource.type === "folder") {
		return (
			<FolderView
				folderId={resource.data.id}
				title={resource.data.title}
				parents={resource.parents}
				pathSegments={pathSegments}
			/>
		);
	}
	if (resource.type === "document") {
		return (
			<DocumentView doc={resource.data} initialFiles={resource.files || []} />
		);
	}
}
