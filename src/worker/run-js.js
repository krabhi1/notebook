self.onmessage = (e) => {
	const logs = [];

	// 1. Create a proxy for the console
	const customConsole = {
		log: (...args) => logs.push({ level: "log", content: args }),
		error: (...args) => logs.push({ level: "error", content: args }),
		warn: (...args) => logs.push({ level: "warn", content: args }),
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

		runner(customConsole);

		// 3. Send the captured logs back
		self.postMessage({ type: "success", logs });
	} catch (err) {
		self.postMessage({ type: "error", message: err.message, logs });
	}
};
