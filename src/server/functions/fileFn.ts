import { createServerFn } from "@tanstack/react-start";
import { and, asc, eq, isNull } from "drizzle-orm";
import {
	createFileSchema,
	deleteFileSchema,
	getFileSchema,
	getFilesSchema,
	updateFileSchema,
} from "@/lib/schemas";
import { db } from "@/server/db";
import { documents, files } from "@/server/db/schema";
import { authMiddleware } from "@/server/middleware";

export const getFilesFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(getFilesSchema)
	.handler(async ({ data: { documentId }, context: { user } }) => {
		const documentFiles = await db
			.select()
			.from(files)
			.innerJoin(documents, eq(files.documentId, documents.id))
			.where(
				and(
					eq(files.documentId, documentId),
					isNull(files.deletedAt),
					eq(documents.userId, user.id),
				),
			)
			.orderBy(asc(files.createdAt));
		return documentFiles.map((item) => item.files);
	});
export const getFileFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(getFileSchema)
	.handler(async ({ data: { id }, context: { user } }) => {
		const file = await db
			.select()
			.from(files)
			.innerJoin(documents, eq(files.documentId, documents.id))
			.where(
				and(
					eq(files.id, id),
					isNull(files.deletedAt),
					eq(documents.userId, user.id),
				),
			)
			.limit(1);

		if (file.length === 0) {
			throw new Error("File not found or access denied");
		}

		return file[0].files;
	});
export const createFileFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(createFileSchema)
	.handler(
		async ({
			data: { documentId, name, meta, content },
			context: { user },
		}) => {
			// Check if the document exists and belongs to the user
			const document = await db
				.select()
				.from(documents)
				.innerJoin(documents, eq(files.documentId, documents.id))
				.where(
					and(
						eq(documents.id, documentId),
						eq(documents.userId, user.id),
						isNull(documents.deletedAt),
					),
				)
				.limit(1);

			if (document.length === 0) {
				throw new Error("Document not found or access denied");
			}

			// Create the file
			const newFile = await db
				.insert(files)
				.values({
					documentId,
					name,
					meta,
					content,
					createdAt: new Date(),
				})
				.returning();

			return newFile[0];
		},
	);

export const updateFileFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(updateFileSchema)
	.handler(async ({ data: { id, name, meta, content }, context: { user } }) => {
		// Check if the file exists and belongs to a document of the user
		const file = await db
			.select()
			.from(files)
			.innerJoin(documents, eq(files.documentId, documents.id))
			.where(
				and(
					eq(files.id, id),
					isNull(files.deletedAt),
					eq(documents.userId, user.id),
				),
			)
			.limit(1);

		if (file.length === 0) {
			throw new Error("File not found or access denied");
		}

		// Update the file
		const updatedFile = await db
			.update(files)
			.set({ name, meta, content, updatedAt: new Date() })
			.where(eq(files.id, id))
			.returning();

		return updatedFile[0];
	});

export const deleteFileFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(deleteFileSchema)
	.handler(async ({ data: { id }, context: { user } }) => {
		// Check if the file exists and belongs to a document of the user
		const file = await db
			.select()
			.from(files)
			.innerJoin(documents, eq(files.documentId, documents.id))
			.where(
				and(
					eq(files.id, id),
					isNull(files.deletedAt),
					eq(documents.userId, user.id),
				),
			)
			.limit(1);

		if (file.length === 0) {
			throw new Error("File not found or access denied");
		}

		// Soft delete the file
		await db
			.update(files)
			.set({ deletedAt: new Date() })
			.where(eq(files.id, id));

		return { success: true, id };
	});
