import { createServerFn } from "@tanstack/react-start";
import { and, asc, eq, isNull } from "drizzle-orm";
import {
	createFolderSchema,
	deleteFolderSchema,
	getFolderSchema,
	updateFolderSchema,
} from "@/lib/schemas";
import { db } from "@/server/db";
import { documents, folders } from "@/server/db/schema";
import { authMiddleware } from "@/server/middleware";
import { validateZodInput } from "@/server/utils";

export const getFoldersFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context: { user } }) => {
		const userFolders = await db
			.select()
			.from(folders)
			.where(and(eq(folders.userId, user.id), isNull(folders.deletedAt)))
			.orderBy(asc(folders.createdAt));
		return userFolders;
	});

export const getFolderFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(getFolderSchema)
	.handler(async ({ data: { id }, context: { user } }) => {
		const folder = await db
			.select()
			.from(folders)
			.where(
				and(
					eq(folders.id, id),
					eq(folders.userId, user.id),
					isNull(folders.deletedAt),
				),
			)
			.limit(1);
		return folder[0] || null;
	});

export const createFolderFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(createFolderSchema)
	.handler(async ({ data, context: { user } }) => {
		const newFolder = await db
			.insert(folders)
			.values({
				userId: user.id,
				title: data.title,
				parentId: data.parentId || null,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();
		return newFolder[0];
	});

export const updateFolderFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(validateZodInput(updateFolderSchema))
	.handler(async ({ data: { id, ...updates }, context: { user } }) => {
		const updated = await db
			.update(folders)
			.set({
				...updates,
				parentId:
					updates.parentId === undefined ? undefined : updates.parentId || null,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(folders.id, id),
					eq(folders.userId, user.id),
					isNull(folders.deletedAt),
				),
			)
			.returning();
		return updated[0] || null;
	});

export const deleteFolderFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(deleteFolderSchema)
	.handler(async ({ data: { id }, context: { user } }) => {
		// Soft delete the folder
		await db
			.update(folders)
			.set({ deletedAt: new Date() })
			.where(
				and(
					eq(folders.id, id),
					eq(folders.userId, user.id),
					isNull(folders.deletedAt),
				),
			);

		// Optionally: You might want to also soft-delete all documents inside this folder
		// or handle recursive folder deletion if your DB doesn't handle cascade on deleteAt
		await db
			.update(documents)
			.set({ deletedAt: new Date() })
			.where(
				and(
					eq(documents.folderId, id),
					eq(documents.userId, user.id),
					isNull(documents.deletedAt),
				),
			);

		return { success: true };
	});
