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
	type: text("type").notNull().default("mermaid"),
	content: text("content").notNull().default(""),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export type Document = typeof documents.$inferSelect;
