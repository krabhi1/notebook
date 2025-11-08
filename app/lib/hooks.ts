import { useEffect, useState, useCallback } from "react";
import { debounce } from "./utils";
import type { File } from "~/.server/db/schema";
import { useFetcher, useFetchers } from "react-router";
import type { PageWithFiles } from "~/.server/repos/pageRepository";
export function useFilesStatus() {
  const fetchers = useFetchers();
  const check = useCallback(
    (fileId: string) => {
      const fetcher = fetchers.find((f) => f.key === fileId);
      if (!fetcher) return { isSaving: false };
      return {
        isSaving: fetcher.state === "submitting",
      };
    },
    [fetchers],
  );
  return {
    check,
  };
}
export function useFile(file: File) {
  const [value, setValue] = useState(file.content);
  const [updatedAt, setUpdatedAt] = useState<Date>(file.updatedAt);
  const fetcher = useFetcher({ key: file.id });
  const path = `${file.pageId}/${file.id}`;

  // Debounced cloud save
  const saveToCloud = useCallback(
    debounce(async (content: string) => {
      try {
        const formData = new FormData();
        formData.append("action", "saveFile");
        formData.append("content", content);
        formData.append("fileId", file.id);
        await fetcher.submit(formData, { method: "post" });
        setUpdatedAt(new Date());
      } catch (error) {
        //TODO: show toast
        console.error("Failed to save to cloud:", error);
      }
    }, 2000),
    [file.id, fetcher],
  );

  const updateValue = useCallback(
    (newValue: string) => {
      setValue(newValue);
      saveToCloud(newValue);
    },
    [saveToCloud],
  );

  return {
    value,
    updateValue,
    isSaving: fetcher.state === "submitting",
    path,
  };
}

export function useFiles<T extends string>(
  page: PageWithFiles,
  languages: T[],
) {
  // Initialize state as an object keyed by language
  const initialState = Object.fromEntries(
    languages.map((lang) => {
      const file = page.files.find((f) => f.lang === lang);
      if (!file) {
        throw new Error(
          `Required file with language "${lang}" is missing in the page.`,
        );
      }
      return [
        lang,
        {
          value: file.content,
          id: file.id,
          lang: file.lang,
        },
      ];
    }),
  ) as Record<T, { value: string; id: string; lang: T }>;

  const [files, setFiles] = useState(initialState);
  useEffect(() => {
    setFiles(initialState);
  }, [page]);

  // Setter for a specific language
  const setFile = (lang: T, content: string) => {
    setFiles((prev) => ({
      ...prev,
      [lang]: content,
    }));
  };

  return {
    files,
    setFile,
  };
}
