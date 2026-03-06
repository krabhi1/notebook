import { useIsMutating } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { Loader2Icon, Moon, Sun } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/providers/auth-provider";

function AppHeader({ className, ...props }: React.ComponentProps<"header">) {
	const context = useAuthContext();
	const [isDark, setIsDark] = useState(false);

	const toggleTheme = () => {
		const newIsDark = !isDark;
		setIsDark(newIsDark);
		document.documentElement.classList.toggle("dark", newIsDark);
	};

	const user = context.user;
	const signOut = context.signOut;
	const params = useParams({ strict: false });
	const docId = params.docId;
	const isSaving = useIsMutating({
		mutationKey: ["documents", "update", docId],
	});

	return (
		<header
			className={cn(
				className,
				"border-b border-border px-6 h-16 flex items-center justify-between bg-surface/80 backdrop-blur-md sticky top-0 z-50",
			)}
			{...props}
		>
			<div className="flex flex-1 items-center gap-3 " id="header-actions">
				<Link
					to="/"
					className="text-text text-2xl font-bold hover:opacity-80 transition-opacity"
				>
					Notebook
				</Link>
			</div>

			<div className="flex items-center gap-2 shrink-0">
				<div>
					{docId && isSaving > 0 && (
						<Loader2Icon className="animate-spin size-4" />
					)}
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Avatar className="cursor-pointer border border-border rounded-lg h-9 w-9 shrink-0">
							<AvatarImage
								className="rounded-lg"
								src={user.image || undefined}
								alt={user.name}
							/>
							<AvatarFallback>
								{user.name
									?.split(" ")
									.map((n) => n[0])
									.join("") || "U"}
							</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-64 p-2 rounded-lg">
						<DropdownMenuLabel className="flex items-center gap-3 p-2">
							<Avatar className="h-9 w-9 rounded-lg">
								<AvatarImage
									className="rounded-lg"
									src={user.image || undefined}
									alt={user.name}
								/>
								<AvatarFallback>
									{user.name
										?.split(" ")
										.map((n) => n[0])
										.join("") || "U"}
								</AvatarFallback>
							</Avatar>
							<div className="flex flex-col space-y-0.5">
								<p className="text-sm font-semibold text-text truncate max-w-45">
									{user.name}
								</p>
								<p className="text-xs text-text-muted truncate max-w-45">
									{user.email}
								</p>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{/*<DropdownMenuItem
						onSelect={() => setIsSettingsOpen(true)}
						className="text-text cursor-pointer"
					>
						Settings
					</DropdownMenuItem>*/}

						<DropdownMenuItem
							onClick={toggleTheme}
							className="text-text cursor-pointer flex items-center gap-2"
						>
							{isDark ? (
								<Sun className="size-4" />
							) : (
								<Moon className="size-4" />
							)}
							{isDark ? "Light Mode" : "Dark Mode"}
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							onClick={signOut}
							className="text-error cursor-pointer focus:bg-error/10 focus:text-error"
						>
							Sign Out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}

export default AppHeader;
