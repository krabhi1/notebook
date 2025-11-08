import React, {
  createContext,
  use,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import {
  useFetcher,
  useFetchers,
  type FetcherWithComponents,
} from "react-router";
import type { File } from "~/.server/db/schema";
import { debounce } from "../utils";
import type { PageWithFiles } from "~/.server/repos/pageRepository";
export type ExtendedFile = File & {
  status?: "saved" | "saving" | "error" | "unsaved";
  path: string;
};
type FileSyncContextType = {
  files: ExtendedFile[];
  activeFile: ExtendedFile | undefined;
  activeEditorContent: string;
  setActiveTab: (tabId: string) => void;
  updateValue: (fileId: string, newContent: string) => void;
  setFetcher: (fileId: string, fetcher: FetcherWithComponents<any>) => void;
};

const FileSyncContext = createContext<FileSyncContextType | undefined>(
  undefined,
);

interface FileSyncProviderProps {
  page: PageWithFiles;
}

export function FileSyncProvider({
  page: { files, id, name },
  children,
}: React.PropsWithChildren<FileSyncProviderProps>) {
  const [drafts, setDrafts] = useState<
    Record<
      string,
      {
        content: string;
        fetcher?: FetcherWithComponents<any>;
      }
    >
  >({});
  const [activeTabId, setActiveTabId] = useState(files[0]?.id);
  useEffect(() => {
    const activeExists = files.some((f) => f.id === activeTabId);
    if (!activeExists) {
      const newActiveId = files[0]?.id;
      setActiveTabId(newActiveId);
    }
  }, [files, activeTabId, setActiveTabId]);

  const activePage = files.find((f) => f.id === activeTabId);
  const activeEditorContent =
    drafts[activeTabId]?.content ?? activePage?.content ?? "";

  useEffect(() => {
    console.log("FileSyncProvider mounted", name);
    return () => {
      console.log("FileSyncProvider unmounted", name);
    };
  }, [name]);

  // 1. Memoized Debounce Function
  const debouncedSave = useMemo(() => {
    return debounce(
      async (
        fileId: string,
        content: string,
        fetcher: FetcherWithComponents<any>,
      ) => {
        try {
          const formData = new FormData();
          formData.append("action", "saveFile");
          formData.append("content", content);
          formData.append("fileId", fileId);
          // Submit the form data
          await fetcher.submit(formData, { method: "post" });
          // Note: State update for 'saved' status happens automatically via fetchers update
          console.log("Saved to cloud successfully.");
        } catch (error) {
          console.error("Failed to save to cloud:", error);
          // TODO: Implement error status update here
        }
      },
      2000,
    );
  }, []);

  const updateValue = useCallback(
    (fileId: string, newContent: string) => {
      setDrafts((prev) => {
        const old = prev[fileId];
        const fetcher = old?.fetcher;
        if (fetcher) {
          debouncedSave(fileId, newContent, fetcher);
        } else {
          console.warn(
            `No fetcher found for fileId ${fileId}. Cannot auto-save.`,
          );
        }
        return {
          ...prev,
          [fileId]: { ...old, content: newContent },
        };
      });
    },
    [debouncedSave, setDrafts],
  );

  const setFetcher = useCallback(
    (fileId: string, fetcher: FetcherWithComponents<any>) => {
      setDrafts((prev) => {
        const old = prev[fileId];
        // Avoid state update if fetcher is already set
        if (old?.fetcher === fetcher) {
          return prev;
        }
        return {
          ...prev,
          [fileId]: { ...old, fetcher },
        };
      });
    },
    [setDrafts],
  );

  const extendedFiles: ExtendedFile[] = useMemo(() => {
    return files.map((file) => {
      const draftContent = drafts[file.id]?.content;
      // Assumes the consuming component uses useFetcher({ key: file.id })
      const fetcher = drafts[file.id]?.fetcher;
      const isSaving = fetcher?.state === "submitting";
      const path = `${file.pageId}/${file.id}`;
      let status: ExtendedFile["status"] = undefined;
      if (isSaving) {
        status = "saving";
      } else if (draftContent !== undefined && draftContent !== file.content) {
        status = "unsaved";
      } else {
        status = "saved";
      }

      return { ...file, status, path };
    });
  }, [files, drafts]);

  const activeFile = useMemo(() => {
    return extendedFiles.find((f) => f.id === activeTabId);
  }, [extendedFiles, activeTabId]);

  const value = useMemo(
    () => ({
      updateValue,
      files: extendedFiles,
      activeEditorContent,
      setActiveTab: setActiveTabId,
      activeFile,
      setFetcher,
    }),
    [
      updateValue,
      extendedFiles,
      activeTabId,
      activeEditorContent,
      setActiveTabId,
      activeFile,
      setFetcher,
    ],
  );

  return (
    <FileSyncContext.Provider value={value}>
      {children}
    </FileSyncContext.Provider>
  );
}

export const useFilesSync = (): FileSyncContextType => {
  const ctx = useContext(FileSyncContext);
  if (!ctx) {
    throw new Error(
      "useFileSyncContext must be used within a FileSyncProvider",
    );
  }
  return ctx;
};

export function FileFetcher({ id }: { id: string }) {
  const fetcher = useFetcher({ key: id });
  const fileSync = useFilesSync();
  useEffect(() => {
    fileSync.setFetcher(id, fetcher);
  }, [id, fetcher, fileSync]);
  return null;
}
