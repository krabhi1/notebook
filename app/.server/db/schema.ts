import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
};

const isDeleted = integer("is_deleted", { mode: "boolean" }).default(false);

export const users = sqliteTable("user", {
  id: text("id").primaryKey().notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  onBoarded: integer("onboarded", { mode: "boolean" }).default(false),
  ...timestamps,
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
    isDeleted,
    ...timestamps,
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
    folderId: text("folder_id")
      .notNull()
      .references(() => folders.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type", {
      enum: ["code", "web", "mermaid", "database", "editorjs", "circuit"],
    }).notNull(),
    isDeleted,
    ...timestamps,
  },
  (table) => ({
    folderIdIdx: index("page_folder_id_idx").on(table.folderId),
    deletedIdx: index("page_deleted_idx").on(table.isDeleted),
  }),
);

export const files = sqliteTable(
  "file",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    pageId: text("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    lang: text("lang"),
    content: text("content"),
    ...timestamps,
  },
  (table) => ({
    pageIdIdx: index("file_page_id_idx").on(table.pageId),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UpdateUser = Partial<Pick<User, "name" | "imageUrl" | "onBoarded">>;

export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
export type UpdateFolder = Partial<Pick<Folder, "name">>;

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
export type UpdatePage = Partial<Pick<Page, "name" | "type" | "folderId">>;

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
export type UpdateFile = Partial<
  Pick<File, "name" | "lang" | "content" | "pageId">
>;

export type PageMeta = Pick<
  Page,
  "id" | "name" | "type" | "updatedAt" | "createdAt"
>;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  folders: many(folders),
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
  user: one(users, {
    fields: [folders.userId],
    references: [users.id],
  }),
  pages: many(pages),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
  folder: one(folders, {
    fields: [pages.folderId],
    references: [folders.id],
  }),
  files: many(files),
}));

export const filesRelations = relations(files, ({ one }) => ({
  page: one(pages, {
    fields: [files.pageId],
    references: [pages.id],
  }),
}));
