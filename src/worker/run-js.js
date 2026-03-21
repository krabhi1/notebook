/**
 * Web Worker for executing JavaScript code safely.
 * Enhanced to support:
 * 1. ES Modules (via dynamic import)
 * 2. Immediate log streaming (for async support)
 * 3. Structured cloning of logs (to prevent reference issues)
 * 4. Async error and rejection capturing
 * 5. Extraction of serializable results from module exports
 */

self.onmessage = async (e) => {
	const code = e.data;
	const toMessage = (value, fallback) => {
		if (value instanceof Error) return value.message;
		if (typeof value === "string" && value.length > 0) return value;
		if (value && typeof value === "object" && "message" in value) {
			const maybeMessage = value.message;
			if (typeof maybeMessage === "string" && maybeMessage.length > 0) {
				return maybeMessage;
			}
		}
		return fallback;
	};

	// Capture logs and stream them immediately to the main thread
	const createLogHandler =
		(level) =>
		(...args) => {
			try {
				const clonedArgs = structuredClone(args);
				self.postMessage({ type: "log", level, content: clonedArgs });
			} catch (err) {
				// Fallback if structuredClone fails (e.g., for non-serializable objects)
				self.postMessage({
					type: "log",
					level: "error",
					content: [`[Unserializable ${level}]: ${err.message}`],
				});
			}
		};

	const customConsole = {
		log: createLogHandler("log"),
		error: createLogHandler("error"),
		warn: createLogHandler("warn"),
		info: createLogHandler("info"),
		debug: createLogHandler("debug"),
	};

	// Override global console for the duration of this worker's life
	self.console = customConsole;

	// Catch unhandled async errors
	const errorHandler = (event) => {
		self.postMessage({
			type: "error",
			message: event.message || "Unhandled error",
		});
	};
	const rejectionHandler = (event) => {
		self.postMessage({
			type: "error",
			message: toMessage(event.reason, "Unhandled promise rejection"),
		});
	};

	self.addEventListener("error", errorHandler);
	self.addEventListener("unhandledrejection", rejectionHandler);

	let url = null;
	try {
		// Wrap code in a blob to treat it as an ES module
		const blob = new Blob([`"use strict";\n${code}`], {
			type: "application/javascript",
		});
		url = URL.createObjectURL(blob);

		const moduleNamespace = await import(/* @vite-ignore */ url);

		// Extract serializable results to avoid "Module could not be cloned" error
		let result;
		if (moduleNamespace) {
			// Prefer default export, otherwise look for specific common export names or the first named export
			const keys = Object.keys(moduleNamespace);
			if ("default" in moduleNamespace) {
				result = moduleNamespace.default;
			} else if (keys.length > 0) {
				result = moduleNamespace[keys[0]];
			}
		}

		// Only send back result if it is likely cloneable (primitive or plain object)
		const isCloneable = (val) => {
			if (val === null || typeof val !== "object") return true;
			try {
				structuredClone(val);
				return true;
			} catch {
				return false;
			}
		};

		self.postMessage({
			type: "success",
			result: isCloneable(result)
				? result
				: `[Non-serializable Result: ${typeof result}]`,
		});
	} catch (err) {
		self.postMessage({
			type: "error",
			message: toMessage(err, "Execution failed"),
		});
	} finally {
		if (url) URL.revokeObjectURL(url);
		self.removeEventListener("error", errorHandler);
		self.removeEventListener("unhandledrejection", rejectionHandler);
	}
};
