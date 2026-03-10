import { createServerFn } from "@tanstack/react-start";
import { and, asc, eq, isNull } from "drizzle-orm";
import {
	createDocumentSchema,
	deleteDocumentSchema,
	getDocumentSchema,
	updateDocumentSchema,
} from "@/lib/schemas";
import { db } from "@/server/db";
import { documents } from "@/server/db/schema";
import { authMiddleware } from "@/server/middleware";
import { validateZodInput } from "@/server/utils";
import { DEFAULT_DOCUMENT_CONTENT } from "@/server/utils/constant";

export const getDocumentsFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context: { user } }) => {
		const userDocuments = await db
			.select()
			.from(documents)
			.where(and(eq(documents.userId, user.id), isNull(documents.deletedAt)))
			.orderBy(asc(documents.createdAt));
		return userDocuments;
	});

export const getDocumentFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(getDocumentSchema)
	.handler(async ({ data: { id }, context: { user } }) => {
		const document = await db
			.select()
			.from(documents)
			.where(
				and(
					eq(documents.id, id),
					eq(documents.userId, user.id),
					isNull(documents.deletedAt),
				),
			)
			.limit(1);
		return document[0] || null;
	});

export const createDocumentFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(createDocumentSchema)
	.handler(async ({ data, context: { user } }) => {
		const newDoc = await db
			.insert(documents)
			.values({
				userId: user.id,
				title: data.title,
				type: data.type,
				content: data.content || DEFAULT_DOCUMENT_CONTENT.mermaid,
				createdAt: new Date(),
			})
			.returning();
		return newDoc[0];
	});

export const updateDocumentFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(validateZodInput(updateDocumentSchema))
	.handler(async ({ data: { id, ...updates }, context: { user } }) => {
		const updated = await db
			.update(documents)
			.set({ ...updates, updatedAt: new Date() })
			.where(
				and(
					eq(documents.id, id),
					eq(documents.userId, user.id),
					isNull(documents.deletedAt),
				),
			)
			.returning();
		return updated[0] || null;
	});

export const deleteDocumentFn = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(deleteDocumentSchema)
	.handler(async ({ data: { id }, context: { user } }) => {
		await db
			.update(documents)
			.set({ deletedAt: new Date() })
			.where(
				and(
					eq(documents.id, id),
					eq(documents.userId, user.id),
					isNull(documents.deletedAt),
				),
			);
		return { success: true };
	});
