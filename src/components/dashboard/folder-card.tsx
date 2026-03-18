import { Link, useParams } from "@tanstack/react-router";
import { Edit2, Folder as FolderIcon, MoreVertical, Trash } from "lucide-react";
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
	className?: string;
}

export function FolderCard({
	id,
	title,
	onDelete,
	onUpdate,
	className,
}: FolderCardProps) {
	const params = useParams({ strict: false });
	const currentPath = params._splat || "";
	const newPath = currentPath ? `${currentPath}/${id}` : id;

	return (
		<div
			className={cn(
				"group flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-card hover:bg-accent/40 transition-all cursor-default select-none shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm",
				className,
			)}
		>
			<Link
				to="/$"
				params={{ _splat: newPath }}
				className="flex items-center gap-3 flex-1 min-w-0"
			>
				<div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 shrink-0 transition-transform group-hover:scale-110">
					<FolderIcon className="h-6 w-6 text-amber-600 dark:text-amber-500 fill-amber-600/20" />
				</div>
				<div className="flex flex-col min-w-0">
					<EditableText
						initialValue={title}
						onSave={async (value) => {
							return onUpdate(id, value);
						}}
						onClick={(e) => e.stopPropagation()}
						className="text-[13px] font-semibold truncate bg-transparent border-none p-0 focus-visible:ring-0 text-foreground/90"
					/>
					<span className="text-[10px] text-muted-foreground/70 font-medium uppercase tracking-tight">
						Folder
					</span>
				</div>
			</Link>

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
