import { SplitSquareHorizontal, SplitSquareVertical } from "lucide-react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface EditorActionsProps {
	isRunning: boolean;
	onRun: () => void;
	isRunnable: boolean;
	layout: "horizontal" | "vertical";
	onLayoutChange: (layout: "horizontal" | "vertical") => void;
}

/**
 * Component to render the editor actions (Run button and Layout toggles)
 * into the document header's portal.
 */
export default function EditorActions({
	isRunning,
	onRun,
	layout,
	onLayoutChange,
	isRunnable,
}: EditorActionsProps) {
	const headerActionsContainer = document.getElementById(
		"header-right-actions",
	) as HTMLElement;

	if (!headerActionsContainer) return null;

	return createPortal(
		<div className="flex items-center space-x-2">
			{isRunnable && (
				<Button
					size="sm"
					loading={isRunning}
					onClick={onRun}
					className="mr-2"
					variant="default"
				>
					Run
				</Button>
			)}
			<ToggleGroup
				type="single"
				size="sm"
				variant="outline"
				onValueChange={(v) => {
					if (v === "horizontal" || v === "vertical") {
						onLayoutChange(v);
					}
				}}
				value={layout}
			>
				<ToggleGroupItem value="horizontal" aria-label="Horizontal layout">
					<SplitSquareHorizontal className="h-4 w-4" />
				</ToggleGroupItem>
				<ToggleGroupItem value="vertical" aria-label="Vertical layout">
					<SplitSquareVertical className="h-4 w-4" />
				</ToggleGroupItem>
			</ToggleGroup>
		</div>,
		headerActionsContainer,
	);
}
