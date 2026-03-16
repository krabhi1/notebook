import { z } from "zod";

export const getDocumentSchema = z.object({
	id: z.string(),
});
export const deleteDocumentSchema = z.object({
	id: z.string(),
});
export const createDocumentSchema = z.object({
	title: z.string().max(255),
	type: z.enum(["mermaid", "excalidraw", "code"]),
	content: z.string().max(1048576).optional(),
	folderId: z.string().optional(),
});

export const updateDocumentSchema = z.object({
	id: z.string(),
	title: z.string().max(255).optional(),
	content: z.string().max(1048576).optional(),
	folderId: z.string().optional(),
});

// Folders
export const getFolderSchema = z.object({
	id: z.string(),
});
export const deleteFolderSchema = z.object({
	id: z.string(),
});
export const createFolderSchema = z.object({
	title: z.string().max(255),
	parentId: z.string().optional(),
});
export const updateFolderSchema = z.object({
	id: z.string(),
	title: z.string().max(255).optional(),
	parentId: z.string().optional(),
});

// Files
const MetaSchema = z.record(
	z.string(),
	z.union([z.string(), z.number(), z.boolean()]),
);
export const getFilesSchema = z.object({
	documentId: z.string(),
});
export const getFileSchema = z.object({
	id: z.string(),
});
export const createFileSchema = z.object({
	documentId: z.string(),
	name: z.string().max(255),
	meta: MetaSchema.optional(),
	content: z.string().max(1048576).optional(),
});

export const updateFileSchema = z.object({
	id: z.string(),
	name: z.string().max(255).optional(),
	meta: MetaSchema.optional(),
	content: z.string().max(1048576).optional(),
});

export const deleteFileSchema = z.object({
	id: z.string(),
});
