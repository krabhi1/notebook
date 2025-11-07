import { useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "~/components/ui/resizable";

import ConsolePanel from "./ConsolePanel";
import EditorTabBar from "./EditorTabBar";
import PreviewPanel from "./PreviewPanel";
import CodeEditor from "~/components/CodeEditor";
import { useConsoleLogs, useEditor, usePreview } from "./hooks";
import type { PageWithFiles } from "~/.server/repos/pageRepository";
type WebPageProps = {
  page: PageWithFiles;
};
export default function WebPage({ page }: WebPageProps) {
  const {
    getEditorValues,
    onMount,
    formatCode,
    current,
    onChange,
    activeTab,
    setActiveTab,
  } = useEditor(page, () => {
    reloadPreview();
  });

  const { reloadPreview, updatePreview, iframeRef, isUpdatingPreview } =
    usePreview({
      getEditorValues,
    });

  const { logs: consoleLogs, clear: clearConsole } = useConsoleLogs();
  // Multi-file content state
  const [isConsoleVisible, setIsConsoleVisible] = useState(true);
  const [autoClearOnEdit, setAutoClearOnEdit] = useState(true);
  const [previewMode, setPreviewMode] = useState<
    "mobile" | "tablet" | "desktop" | "full"
  >("full");

  const monacoTheme = false ? "vs-dark" : "light";

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
                  handleIframeLoad={updatePreview}
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
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
