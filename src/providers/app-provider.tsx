import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
} from "react";
import AppLayout from "@/components/layout/app-layout";
import { authClient } from "@/lib/auth-client";
import { Route } from "@/routes/__root";
import type { User } from "@/server/auth";

interface AppContextType {
	user: User;
	signOut: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * AppProvider: The global orchestration layer.
 * Now refactored to handle both authenticated and guest states gracefully.
 * It provides the operational context (phase, time bounds) if a user is present,
 * otherwise it provides an undefined context while still rendering the shared AppLayout.
 */
export const AppProvider = ({ children }: { children: ReactNode }) => {
	const { session: initialSession } = Route.useRouteContext();

	const { data: liveSession } = authClient.useSession();
	const session = liveSession ?? initialSession;

	const navigate = Route.useNavigate();

	const signOut = useCallback(
		() =>
			authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						navigate({ to: "/" });
					},
				},
			}),
		[navigate],
	);

	const contextValue = useMemo(() => {
		if (!session?.user) return undefined;

		return {
			user: session.user,
			signOut,
		};
	}, [session, signOut]);

	return (
		<AppContext.Provider value={contextValue}>
			<AppLayout>{children}</AppLayout>
		</AppContext.Provider>
	);
};

/**
 * Strict Hook: Use this in routes/components that REQUIRE authentication.
 * It will throw if no user context is present.
 */
export const useAppContext = () => {
	const context = useContext(AppContext);
	if (context === undefined) {
		throw new Error(
			"useAppContext must be used within an authenticated session inside AppProvider",
		);
	}
	return context;
};

/**
 * Optional Hook: Use this in global components (like AppLayout) that need
 * to adapt based on whether a user is logged in or not.
 */
export const useOptionalAppContext = () => {
	const context = useContext(AppContext);
	return context;
};
