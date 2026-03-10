import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DocumentCard } from "@/components/dashboard/document-card";
import { DocumentDeleteDialog } from "@/components/dashboard/document-delete-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocuments } from "@/hooks/use-document";

export const Route = createFileRoute("/(auth)/")({
	loader: async ({ context }) => {
		const { session } = context;
		return { session };
	},
	head: ({ loaderData }) => ({
		meta: [
			{
				title: loaderData?.session ? "Dashboard | Notebook" : "Notebook",
			},
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const {
		docs,
		createDocument,
		deleteDocument,
		isDeleting,
		isLoading,
		isCreating,
		updateDocument,
	} = useDocuments();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
	return (
		<div className=" flex flex-col gap-4 h-full overflow-y-scroll px-6 py-6">
			<div className="flex items-center justify-end gap-2">
				<Button
					onClick={() => {
						createDocument({ data: { type: "mermaid", title: "Untitled" } });
					}}
					loading={isCreating}
					className="w-fit"
				>
					New Mermaid
				</Button>
				<Button
					onClick={() => {
						createDocument({ data: { type: "excalidraw", title: "Untitled" } });
					}}
					loading={isCreating}
					className="w-fit"
				>
					New Excalidraw
				</Button>
			</div>
			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey:  static array
							key={i}
							className="p-4 border rounded-lg h-60 flex flex-col justify-between"
						>
							<Skeleton className="h-4 w-3/4 mb-2" />
							<Skeleton className="flex-1 w-full mb-2" />
							<Skeleton className="h-6 w-1/2 ml-auto" />
						</div>
					))}
				</div>
			) : (
				<div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-4 gap-4 ">
					{docs.map((doc) => (
						<DocumentCard
							key={doc.id}
							id={doc.id}
							title={doc.title}
							content={doc.content}
							onDelete={() => {
								setSelectedDocId(doc.id);
								setDeleteDialogOpen(true);
							}}
							onUpdate={(id, title) => {
								return updateDocument({ data: { id, title } });
							}}
						/>
					))}
				</div>
			)}
			{selectedDocId && (
				<DocumentDeleteDialog
					id={selectedDocId}
					open={deleteDialogOpen}
					onOpenChange={setDeleteDialogOpen}
					onDelete={async (id) => {
						await deleteDocument(
							{ data: { id } },
							{
								onSuccess: () => {
									setDeleteDialogOpen(false);

									setSelectedDocId(null);
								},
							},
						);
					}}
					isDeleting={isDeleting}
				/>
			)}
		</div>
	);
}
