import { createServerFn } from "@tanstack/react-start";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db";
import {
	type Document,
	documents as documentsTable,
	type File,
	type Folder,
	files as filesTable,
	folders as foldersTable,
} from "@/server/db/schema";
import { authMiddleware } from "@/server/middleware";
export type FolderResource = {
	type: "folder";
	data: Folder;
	parents: Folder[];
};
export type DocumentResource = {
	type: "document";
	data: Document;
	files: File[];
	parents: Folder[];
};
export type Resource = FolderResource | DocumentResource;
export const getResourceFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(z.string())
	.handler(
		async ({ data: id, context: { user } }): Promise<Resource | null> => {
			// 1. Check if it's a folder
			const folder = await db
				.select()
				.from(foldersTable)
				.where(
					and(
						eq(foldersTable.id, id),
						eq(foldersTable.userId, user.id),
						isNull(foldersTable.deletedAt),
					),
				)
				.get();

			if (folder) {
				const parents = [];
				let currentParentId = folder.parentId;

				while (currentParentId) {
					const parent = await db
						.select()
						.from(foldersTable)
						.where(eq(foldersTable.id, currentParentId))
						.get();
					if (parent) {
						parents.unshift(parent);
						currentParentId = parent.parentId;
					} else {
						currentParentId = null;
					}
				}

				return { type: "folder" as const, data: folder, parents };
			}

			// 2. Check if it's a document
			const doc = await db
				.select()
				.from(documentsTable)
				.where(
					and(
						eq(documentsTable.id, id),
						eq(documentsTable.userId, user.id),
						isNull(documentsTable.deletedAt),
					),
				)
				.get();

			if (doc) {
				const parents = [];
				let currentParentId = doc.folderId;

				while (currentParentId) {
					const parent = await db
						.select()
						.from(foldersTable)
						.where(eq(foldersTable.id, currentParentId))
						.get();
					if (parent) {
						parents.unshift(parent);
						currentParentId = parent.parentId;
					} else {
						currentParentId = null;
					}
				}

				const docFiles = await db
					.select()
					.from(filesTable)
					.where(eq(filesTable.documentId, doc.id))
					.all();

				return {
					type: "document" as const,
					data: doc,
					files: docFiles,
					parents,
				};
			}

			return null;
		},
	);
