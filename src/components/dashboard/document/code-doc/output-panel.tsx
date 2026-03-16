/** biome-ignore-all lint/suspicious/noArrayIndexKey: ignore */

import type { Log } from "@/lib/utils";

export function OutputPanel({
	logs,
	error,
}: {
	logs: Log[];
	error: string | null;
}) {
	return (
		<div className="h-full flex flex-col min-h-0">
			<div className="px-3 py-1.5 text-xs  text-muted-foreground border-b bg-muted/30 shrink-0">
				Output
			</div>
			<div className="flex-1 min-h-0  text-xs font-mono p-2 overflow-auto text-foreground ">
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
