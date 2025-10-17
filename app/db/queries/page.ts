import { eq, and } from "drizzle-orm";
import { db } from "../index";
import { pages, type Page, type NewPage, type UpdatePage } from "../schema";
import { nanoid } from "nanoid";

export const PageDAO = {
  getById: async (id: string): Promise<Page | undefined> => {
    const result = await db()
      .select()
      .from(pages)
      .where(and(eq(pages.id, id), eq(pages.isDeleted, false)));
    return result[0];
  },

  getByIdWithFiles: async (id: string) => {
    // return db().query.pages.findFirst({
    //   where: and(eq(pages.id, id), eq(pages.isDeleted, false)),
    //   with: {
    //     files: {
    //       orderBy: (files, { asc }) => [asc(files.name)],
    //     },
    //   },
    // });
    throw new Error("Not implemented");
  },

  getByFolder: async (folderId: string): Promise<Page[]> => {
    return db()
      .select()
      .from(pages)
      .where(and(eq(pages.folderId, folderId), eq(pages.isDeleted, false)))
      .orderBy(pages.updatedAt);
  },

  getByFolderWithFiles: async (folderId: string) => {
    // return db().query.pages.findMany({
    //   where: and(eq(pages.folderId, folderId), eq(pages.isDeleted, false)),
    //   with: {
    //     files: {
    //       orderBy: (files, { asc }) => [asc(files.name)],
    //     },
    //   },
    //   orderBy: (pages, { desc }) => [desc(pages.updatedAt)],
    // });
    th;
  },

  getAll: async (): Promise<Page[]> => {
    return db().select().from(pages).where(eq(pages.isDeleted, false));
  },

  create: async (data: {
    folderId: string;
    name: string;
    type: "code" | "web" | "mermaid" | "database" | "editorjs" | "circuit";
  }): Promise<Page[]> => {
    return db()
      .insert(pages)
      .values({
        id: nanoid(),
        ...data,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
  },

  update: async (id: string, data: UpdatePage): Promise<void> => {
    await db()
      .update(pages)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(pages.id, id));
  },

  softDelete: async (id: string): Promise<void> => {
    await db()
      .update(pages)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(eq(pages.id, id));
  },

  hardDelete: async (id: string): Promise<void> => {
    await db().delete(pages).where(eq(pages.id, id));
  },

  exists: async (id: string): Promise<boolean> => {
    const result = await db()
      .select({ id: pages.id })
      .from(pages)
      .where(and(eq(pages.id, id), eq(pages.isDeleted, false)));
    return result.length > 0;
  },

  belongsToFolder: async (id: string, folderId: string): Promise<boolean> => {
    const result = await db()
      .select({ id: pages.id })
      .from(pages)
      .where(
        and(
          eq(pages.id, id),
          eq(pages.folderId, folderId),
          eq(pages.isDeleted, false),
        ),
      );
    return result.length > 0;
  },

  getByType: async (
    type: "code" | "web" | "mermaid" | "database" | "editorjs" | "circuit",
  ): Promise<Page[]> => {
    return db()
      .select()
      .from(pages)
      .where(and(eq(pages.type, type), eq(pages.isDeleted, false)))
      .orderBy(pages.updatedAt);
  },
};
