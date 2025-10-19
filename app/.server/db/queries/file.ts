import { eq, and, inArray, count } from "drizzle-orm";
import { db } from "../index";
import { files, type File, type NewFile, type UpdateFile } from "../schema";

export const FileDAO = {
  getById: async (id: string): Promise<File | undefined> => {
    const result = await db().select().from(files).where(eq(files.id, id));
    return result[0];
  },

  getByPage: async (pageId: string): Promise<File[]> => {
    return db()
      .select()
      .from(files)
      .where(eq(files.pageId, pageId))
      .orderBy(files.name);
  },

  getByName: async (
    pageId: string,
    name: string,
  ): Promise<File | undefined> => {
    const result = await db()
      .select()
      .from(files)
      .where(and(eq(files.pageId, pageId), eq(files.name, name)));
    return result[0];
  },

  getAll: async (): Promise<File[]> => {
    return db().select().from(files).orderBy(files.updatedAt);
  },

  create: async (data: {
    pageId: string;
    name: string;
    lang?: string;
    content?: string;
  }): Promise<File[]> => {
    return db()
      .insert(files)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
  },

  createMany: async (
    pageId: string,
    fileData: Array<{
      name: string;
      lang?: string;
      content?: string;
    }>,
  ): Promise<File[]> => {
    const filesToInsert = fileData.map((file) => ({
      pageId,
      ...file,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return db().insert(files).values(filesToInsert).returning();
  },

  update: async (id: string, data: UpdateFile): Promise<void> => {
    await db()
      .update(files)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(files.id, id));
  },

  updateContent: async (id: string, content: string): Promise<void> => {
    await db()
      .update(files)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(eq(files.id, id));
  },

  delete: async (id: string): Promise<void> => {
    await db().delete(files).where(eq(files.id, id));
  },

  deleteByPage: async (pageId: string): Promise<void> => {
    await db().delete(files).where(eq(files.pageId, pageId));
  },

  deleteMany: async (ids: string[]): Promise<void> => {
    if (ids.length === 0) return;
    await db().delete(files).where(inArray(files.id, ids));
  },

  exists: async (id: string): Promise<boolean> => {
    const result = await db()
      .select({ id: files.id })
      .from(files)
      .where(eq(files.id, id));
    return result.length > 0;
  },

  existsByName: async (pageId: string, name: string): Promise<boolean> => {
    const result = await db()
      .select({ id: files.id })
      .from(files)
      .where(and(eq(files.pageId, pageId), eq(files.name, name)));
    return result.length > 0;
  },

  belongsToPage: async (id: string, pageId: string): Promise<boolean> => {
    const result = await db()
      .select({ id: files.id })
      .from(files)
      .where(and(eq(files.id, id), eq(files.pageId, pageId)));
    return result.length > 0;
  },

  getByLanguage: async (lang: string): Promise<File[]> => {
    return db()
      .select()
      .from(files)
      .where(eq(files.lang, lang))
      .orderBy(files.updatedAt);
  },

  countByPage: async (pageId: string): Promise<number> => {
    const result = await db()
      .select({ count: count() })
      .from(files)
      .where(eq(files.pageId, pageId));
    return result[0].count;
  },
};
