/** biome-ignore-all lint/suspicious/noExplicitAny: ignore */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Log } from "@/lib/utils";
import workerUrl from "@/worker/run-js?worker&url";

export type JsRuntime = "web" | "worker";
const MAX_LOGS = 500;
const EXECUTION_TIMEOUT_MS = 10000;

export function useRunJs() {
	const workerRef = useRef<Worker | null>(null);
	const iframeRef = useRef<HTMLIFrameElement | null>(null);
	const iframeMessageHandlerRef = useRef<
		((event: MessageEvent) => void) | null
	>(null);
	const activeRunIdRef = useRef<number>(0);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<any>(null);
	const [logs, setLogs] = useState<Log[]>([]);
	const appendLog = useCallback((log: Log) => {
		setLogs((prev) => {
			const next = [...prev, log];
			if (next.length <= MAX_LOGS) return next;
			return next.slice(next.length - MAX_LOGS);
		});
	}, []);
	const reportError = useCallback((message: string) => {
		setError(message);
	}, []);

	const cleanupWorker = useCallback(() => {
		if (!workerRef.current) return;
		workerRef.current.terminate();
		workerRef.current = null;
	}, []);

	const cleanupIframe = useCallback(() => {
		if (iframeMessageHandlerRef.current) {
			window.removeEventListener("message", iframeMessageHandlerRef.current);
			iframeMessageHandlerRef.current = null;
		}
		if (!iframeRef.current) return;
		iframeRef.current.remove();
		iframeRef.current = null;
	}, []);

	useEffect(() => {
		return () => {
			cleanupWorker();
			cleanupIframe();
		};
	}, [cleanupWorker, cleanupIframe]);

	const runInWorker = useCallback(
		(code: string, runId: number) =>
			new Promise<void>((resolve) => {
				cleanupIframe();
				cleanupWorker();

				const worker = new Worker(workerUrl, { type: "module" });
				workerRef.current = worker;
				let settled = false;
				const finish = () => {
					if (settled) return;
					settled = true;
					clearTimeout(timeoutId);
					resolve();
				};
				const timeoutId = window.setTimeout(() => {
					if (runId !== activeRunIdRef.current) return;
					setError(`Execution timed out after ${EXECUTION_TIMEOUT_MS / 1000}s`);
					cleanupWorker();
					finish();
				}, EXECUTION_TIMEOUT_MS);

				worker.onmessage = (event) => {
					if (runId !== activeRunIdRef.current) return;
					const {
						type,
						message,
						level,
						content,
						result: runResult,
					} = event.data;
					if (type === "error") {
						setError(message);
						finish();
						return;
					}
					if (type === "log") {
						appendLog({ level, content });
						return;
					}
					if (type === "success") {
						setResult(runResult);
						finish();
					}
				};
				worker.onerror = (event) => {
					if (runId !== activeRunIdRef.current) return;
					setError(event.message || "Worker runtime error");
					finish();
				};
				worker.onmessageerror = () => {
					if (runId !== activeRunIdRef.current) return;
					setError("Worker message error");
					finish();
				};
				worker.postMessage(code);
			}),
		[appendLog, cleanupIframe, cleanupWorker],
	);

	const runInIframe = useCallback(
		(code: string, runId: number) =>
			new Promise<void>((resolve) => {
				cleanupWorker();
				cleanupIframe();

				const iframe = document.createElement("iframe");
				iframe.style.display = "none";
				iframe.setAttribute("sandbox", "allow-scripts");

				const codeJson = JSON.stringify(code).replaceAll(
					"</script",
					"<\\/script",
				);
				const srcDoc = `
<!doctype html>
<html>
<body>
<script type="module">
const RUN_ID = ${runId};
const send = (payload) => {
  parent.postMessage({ __runjs: true, runId: RUN_ID, ...payload }, "*");
};
const toMessage = (err, fallback) => (err && typeof err === "object" && "message" in err ? err.message : fallback);
const createLog = (level) => (...content) => send({ type: "log", level, content });
console.log = createLog("log");
console.info = createLog("info");
console.warn = createLog("warn");
console.error = createLog("error");
window.addEventListener("error", (event) => {
  send({ type: "error", message: event.message || "Unhandled error" });
});
window.addEventListener("unhandledrejection", (event) => {
  send({ type: "error", message: toMessage(event.reason, "Unhandled promise rejection") });
});
const code = ${codeJson};
let url;
try {
  const blob = new Blob([\`"use strict";\\n\${code}\`], { type: "application/javascript" });
  url = URL.createObjectURL(blob);
  const moduleNamespace = await import(url);
  let value;
  if (moduleNamespace) {
    const keys = Object.keys(moduleNamespace);
    if ("default" in moduleNamespace) value = moduleNamespace.default;
    else if (keys.length > 0) value = moduleNamespace[keys[0]];
  }
  send({ type: "success", result: value });
} catch (err) {
  send({ type: "error", message: toMessage(err, "Execution failed") });
} finally {
  if (url) URL.revokeObjectURL(url);
}
</script>
</body>
</html>
`;

				const onMessage = (event: MessageEvent) => {
					if (runId !== activeRunIdRef.current) return;
					if (event.source !== iframe.contentWindow) return;
					const data = event.data;
					if (!data?.__runjs || data.runId !== runId) return;

					if (data.type === "error") {
						setError(data.message ?? "Execution failed");
						finish();
						return;
					}
					if (data.type === "log") {
						appendLog({ level: data.level, content: data.content });
						return;
					}
					if (data.type === "success") {
						setResult(data.result);
						finish();
					}
				};
				let settled = false;
				const finish = () => {
					if (settled) return;
					settled = true;
					clearTimeout(timeoutId);
					cleanupIframe();
					resolve();
				};
				const timeoutId = window.setTimeout(() => {
					if (runId !== activeRunIdRef.current) return;
					setError(`Execution timed out after ${EXECUTION_TIMEOUT_MS / 1000}s`);
					finish();
				}, EXECUTION_TIMEOUT_MS);

				iframeMessageHandlerRef.current = onMessage;
				window.addEventListener("message", onMessage);
				iframe.srcdoc = srcDoc;
				document.body.appendChild(iframe);
				iframeRef.current = iframe;
			}),
		[appendLog, cleanupIframe, cleanupWorker],
	);

	const run = useCallback(
		async (code: string, runtime: JsRuntime) => {
			activeRunIdRef.current += 1;
			const runId = activeRunIdRef.current;

			setError(null);
			setResult(null);
			setLogs([]);

			if (runtime === "worker") {
				await runInWorker(code, runId);
				return;
			}
			await runInIframe(code, runId);
		},
		[runInIframe, runInWorker],
	);

	return { run, error, logs, result, reportError };
}
