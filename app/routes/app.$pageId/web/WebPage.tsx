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
import { emmetHTML } from "emmet-monaco-es";
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
import CodeEditor from "~/components/CodeEditor";
import type { PageWithFiles } from "~/.server/db/queries/page";
import { getFiles } from "~/lib/utils";
import { useFiles } from "~/lib/hooks";
type WebPageProps = {
  page: PageWithFiles;
};
export default function WebPage({ page }: WebPageProps) {
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPageId, setCurrentPageId] = useState<string>("page-1");

  // Multi-file content state
  const [activeTab, setActiveTab] = useState<EditorTab>("html");
  const htmlEditorRef = useRef<any>(null);
  const cssEditorRef = useRef<any>(null);
  const jsEditorRef = useRef<any>(null);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [isConsoleVisible, setIsConsoleVisible] = useState(true);
  const [autoClearOnEdit, setAutoClearOnEdit] = useState(true);
  const [isUpdatingPreview, setIsUpdatingPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<
    "mobile" | "tablet" | "desktop" | "full"
  >("full");

  const { files, setFile } = useFiles(page, ["html", "css", "javascript"]);

  const htmlContent = files.html;
  const cssContent = files.css;
  const jsContent = files.javascript;

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Refs for editor change listeners disposables
  const htmlDisposableRef = useRef<any>(null);
  const cssDisposableRef = useRef<any>(null);
  const jsDisposableRef = useRef<any>(null);

  // Convert resolvedTheme to Monaco theme format
  const monacoTheme = false ? "vs-dark" : "light";

  // Debounced preview update function
  const updatePreview = useCallback(
    debounce(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        const html = htmlEditorRef.current?.getValue() || "";
        const css = cssEditorRef.current?.getValue() || "";
        const js = jsEditorRef.current?.getValue() || "";
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
      const html = htmlEditorRef.current?.getValue() || "";
      const css = cssEditorRef.current?.getValue() || "";
      const js = jsEditorRef.current?.getValue() || "";
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

  // Setup Monaco Editor with Tailwind autocomplete
  const setupTailwindAutocomplete = useCallback((monaco: any) => {
    // Register completion item provider
    monaco.languages.registerCompletionItemProvider("html", {
      provideCompletionItems: (model: any, position: any) => {
        // Get the content of the current line up to the cursor position
        const lineContent = model.getLineContent(position.lineNumber);
        const beforeCursor = lineContent.substring(0, position.column - 1);

        // Check if we're inside a class attribute
        const classMatch = beforeCursor.match(/class\s*=\s*["']([^"']*)$/);
        if (!classMatch) {
          return { suggestions: [] };
        }

        const currentClasses = classMatch[1];
        const lastSpaceIndex = currentClasses.lastIndexOf(" ");
        const currentClass = currentClasses.substring(lastSpaceIndex + 1);

        // Filter tailwind classes based on current input
        const suggestions = tailwindClasses
          .filter((className) =>
            className.toLowerCase().includes(currentClass.toLowerCase()),
          )
          .map((className) => ({
            label: className,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: className,
            detail: "Tailwind CSS",
            documentation: `Tailwind CSS class: ${className}`,
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: position.column - currentClass.length,
              endColumn: position.column,
            },
          }));

        return { suggestions };
      },
    });
  }, []);

  const setupEmmet = useCallback((monaco: any) => {
    emmetHTML(monaco);
  }, []);

  const setupEnhancedEditor = useCallback<OnMount>(
    (editor, monaco) => {
      // Add Ctrl+S override
      editor.addAction({
        id: "save.content",
        label: "Save Content",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
        run: () => {
          // Save all content from editors
          const allContent = {
            html: htmlEditorRef.current?.getValue() || "",
            css: cssEditorRef.current?.getValue() || "",
            js: jsEditorRef.current?.getValue() || "",
            timestamp: new Date().toISOString(),
          };

          // Save to localStorage
          localStorage.setItem("webui-playground", JSON.stringify(allContent));
        },
      });
    },
    [], // No dependencies, uses refs
  );

  const handleEditorMount = useCallback(
    (editor: any, monaco: any, type: "html" | "css" | "js") => {
      // Store monaco globally for consistency
      (window as any).monaco = monaco;

      // Setup based on type
      if (type === "html") {
        setupTailwindAutocomplete(monaco);
        setupEmmet(monaco);
      }
      setupEnhancedEditor(editor, monaco);
    },
    [setupTailwindAutocomplete, setupEmmet, setupEnhancedEditor],
  );

  // Handle tab switching
  const handleTabSwitch = useCallback(
    (newTab: EditorTab) => {
      if (newTab === activeTab) return;
      setActiveTab(newTab);
    },
    [activeTab],
  );

  // Memoized mount handlers for editors
  const handleHtmlMount = useCallback<OnMount>(
    (editor, monaco) => {
      htmlEditorRef.current = editor;
      editor.setValue(htmlContent);
      handleEditorMount(editor, monaco, "html");
      // Dispose previous listener
      if (htmlDisposableRef.current) htmlDisposableRef.current.dispose();
      // Add change listener
      htmlDisposableRef.current = editor.onDidChangeModelContent(() => {
        setIsUpdatingPreview(true);
        updatePreview();
        if (autoClearOnEdit) {
          clearConsole();
        }
      });
    },
    [handleEditorMount, htmlContent, updatePreview],
  );

  const handleCssMount = useCallback(
    (editor: any, monaco: any) => {
      cssEditorRef.current = editor;
      editor.setValue(cssContent);
      handleEditorMount(editor, monaco, "css");
      // Dispose previous listener
      if (cssDisposableRef.current) cssDisposableRef.current.dispose();
      // Add change listener
      cssDisposableRef.current = editor.onDidChangeModelContent(() => {
        setIsUpdatingPreview(true);
        updatePreview();
        if (autoClearOnEdit) {
          clearConsole();
        }
      });
    },
    [handleEditorMount, cssContent, updatePreview],
  );

  const handleJsMount = useCallback(
    (editor: any, monaco: any) => {
      jsEditorRef.current = editor;
      editor.setValue(jsContent);
      handleEditorMount(editor, monaco, "js");
      // Dispose previous listener
      if (jsDisposableRef.current) jsDisposableRef.current.dispose();
      // Add change listener
      jsDisposableRef.current = editor.onDidChangeModelContent(() => {
        setIsUpdatingPreview(true);
        updatePreview();
      });
    },
    [handleEditorMount, jsContent, updatePreview],
  );

  // Format code in active editor
  const formatCode = useCallback(() => {
    let currentEditor;
    switch (activeTab) {
      case "html":
        currentEditor = htmlEditorRef.current;
        break;
      case "css":
        currentEditor = cssEditorRef.current;
        break;
      case "js":
        currentEditor = jsEditorRef.current;
        break;
      default:
        return;
    }

    if (currentEditor) {
      currentEditor.getAction("editor.action.formatDocument").run();
    }
  }, [activeTab]);

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

  // Prevent body scrolling
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

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

  // Sidebar handlers
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handlePageSelect = useCallback((pageId: string) => {
    setCurrentPageId(pageId);
    // TODO: Load page content from storage
    console.log("Selected page:", pageId);
  }, []);

  const handlePageCreate = useCallback(() => {
    // TODO: Create new page and switch to it
    console.log("Create new page");
  }, []);

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
                    isSidebarOpen={isSidebarOpen}
                    onSidebarToggle={toggleSidebar}
                  />

                  {/* Editors */}
                  <div className="flex-1 relative">
                    <div
                      className={`h-full ${activeTab === "html" ? "block" : "hidden"}`}
                    >
                      <CodeEditor
                        language="html"
                        value={htmlContent}
                        onMount={handleHtmlMount}
                        theme={monacoTheme}
                        loadingText="Loading HTML editor..."
                      />
                    </div>
                    <div
                      className={`h-full ${activeTab === "css" ? "block" : "hidden"}`}
                    >
                      <CodeEditor
                        language="css"
                        value={cssContent}
                        onMount={handleCssMount}
                        theme={monacoTheme}
                        loadingText="Loading CSS editor..."
                      />
                    </div>
                    <div
                      className={`h-full ${activeTab === "js" ? "block" : "hidden"}`}
                    >
                      <CodeEditor
                        language="javascript"
                        value={jsContent}
                        onMount={handleJsMount}
                        theme={monacoTheme}
                        loadingText="Loading JS editor..."
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
