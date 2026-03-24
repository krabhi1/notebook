import {
	ChevronDown,
	SplitSquareHorizontal,
	SplitSquareVertical,
	WrapText,
} from "lucide-react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface EditorActionsProps {
	isRunning: boolean;
	onRun: () => void;
	isRunnable: boolean;
	layout: "horizontal" | "vertical";
	onLayoutChange: (layout: "horizontal" | "vertical") => void;
	wrapCode: boolean;
	onWrapCodeChange: (wrapCode: boolean) => void;
	autoRun: boolean;
	onAutoRunChange: (autoRun: boolean) => void;
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
	wrapCode,
	onWrapCodeChange,
	autoRun,
	onAutoRunChange,
}: EditorActionsProps) {
	const headerActionsContainer = document.getElementById(
		"header-right-actions",
	) as HTMLElement;

	if (!headerActionsContainer) return null;

	return createPortal(
		<div className="flex items-center space-x-2">
			{isRunnable && (
				<>
					<DropdownMenu>
						<div className="flex items-center">
							<Button
								size="sm"
								loading={isRunning}
								onClick={onRun}
								className="rounded-r-none border-r-0"
								variant="default"
							>
								Run
							</Button>
							<DropdownMenuTrigger asChild>
								<Button
									size="sm"
									variant="default"
									className="rounded-l-none px-2"
									aria-label="Run options"
								>
									<ChevronDown className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
						</div>
						<DropdownMenuContent align="end" className="w-44 rounded-xl p-1">
							<DropdownMenuCheckboxItem
								checked={autoRun}
								onCheckedChange={(checked) => {
									onAutoRunChange(checked === true);
								}}
								className="gap-2 rounded-lg text-sm"
							>
								<span>Auto run</span>
							</DropdownMenuCheckboxItem>
						</DropdownMenuContent>
					</DropdownMenu>
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
				</>
			)}

			<Toggle
				pressed={wrapCode}
				onPressedChange={onWrapCodeChange}
				variant="outline"
				size="sm"
				aria-label="Toggle code wrapping"
			>
				<WrapText className="h-4 w-4" />
			</Toggle>
		</div>,
		headerActionsContainer,
	);
}
