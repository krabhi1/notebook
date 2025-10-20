import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PageWithFiles } from "~/.server/db/queries/page";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFiles<T extends string>(
  page: PageWithFiles,
  languages: T[],
) {
  return Object.fromEntries(
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
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
}
