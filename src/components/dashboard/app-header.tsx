import { useIsMutating } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { CloudUploadIcon, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
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
import { useAppContext } from "@/providers/app-provider";
import { useAuthContext } from "@/providers/auth-provider";

function AppHeader({ className, ...props }: React.ComponentProps<"header">) {
	const context = useAuthContext();
	const { isDark, toggleMode } = useAppContext();

	const user = context.user;
	const signOut = context.signOut;
	const params = useParams({ strict: false });
	const resourceId = params._splat?.split("/").filter(Boolean).at(-1);
	const isSaving = useIsMutating() > 0;
	const [showIcon, setShowIcon] = useState(false);
	useEffect(() => {
		if (isSaving) {
			setShowIcon(true);
		} else {
			// When saving stops, wait 2 seconds before hiding
			const timer = setTimeout(() => {
				setShowIcon(false);
			}, 2000);

			return () => clearTimeout(timer);
		}
	}, [isSaving]);
	return (
		<header
			className={cn(
				className,
				"border-b border-border px-6 h-16 flex items-center justify-between bg-background/80 backdrop-blur-md sticky top-0 z-50",
			)}
			{...props}
		>
			<div className="flex items-center gap-3 ">
				<Link
					to="/"
					className="text-foreground text-lg font-bold hover:opacity-80 transition-opacity"
				>
					<span className="hidden sm:inline">Notebook</span>
					<span className="inline sm:hidden">N</span>
				</Link>
				<div id="header-actions" />
			</div>

			<div className="flex items-center gap-2 shrink-0">
				<div>
					{resourceId && showIcon && (
						<CloudUploadIcon className=" animate-pulse size-4" />
					)}
				</div>
				<div id="header-right-actions" />
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
								<p className="text-sm font-semibold text-foreground truncate max-w-45">
									{user.name}
								</p>
								<p className="text-xs text-muted-foreground truncate max-w-45">
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
							onClick={toggleMode}
							className="text-foreground cursor-pointer flex items-center gap-2"
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
							className="text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive"
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
