import { z } from "zod";

export const getDocumentSchema = z.object({
	id: z.string(),
});
export const deleteDocumentSchema = z.object({
	id: z.string(),
});
export const createDocumentSchema = z.object({
	title: z.string().optional(),
	type: z.string().optional(),
	content: z.string().optional(),
});

export const updateDocumentSchema = z.object({
	id: z.string(),
	title: z.string().optional(),
	type: z.string().optional(),
	content: z.string().optional(),
});
