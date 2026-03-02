import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/components/dashboard";

export const Route = createFileRoute("/(auth)/")({
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
	return <Dashboard />;
}
