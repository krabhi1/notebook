import { eq, and, inArray, count } from "drizzle-orm";
import type { DrizzleClient } from "../db";
import { files, type File, type UpdateFile } from "~/.server/db/schema";

export class FileRepository {
  constructor(private db: DrizzleClient) {}

  async getById(id: string): Promise<File | undefined> {
    const result = await this.db.select().from(files).where(eq(files.id, id));
    return result[0];
  }

  async getByPage(pageId: string): Promise<File[]> {
    return this.db
      .select()
      .from(files)
      .where(eq(files.pageId, pageId))
      .orderBy(files.name);
  }

  async getByName(pageId: string, name: string): Promise<File | undefined> {
    const result = await this.db
      .select()
      .from(files)
      .where(and(eq(files.pageId, pageId), eq(files.name, name)));
    return result[0];
  }

  async getAll(): Promise<File[]> {
    return this.db.select().from(files).orderBy(files.updatedAt);
  }

  async create(data: {
    pageId: string;
    name: string;
    lang?: string;
    content?: string;
  }): Promise<File[]> {
    return this.db
      .insert(files)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
  }

  async createMany(
    pageId: string,
    fileData: Array<{
      name: string;
      lang?: string;
      content?: string;
    }>,
  ): Promise<File[]> {
    const filesToInsert = fileData.map((file) => ({
      pageId,
      ...file,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return this.db.insert(files).values(filesToInsert).returning();
  }

  async update(id: string, data: UpdateFile): Promise<void> {
    await this.db
      .update(files)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(files.id, id));
  }

  async updateContent(id: string, content: string): Promise<File> {
    const result = await this.db
      .update(files)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(eq(files.id, id))
      .returning();
    return result[0];
  }

  async updateContentWithVersion(
    id: string,
    content: string,
    expectedVersion: number,
  ): Promise<File> {
    const result = await this.db
      .update(files)
      .set({
        content,
        version: expectedVersion + 1,
        updatedAt: new Date(),
      })
      .where(and(eq(files.id, id), eq(files.version, expectedVersion)))
      .returning();

    if (result.length === 0) {
      throw new Error("Version conflict or file not found");
    }

    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(files).where(eq(files.id, id));
  }

  async deleteByPage(pageId: string): Promise<void> {
    await this.db.delete(files).where(eq(files.pageId, pageId));
  }

  async deleteMany(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await this.db.delete(files).where(inArray(files.id, ids));
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.db.select().from(files).where(eq(files.id, id));
    return result.length > 0;
  }

  async existsByName(pageId: string, name: string): Promise<boolean> {
    const result = await this.db
      .select()
      .from(files)
      .where(and(eq(files.pageId, pageId), eq(files.name, name)));
    return result.length > 0;
  }

  async belongsToPage(id: string, pageId: string): Promise<boolean> {
    const result = await this.db
      .select()
      .from(files)
      .where(and(eq(files.id, id), eq(files.pageId, pageId)));
    return result.length > 0;
  }

  async getByLanguage(lang: string): Promise<File[]> {
    return this.db
      .select()
      .from(files)
      .where(eq(files.lang, lang))
      .orderBy(files.updatedAt);
  }

  async countByPage(pageId: string): Promise<number> {
    const result = await this.db
      .select()
      .from(files)
      .where(eq(files.pageId, pageId));
    return result.length;
  }
}
