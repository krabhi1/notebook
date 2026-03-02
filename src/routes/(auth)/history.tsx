import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/history")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>History</div>;
}
