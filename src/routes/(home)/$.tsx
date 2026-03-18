import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Fragment } from "react";
import { DocumentView } from "@/components/dashboard/document-view";
import { FolderView } from "@/components/dashboard/folder-view";
import { getResourceFn } from "@/server/functions/utilsFn";

export const Route = createFileRoute("/(home)/$")({
	loader: async ({ params: { _splat } }) => {
		const splat = _splat || "";
		const pathSegments = splat.split("/").filter(Boolean);
		const targetId = pathSegments[pathSegments.length - 1];

		if (!targetId) throw notFound();

		const resource = await getResourceFn({ data: targetId });
		if (!resource) throw notFound();

		return { ...resource, pathSegments };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const resource = Route.useLoaderData();
	if (resource.type === "folder") {
		return (
			<FolderView
				folderId={resource.data.id}
				title={resource.data.title}
				parents={resource.parents}
				pathSegments={resource.pathSegments}
			/>
		);
	}
	return (
		<div className="flex flex-col h-full">
			<nav className="flex items-center text-sm text-muted-foreground gap-2 px-6 py-4 border-b bg-muted/10 shrink-0">
				<Link to="/" className="hover:text-foreground transition-colors">
					Dashboard
				</Link>
				{resource.parents.map((p, idx) => (
					<Fragment key={p.id}>
						<span className="text-muted-foreground/50">/</span>
						<Link
							to="/$"
							params={{
								_splat: resource.pathSegments.slice(0, idx + 1).join("/"),
							}}
							className="hover:text-foreground truncate max-w-[120px]"
						>
							{p.title}
						</Link>
					</Fragment>
				))}
				<span className="text-muted-foreground/50">/</span>
				<span className="font-medium text-foreground truncate">
					{resource.data.title}
				</span>
			</nav>
			<div className="flex-1 min-h-0">
				<DocumentView doc={resource.data} initialFiles={resource.files || []} />
			</div>
		</div>
	);
}
