import { useDroppable } from "@dnd-kit/core";
import {
	DROP_TYPE_ROOT,
	type RootDropData,
} from "@/components/dashboard/dnd-utils";
import { cn } from "@/lib/utils";

export function RootDropZone({
	visible,
	isOver,
}: {
	visible: boolean;
	isOver: boolean;
}) {
	const { setNodeRef } = useDroppable({
		id: "root-drop-zone",
		data: { type: DROP_TYPE_ROOT } satisfies RootDropData,
	});

	if (!visible) return null;

	return (
		<div
			ref={setNodeRef}
			className={cn(
				"rounded-xl border-2 border-dashed px-4 py-3 text-sm text-muted-foreground transition-colors",
				isOver
					? "border-primary bg-primary/5 text-foreground"
					: "border-border/60 bg-muted/10",
			)}
		>
			Drop here to move to root
		</div>
	);
}
