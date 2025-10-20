import { useEffect, useState } from "react";
import type { PageWithFiles } from "~/.server/db/queries/page";

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
