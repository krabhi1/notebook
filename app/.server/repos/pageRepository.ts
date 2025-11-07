import { eq, and, inArray } from "drizzle-orm";
import type { DrizzleClient } from "../db";
import {
  pages,
  files,
  type Page,
  type File,
  type NewPage,
  type UpdatePage,
} from "~/.server/db/schema";
import { nanoid } from "nanoid";

export type PageWithFiles = Page & {
  files: File[];
};

export class PageRepository {
  constructor(private db: DrizzleClient) {}

  async getById(id: string): Promise<Page | undefined> {
    const result = await this.db
      .select()
      .from(pages)
      .where(and(eq(pages.id, id), eq(pages.isDeleted, false)));
    return result[0];
  }

  async getByIdWithFiles(id: string): Promise<PageWithFiles | undefined> {
    const page = await this.getById(id);
    if (!page) {
      return undefined;
    }

    const filesList = await this.db
      .select()
      .from(files)
      .where(eq(files.pageId, id))
      .orderBy(files.name);

    return {
      ...page,
      files: filesList,
    };
  }

  async getByFolder(folderId: string): Promise<Page[]> {
    return this.db
      .select()
      .from(pages)
      .where(and(eq(pages.folderId, folderId), eq(pages.isDeleted, false)))
      .orderBy(pages.updatedAt);
  }

  async getAll(): Promise<Page[]> {
    return this.db
      .select()
      .from(pages)
      .where(eq(pages.isDeleted, false))
      .orderBy(pages.updatedAt);
  }

  async create(data: {
    folderId: string;
    name: string;
    type: "code" | "web" | "mermaid" | "database" | "editorjs" | "circuit";
  }): Promise<Page[]> {
    return this.db
      .insert(pages)
      .values({
        id: nanoid(),
        ...data,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
  }

  async update(id: string, data: UpdatePage): Promise<void> {
    await this.db
      .update(pages)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(pages.id, id));
  }

  async softDelete(id: string): Promise<void> {
    await this.db
      .update(pages)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(eq(pages.id, id));
  }

  async hardDelete(id: string): Promise<void> {
    await this.db.delete(pages).where(eq(pages.id, id));
  }

  async deleteMany(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await this.db.delete(pages).where(inArray(pages.id, ids));
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.db
      .select()
      .from(pages)
      .where(and(eq(pages.id, id), eq(pages.isDeleted, false)));
    return result.length > 0;
  }

  async belongsToFolder(id: string, folderId: string): Promise<boolean> {
    const result = await this.db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.id, id),
          eq(pages.folderId, folderId),
          eq(pages.isDeleted, false),
        ),
      );
    return result.length > 0;
  }

  async getByType(
    type: "code" | "web" | "mermaid" | "database" | "editorjs" | "circuit",
  ): Promise<Page[]> {
    return this.db
      .select()
      .from(pages)
      .where(and(eq(pages.type, type), eq(pages.isDeleted, false)))
      .orderBy(pages.updatedAt);
  }

  async countByFolder(folderId: string): Promise<number> {
    const result = await this.db
      .select()
      .from(pages)
      .where(and(eq(pages.folderId, folderId), eq(pages.isDeleted, false)));
    return result.length;
  }

  async moveToFolder(id: string, newFolderId: string): Promise<void> {
    await this.db
      .update(pages)
      .set({
        folderId: newFolderId,
        updatedAt: new Date(),
      })
      .where(eq(pages.id, id));
  }
}
