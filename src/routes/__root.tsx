import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import type { Session } from "@/lib/auth-client";
import { getSession } from "@/server/utils";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
	session: Session | null;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	beforeLoad: async () => {
		const session = await getSession();
		return {
			session,
		};
	},
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Notebook",
			},
			{
				name: "description",
				content:
					"Notebook is app to create different types of page like mermaid diagrams, excalidraw,code",
			},
			{
				name: "keywords",
				content: "notebook, mermaid diagrams, excalidraw, code",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/logo.svg",
			},
		],
	}),

	shellComponent: RootDocument,
	notFoundComponent: () => {
		return <div>Not Found</div>;
	},
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="overflow-hidden">
				{children}
				<Toaster />
				{/*<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>*/}
				<Scripts />
			</body>
		</html>
	);
}
