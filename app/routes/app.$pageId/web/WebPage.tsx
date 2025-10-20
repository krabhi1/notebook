import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { OnMount, EditorProps, Monaco } from "@monaco-editor/react";
// Simple debounce utility

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "~/components/ui/resizable";
import { twMerge } from "tailwind-merge";
import {
  tailwindClasses,
  type ConsoleLog,
  type EditorTab,
  iframeHtml,
} from "./utils";

import ConsolePanel from "./ConsolePanel";
import EditorTabBar from "./EditorTabBar";
import PreviewPanel from "./PreviewPanel";
import CodeEditor, { type MonacoEditorInstance } from "~/components/CodeEditor";
import type { PageWithFiles } from "~/.server/db/queries/page";
import { debounce, getFiles } from "~/lib/utils";
type WebPageProps = {
  page: PageWithFiles;
};
export default function WebPage({ page }: WebPageProps) {
  // Multi-file content state
  const [activeTab, setActiveTab] = useState<EditorTab>("html");
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [isConsoleVisible, setIsConsoleVisible] = useState(true);
  const [autoClearOnEdit, setAutoClearOnEdit] = useState(true);
  const [isUpdatingPreview, setIsUpdatingPreview] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewMode, setPreviewMode] = useState<
    "mobile" | "tablet" | "desktop" | "full"
  >("full");

  const files = useMemo(
    () => getFiles(page, ["html", "css", "javascript"]),
    [page],
  );
  const editorInstance = useRef<MonacoEditorInstance | null>(null);

  const htmlFile = files.html;
  const cssFile = files.css;
  const jsFile = files.javascript;

  const monacoTheme = false ? "vs-dark" : "light";

  const onMount = useCallback<OnMount>((editor, monaco) => {
    editorInstance.current = { editor, monaco };
    reloadPreview();
  }, []);
  const onChange = useCallback((value: string | undefined) => {
    debounce(reloadPreview, 1000)();
    if (autoClearOnEdit) {
      clearConsole();
    }
  }, []);
  const handleTabSwitch = useCallback(
    (newTab: EditorTab) => {
      if (newTab === activeTab) return;
      setActiveTab(newTab);
      updatePreview();
      if (autoClearOnEdit) {
        clearConsole();
      }
    },
    [activeTab],
  );
  // on files change by page change
  useEffect(() => {
    reloadPreview();
  }, [files]);

  const getEditorValues = () => {
    if (!editorInstance.current) {
      console.error("Editor instance not available");
      return {
        html: files.html.value,
        css: files.css.value,
        javascript: files.javascript.value,
      };
    }

    const models = editorInstance.current.monaco.editor.getModels();
    const getModelValue = (
      language: string,
      path: string,
      defaultValue: string,
    ) =>
      models
        .find((model) => {
          return (
            model.getLanguageId() === language && model.uri.path.includes(path)
          );
        })
        ?.getValue() ?? defaultValue;

    return {
      html: getModelValue(
        "html",
        `${page.id}/${htmlFile.id}/index.html`,
        files.html.value,
      ),
      css: getModelValue(
        "css",
        `${page.id}/${cssFile.id}/styles.css`,
        files.css.value,
      ),
      javascript: getModelValue(
        "javascript",
        `${page.id}/${jsFile.id}/script.js`,
        files.javascript.value,
      ),
    };
  };

  const updatePreview = useCallback(
    (immediate = false) => {
      setIsUpdatingPreview(true);
      const doUpdate = () => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          const { html, css, javascript: js } = getEditorValues();
          console.log("Updating preview with:", { html, css, js });
          iframeRef.current.contentWindow.postMessage(
            {
              html,
              css,
              js,
            },
            "*",
          );
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

  // Immediate preview update function
  const updatePreviewImmediate = useCallback(() => {
    updatePreview(true);
  }, [updatePreview]);

  // Format code in active editor
  const formatCode = useCallback(() => {
    if (editorInstance.current != null) {
      console.log(getEditorValues());
      editorInstance.current.editor
        .getAction("editor.action.formatDocument")
        ?.run();
    }
  }, []);

  // Listen for console messages from iframe
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

        setConsoleLogs((prev) => {
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

  // Initialize iframe when it loads
  const handleIframeLoad = useCallback(() => {
    updatePreviewImmediate();
  }, [updatePreviewImmediate]);

  // Clear console logs
  const clearConsole = useCallback(() => {
    setConsoleLogs([]);
  }, []);

  // Reload iframe manually
  const reloadPreview = useCallback(() => {
    updatePreviewImmediate();
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      iframe.srcdoc = iframe.srcdoc;
    }
  }, [updatePreviewImmediate]);

  // Format console arguments for display
  const formatConsoleArgs = useCallback((args: any[]) => {
    return args
      .map((arg) => {
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
  }, []);

  // Get console log icon and color based on type (CodePen style)
  const getLogStyle = useCallback((type: string) => {
    switch (type) {
      case "error":
        return { icon: "×", color: "text-red-400" };
      case "warn":
        return { icon: "!", color: "text-yellow-400" };
      case "info":
        return { icon: "i", color: "text-blue-400" };
      default:
        return { icon: ">", color: "text-gray-300" };
    }
  }, []);

  const current = useMemo(() => {
    const fileMap = {
      html: {
        language: "html" as const,
        value: htmlFile.value,
        path: `${page.id}/${htmlFile.id}/index.html`,
      },
      css: {
        language: "css" as const,
        value: cssFile.value,
        path: `${page.id}/${cssFile.id}/styles.css`,
      },
      js: {
        language: "javascript" as const,
        value: jsFile.value,
        path: `${page.id}/${jsFile.id}/script.js`,
      },
    };

    return fileMap[activeTab];
  }, [activeTab, files]);
  console.log("current", current.path, current.language);

  return (
    <div className="flex-1 flex flex-col">
      {/* Main Content */}
      <div className="flex-1">
        <ResizablePanelGroup direction="vertical" className="h-full">
          <ResizablePanel
            id="editor-panel"
            order={1}
            defaultSize={isConsoleVisible ? 75 : 100}
            minSize={30}
          >
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* Code Panel */}
              <ResizablePanel
                id="code-panel"
                order={1}
                defaultSize={50}
                minSize={20}
              >
                <div className="h-full flex flex-col bg-slate-50 dark:bg-gray-800">
                  <EditorTabBar
                    activeTab={activeTab}
                    setActiveTab={handleTabSwitch}
                    setIsConsoleVisible={setIsConsoleVisible}
                    isConsoleVisible={isConsoleVisible}
                    formatCode={formatCode}
                  />

                  {/* Editors */}
                  <div className="flex-1 relative">
                    <div className="h-full">
                      <CodeEditor
                        defaultLanguage={current.language}
                        defaultValue={current.value}
                        path={current.path}
                        theme={monacoTheme}
                        loadingText="Loading HTML editor..."
                        onMount={onMount}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle className="w-1 bg-slate-200 dark:bg-gray-600 hover:bg-slate-300 dark:hover:bg-gray-500" />

              <ResizablePanel
                id="preview-panel"
                order={2}
                defaultSize={50}
                minSize={20}
              >
                <PreviewPanel
                  iframeRef={iframeRef}
                  iframeHtml={iframeHtml}
                  handleIframeLoad={handleIframeLoad}
                  isUpdatingPreview={isUpdatingPreview}
                  previewMode={previewMode}
                  setPreviewMode={setPreviewMode}
                  onReload={reloadPreview}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          {/* Console Panel */}
          {isConsoleVisible && (
            <>
              <ResizableHandle className="h-1 bg-slate-200 dark:bg-gray-600 hover:bg-slate-300 dark:hover:bg-gray-500" />
              <ResizablePanel
                id="console-panel"
                order={2}
                defaultSize={25}
                minSize={15}
                maxSize={50}
              >
                <ConsolePanel
                  consoleLogs={consoleLogs}
                  clearConsole={clearConsole}
                  autoClearOnEdit={autoClearOnEdit}
                  setAutoClearOnEdit={setAutoClearOnEdit}
                  formatConsoleArgs={formatConsoleArgs}
                  getLogStyle={getLogStyle}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
