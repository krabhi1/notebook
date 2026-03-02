import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Landing() {
	const [isDark, setIsDark] = useState(false);

	const toggleTheme = () => {
		const newIsDark = !isDark;
		setIsDark(newIsDark);
		document.documentElement.classList.toggle("dark", newIsDark);
	};
	return (
		<div className="bg-surface selection:bg-accent/30 text-text font-sans tracking-tight">
			<header className="border-b border-border px-6 h-16 flex items-center justify-between bg-surface/80 backdrop-blur-md sticky top-0 z-50">
				<Link
					to="/"
					className="text-text text-2xl font-bold hover:opacity-80 transition-opacity"
				>
					Notebook
				</Link>

				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={toggleTheme}
						className="text-text-muted"
					>
						{isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
					</Button>
					<Button asChild variant="outline" size="sm">
						<Link to="/login">Login</Link>
					</Button>
					<Button asChild size="sm">
						<Link to="/signup">Join</Link>
					</Button>
				</div>
			</header>
		</div>
	);
}
