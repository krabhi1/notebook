import {
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	type DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
	DROP_TYPE_FOLDER,
	type DragItemData,
	type FolderDropData,
	isDescendantFolder,
} from "@/components/dashboard/dnd-utils";
import { DocumentCard } from "@/components/dashboard/document-card";
import { DocumentDeleteDialog } from "@/components/dashboard/document-delete-dialog";
import { FolderCard } from "@/components/dashboard/folder-card";
import { NewResourceButton } from "@/components/dashboard/new-resource-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocuments } from "@/hooks/use-document";
import { useFolders } from "@/hooks/use-folder";

export const Route = createFileRoute("/(home)/")({
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
	const { docs, deleteDocument, isDeleting, isLoading, updateDocument } =
		useDocuments();
	const {
		folders,
		updateFolder,
		deleteFolder,
		isLoading: isFoldersLoading,
	} = useFolders();

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
	const [activeItem, setActiveItem] = useState<DragItemData | null>(null);
	const [overFolderId, setOverFolderId] = useState<string | null>(null);
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
	);

	const rootFolders = folders.filter((f) => !f.parentId);
	const rootDocs = docs.filter((d) => !d.folderId);

	const handleDragStart = (event: DragStartEvent) => {
		const dragData = event.active.data.current as DragItemData | undefined;
		if (!dragData) return;
		setActiveItem(dragData);
	};

	const handleDragOver = (event: DragOverEvent) => {
		const dropData = event.over?.data.current as FolderDropData | undefined;
		if (dropData?.type === DROP_TYPE_FOLDER) {
			setOverFolderId(dropData.folderId);
			return;
		}
		setOverFolderId(null);
	};

	const resetDragState = () => {
		setActiveItem(null);
		setOverFolderId(null);
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		const dragData = event.active.data.current as DragItemData | undefined;
		const dropData = event.over?.data.current as FolderDropData | undefined;

		resetDragState();

		if (!dragData || !dropData || dropData.type !== DROP_TYPE_FOLDER) {
			return;
		}

		const targetFolderId = dropData.folderId;

		if (dragData.type === "document") {
			if (dragData.sourceParentId === targetFolderId) return;
			await updateDocument({
				data: { id: dragData.id, folderId: targetFolderId },
			});
			return;
		}

		if (dragData.id === targetFolderId) {
			toast.error("You can't move a folder into itself.");
			return;
		}

		if (isDescendantFolder(folders, dragData.id, targetFolderId)) {
			toast.error("You can't move a folder into its own subfolder.");
			return;
		}

		if (dragData.sourceParentId === targetFolderId) return;

		await updateFolder({ data: { id: dragData.id, parentId: targetFolderId } });
	};

	return (
		<div className="flex flex-col gap-8 flex-1 overflow-y-auto px-8 py-8 max-w-7xl mx-auto w-full">
			<div className="flex items-center justify-between mb-2">
				<h1 className="text-2xl font-bold tracking-tight">My Drive</h1>
				<div className="flex items-center gap-2">
					<NewResourceButton />
				</div>
			</div>
			{isLoading || isFoldersLoading ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{Array.from({ length: 8 }).map((_, i) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: fixed
							key={i}
							className="p-4 rounded-xl border border-border/50 h-16 flex items-center gap-4 bg-muted/5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
						>
							<Skeleton className="h-10 w-10 rounded-lg" />
							<div className="space-y-2">
								<Skeleton className="h-3 w-24" />
								<Skeleton className="h-2 w-12" />
							</div>
						</div>
					))}
				</div>
			) : (
				<DndContext
					sensors={sensors}
					onDragStart={handleDragStart}
					onDragOver={handleDragOver}
					onDragCancel={resetDragState}
					onDragEnd={handleDragEnd}
				>
					<div className="flex flex-col gap-10">
						{rootFolders.length > 0 && (
							<div className="flex flex-col gap-4">
								<h2 className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em] px-1">
									Folders
								</h2>
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
									{rootFolders.map((folder) => (
										<FolderCard
											key={folder.id}
											id={folder.id}
											title={folder.title}
											dragData={{
												type: "folder",
												id: folder.id,
												sourceParentId: folder.parentId,
											}}
											isDropTarget={overFolderId === folder.id}
											disableNavigation={activeItem !== null}
											onDelete={() => deleteFolder({ data: { id: folder.id } })}
											onUpdate={(id, title) =>
												updateFolder({ data: { id, title } })
											}
										/>
									))}
								</div>
							</div>
						)}

						<div className="flex flex-col gap-4">
							<h2 className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em] px-1">
								Files
							</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{rootDocs.map((doc) => (
									<DocumentCard
										key={doc.id}
										id={doc.id}
										title={doc.title}
										type={doc.type}
										dragData={{
											type: "document",
											id: doc.id,
											sourceParentId: doc.folderId,
										}}
										disableNavigation={activeItem !== null}
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
						</div>
					</div>
				</DndContext>
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
