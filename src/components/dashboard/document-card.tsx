import { useDraggable } from "@dnd-kit/core";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
	Edit2,
	FileCode2,
	FileJson,
	FileText,
	Layout,
	MoreVertical,
	Trash,
} from "lucide-react";
import { useState } from "react";
import type { DragItemData } from "@/components/dashboard/dnd-utils";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditableText } from "@/components/ui/editable-text";
import { cn } from "@/lib/utils";

interface DocumentCardProps {
	id: string;
	title: string;
	type?: "mermaid" | "excalidraw" | "code";
	onDelete?: (id: string) => void;
	onUpdate?: (id: string, title: string) => Promise<unknown>;
	dragData?: DragItemData;
	disableNavigation?: boolean;
	className?: string;
}

const TypeIcon = ({ type }: { type?: string }) => {
	switch (type) {
		case "code":
			return <FileCode2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
		case "mermaid":
			return (
				<FileJson className="h-5 w-5 text-purple-600 dark:text-purple-400" />
			);
		case "excalidraw":
			return (
				<Layout className="h-5 w-5 text-orange-600 dark:text-orange-400" />
			);
		default:
			return (
				<FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
			);
	}
};

const TypeBg = ({ type }: { type?: string }) => {
	switch (type) {
		case "code":
			return "bg-blue-100 dark:bg-blue-900/30";
		case "mermaid":
			return "bg-purple-100 dark:bg-purple-900/30";
		case "excalidraw":
			return "bg-orange-100 dark:bg-orange-900/30";
		default:
			return "bg-slate-100 dark:bg-slate-900/30";
	}
};

export function DocumentCard({
	id,
	title,
	type,
	onDelete,
	onUpdate,
	dragData,
	disableNavigation = false,
	className,
}: DocumentCardProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const navigate = useNavigate();
	const params = useParams({ strict: false });
	const currentPath = params._splat || "";
	const newPath = currentPath ? `${currentPath}/${id}` : id;
	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({
			id: `document:${id}`,
			disabled: !dragData,
			data: dragData,
		});
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
				"group flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-card hover:bg-accent/40 cursor-pointer select-none hover:shadow-sm",
				isDragging && "opacity-60",
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
				<div
					className={cn(
						"flex items-center justify-center h-10 w-10 rounded-lg shrink-0 transition-transform group-hover:scale-110",
						TypeBg({ type }),
					)}
				>
					<TypeIcon type={type} />
				</div>
				<div className="flex flex-col min-w-0">
					<EditableText
						initialValue={title}
						open={isEditing}
						onOpenChange={setIsEditing}
						onSave={async (value) => {
							return onUpdate?.(id, value);
						}}
					/>
					<span className="text-[10px] text-muted-foreground/70 font-medium uppercase tracking-tight">
						{type || "Document"}
					</span>
				</div>
			</button>

			<DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
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
					onCloseAutoFocus={(event) => {
						event.preventDefault();
					}}
				>
					<DropdownMenuItem
						className="rounded-lg gap-2 text-sm"
						onSelect={(event) => {
							event.preventDefault();
							setIsMenuOpen(false);
							requestAnimationFrame(() => {
								setIsEditing(true);
							});
						}}
					>
						<Edit2 className="h-4 w-4 opacity-70" />
						<span>Rename</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						className="text-destructive focus:text-destructive rounded-lg gap-2 text-sm"
						onSelect={(event) => {
							event.preventDefault();
							onDelete?.(id);
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
