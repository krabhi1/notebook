import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/components/dashboard";
import Landing from "@/components/landing/index";
import { authClient } from "@/lib/auth-client";
import { AppProvider } from "@/providers/app-provider";

export const Route = createFileRoute("/")({
	loader: async ({ context }) => {
		const { session } = context;
		return { session };
	},
	head: ({ loaderData }) => ({
		meta: [
			{
				title: loaderData?.session ? "Dashboard | Notebook" : "Notebook",
			},
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { session: initialSession } = Route.useRouteContext();
	const { data: liveSession } = authClient.useSession();
	const session = liveSession ?? initialSession;

	/**
	 * We wrap the entire home route in AppProvider.
	 * The Provider (and its internal AppLayout) will handle the
	 * authenticated vs. guest header and layout automatically.
	 */
	return <AppProvider>{!session ? <Landing /> : <Dashboard />}</AppProvider>;
}
