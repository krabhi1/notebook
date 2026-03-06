import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import type { z } from "zod";
import { auth } from "../auth";

/**
 * Server function to fetch the current session.
 * This can be called from loaders or beforeLoad hooks to check authentication status.
 */
export const getSession = createServerFn({ method: "GET" }).handler(
	async () => {
		const request = getRequest();
		if (!request) return null;

		const session = await auth.api.getSession({
			headers: request.headers,
		});

		return session;
	},
);

export function validateZodInput<T>(schema: z.Schema<T>) {
	return (data: unknown) => {
		const result = schema.safeParse(data);

		if (!result.success) {
			// Flatten the Zod error into a simple string
			const description = result.error.issues[0]?.message || "Invalid input";

			// Throw your standard structured error
			throw new Error(description);
		}

		return result.data;
	};
}
