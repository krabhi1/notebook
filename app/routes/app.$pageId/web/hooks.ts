import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ConsoleLog, EditorTab } from "./utils";
import type { OnMount, Monaco } from "@monaco-editor/react";
import type { PageWithFiles } from "~/.server/db/queries/page";
import type { MonacoEditorInstance } from "~/components/CodeEditor";
import { debounce, getFiles } from "~/lib/utils";

export function useConsoleLogs() {
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const clear = useCallback(() => setLogs([]), []);
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "console" && event.data.log) {
        const content = event.data.log.args
          .map((arg: any) => {
            if (typeof arg === "object" && arg !== null) {
              try {
                return JSON.stringify(arg, null, 2);
              } catch {
                return String(arg);
              }
            }
            return String(arg);
          })
          .join(" ");

        setLogs((prev) => {
          // Check if the LAST log is the same (consecutive duplicates only)
          const lastLog = prev[prev.length - 1];

          if (
            lastLog &&
            lastLog.content === content &&
            lastLog.type === event.data.log.type
          ) {
            // Update the last log's count and timestamp
            const updatedLogs = [...prev];
            updatedLogs[updatedLogs.length - 1] = {
              ...lastLog,
              count: lastLog.count + 1,
              timestamp: event.data.log.timestamp,
            };
            return updatedLogs;
          } else {
            // Add new log (different from previous or first log)
            const newLog: ConsoleLog = {
              id: Math.random().toString(36).substr(2, 9),
              type: event.data.log.type,
              args: event.data.log.args,
              timestamp: event.data.log.timestamp,
              count: 1,
              content: content,
            };
            return [...prev, newLog];
          }
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return { logs, clear };
}

// hooks/useEditor.ts

export function useEditor(page: PageWithFiles, onUpdatePreview: () => void) {
  const editorInstance = useRef<MonacoEditorInstance | null>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>("html");

  const files = useMemo(
    () => getFiles(page, ["html", "css", "javascript"]),
    [page],
  );
  // Mount handler
  const onMount = useCallback<OnMount>(
    (editor, monaco: Monaco) => {
      editorInstance.current = { editor, monaco };
      onUpdatePreview();
    },
    [onUpdatePreview],
  );
  const onChange = useCallback(
    (value?: string) => {
      debounce(onUpdatePreview, 1000)();
    },
    [onUpdatePreview],
  );

  // Get current editor values
  const getEditorValues = useCallback(() => {
    if (!editorInstance.current) {
      return {
        html: files.html.value,
        css: files.css.value,
        javascript: files.javascript.value,
      };
    }

    const models = editorInstance.current.monaco.editor.getModels();
    const getModelValue = (language: string, path: string, fallback: string) =>
      models
        .find(
          (m) => m.getLanguageId() === language && m.uri.path.includes(path),
        )
        ?.getValue() ?? fallback;

    return {
      html: getModelValue(
        "html",
        `${page.id}/${files.html.id}/index.html`,
        files.html.value,
      ),
      css: getModelValue(
        "css",
        `${page.id}/${files.css.id}/styles.css`,
        files.css.value,
      ),
      javascript: getModelValue(
        "javascript",
        `${page.id}/${files.javascript.id}/script.js`,
        files.javascript.value,
      ),
    };
  }, [page]);

  // Format code
  const formatCode = useCallback(() => {
    editorInstance.current?.editor
      .getAction("editor.action.formatDocument")
      ?.run();
  }, []);

  // Current file (html/css/js) based on activeTab
  const current = useMemo(() => {
    const fileMap = {
      html: {
        language: "html" as const,
        value: files.html.value,
        path: `${page.id}/${files.html.id}/index.html`,
      },
      css: {
        language: "css" as const,
        value: files.css.value,
        path: `${page.id}/${files.css.id}/styles.css`,
      },
      js: {
        language: "javascript" as const,
        value: files.javascript.value,
        path: `${page.id}/${files.javascript.id}/script.js`,
      },
    };
    return fileMap[activeTab];
  }, [activeTab, page]);

  return {
    onMount,
    onChange,
    getEditorValues,
    formatCode,
    current,
    files,
    activeTab,
    setActiveTab,
  };
}

type PreviewMode = "mobile" | "tablet" | "desktop" | "full";

interface UsePreviewOptions {
  getEditorValues: () => { html: string; css: string; javascript: string };
}

export function usePreview({ getEditorValues }: UsePreviewOptions) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isUpdatingPreview, setIsUpdatingPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("full");

  // Core update logic
  const updatePreview = useCallback(
    (immediate = false) => {
      setIsUpdatingPreview(true);

      const doUpdate = () => {
        if (iframeRef.current?.contentWindow) {
          const { html, css, javascript: js } = getEditorValues();
          console.log("Updating preview iframe...", { html, css, js });
          iframeRef.current.contentWindow.postMessage({ html, css, js }, "*");
        }
        setIsUpdatingPreview(false);
      };

      if (immediate) {
        doUpdate();
      } else {
        debounce(doUpdate, 1000)();
      }
    },
    [getEditorValues],
  );

  // Immediate update
  const updatePreviewImmediate = useCallback(() => {
    updatePreview(true);
  }, [updatePreview]);

  // Reload iframe
  const reloadPreview = useCallback(() => {
    updatePreviewImmediate();
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      iframe.srcdoc = iframe.srcdoc; // force reload
    }
  }, [updatePreviewImmediate]);

  return {
    iframeRef,
    isUpdatingPreview,
    previewMode,
    setPreviewMode,
    updatePreview,
    reloadPreview,
  };
}
