import type * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"border-border placeholder:text-text-muted aria-invalid:ring-focus/20 aria-invalid:border-focus bg-surface flex field-sizing-content min-h-16 w-full border px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none rounded-lg disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
				"focus-visible:border-focus focus-visible:ring-focus/50 focus-visible:ring-[2px]",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
