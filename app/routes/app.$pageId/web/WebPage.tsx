import { useState, useEffect, useRef, useCallback } from "react";
import type { OnMount, EditorProps, Monaco } from "@monaco-editor/react";
// Simple debounce utility
const debounce = (func: Function, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};
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
import { getFiles } from "~/lib/utils";
import { useFiles } from "~/lib/hooks";
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
  const [previewMode, setPreviewMode] = useState<
    "mobile" | "tablet" | "desktop" | "full"
  >("full");

  const { files: defaultFiles } = useFiles(page, ["html", "css", "javascript"]);
  const editorInstance = useRef<MonacoEditorInstance | null>(null);

  const getEditorValues = () => {
    if (!editorInstance.current) {
      return {
        html: defaultFiles.html.value,
        css: defaultFiles.css.value,
        javascript: defaultFiles.javascript.value,
      };
    }

    const models = editorInstance.current.monaco.editor.getModels();
    const getModelValue = (language: string, defaultValue: string) =>
      models.find((model) => model.getLanguageId() === language)?.getValue() ??
      defaultValue;

    return {
      html: getModelValue("html", defaultFiles.html.value),
      css: getModelValue("css", defaultFiles.css.value),
      javascript: getModelValue("javascript", defaultFiles.javascript.value),
    };
  };

  const htmlFile = defaultFiles.html;
  const cssFile = defaultFiles.css;
  const jsFile = defaultFiles.javascript;

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Convert resolvedTheme to Monaco theme format
  const monacoTheme = false ? "vs-dark" : "light";

  // Debounced preview update function
  const updatePreview = useCallback(
    debounce(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        const { html, css, javascript: js } = getEditorValues();
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
    }, 1000),
    [],
  );

  // Immediate preview update function
  const updatePreviewImmediate = useCallback(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const { html, css, javascript: js } = getEditorValues();
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
  }, []);

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

  const onMount = useCallback<OnMount>((editor, monaco) => {
    editorInstance.current = { editor, monaco };
    const models = monaco.editor.getModels();
  }, []);
  const onChange = useCallback((value: string | undefined) => {
    console.log("Editor content changed", value);
  }, []);

  const current = {
    language: "",
    value: "",
    path: "",
  };
  if (activeTab === "html") {
    current.language = "html";
    current.value = htmlFile.value;
    current.path = htmlFile.id + "/index.html";
  } else if (activeTab === "css") {
    current.language = "css";
    current.value = cssFile.value;
    current.path = cssFile.id + "/styles.css";
  } else if (activeTab === "js") {
    current.language = "javascript";
    current.value = jsFile.value;
    current.path = jsFile.id + "/script.js";
  }

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
                    setActiveTab={setActiveTab}
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
