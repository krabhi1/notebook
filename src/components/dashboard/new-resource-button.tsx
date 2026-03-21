import { FileCode2, FileJson, FolderPlus, Layout, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDocuments } from "@/hooks/use-document";
import { useFolders } from "@/hooks/use-folder";
import { cn } from "@/lib/utils";

interface NewResourceButtonProps {
	folderId?: string | null;
	className?: string;
}

/**
 * A unified "New" button component that provides a dropdown to create
 * folders and different types of documents.
 * Can be used on the dashboard (root) or inside any folder.
 */
export function NewResourceButton({
	folderId = null,
	className,
}: NewResourceButtonProps) {
	const { createDocument, isCreating: isCreatingDoc } = useDocuments();
	const { createFolder, isCreating: isCreatingFolder } = useFolders();

	const isPending = isCreatingDoc || isCreatingFolder;

	const handleCreateFolder = () => {
		createFolder({
			data: {
				title: "Folder",
				parentId: folderId || undefined,
			},
		});
	};

	const handleCreateDocument = (type: "code" | "mermaid" | "excalidraw") => {
		createDocument({
			data: {
				title: "Untitled",
				type,
				folderId: folderId || undefined,
			},
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					size="sm"
					className={cn(
						"gap-2 shadow-sm rounded-full px-4 h-10 font-semibold transition-all hover:shadow-md",
						className,
					)}
					disabled={isPending}
				>
					<Plus className="h-5 w-5" />
					<span>New</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-56 p-2 rounded-xl shadow-xl border-border/50"
			>
				<DropdownMenuItem
					onClick={handleCreateFolder}
					className="rounded-lg gap-3 py-2.5 cursor-pointer"
				>
					<div className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30">
						<FolderPlus className="h-4 w-4 text-amber-600 dark:text-amber-500" />
					</div>
					<div className="flex flex-col">
						<span className="text-sm font-medium">Folder</span>
						<span className="text-[10px] text-muted-foreground">
							Create a new directory
						</span>
					</div>
				</DropdownMenuItem>

				<DropdownMenuSeparator className="my-2" />

				<DropdownMenuItem
					onClick={() => handleCreateDocument("code")}
					className="rounded-lg gap-3 py-2.5 cursor-pointer"
				>
					<div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30">
						<FileCode2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
					</div>
					<div className="flex flex-col">
						<span className="text-sm font-medium">Code Document</span>
						<span className="text-[10px] text-muted-foreground">
							JS, TS, Python and more
						</span>
					</div>
				</DropdownMenuItem>

				<DropdownMenuItem
					onClick={() => handleCreateDocument("mermaid")}
					className="rounded-lg gap-3 py-2.5 cursor-pointer"
				>
					<div className="flex items-center justify-center h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30">
						<FileJson className="h-4 w-4 text-purple-600 dark:text-purple-400" />
					</div>
					<div className="flex flex-col">
						<span className="text-sm font-medium">Mermaid Diagram</span>
						<span className="text-[10px] text-muted-foreground">
							Flowcharts and sequences
						</span>
					</div>
				</DropdownMenuItem>

				<DropdownMenuItem
					onClick={() => handleCreateDocument("excalidraw")}
					className="rounded-lg gap-3 py-2.5 cursor-pointer"
				>
					<div className="flex items-center justify-center h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/30">
						<Layout className="h-4 w-4 text-orange-600 dark:text-orange-400" />
					</div>
					<div className="flex flex-col">
						<span className="text-sm font-medium">Excalidraw</span>
						<span className="text-[10px] text-muted-foreground">
							Hand-drawn diagrams
						</span>
					</div>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
