export * from "./auth";

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { user } from "./auth";

export const documents = sqliteTable("documents", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => nanoid()),
	userId: text("user_id")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	title: text("title").notNull().default("Untitled"),
	content: text("content").notNull().default(""),
	type: text({ enum: ["mermaid", "excalidraw", "code"] })
		.notNull()
		.default("mermaid"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const files = sqliteTable("files", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => nanoid()),
	documentId: text("document_id").references(() => documents.id, {
		onDelete: "cascade",
	}),
	name: text("name").notNull(),
	meta: text("meta", { mode: "json" })
		.notNull()
		.default({})
		.$type<Record<string, string | number | boolean>>(),
	content: text("content"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type File = typeof files.$inferSelect;

export type Document = typeof documents.$inferSelect;
