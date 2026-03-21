/** biome-ignore-all lint/suspicious/noArrayIndexKey: ignore */

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { JsRuntime } from "@/hooks/use-runjs";
import type { Log } from "@/lib/utils";

export function OutputPanel({
	logs,
	error,
	isRunnable,
	runtime,
	onRuntimeChange,
}: {
	logs: Log[];
	error: string | null;
	isRunnable: boolean;
	runtime: JsRuntime;
	onRuntimeChange: (runtime: JsRuntime) => void;
}) {
	return (
		<div className="h-full flex flex-col min-h-0">
			<div className="px-3 py-1.5 text-xs text-muted-foreground border-b bg-muted/30 shrink-0 flex items-center justify-between">
				<span>Output</span>
				{isRunnable && (
					<ToggleGroup
						type="single"
						size="sm"
						variant="outline"
						value={runtime}
						onValueChange={(value) => {
							if (value === "web" || value === "worker") {
								onRuntimeChange(value);
							}
						}}
					>
						<ToggleGroupItem value="web" aria-label="Web iframe runtime">
							web
						</ToggleGroupItem>
						<ToggleGroupItem value="worker" aria-label="Web worker runtime">
							worker
						</ToggleGroupItem>
					</ToggleGroup>
				)}
			</div>
			<div className="flex-1 min-h-0 text-xs font-mono p-2 overflow-auto text-foreground">
				{error ? (
					<div className="text-red-500">{error}</div>
				) : (
					logs.map((log, index) => (
						<div
							key={index}
							className={`${logs.length - 1 !== index ? "border-b" : ""} py-1`}
						>
							{log.content.map((item, i) => (
								<div key={i}>
									{typeof item === "string"
										? item
										: JSON.stringify(item, null, 2)}
								</div>
							))}
						</div>
					))
				)}
			</div>
		</div>
	);
}
