import { lazy, Suspense } from "react";
import ClientOnly from "~/components/ClientOnly";
import { type OnMount } from "@monaco-editor/react";
// Lazy load the Monaco Editor to prevent SSR issues
const MonacoEditor = lazy(() => import("@monaco-editor/react"));
const CodeEditor = ({
  language,
  value,
  onChange,
  onMount,
  theme = "vs-dark",
  loadingText,
}: {
  language: string;
  value: string;
  onChange?: (value: string | undefined) => void;
  onMount?: OnMount;
  theme: string; // default to "vs-dark" , "light"
  loadingText: string;
}) => (
  <ClientOnly
    fallback={
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-500 dark:text-gray-400">{loadingText}</div>
      </div>
    }
  >
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <div className="text-slate-500 dark:text-gray-400">{loadingText}</div>
        </div>
      }
    >
      <MonacoEditor
        height="100%"
        language={language}
        value={value}
        onChange={onChange}
        onMount={onMount}
        theme={theme}
        loading={
          <div className="text-slate-500 dark:text-gray-400">{loadingText}</div>
        }
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "JetBrains Mono, Consolas, Monaco, monospace",
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: "off",
          formatOnType: true,
          formatOnPaste: true,
          contextmenu: true,
          selectOnLineNumbers: true,
          glyphMargin: false,
          folding: true,
          renderLineHighlight: "line",
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          autoSurround: "languageDefined",
          matchBrackets: "always",
          autoIndent: "full",
          stickyScroll: { enabled: false },
          suggest: {
            showKeywords: true,
            showSnippets: true,
            showClasses: true,
            showFunctions: true,
            showVariables: true,
            insertMode: "insert",
            filterGraceful: true,
          },
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true,
          },
          acceptSuggestionOnCommitCharacter: true,
          acceptSuggestionOnEnter: "on",
          tabCompletion: "on",
          dragAndDrop: true,
          copyWithSyntaxHighlighting: true,
          links: true,
          mouseWheelZoom: true,
          multiCursorModifier: "ctrlCmd",
          accessibilitySupport: "auto",
        }}
      />
    </Suspense>
  </ClientOnly>
);

export default CodeEditor;
