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
const MAX_DOM_HTML_LENGTH = 20000;
const MAX_TEXT_LENGTH = 1000;
const MAX_DOM_CHILDREN = 30;
const MAX_OBJECT_KEYS = 50;
const MAX_DEPTH = 6;
const truncate = (value, max) => {
  if (typeof value !== "string") return value;
  if (value.length <= max) return value;
  return value.slice(0, max) + "... [truncated]";
};
const toDomNode = (value, depth = 0) => {
  try {
    if (typeof Node === "undefined" || !(value instanceof Node)) return null;
    if (value.nodeType === Node.TEXT_NODE) {
      return {
        __kind: "dom-text",
        text: truncate(value.textContent || "", MAX_TEXT_LENGTH),
      };
    }
    if (typeof Element !== "undefined" && value instanceof Element) {
      const attrEntries = Array.from(value.attributes);
      const attributes = {};
      for (const attr of attrEntries.slice(0, MAX_OBJECT_KEYS)) {
        attributes[attr.name] = truncate(attr.value, MAX_TEXT_LENGTH);
      }
      const childNodes = Array.from(value.childNodes);
      const hasMoreChildren = childNodes.length > MAX_DOM_CHILDREN;
      const canExpandChildren = depth < MAX_DEPTH;
      const children = canExpandChildren
        ? childNodes
            .slice(0, MAX_DOM_CHILDREN)
            .map((node) => toDomNode(node, depth + 1))
            .filter(Boolean)
        : [];

      return {
        __kind: "dom",
        tag: value.tagName.toLowerCase(),
        id: value.id || undefined,
        className:
          typeof value.className === "string" && value.className.length > 0
            ? value.className
            : undefined,
        attributes,
        children,
        truncatedChildren: hasMoreChildren,
        depthTruncated: !canExpandChildren && childNodes.length > 0,
        htmlPreview: truncate(value.outerHTML || value.tagName, MAX_DOM_HTML_LENGTH),
      };
    }
  } catch (_) {
    return {
      __kind: "dom",
      tag: "unknown",
      htmlPreview: "[DOM serialization failed]",
      children: [],
    };
  }
  return null;
};
const toCloneSafe = (value, seen = new WeakSet(), depth = 0) => {
  if (value === null || value === undefined) return value;
  const type = typeof value;
  if (type === "string" || type === "number" || type === "boolean") return value;
  if (type === "bigint") return String(value) + "n";
  if (type === "symbol") return String(value);
  if (type === "function") {
    const name = value.name || "anonymous";
    return "[Function " + name + "]";
  }
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }
  if (value instanceof Date) return value.toISOString();
  if (value instanceof RegExp) return value.toString();
  const domValue = toDomNode(value, depth);
  if (domValue !== null) return domValue;
  if (Array.isArray(value)) {
    if (depth >= MAX_DEPTH) return "[Array]";
    return value.map((item) => toCloneSafe(item, seen, depth + 1));
  }
  if (type === "object") {
    if (seen.has(value)) return "[Circular]";
    seen.add(value);
    if (depth >= MAX_DEPTH) {
      const name = value?.constructor?.name || "Object";
      return "[" + name + "]";
    }
    try {
      const entries = Object.entries(value);
      const output = {};
      for (const [key, item] of entries.slice(0, MAX_OBJECT_KEYS)) {
        output[key] = toCloneSafe(item, seen, depth + 1);
      }
      if (entries.length > MAX_OBJECT_KEYS) {
        output.__truncatedKeys = entries.length - MAX_OBJECT_KEYS;
      }
      return output;
    } catch (_) {
      const name = value?.constructor?.name || "Object";
      return "[Unserializable " + name + "]";
    }
  }
  return String(value);
};
const toMessage = (err, fallback) => (err && typeof err === "object" && "message" in err ? err.message : fallback);
const createLog = (level) => (...content) => {
  const safeContent = content.map((item) => toCloneSafe(item));
  send({ type: "log", level, content: safeContent });
};
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
  send({ type: "success", result: toCloneSafe(value) });
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
