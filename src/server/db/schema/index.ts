export * from "./auth";

import {
	foreignKey,
	integer,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { user } from "./auth";

const commonTimestamps = {
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	deletedAt: integer("deleted_at", { mode: "timestamp" }),
};
export const folders = sqliteTable(
	"folders",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid()),
		userId: text("user_id")
			.references(() => user.id, { onDelete: "cascade" })
			.notNull(),
		title: text("title").notNull().default("Folder"),
		parentId: text("parent_id"),
		...commonTimestamps,
	},
	(table) => ({
		parentReference: foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
		}).onDelete("cascade"),
	}),
);

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
	folderId: text("folder_id").references(() => folders.id, {
		onDelete: "set null",
	}),
	...commonTimestamps,
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
	...commonTimestamps,
});
export type Folder = typeof folders.$inferSelect;

export type File = typeof files.$inferSelect;

export type Document = typeof documents.$inferSelect;
