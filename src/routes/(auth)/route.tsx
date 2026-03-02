import { createFileRoute, Outlet } from "@tanstack/react-router";
import Landing from "@/components/landing";
import AppLayout from "@/components/layout/app-layout";
import { AuthProvider } from "@/providers/auth-provider";

export const Route = createFileRoute("/(auth)")({
	component: () => {
		const { session } = Route.useRouteContext();
		if (!session) return <Landing />;
		return <RouteComponent />;
	},
});

function RouteComponent() {
	return (
		<AuthProvider>
			<AppLayout>
				<Outlet />
			</AppLayout>
		</AuthProvider>
	);
}
