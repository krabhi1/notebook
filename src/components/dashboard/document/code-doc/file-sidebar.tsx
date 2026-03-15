import { Button } from "@/components/ui/button";
import type { File } from "@/server/db/schema";
export default function FileSidebar({
	files,
	createNewFile,
	isCreating,
	openFileIds,
	setOpenFileIds,
	activeFileId,
	setActiveFileId,
}: {
	files: File[];
	createNewFile: () => void;
	isCreating: boolean;
	openFileIds: string[];
	setOpenFileIds: (ids: string[]) => void;
	activeFileId: string | null;
	setActiveFileId: (id: string | null) => void;
}) {
	return (
		<div className="h-full w-full  bg-background shadow-sm overflow-hidden flex flex-col">
			<div className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b bg-muted/30 shrink-0 flex justify-between items-center">
				<span>Files</span>
				<Button loading={isCreating} size="sm" onClick={createNewFile}>
					New File
				</Button>
			</div>
			<div className="flex-1 min-h-0 overflow-hidden">
				{files.map((file) => (
					<button
						key={file.id}
						type="button"
						className={`px-3 py-2 text-sm hover:bg-muted cursor-pointer w-full text-left ${
							activeFileId === file.id ? "bg-muted" : ""
						}`}
						onClick={() => {
							const isOpen = openFileIds.includes(file.id);
							if (!isOpen) {
								setOpenFileIds([...openFileIds, file.id]);
							}
							setActiveFileId(file.id);
						}}
					>
						{file.name}
					</button>
				))}
			</div>
		</div>
	);
}
