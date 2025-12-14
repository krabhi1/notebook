import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { useFetcher } from "react-router";
import type { File } from "~/.server/db/schema";
import type { PageWithFiles } from "~/.server/repos/pageRepository";

export type ExtendedFile = File & {
  status: "saved" | "dirty" | "saving" | "conflict";
  path: string;
};

type SaveResponse = {
  content: string;
  version: number;
  ok: boolean;
  error?: string;
};

type FileSyncContextType = {
  files: ExtendedFile[];
  activeFile: ExtendedFile | undefined;
  setActiveTab: (id: string) => void;
  updateValue: (id: string, content: string) => void;
};

type FileSaverProps = {
  file: ExtendedFile;
  markSaving: (id: string) => void;
  applySave: (id: string, data: SaveResponse) => void;
};

const FileSyncContext = createContext<FileSyncContextType | undefined>(
  undefined,
);

export function FileSyncProvider({
  page,
  children,
}: PropsWithChildren<{ page: PageWithFiles }>) {
  const [files, setFiles] = useState<ExtendedFile[]>(() =>
    page.files.map((f) => ({
      ...f,
      status: "saved" as const,
      path: `${f.pageId}/${f.id}`,
    })),
  );

  const [activeId, setActiveId] = useState<string | undefined>(files[0]?.id);

  const updateValue = useCallback((id: string, content: string) => {
    setFiles((s) =>
      s.map((f) =>
        f.id === id ? { ...f, content, status: "dirty" as const } : f,
      ),
    );
  }, []);

  // internal
  const markSaving = useCallback((id: string) => {
    setFiles((s) =>
      s.map((f) => (f.id === id ? { ...f, status: "saving" as const } : f)),
    );
  }, []);

  const applySave = useCallback((id: string, data: SaveResponse) => {
    setFiles((s) =>
      s.map((f) =>
        f.id === id
          ? {
              ...f,
              content: data.content,
              version: data.version,
              status: data.ok ? ("saved" as const) : ("conflict" as const),
            }
          : f,
      ),
    );
  }, []);

  const activeFile = files.find((f) => f.id === activeId);

  const value = useMemo(
    () => ({
      files,
      activeFile,
      setActiveTab: setActiveId,
      updateValue,
    }),
    [files, activeFile, updateValue],
  );

  return (
    <FileSyncContext.Provider value={value}>
      {children}
      {files.map((f) => (
        <FileSaver
          key={f.id}
          file={f}
          markSaving={markSaving}
          applySave={applySave}
        />
      ))}
    </FileSyncContext.Provider>
  );
}

export function useFilesSync(): FileSyncContextType {
  const ctx = useContext(FileSyncContext);
  if (!ctx) throw new Error("useFilesSync must be inside provider");
  return ctx;
}

function FileSaver({ file, markSaving, applySave }: FileSaverProps) {
  const fetcher = useFetcher({ key: file.id });
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Use refs to store latest values without causing re-renders
  const fileRef = useRef(file);
  const markSavingRef = useRef(markSaving);

  // Update refs on every render
  fileRef.current = file;
  markSavingRef.current = markSaving;

  // Stable save function that doesn't recreate
  const saveNow = useCallback(() => {
    const currentFile = fileRef.current;
    if (currentFile.status !== "dirty") return;

    clearTimeout(timerRef.current);
    markSavingRef.current(currentFile.id);
    const formData = new FormData();
    formData.append("action", "saveFile");
    formData.append("content", currentFile.content);
    formData.append("fileId", currentFile.id);
    fetcher.submit(formData, { method: "post" });
  }, [fetcher]); // Only depends on fetcher

  // autosave with timer
  useEffect(() => {
    if (file.status !== "dirty") return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveNow();
    }, 1500);

    return () => clearTimeout(timerRef.current);
  }, [file.content, file.status, saveNow]); // saveNow is now stable

  // Save immediately on ACTUAL unmount
  useEffect(() => {
    return () => {
      const currentFile = fileRef.current;
      if (currentFile.status === "dirty") {
        saveNow();
      }
    };
  }, [saveNow]); // saveNow is now stable, so this rarely re-runs

  // Handle save response
  useEffect(() => {
    if (!fetcher.data) return;
    const response = fetcher.data as SaveResponse;
    if (!response.ok && response.error) {
      console.error(`Failed to save file ${file.id}:`, response.error);
    }
    applySave(file.id, response);
  }, [fetcher.data, applySave, file.id]);

  return null;
}
