import type { Folder } from "@/server/db/schema";

export type DragItemType = "document" | "folder";

export type DragItemData = {
	type: DragItemType;
	id: string;
	sourceParentId: string | null;
};

export const DROP_TYPE_FOLDER = "folder-drop";

export type FolderDropData = {
	type: typeof DROP_TYPE_FOLDER;
	folderId: string;
};

export function isDescendantFolder(
	folders: Folder[],
	ancestorFolderId: string,
	targetFolderId: string,
) {
	const folderById = new Map(folders.map((folder) => [folder.id, folder]));
	let currentParentId = folderById.get(targetFolderId)?.parentId ?? null;

	while (currentParentId) {
		if (currentParentId === ancestorFolderId) {
			return true;
		}

		currentParentId = folderById.get(currentParentId)?.parentId ?? null;
	}

	return false;
}
