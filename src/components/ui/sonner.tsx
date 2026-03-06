import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			icons={{
				success: <CircleCheckIcon className="size-4 text-success" />,
				info: <InfoIcon className="size-4 text-accent" />,
				warning: <TriangleAlertIcon className="size-4 text-orange-500" />,
				error: <OctagonXIcon className="size-4 text-error" />,
				loading: (
					<Loader2Icon className="size-4 animate-spin text-text-muted" />
				),
			}}
			toastOptions={{
				classNames: {
					toast:
						"group toast group-[.toaster]:bg-panel group-[.toaster]:text-text group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
					description: "group-[.toast]:text-text-muted",
					actionButton:
						"group-[.toast]:bg-accent group-[.toast]:text-primary-foreground",
					cancelButton:
						"group-[.toast]:bg-panel2 group-[.toast]:text-text-muted",
				},
			}}
			style={
				{
					"--normal-bg": "var(--panel)",
					"--normal-text": "var(--text)",
					"--normal-border": "var(--border)",
					"--border-radius": "var(--radius)",
				} as React.CSSProperties
			}
			{...props}
		/>
	);
};

export { Toaster };
