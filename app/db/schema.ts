import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export const users = sqliteTable("user", {
  id: text("id").primaryKey().notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  onboarded: integer("onboarded", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const folders = sqliteTable(
  "folder",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    isDeleted: integer("is_deleted", { mode: "boolean" }).default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    userIdIdx: index("folder_user_id_idx").on(table.userId),
    deletedIdx: index("folder_deleted_idx").on(table.isDeleted),
  }),
);

export const pages = sqliteTable(
  "page",
  {
    id: text("id").primaryKey(),
    userId: text("user_id") // ← ADDED
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    folderId: text("folder_id")
      .notNull()
      .references(() => folders.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type", { enum: ["web", "code", "mermaid"] }).notNull(),
    lang: text("lang", {
      enum: ["javascript", "typescript", "rust", "sql", "text"],
    }),
    content: text("content"),
    options: text("options", { mode: "json" }), // keep as JSON if storing objects
    isDeleted: integer("is_deleted", { mode: "boolean" }).default(false), // ← ADDED
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    userIdIdx: index("page_user_id_idx").on(table.userId),
    folderIdIdx: index("page_folder_id_idx").on(table.folderId),
    deletedIdx: index("page_deleted_idx").on(table.isDeleted),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UpdateUser = Partial<Pick<User, "name" | "imageUrl" | "onboarded">>;

export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
export type UpdateFolder = Partial<Pick<Folder, "name">>;

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
export type UpdatePage = Partial<
  Pick<Page, "name" | "content" | "lang" | "options">
>;

// Your simple PageMeta (great as-is!)
export type PageMeta = Pick<
  Page,
  "id" | "name" | "type" | "lang" | "updatedAt" | "createdAt"
>;
