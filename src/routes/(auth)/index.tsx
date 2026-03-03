import { createFileRoute } from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { DocumentCard } from "@/components/dashboard/document-card";
import { DocumentDeleteDialog } from "@/components/dashboard/document-delete-dialog";
import { Button } from "@/components/ui/button";
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
		documents,
		createDocument,
		deleteDocument,
		isDeleting,
		isLoading,
		isCreating,
	} = useDocuments();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
	return (
		<div className="p-6 flex flex-col gap-6">
			<Button
				onClick={() => {
					createDocument({ data: {} });
				}}
				disabled={isCreating}
				className="w-fit"
			>
				{isCreating && <Loader2Icon className="animate-spin" />} Create Document
			</Button>
			{isLoading ? (
				<p>Loading documents...</p>
			) : (
				<div className="grid grid-cols-3 gap-4">
					{documents.map((doc) => (
						<DocumentCard
							key={doc.id}
							id={doc.id}
							title={doc.title}
							content={doc.content}
							onDelete={() => {
								setSelectedDocId(doc.id);
								setDeleteDialogOpen(true);
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
