self.onmessage = (e) => {
	const logs = [];

	// 1. Create a proxy for the console
	const customConsole = {
		log: (...args) =>
			logs.push({ level: "log", content: structuredClone(args) }),
		error: (...args) =>
			logs.push({ level: "error", content: structuredClone(args) }),
		warn: (...args) =>
			logs.push({ level: "warn", content: structuredClone(args) }),
	};

	try {
		// 2. Wrap the code in a function that provides the 'console' variable
		// We use a Function constructor and pass our custom console as an argument
		const runner = new Function(
			"console",
			`
      "use strict";
      ${e.data}
    `,
		);

		const result = runner(customConsole);

		// 3. Send the captured logs and result back
		self.postMessage({ type: "success", logs, result });
	} catch (err) {
		self.postMessage({ type: "error", message: err.message, logs });
	}
};
