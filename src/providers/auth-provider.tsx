import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
} from "react";
import { authClient } from "@/lib/auth-client";
import { Route } from "@/routes/__root";
import type { User } from "@/server/auth";

interface AuthContextType {
	user: User;
	signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
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
		<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
	);
};

export const useAuthContext = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error(
			"useAuthContext must be used within an authenticated session inside AuthProvider",
		);
	}
	return context;
};
