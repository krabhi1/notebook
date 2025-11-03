import { PageDAO } from "../db/queries/page";
import { FileDAO } from "../db/queries/file";
import { FolderDAO } from "../db/queries/folder";
import { type Page, type NewPage, type UpdatePage } from "../db/schema";
import {
  defaultJsContent,
  defaultWebContent,
  defaultMermaidContent,
  defaultDatabaseContent,
  defaultEditorJsContent,
  defaultCircuitContent,
} from "~/lib/constants";

export const PageService = {
  createPage: async (data: {
    folderId: string;
    name: string;
    type: "code" | "web" | "mermaid" | "database" | "editorjs" | "circuit";
    userId?: string;
  }): Promise<Page> => {
    // Validate folder exists
    const folder = await FolderDAO.getById(data.folderId);
    if (!folder) {
      throw new Error(`Folder with id ${data.folderId} not found`);
    }

    // If userId provided, validate folder ownership
    if (data.userId && folder.userId !== data.userId) {
      throw new Error(
        `Unauthorized: Folder does not belong to user ${data.userId}`,
      );
    }

    // // Check for duplicate page names in the folder
    // const existingPages = await PageDAO.getByFolder(data.folderId);
    // const duplicateName = existingPages.some(
    //   (page) => page.name.toLowerCase() === data.name.toLowerCase(),
    // );

    // if (duplicateName) {
    //   throw new Error(
    //     `Page with name "${data.name}" already exists in this folder`,
    //   );
    // }

    const [page] = await PageDAO.create({
      folderId: data.folderId,
      name: data.name,
      type: data.type,
    });

    return page;
  },

  createPageWithDefaultFiles: async (
    folderId: string,
    name: string,
    type: "code" | "web" | "mermaid" | "database" | "editorjs" | "circuit",
    userId?: string,
  ): Promise<Page> => {
    const page = await PageService.createPage({ folderId, name, type, userId });

    // Create default files based on type
    if (type === "web") {
      await FileDAO.createMany(page.id, [
        {
          name: "index.html",
          lang: "html",
          content: defaultWebContent.html,
        },
        {
          name: "style.css",
          lang: "css",
          content: defaultWebContent.css,
        },
        {
          name: "script.js",
          lang: "javascript",
          content: defaultWebContent.js,
        },
      ]);
    } else if (type === "code") {
      await FileDAO.create({
        pageId: page.id,
        name: "main.js",
        lang: "javascript",
        content: defaultJsContent,
      });
      await FileDAO.create({
        pageId: page.id,
        name: "main.html",
        lang: "html",
        content: "<!-- HTML File -->",
      });
      await FileDAO.create({
        pageId: page.id,
        name: "main.css",
        lang: "css",
        content: "/* CSS File */",
      });
    } else if (type === "mermaid") {
      await FileDAO.create({
        pageId: page.id,
        name: "diagram.mmd",
        lang: "mermaid",
        content: defaultMermaidContent,
      });
    } else if (type === "database") {
      await FileDAO.create({
        pageId: page.id,
        name: "schema.sql",
        lang: "sql",
        content: defaultDatabaseContent,
      });
    } else if (type === "editorjs") {
      await FileDAO.create({
        pageId: page.id,
        name: "content.json",
        lang: "json",
        content: defaultEditorJsContent(),
      });
    } else if (type === "circuit") {
      await FileDAO.create({
        pageId: page.id,
        name: "circuit.json",
        lang: "json",
        content: defaultCircuitContent(name),
      });
    }

    return page;
  },

  getPageById: async (id: string, userId?: string): Promise<Page> => {
    const page = await PageDAO.getById(id);
    if (!page) {
      throw new Error(`Page with id ${id} not found`);
    }

    // If userId provided, validate access through folder ownership
    if (userId) {
      const folder = await FolderDAO.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: Page does not belong to user ${userId}`);
      }
    }

    return page;
  },

  getPageWithFiles: async (id: string) => {
    const page = await PageDAO.getByIdWithFiles(id);
    if (!page) {
      throw new Error(`Page with id ${id} not found`);
    }
    return page;
  },

  getPagesByFolder: async (
    folderId: string,
    userId?: string,
  ): Promise<Page[]> => {
    const folder = await FolderDAO.getById(folderId);
    if (!folder) {
      throw new Error(`Folder with id ${folderId} not found`);
    }

    // If userId provided, validate folder ownership
    if (userId && folder.userId !== userId) {
      throw new Error(`Unauthorized: Folder does not belong to user ${userId}`);
    }

    return PageDAO.getByFolder(folderId);
  },

  updatePage: async (
    id: string,
    data: UpdatePage,
    userId?: string,
  ): Promise<void> => {
    const page = await PageDAO.getById(id);
    if (!page) {
      throw new Error(`Page with id ${id} not found`);
    }

    // If userId provided, validate access through folder ownership
    if (userId) {
      const folder = await FolderDAO.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: Page does not belong to user ${userId}`);
      }
    }

    // Check for duplicate names if name is being updated
    if (data.name) {
      const siblingPages = await PageDAO.getByFolder(page.folderId);
      const duplicateName = siblingPages.some(
        (sibling) =>
          sibling.id !== id &&
          sibling.name.toLowerCase() === data.name!.toLowerCase(),
      );

      if (duplicateName) {
        throw new Error(
          `Page with name "${data.name}" already exists in this folder`,
        );
      }
    }

    await PageDAO.update(id, data);
  },

  deletePage: async (
    id: string,
    userId?: string,
    options?: {
      hardDelete?: boolean;
    },
  ): Promise<void> => {
    const page = await PageDAO.getById(id);
    if (!page) {
      throw new Error(`Page with id ${id} not found`);
    }

    // If userId provided, validate access through folder ownership
    if (userId) {
      const folder = await FolderDAO.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: Page does not belong to user ${userId}`);
      }
    }

    if (options?.hardDelete) {
      // Delete all files first, then the page
      await FileDAO.deleteByPage(id);
      await PageDAO.hardDelete(id);
    } else {
      // Soft delete - just mark page as deleted (files remain)
      await PageDAO.softDelete(id);
    }
  },

  deletePageWithFiles: async (
    pageId: string,
    userId?: string,
  ): Promise<void> => {
    await PageService.deletePage(pageId, userId, { hardDelete: true });
  },

  movePage: async (
    id: string,
    newFolderId: string,
    userId?: string,
  ): Promise<void> => {
    const page = await PageDAO.getById(id);
    if (!page) {
      throw new Error(`Page with id ${id} not found`);
    }

    const newFolder = await FolderDAO.getById(newFolderId);
    if (!newFolder) {
      throw new Error(`Destination folder with id ${newFolderId} not found`);
    }

    // If userId provided, validate access to both folders
    if (userId) {
      const currentFolder = await FolderDAO.getById(page.folderId);
      if (!currentFolder || currentFolder.userId !== userId) {
        throw new Error(
          `Unauthorized: Current page folder does not belong to user ${userId}`,
        );
      }
      if (newFolder.userId !== userId) {
        throw new Error(
          `Unauthorized: Destination folder does not belong to user ${userId}`,
        );
      }
    }

    // Check for duplicate names in destination folder
    const existingPages = await PageDAO.getByFolder(newFolderId);
    const duplicateName = existingPages.some(
      (existingPage) =>
        existingPage.name.toLowerCase() === page.name.toLowerCase(),
    );

    if (duplicateName) {
      throw new Error(
        `Page with name "${page.name}" already exists in destination folder`,
      );
    }

    await PageDAO.update(id, { folderId: newFolderId });
  },

  validatePageAccess: async (
    pageId: string,
    userId: string,
  ): Promise<boolean> => {
    const page = await PageDAO.getById(pageId);
    if (!page) return false;

    return FolderDAO.belongsToUser(page.folderId, userId);
  },

  getPageStats: async (id: string, userId?: string) => {
    const page = await PageDAO.getById(id);
    if (!page) {
      throw new Error(`Page with id ${id} not found`);
    }

    // If userId provided, validate access through folder ownership
    if (userId) {
      const folder = await FolderDAO.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: Page does not belong to user ${userId}`);
      }
    }

    const fileCount = await FileDAO.countByPage(id);
    const files = await FileDAO.getByPage(id);
    const totalSize = files.reduce(
      (size, file) => size + (file.content?.length || 0),
      0,
    );

    return {
      id: page.id,
      name: page.name,
      type: page.type,
      fileCount,
      totalSize,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    };
  },

  getPagesByType: async (
    type: "code" | "web" | "mermaid" | "database" | "editorjs" | "circuit",
    userId?: string,
  ): Promise<Page[]> => {
    const pages = await PageDAO.getByType(type);

    if (!userId) {
      return pages;
    }

    // Filter pages by user ownership through folders
    const userPages = [];
    for (const page of pages) {
      const folder = await FolderDAO.getById(page.folderId);
      if (folder && folder.userId === userId) {
        userPages.push(page);
      }
    }

    return userPages;
  },
};
