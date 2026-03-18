import { useDraggable, useDroppable } from "@dnd-kit/core";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Edit2, Folder as FolderIcon, MoreVertical, Trash } from "lucide-react";
import { useState } from "react";
import {
	DROP_TYPE_FOLDER,
	type DragItemData,
	type FolderDropData,
} from "@/components/dashboard/dnd-utils";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditableText } from "@/components/ui/editable-text";
import { cn } from "@/lib/utils";

interface FolderCardProps {
	id: string;
	title: string;
	onDelete: () => void;
	onUpdate: (id: string, title: string) => Promise<unknown>;
	dragData?: DragItemData;
	disableNavigation?: boolean;
	isDropTarget?: boolean;
	className?: string;
}

export function FolderCard({
	id,
	title,
	onDelete,
	onUpdate,
	dragData,
	disableNavigation = false,
	isDropTarget = false,
	className,
}: FolderCardProps) {
	const [isEditing, setIsEditing] = useState(false);
	const navigate = useNavigate();
	const params = useParams({ strict: false });
	const currentPath = params._splat || "";
	const newPath = currentPath ? `${currentPath}/${id}` : id;
	const {
		attributes,
		listeners,
		setNodeRef: setDragNodeRef,
		transform,
		isDragging,
	} = useDraggable({
		id: `folder:${id}`,
		disabled: !dragData,
		data: dragData,
	});
	const { setNodeRef: setDropNodeRef } = useDroppable({
		id: `folder-drop:${id}`,
		data: { type: DROP_TYPE_FOLDER, folderId: id } satisfies FolderDropData,
	});
	const setNodeRef = (node: HTMLDivElement | null) => {
		setDragNodeRef(node);
		setDropNodeRef(node);
	};
	const transformStyle = transform
		? `translate3d(${transform.x}px, ${transform.y}px, 0)`
		: undefined;

	const handleNavigate = () => {
		if (isEditing || isDragging || disableNavigation) return;
		navigate({
			to: "/$",
			params: { _splat: newPath },
		});
	};

	return (
		<div
			ref={setNodeRef}
			style={{ transform: transformStyle }}
			className={cn(
				"group flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-card hover:bg-accent/40  cursor-pointer select-none  hover:shadow-sm",
				isDragging && "opacity-60",
				isDropTarget && "ring-2 ring-primary/60 bg-accent/60",
				className,
			)}
		>
			<button
				type="button"
				onClick={handleNavigate}
				{...listeners}
				{...attributes}
				className="flex items-center gap-3 flex-1 min-w-0 text-left rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
			>
				<div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 shrink-0 transition-transform group-hover:scale-110">
					<FolderIcon className="h-6 w-6 text-amber-600 dark:text-amber-500 fill-amber-600/20" />
				</div>
				<div className="flex flex-col min-w-0">
					<EditableText
						initialValue={title}
						floating={true}
						triggerMode="none"
						editing={isEditing}
						onEditingChange={setIsEditing}
						onSave={async (value) => {
							return onUpdate(id, value);
						}}
					/>
					<span className="text-[10px] text-muted-foreground/70 font-medium uppercase tracking-tight">
						Folder
					</span>
				</div>
			</button>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 hover:bg-accent rounded-full"
						onClick={(e) => e.stopPropagation()}
					>
						<MoreVertical className="h-4 w-4 text-muted-foreground" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					className="w-48 p-1 rounded-xl shadow-lg border-border/50"
				>
					<DropdownMenuItem
						className="rounded-lg gap-2 text-sm"
						onClick={(e) => {
							e.stopPropagation();
							setIsEditing(true);
						}}
					>
						<Edit2 className="h-4 w-4 opacity-70" />
						<span>Rename</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						className="text-destructive focus:text-destructive rounded-lg gap-2 text-sm"
						onClick={(e) => {
							e.stopPropagation();
							onDelete();
						}}
					>
						<Trash className="h-4 w-4 opacity-70" />
						<span>Delete</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
