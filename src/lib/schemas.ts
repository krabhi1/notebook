import { z } from "zod";

export const getDocumentSchema = z.object({
	id: z.string(),
});
export const deleteDocumentSchema = z.object({
	id: z.string(),
});
export const createDocumentSchema = z.object({
	title: z.string().max(255),
	type: z.enum(["mermaid", "excalidraw"]),
	content: z.string().max(1048576).optional(),
});

export const updateDocumentSchema = z.object({
	id: z.string(),
	title: z.string().max(255).optional(),
	content: z.string().max(1048576).optional(),
});
