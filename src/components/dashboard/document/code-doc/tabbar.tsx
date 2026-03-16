import { X } from "lucide-react";
import type { File } from "@/server/db/schema";

export default function TabBar({
	openFiles,
	openFileIds,
	activeFileId,
	setActiveFileId,
	setOpenFileIds,
}: {
	openFiles: File[];
	openFileIds: string[];
	activeFileId: string | null;
	setActiveFileId: (id: string | null) => void;
	setOpenFileIds: (ids: string[]) => void;
}) {
	return (
		<div
			onWheel={(e) => {
				e.currentTarget.scrollLeft += e.deltaY;
			}}
			className="flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-b bg-muted/30 shrink-0 "
		>
			{openFiles.map((file) => (
				<button
					key={file.id}
					className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1 hover:bg-muted shrink-0 ${
						activeFileId === file.id ? "bg-muted-foreground/20!" : ""
					}`}
					onClick={() => setActiveFileId(file.id)}
					type="button"
				>
					{file.name}
					<X
						size={14}
						className="hover:bg-muted-foreground/40 hover:text-destructive-foreground rounded p-0.5"
						onClick={(e) => {
							e.stopPropagation();
							setOpenFileIds(openFileIds.filter((id) => id !== file.id));
							if (activeFileId === file.id) {
								const index = openFiles.findIndex((f) => f.id === file.id);
								const newActive =
									openFiles[index - 1] || openFiles[index + 1] || null;
								setActiveFileId(newActive?.id || null);
							}
						}}
					/>
				</button>
			))}
		</div>
	);
}
