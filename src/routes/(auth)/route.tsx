import { createFileRoute, Outlet } from "@tanstack/react-router";
import AppHeader from "@/components/dashboard/app-header";
import Landing from "@/components/landing";
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
			<div className="h-screen w-screen overflow-hidden flex flex-col bg-surface">
				<AppHeader />
				<Outlet />
			</div>
		</AuthProvider>
	);
}
