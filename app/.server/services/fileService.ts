import type { DrizzleClient } from "../db";
import { FileRepository } from "../repos/fileRepository";
import { PageRepository } from "../repos/pageRepository";
import { FolderRepository } from "../repos/folderRepository";
import { type File, type NewFile, type UpdateFile } from "~/.server/db/schema";

export class FileService {
  constructor(
    private fileRepository: FileRepository,
    private pageRepository: PageRepository,
    private folderRepository: FolderRepository,
  ) {}

  async createFile(data: {
    pageId: string;
    name: string;
    lang?: string;
    content?: string;
    userId?: string;
  }): Promise<File> {
    // Validate page exists
    const page = await this.pageRepository.getById(data.pageId);
    if (!page) {
      throw new Error(`Page with id ${data.pageId} not found`);
    }

    // If userId provided, validate access through folder ownership
    if (data.userId) {
      const folder = await this.folderRepository.getById(page.folderId);
      if (!folder || folder.userId !== data.userId) {
        throw new Error(
          `Unauthorized: Page does not belong to user ${data.userId}`,
        );
      }
    }

    // Check for duplicate file names in the page
    const existingFile = await this.fileRepository.existsByName(
      data.pageId,
      data.name,
    );
    if (existingFile) {
      throw new Error(
        `File with name "${data.name}" already exists in this page`,
      );
    }

    const [file] = await this.fileRepository.create({
      pageId: data.pageId,
      name: data.name,
      lang: data.lang,
      content: data.content || "",
    });

    return file;
  }

  async createMultipleFiles(
    pageId: string,
    fileData: Array<{
      name: string;
      lang?: string;
      content?: string;
    }>,
    userId?: string,
  ): Promise<File[]> {
    // Validate page exists
    const page = await this.pageRepository.getById(pageId);
    if (!page) {
      throw new Error(`Page with id ${pageId} not found`);
    }

    // If userId provided, validate access through folder ownership
    if (userId) {
      const folder = await this.folderRepository.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: Page does not belong to user ${userId}`);
      }
    }

    // Check for duplicate file names
    for (const file of fileData) {
      const existingFile = await this.fileRepository.existsByName(
        pageId,
        file.name,
      );
      if (existingFile) {
        throw new Error(
          `File with name "${file.name}" already exists in this page`,
        );
      }
    }

    return this.fileRepository.createMany(pageId, fileData);
  }

  async getFileById(id: string, userId?: string): Promise<File> {
    const file = await this.fileRepository.getById(id);
    if (!file) {
      throw new Error(`File with id ${id} not found`);
    }

    // If userId provided, validate access through page/folder ownership
    if (userId) {
      const page = await this.pageRepository.getById(file.pageId);
      if (!page) {
        throw new Error(`Associated page not found`);
      }

      const folder = await this.folderRepository.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: File does not belong to user ${userId}`);
      }
    }

    return file;
  }

  async getFilesByPage(pageId: string, userId?: string): Promise<File[]> {
    // If userId provided, validate access through folder ownership
    if (userId) {
      const page = await this.pageRepository.getById(pageId);
      if (!page) {
        throw new Error(`Page with id ${pageId} not found`);
      }

      const folder = await this.folderRepository.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: Page does not belong to user ${userId}`);
      }
    }

    return this.fileRepository.getByPage(pageId);
  }

  async updateFile(
    id: string,
    data: UpdateFile,
    userId?: string,
  ): Promise<void> {
    const file = await this.fileRepository.getById(id);
    if (!file) {
      throw new Error(`File with id ${id} not found`);
    }

    // If userId provided, validate access through page/folder ownership
    if (userId) {
      const page = await this.pageRepository.getById(file.pageId);
      if (!page) {
        throw new Error(`Associated page not found`);
      }

      const folder = await this.folderRepository.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: File does not belong to user ${userId}`);
      }
    }

    // Check for duplicate names if name is being changed
    if (data.name && data.name !== file.name) {
      const existingFile = await this.fileRepository.existsByName(
        file.pageId,
        data.name,
      );
      if (existingFile) {
        throw new Error(
          `File with name "${data.name}" already exists in this page`,
        );
      }
    }

    await this.fileRepository.update(id, data);
  }

  async updateFileContent(id: string, content: string, userId?: string) {
    const file = await this.fileRepository.getById(id);
    if (!file) {
      throw new Error(`File with id ${id} not found`);
    }

    // If userId provided, validate access through page/folder ownership
    if (userId) {
      const page = await this.pageRepository.getById(file.pageId);
      if (!page) {
        throw new Error(`Associated page not found`);
      }

      const folder = await this.folderRepository.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: File does not belong to user ${userId}`);
      }
    }

    return await this.fileRepository.updateContent(id, content);
  }

  async updateFileContentWithVersion(
    id: string,
    content: string,
    expectedVersion: number,
    userId?: string,
  ): Promise<File> {
    const file = await this.fileRepository.getById(id);
    if (!file) {
      throw new Error(`File with id ${id} not found`);
    }

    // If userId provided, validate access through page/folder ownership
    if (userId) {
      const page = await this.pageRepository.getById(file.pageId);
      if (!page) {
        throw new Error(`Associated page not found`);
      }

      const folder = await this.folderRepository.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: File does not belong to user ${userId}`);
      }
    }

    try {
      return await this.fileRepository.updateContentWithVersion(
        id,
        content,
        expectedVersion,
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Version conflict")
      ) {
        // Get the current version of the file for detailed conflict info
        const currentFile = await this.fileRepository.getById(id);
        if (currentFile) {
          const conflictError = new Error(
            `Conflict detected. Expected version ${expectedVersion}, but current version is ${currentFile.version}. The file has been updated by another source.`,
          );
          (conflictError as any).conflictInfo = {
            expectedVersion,
            currentVersion: currentFile.version,
            currentContent: currentFile.content,
          };
          throw conflictError;
        }
      }
      throw error;
    }
  }

  async getFileContentWithVersion(
    id: string,
    userId?: string,
  ): Promise<{
    content: string;
    version: number;
    name: string;
    lang: string;
  }> {
    const file = await this.fileRepository.getById(id);
    if (!file) {
      throw new Error(`File with id ${id} not found`);
    }

    // If userId provided, validate access
    if (userId) {
      const page = await this.pageRepository.getById(file.pageId);
      if (!page) {
        throw new Error(`Associated page not found`);
      }

      const folder = await this.folderRepository.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: File does not belong to user ${userId}`);
      }
    }

    return {
      content: file.content,
      version: file.version,
      name: file.name,
      lang: file.lang,
    };
  }

  async resolveFileConflict(
    id: string,
    content: string,
    resolutionStrategy: "force-overwrite" | "merge-attempt",
    userId?: string,
  ): Promise<File> {
    const file = await this.fileRepository.getById(id);
    if (!file) {
      throw new Error(`File with id ${id} not found`);
    }

    // If userId provided, validate access
    if (userId) {
      const page = await this.pageRepository.getById(file.pageId);
      if (!page) {
        throw new Error(`Associated page not found`);
      }

      const folder = await this.folderRepository.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: File does not belong to user ${userId}`);
      }
    }

    if (resolutionStrategy === "force-overwrite") {
      // Force update regardless of version, but increment from current version
      return await this.fileRepository.updateContentWithVersion(
        id,
        content,
        file.version, // Use current version instead of expected
      );
    }

    // For merge-attempt, we would implement merge logic here
    // For now, just return the force overwrite behavior
    return await this.fileRepository.updateContentWithVersion(
      id,
      content,
      file.version,
    );
  }

  async deleteFile(id: string, userId?: string): Promise<void> {
    const file = await this.fileRepository.getById(id);
    if (!file) {
      throw new Error(`File with id ${id} not found`);
    }

    // If userId provided, validate access through page/folder ownership
    if (userId) {
      const page = await this.pageRepository.getById(file.pageId);
      if (!page) {
        throw new Error(`Associated page not found`);
      }

      const folder = await this.folderRepository.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: File does not belong to user ${userId}`);
      }
    }

    await this.fileRepository.delete(id);
  }

  async deleteFilesByPage(pageId: string, userId?: string): Promise<void> {
    // If userId provided, validate access through folder ownership
    if (userId) {
      const page = await this.pageRepository.getById(pageId);
      if (!page) {
        throw new Error(`Page with id ${pageId} not found`);
      }

      const folder = await this.folderRepository.getById(page.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error(`Unauthorized: Page does not belong to user ${userId}`);
      }
    }

    await this.fileRepository.deleteByPage(pageId);
  }

  async fileExists(id: string): Promise<boolean> {
    return this.fileRepository.exists(id);
  }

  async fileExistsByName(pageId: string, name: string): Promise<boolean> {
    return this.fileRepository.existsByName(pageId, name);
  }

  async fileBelongsToPage(id: string, pageId: string): Promise<boolean> {
    return this.fileRepository.belongsToPage(id, pageId);
  }

  async getFilesByLanguage(lang: string, userId?: string): Promise<File[]> {
    const files = await this.fileRepository.getByLanguage(lang);

    // If userId provided, filter files to only those accessible by the user
    if (userId) {
      const accessibleFiles: File[] = [];

      for (const file of files) {
        try {
          const page = await this.pageRepository.getById(file.pageId);
          if (page) {
            const folder = await this.folderRepository.getById(page.folderId);
            if (folder && folder.userId === userId) {
              accessibleFiles.push(file);
            }
          }
        } catch (error) {
          // Skip files that can't be accessed
          continue;
        }
      }

      return accessibleFiles;
    }

    return files;
  }

  async countFilesByPage(pageId: string): Promise<number> {
    return this.fileRepository.countByPage(pageId);
  }
}
