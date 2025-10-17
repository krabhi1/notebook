import { FileDAO } from "../queries/file";
import { PageDAO } from "../queries/page";
import { FolderDAO } from "../queries/folder";
import { type File, type NewFile, type UpdateFile } from "../schema";

export const FileService = {
  createFile: async (data: {
    pageId: string;
    name: string;
    lang?: string;
    content?: string;
    userId?: string;
  }): Promise<File> => {
    // Validate page exists
    const page = await PageDAO.getById(data.pageId);
    if (!page) {
      throw new Error(`Page with id ${data.pageId} not found`);
    }

    // If userId provided, validate access through folder ownership
    if (data.userId) {
      const folder = await FolderDAO.getById(page.folderId);
      if (!folder || folder.userId !== data.userId) {
        throw new Error(
          `Unauthorized: Page does not belong to user ${data.userId}`,
        );
      }
    }

    // Check for duplicate file names in the page
    const existingFile = await FileDAO.existsByName(data.pageId, data.name);
    if (existingFile) {
      throw new Error(
        `File with name "${data.name}" already exists in this page`,
      );
    }

    const [file] = await FileDAO.create({
      pageId: data.pageId,
      name: data.name,
      lang: data.lang,
      content: data.content || "",
    });

    return file;
  },

  createMultipleFiles: async (
    pageId: string,
    fileData: Array<{
      name: string;
      lang?: string;
      content?: string;
    }>,
    userId?: string,
  ): Promise<File[]> => {
    // Validate page exists
    const page = await PageDAO.getById(pageId);
    if (!page) {
      throw new Error(`Page with id ${pageId} not found`);
    }

    // If userId provided, validate access through folder ownership
    if (userId) {
      const folder = await FolderDAO.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: Page does not belong to user ${userId}`);
      }
    }

    // Check for duplicate file names
    for (const file of fileData) {
      const existingFile = await FileDAO.existsByName(pageId, file.name);
      if (existingFile) {
        throw new Error(
          `File with name "${file.name}" already exists in this page`,
        );
      }
    }

    // Check for duplicates within the new files array
    const names = fileData.map((f) => f.name.toLowerCase());
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) {
      throw new Error("Duplicate file names found in the request");
    }

    return FileDAO.createMany(pageId, fileData);
  },

  getFileById: async (id: string, userId?: string): Promise<File> => {
    const file = await FileDAO.getById(id);
    if (!file) {
      throw new Error(`File with id ${id} not found`);
    }

    // If userId provided, validate access through page/folder ownership
    if (userId) {
      const page = await PageDAO.getById(file.pageId);
      if (!page) {
        throw new Error(`Associated page not found`);
      }

      const folder = await FolderDAO.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: File does not belong to user ${userId}`);
      }
    }

    return file;
  },

  getFilesByPage: async (pageId: string, userId?: string): Promise<File[]> => {
    const page = await PageDAO.getById(pageId);
    if (!page) {
      throw new Error(`Page with id ${pageId} not found`);
    }

    // If userId provided, validate access through folder ownership
    if (userId) {
      const folder = await FolderDAO.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: Page does not belong to user ${userId}`);
      }
    }

    return FileDAO.getByPage(pageId);
  },

  updateFile: async (
    id: string,
    data: UpdateFile,
    userId?: string,
  ): Promise<void> => {
    const file = await FileDAO.getById(id);
    if (!file) {
      throw new Error(`File with id ${id} not found`);
    }

    // If userId provided, validate access through page/folder ownership
    if (userId) {
      const page = await PageDAO.getById(file.pageId);
      if (!page) {
        throw new Error(`Associated page not found`);
      }

      const folder = await FolderDAO.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: File does not belong to user ${userId}`);
      }
    }

    // Check for duplicate names if name is being updated
    if (data.name && data.name !== file.name) {
      const existingFile = await FileDAO.existsByName(file.pageId, data.name);
      if (existingFile) {
        throw new Error(
          `File with name "${data.name}" already exists in this page`,
        );
      }
    }

    await FileDAO.update(id, data);
  },

  updateFileContent: async (
    id: string,
    content: string,
    userId?: string,
  ): Promise<void> => {
    const file = await FileDAO.getById(id);
    if (!file) {
      throw new Error(`File with id ${id} not found`);
    }

    // If userId provided, validate access through page/folder ownership
    if (userId) {
      const page = await PageDAO.getById(file.pageId);
      if (!page) {
        throw new Error(`Associated page not found`);
      }

      const folder = await FolderDAO.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: File does not belong to user ${userId}`);
      }
    }

    await FileDAO.updateContent(id, content);
  },

  deleteFile: async (id: string, userId?: string): Promise<void> => {
    const file = await FileDAO.getById(id);
    if (!file) {
      throw new Error(`File with id ${id} not found`);
    }

    // If userId provided, validate access through page/folder ownership
    if (userId) {
      const page = await PageDAO.getById(file.pageId);
      if (!page) {
        throw new Error(`Associated page not found`);
      }

      const folder = await FolderDAO.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: File does not belong to user ${userId}`);
      }
    }

    await FileDAO.delete(id);
  },

  deleteMultipleFiles: async (
    ids: string[],
    userId?: string,
  ): Promise<void> => {
    if (ids.length === 0) return;

    // Validate all files exist and user has access
    for (const id of ids) {
      const file = await FileDAO.getById(id);
      if (!file) {
        throw new Error(`File with id ${id} not found`);
      }

      if (userId) {
        const page = await PageDAO.getById(file.pageId);
        if (!page) {
          throw new Error(`Associated page not found for file ${id}`);
        }

        const folder = await FolderDAO.getById(page.folderId);
        if (!folder || folder.userId !== userId) {
          throw new Error(
            `Unauthorized: File ${id} does not belong to user ${userId}`,
          );
        }
      }
    }

    await FileDAO.deleteMany(ids);
  },

  duplicateFile: async (
    id: string,
    newName: string,
    userId?: string,
  ): Promise<File> => {
    const file = await FileDAO.getById(id);
    if (!file) {
      throw new Error(`File with id ${id} not found`);
    }

    // If userId provided, validate access through page/folder ownership
    if (userId) {
      const page = await PageDAO.getById(file.pageId);
      if (!page) {
        throw new Error(`Associated page not found`);
      }

      const folder = await FolderDAO.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: File does not belong to user ${userId}`);
      }
    }

    // Check if new name already exists
    const existingFile = await FileDAO.existsByName(file.pageId, newName);
    if (existingFile) {
      throw new Error(
        `File with name "${newName}" already exists in this page`,
      );
    }

    const [newFile] = await FileDAO.create({
      pageId: file.pageId,
      name: newName,
      lang: file.lang ?? undefined,
      content: file.content ?? undefined,
    });

    return newFile;
  },

  renameFile: async (
    id: string,
    newName: string,
    userId?: string,
  ): Promise<void> => {
    await FileService.updateFile(id, { name: newName }, userId);
  },

  moveFile: async (
    id: string,
    newPageId: string,
    userId?: string,
  ): Promise<void> => {
    const file = await FileDAO.getById(id);
    if (!file) {
      throw new Error(`File with id ${id} not found`);
    }

    const newPage = await PageDAO.getById(newPageId);
    if (!newPage) {
      throw new Error(`Destination page with id ${newPageId} not found`);
    }

    // If userId provided, validate access to both pages
    if (userId) {
      const currentPage = await PageDAO.getById(file.pageId);
      if (!currentPage) {
        throw new Error(`Current file page not found`);
      }

      const currentFolder = await FolderDAO.getById(currentPage.folderId);
      const newFolder = await FolderDAO.getById(newPage.folderId);

      if (!currentFolder || currentFolder.userId !== userId) {
        throw new Error(
          `Unauthorized: Current file page does not belong to user ${userId}`,
        );
      }
      if (!newFolder || newFolder.userId !== userId) {
        throw new Error(
          `Unauthorized: Destination page does not belong to user ${userId}`,
        );
      }
    }

    // Check for duplicate names in destination page
    const existingFile = await FileDAO.existsByName(newPageId, file.name);
    if (existingFile) {
      throw new Error(
        `File with name "${file.name}" already exists in destination page`,
      );
    }

    await FileDAO.update(id, { pageId: newPageId });
  },

  validateFileAccess: async (
    fileId: string,
    userId: string,
  ): Promise<boolean> => {
    const file = await FileDAO.getById(fileId);
    if (!file) return false;

    const page = await PageDAO.getById(file.pageId);
    if (!page) return false;

    return FolderDAO.belongsToUser(page.folderId, userId);
  },

  getFilesByLanguage: async (
    lang: string,
    userId?: string,
  ): Promise<File[]> => {
    const files = await FileDAO.getByLanguage(lang);

    if (!userId) {
      return files;
    }

    // Filter files by user ownership through pages/folders
    const userFiles = [];
    for (const file of files) {
      const page = await PageDAO.getById(file.pageId);
      if (page) {
        const folder = await FolderDAO.getById(page.folderId);
        if (folder && folder.userId === userId) {
          userFiles.push(file);
        }
      }
    }

    return userFiles;
  },

  searchFiles: async (query: string, userId?: string): Promise<File[]> => {
    // This is a basic implementation - in a real app you might want to use full-text search
    const allFiles = userId
      ? await FileService.getUserFiles(userId)
      : await FileDAO.getAll();

    const searchTerm = query.toLowerCase();
    return allFiles.filter(
      (file) =>
        file.name.toLowerCase().includes(searchTerm) ||
        (file.content && file.content.toLowerCase().includes(searchTerm)),
    );
  },

  getUserFiles: async (userId: string): Promise<File[]> => {
    const folders = await FolderDAO.getByUser(userId);
    const userFiles: File[] = [];

    for (const folder of folders) {
      const pages = await PageDAO.getByFolder(folder.id);
      for (const page of pages) {
        const files = await FileDAO.getByPage(page.id);
        userFiles.push(...files);
      }
    }

    return userFiles;
  },

  getFileStats: async (id: string, userId?: string) => {
    const file = await FileDAO.getById(id);
    if (!file) {
      throw new Error(`File with id ${id} not found`);
    }

    // If userId provided, validate access through page/folder ownership
    if (userId) {
      const page = await PageDAO.getById(file.pageId);
      if (!page) {
        throw new Error(`Associated page not found`);
      }

      const folder = await FolderDAO.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: File does not belong to user ${userId}`);
      }
    }

    const contentLength = file.content?.length || 0;
    const lineCount = file.content ? file.content.split("\n").length : 0;
    const wordCount = file.content
      ? file.content.split(/\s+/).filter((word) => word.length > 0).length
      : 0;

    return {
      id: file.id,
      name: file.name,
      lang: file.lang,
      size: contentLength,
      lines: lineCount,
      words: wordCount,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    };
  },
};
