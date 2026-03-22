import { Edit2, MoreVertical, Trash } from "lucide-react";
import { useState } from "react";
import { ConfirmDeleteDialog } from "@/components/dashboard/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditableText } from "@/components/ui/editable-text";
import { cn } from "@/lib/utils";
import type { File } from "@/server/db/schema";
export default function FileSidebar({
	files,
	createNewFile,
	isCreating,
	openFileIds,
	setOpenFileIds,
	activeFileId,
	setActiveFileId,
	onSaveFileName,
	onDeleteFile,
	isDeleting,
}: {
	files: File[];
	createNewFile: () => void;
	isCreating: boolean;
	openFileIds: string[];
	setOpenFileIds: (ids: string[]) => void;
	activeFileId: string | null;
	setActiveFileId: (id: string | null) => void;
	onSaveFileName: (id: string, newName: string) => Promise<unknown>;
	onDeleteFile: (id: string) => Promise<unknown>;
	isDeleting: boolean;
}) {
	const [editingFileId, setEditingFileId] = useState<string | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<File | null>(null);

	return (
		<>
			<div className="h-full w-full bg-background shadow-sm overflow-hidden flex flex-col">
				<div className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b bg-muted/30 shrink-0 flex justify-between items-center">
					<span>Files</span>
					<Button loading={isCreating} size="sm" onClick={createNewFile}>
						New File
					</Button>
				</div>
				<div className="flex-1 h-full overflow-y-auto">
					{files.map((file) => (
						<div
							key={file.id}
							className={cn(
								"group flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted cursor-pointer",
								activeFileId === file.id && "bg-muted-foreground/20!",
							)}
						>
							<button
								type="button"
								className="flex min-w-0 flex-1 items-center text-left"
								disabled={editingFileId === file.id}
								onClick={() => {
									const isOpen = openFileIds.includes(file.id);
									if (!isOpen) {
										setOpenFileIds([...openFileIds, file.id]);
									}
									setActiveFileId(file.id);
								}}
							>
								<EditableText
									initialValue={file.name}
									open={editingFileId === file.id}
									onOpenChange={(open) => {
										if (!open && editingFileId === file.id) {
											setEditingFileId(null);
										}
									}}
									className="min-w-0 flex-1 text-left"
									onSave={(newName) => {
										return onSaveFileName(file.id, newName);
									}}
								/>
							</button>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
										onClick={(event) => {
											event.stopPropagation();
										}}
									>
										<MoreVertical className="h-4 w-4 text-muted-foreground" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="w-48 p-1 rounded-xl shadow-lg border-border/50"
									onCloseAutoFocus={(event) => {
										event.preventDefault();
									}}
								>
									<DropdownMenuItem
										className="rounded-lg gap-2 text-sm"
										onSelect={(event) => {
											event.preventDefault();
											requestAnimationFrame(() => {
												setEditingFileId(file.id);
											});
										}}
									>
										<Edit2 className="h-4 w-4 opacity-70" />
										<span>Rename</span>
									</DropdownMenuItem>
									<DropdownMenuItem
										variant="destructive"
										className="rounded-lg gap-2 text-sm"
										onSelect={(event) => {
											event.preventDefault();
											setDeleteTarget(file);
										}}
									>
										<Trash className="h-4 w-4 opacity-70" />
										<span>Delete</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					))}
				</div>
			</div>
			<ConfirmDeleteDialog
				open={deleteTarget !== null}
				onOpenChange={(open) => {
					if (!open) {
						setDeleteTarget(null);
					}
				}}
				title="Delete file"
				description={`Are you sure you want to delete "${deleteTarget?.name ?? ""}"?`}
				onConfirm={() => {
					if (!deleteTarget) return;
					void onDeleteFile(deleteTarget.id)
						.then(() => {
							setDeleteTarget(null);
						})
						.catch(() => {
							// Error toast is handled by the mutation hook.
						});
				}}
				isDeleting={isDeleting}
				confirmLabel="Delete file"
			/>
		</>
	);
}
