import type { EditorProps, Monaco, OnMount } from "@monaco-editor/react";
import { ClientOnly } from "@tanstack/react-router";
import initEditor from "monaco-mermaid";
import { lazy, Suspense, useEffect } from "react";

// Lazy load the Monaco Editor to prevent SSR issues
const LazyMonacoEditor = lazy(() => import("@monaco-editor/react"));
// const editorRef=useRef<MonacoCodeEditor|null>(null);

export type MonacoCodeEditor = Parameters<OnMount>[0];
export type EditorInstance = MonacoCodeEditor | null;
export type MonacoEditorInstance = {
	editor: MonacoCodeEditor;
	monaco: Monaco;
};

export type CodeEditorProps = EditorProps & {
	loadingText?: string;
	themeMode?: "dark" | "light";
};
const CodeEditor = ({
	loadingText = "Loading...",
	beforeMount,
	onMount,
	themeMode = "light",
	...props
}: CodeEditorProps) => {
	useEffect(() => {
		console.log("CodeEditor mounted");

		return () => {
			console.log("CodeEditor unmounted");
		};
	}, []);

	return (
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
						<div className="text-slate-500 dark:text-gray-400">
							{loadingText}
						</div>
					</div>
				}
			>
				<LazyMonacoEditor
					theme={themeMode === "dark" ? "vs-dark" : "vs"}
					height="100%"
					loading={
						<div className="text-slate-500 dark:text-gray-400">
							{loadingText}
						</div>
					}
					beforeMount={(monaco) => {
						// initEditor will register the mermaid language and theme with monaco, and also add the necessary typings for autocompletion
						initEditor(monaco);
						beforeMount?.(monaco);
						monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
							target: monaco.languages.typescript.ScriptTarget.ESNext, // Use modern JS target
							module: monaco.languages.typescript.ModuleKind.ESNext, // Use ESNext modules
							esModuleInterop: true, // Enable interoperability
						});
					}}
					onMount={(editor, monaco) => {
						onMount?.(editor, monaco);
						editor.addCommand(
							monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
							() => {
								// Leave this empty to "swallow" the event
								console.log("Ctrl+S was blocked");
							},
						);
					}}
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
					{...props}
				/>
			</Suspense>
		</ClientOnly>
	);
};

export default CodeEditor;
