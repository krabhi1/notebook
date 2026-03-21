import {
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	type DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/dashboard/confirm-delete-dialog";
import {
	DROP_TYPE_FOLDER,
	DROP_TYPE_ROOT,
	type DragItemData,
	type DropTargetData,
	isDescendantFolder,
} from "@/components/dashboard/dnd-utils";
import { DocumentCard } from "@/components/dashboard/document-card";
import { DocumentDeleteDialog } from "@/components/dashboard/document-delete-dialog";
import { FolderCard } from "@/components/dashboard/folder-card";
import { NewResourceButton } from "@/components/dashboard/new-resource-button";
import { RootDropZone } from "@/components/dashboard/root-drop-zone";
import { documentsQueryKey, useDocuments } from "@/hooks/use-document";
import { foldersQueryKey, useFolders } from "@/hooks/use-folder";
import type { Document, Folder } from "@/server/db/schema";
export function FolderView({
	folderId,
	title,
	parents,
	pathSegments,
}: {
	folderId: string;
	title: string;
	parents: Folder[];
	pathSegments: string[];
}) {
	const queryClient = useQueryClient();
	const {
		folders: allFolders,
		updateFolder,
		deleteFolder,
		isDeleting: isDeletingFolder,
	} = useFolders();
	const {
		docs: allDocs,
		deleteDocument,
		updateDocument,
		isDeleting: isDeletingDoc,
	} = useDocuments();

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
	const [deleteFolderDialogOpen, setDeleteFolderDialogOpen] = useState(false);
	const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
	const [activeItem, setActiveItem] = useState<DragItemData | null>(null);
	const [overFolderId, setOverFolderId] = useState<string | null>(null);
	const [isOverRoot, setIsOverRoot] = useState(false);
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
	);

	const subFolders = allFolders.filter((f) => f.parentId === folderId);
	const subDocs = allDocs.filter((d) => d.folderId === folderId);

	const handleDragStart = (event: DragStartEvent) => {
		const dragData = event.active.data.current as DragItemData | undefined;
		if (!dragData) return;
		setActiveItem(dragData);
	};

	const handleDragOver = (event: DragOverEvent) => {
		const dropData = event.over?.data.current as DropTargetData | undefined;
		if (dropData?.type === DROP_TYPE_FOLDER) {
			setOverFolderId(dropData.folderId);
			setIsOverRoot(false);
			return;
		}
		if (dropData?.type === DROP_TYPE_ROOT) {
			setOverFolderId(null);
			setIsOverRoot(true);
			return;
		}
		setOverFolderId(null);
		setIsOverRoot(false);
	};

	const resetDragState = () => {
		setActiveItem(null);
		setOverFolderId(null);
		setIsOverRoot(false);
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		const dragData = event.active.data.current as DragItemData | undefined;
		const dropData = event.over?.data.current as DropTargetData | undefined;

		resetDragState();

		if (!dragData || !dropData) {
			return;
		}

		if (dropData.type === DROP_TYPE_ROOT) {
			if (dragData.sourceParentId === null) return;
			if (dragData.type === "document") {
				const previousDocs =
					queryClient.getQueryData<Document[]>(documentsQueryKey);
				queryClient.setQueryData<Document[]>(documentsQueryKey, (current) =>
					current?.map((doc) =>
						doc.id === dragData.id ? { ...doc, folderId: null } : doc,
					),
				);
				try {
					await updateDocument({ data: { id: dragData.id, folderId: null } });
				} catch (_) {
					queryClient.setQueryData(documentsQueryKey, previousDocs);
					return;
				}
				return;
			}
			const previousFolders =
				queryClient.getQueryData<Folder[]>(foldersQueryKey);
			queryClient.setQueryData<Folder[]>(foldersQueryKey, (current) =>
				current?.map((folder) =>
					folder.id === dragData.id ? { ...folder, parentId: null } : folder,
				),
			);
			try {
				await updateFolder({ data: { id: dragData.id, parentId: null } });
			} catch (_) {
				queryClient.setQueryData(foldersQueryKey, previousFolders);
				return;
			}
			return;
		}

		if (dropData.type !== DROP_TYPE_FOLDER) return;

		const targetFolderId = dropData.folderId;

		if (dragData.type === "document") {
			if (dragData.sourceParentId === targetFolderId) return;
			const previousDocs =
				queryClient.getQueryData<Document[]>(documentsQueryKey);
			queryClient.setQueryData<Document[]>(documentsQueryKey, (current) =>
				current?.map((doc) =>
					doc.id === dragData.id ? { ...doc, folderId: targetFolderId } : doc,
				),
			);
			try {
				await updateDocument({
					data: { id: dragData.id, folderId: targetFolderId },
				});
			} catch (_) {
				queryClient.setQueryData(documentsQueryKey, previousDocs);
				return;
			}
			return;
		}

		if (dragData.id === targetFolderId) {
			toast.error("You can't move a folder into itself.");
			return;
		}

		if (isDescendantFolder(allFolders, dragData.id, targetFolderId)) {
			toast.error("You can't move a folder into its own subfolder.");
			return;
		}

		if (dragData.sourceParentId === targetFolderId) return;

		const previousFolders = queryClient.getQueryData<Folder[]>(foldersQueryKey);
		queryClient.setQueryData<Folder[]>(foldersQueryKey, (current) =>
			current?.map((folder) =>
				folder.id === dragData.id
					? { ...folder, parentId: targetFolderId }
					: folder,
			),
		);
		try {
			await updateFolder({
				data: { id: dragData.id, parentId: targetFolderId },
			});
		} catch (_) {
			queryClient.setQueryData(foldersQueryKey, previousFolders);
			return;
		}
	};

	return (
		<div className="flex flex-1 flex-col gap-8  overflow-y-auto px-8 py-8 max-w-7xl mx-auto w-full">
			<div className="flex flex-col gap-4 shrink-0">
				<nav className="flex items-center text-sm text-muted-foreground gap-2 shrink-0 flex-wrap">
					<Link
						to="/"
						className="hover:text-foreground transition-colors font-medium"
					>
						Dashboard
					</Link>
					{parents.map((p, idx) => (
						<Fragment key={p.id}>
							<span className="text-muted-foreground/40">/</span>
							<Link
								to="/$"
								params={{ _splat: pathSegments.slice(0, idx + 1).join("/") }}
								className="hover:text-foreground transition-colors font-medium truncate max-w-[150px]"
							>
								{p.title}
							</Link>
						</Fragment>
					))}
					<span className="text-muted-foreground/40">/</span>
				</nav>

				<div className="flex items-center justify-between">
					<h1 className="text-3xl font-bold tracking-tight">{title}</h1>
					<div className="flex items-center gap-2">
						<NewResourceButton folderId={folderId} />
					</div>
				</div>
			</div>

			<DndContext
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragCancel={resetDragState}
				onDragEnd={handleDragEnd}
			>
				<div className="flex flex-col gap-10">
					<RootDropZone visible={activeItem !== null} isOver={isOverRoot} />
					{subFolders.length > 0 && (
						<div className="flex flex-col gap-4">
							<h2 className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em] px-1">
								Folders
							</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{subFolders.map((f) => (
									<FolderCard
										key={f.id}
										id={f.id}
										title={f.title}
										dragData={{
											type: "folder",
											id: f.id,
											sourceParentId: f.parentId,
										}}
										isDropTarget={overFolderId === f.id}
										disableNavigation={activeItem !== null}
										onDelete={() => {
											setSelectedFolder(f);
											setDeleteFolderDialogOpen(true);
										}}
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
							{subDocs.map((doc) => (
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
									onUpdate={(id, title) =>
										updateDocument({ data: { id, title } })
									}
								/>
							))}
							{subDocs.length === 0 && (
								<p className="text-sm text-muted-foreground/50 italic col-span-full py-12 text-center border-2 border-dashed rounded-2xl bg-muted/5">
									This folder is empty
								</p>
							)}
						</div>
					</div>
				</div>
			</DndContext>

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
					isDeleting={isDeletingDoc}
				/>
			)}
			{selectedFolder && (
				<ConfirmDeleteDialog
					title="Delete Folder"
					description={`Are you sure you want to delete the folder “${selectedFolder.title}”?`}
					open={deleteFolderDialogOpen}
					onOpenChange={(open) => {
						if (!open) {
							setSelectedFolder(null);
						}
						setDeleteFolderDialogOpen(open);
					}}
					onConfirm={async () => {
						await deleteFolder(
							{ data: { id: selectedFolder.id } },
							{
								onSuccess: () => {
									setDeleteFolderDialogOpen(false);
									setSelectedFolder(null);
								},
							},
						);
					}}
					isDeleting={isDeletingFolder}
					confirmLabel="Delete"
				/>
			)}
		</div>
	);
}
