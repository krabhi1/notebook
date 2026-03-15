import { useCallback, useEffect, useRef, useState } from "react";
import type { Log } from "@/lib/utils";
import runJsWorker from "@/worker/run-js?worker";
export function useRunJsWorker() {
	const workerRef = useRef<Worker | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [logs, setLogs] = useState<Log[]>([]);
	useEffect(() => {
		// Instantiate the worker using the imported constructor
		workerRef.current = new runJsWorker();

		workerRef.current.onmessage = (e) => {
			if (e.data.type === "error") {
				setError(e.data.message);
			}
			if (e.data.type === "success") {
				setLogs(e.data.logs || []);
			}
		};

		return () => workerRef.current?.terminate();
	}, []);
	const run = useCallback((code: string) => {
		setError(null);
		setLogs([]);
		workerRef.current?.postMessage(code);
	}, []);
	return { run, error, logs };
}
