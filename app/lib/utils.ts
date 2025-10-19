import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PageWithFiles } from "~/.server/db/queries/page";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFiles<T extends string>(
  page: PageWithFiles,
  languages: T[],
): Record<T, string> {
  return Object.fromEntries(
    languages.map((lang) => {
      const file = page.files.find((f) => f.lang === lang);
      if (!file) {
        throw new Error(
          `Required file with language "${lang}" is missing in the page.`,
        );
      }
      return [lang, file.content];
    }),
  ) as Record<T, string>;
}
