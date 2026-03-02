import handler from "@tanstack/react-start/server-entry";

/**
 * Cloudflare Worker Entry Point
 * Handles both HTTP requests (TanStack Start) and Cron Triggers (Automation Engine).
 */
export default {
	// Standard TanStack Start fetch handler
	async fetch(request: Request, _env: Env, _ctx: ExecutionContext) {
		try {
			console.log(`Received request: ${request.method} ${request.url}`);
			return await handler.fetch(request);
		} catch (err) {
			console.error("Worker Fetch Error:", err);
			throw err;
		}
	},
};
