/** biome-ignore-all lint/suspicious/noExplicitAny: ignore */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Log } from "@/lib/utils";
import workerUrl from "@/worker/run-js?worker&url";

export function useRunJsWorker() {
	const workerRef = useRef<Worker | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<any>(null);
	const [logs, setLogs] = useState<Log[]>([]);

	// Cleanup worker on unmount
	useEffect(() => {
		return () => {
			if (workerRef.current) {
				workerRef.current.terminate();
			}
		};
	}, []);

	const run = useCallback((code: string) => {
		// 1. Terminate previous worker to clear old timers, loops, and async state
		if (workerRef.current) {
			workerRef.current.terminate();
		}

		// 2. Reset state for the new execution
		setError(null);
		setResult(null);
		setLogs([]);

		// 3. Create a fresh worker instance
		const worker = new Worker(workerUrl, {
			type: "module",
		});
		workerRef.current = worker;

		// 4. Set up the message handler for the new worker
		worker.onmessage = (e) => {
			const { type, message, level, content, result: runResult } = e.data;

			if (type === "error") {
				setError(message);
			} else if (type === "log") {
				// Use functional update to ensure logs are appended correctly in real-time
				setLogs((prev) => [...prev, { level, content }]);
			} else if (type === "success") {
				setResult(runResult);
			}
		};

		// 5. Start the execution
		worker.postMessage(code);
	}, []);

	return { run, error, logs, result };
}
