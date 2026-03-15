import { Button } from "@/components/ui/button";
import { EditableText } from "@/components/ui/editable-text";
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
}: {
	files: File[];
	createNewFile: () => void;
	isCreating: boolean;
	openFileIds: string[];
	setOpenFileIds: (ids: string[]) => void;
	activeFileId: string | null;
	setActiveFileId: (id: string | null) => void;
	onSaveFileName: (id: string, newName: string) => Promise<unknown>;
}) {
	return (
		<div className="h-full w-full  bg-background shadow-sm overflow-hidden flex flex-col">
			<div className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b bg-muted/30 shrink-0 flex justify-between items-center">
				<span>Files</span>
				<Button loading={isCreating} size="sm" onClick={createNewFile}>
					New File
				</Button>
			</div>
			<div className="flex-1  h-full overflow-y-auto ">
				{files.map((file) => (
					<div key={file.id}>
						<EditableText
							key={file.id}
							initialValue={file.name}
							className="w-full border-x-0"
							className2={`px-3 py-2 text-sm hover:bg-muted cursor-pointer w-full text-left ${
								activeFileId === file.id ? "bg-muted-foreground/20!" : ""
							}`}
							onSave={(newName) => {
								return onSaveFileName(file.id, newName);
							}}
							onClick={() => {
								const isOpen = openFileIds.includes(file.id);
								if (!isOpen) {
									setOpenFileIds([...openFileIds, file.id]);
								}
								setActiveFileId(file.id);
							}}
						/>
					</div>
				))}
			</div>
		</div>
	);
}
