import { env } from "cloudflare:workers";
import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "../auth";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
	const headers = getRequestHeaders();
	const session = await auth.api.getSession({ headers });
	if (!session) {
		throw redirect({ to: "/login" });
	}
	if (env.NODE_ENV === "development") {
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	return next({
		context: { user: session.user },
	});
});
