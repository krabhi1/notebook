import { useCallback, useMemo, useState } from "react";
import type { MonacoEditorInstance } from "@/components/code-editor";
import { type JsRuntime, useRunJs } from "@/hooks/use-runjs";
import type { File } from "@/server/db/schema";

function getFileExtension(fileName: string) {
	return fileName.split(".").pop();
}

const SUPPORTED_RUNNER = ["js", "ts"];

/**
 * Hook to handle code execution logic, including TypeScript transpilation
 * via Monaco's TypeScript worker and execution in a Web Worker.
 */
export function useCodeRunner(
	activeFile: File | undefined,
	monacoEditorInstanceRef: React.RefObject<MonacoEditorInstance | null>,
) {
	const { run, error, logs, result, reportError } = useRunJs();
	const [isRunning, setIsRunning] = useState(false);
	const [runtime, setRuntime] = useState<JsRuntime>("web");
	const isRunnable = useMemo(() => {
		if (!activeFile) return false;
		const langExt = getFileExtension(activeFile.name);
		return langExt ? SUPPORTED_RUNNER.includes(langExt) : false;
	}, [activeFile]);

	const runCode = useCallback(async () => {
		if (!activeFile || !isRunnable) return;
		const langExt = getFileExtension(activeFile.name);

		setIsRunning(true);
		const startTime = Date.now();

		try {
			if (langExt === "ts") {
				// Handle TypeScript transpilation using Monaco's internal worker
				if (monacoEditorInstanceRef.current) {
					const { monaco, editor } = monacoEditorInstanceRef.current;
					const model = editor.getModel();
					if (!model) return;

					const worker =
						await monaco.languages.typescript.getTypeScriptWorker();
					const client = await worker(model.uri);
					const emitOutput = await client.getEmitOutput(model.uri.toString());

					// Get the transpiled JS from the first output file
					const firstOutput = emitOutput.outputFiles?.[0];
					if (!firstOutput?.text) {
						reportError("TypeScript transpilation failed: no JS output");
						return;
					}
					const jsCode = firstOutput.text;
					await run(jsCode, runtime);
				}
			} else if (langExt === "js") {
				// Run JavaScript directly
				await run(activeFile.content || "", runtime);
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to run code";
			reportError(message);
		} finally {
			// Ensure the loading state persists for at least 500ms for better UX
			const executionTime = Date.now() - startTime;
			const sleepTime = Math.max(0, 500 - executionTime);

			if (sleepTime > 0) {
				await new Promise((resolve) => setTimeout(resolve, sleepTime));
			}
			setIsRunning(false);
		}
	}, [
		activeFile,
		isRunnable,
		monacoEditorInstanceRef,
		reportError,
		run,
		runtime,
	]);

	return {
		runCode,
		isRunning,
		error,
		logs,
		result,
		isRunnable,
		runtime,
		setRuntime,
	};
}
