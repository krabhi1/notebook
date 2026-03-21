/** biome-ignore-all lint/suspicious/noArrayIndexKey: ignore */

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { JsRuntime } from "@/hooks/use-runjs";
import type { Log } from "@/lib/utils";

type DomTextNode = {
	__kind: "dom-text";
	text: string;
};

type DomNode = {
	__kind: "dom";
	tag: string;
	id?: string;
	className?: string;
	attributes?: Record<string, string>;
	children?: unknown[];
	truncatedChildren?: boolean;
	depthTruncated?: boolean;
	htmlPreview?: string;
};

function isDomTextNode(value: unknown): value is DomTextNode {
	if (!value || typeof value !== "object") return false;
	return "__kind" in value && value.__kind === "dom-text";
}

function isDomNode(value: unknown): value is DomNode {
	if (!value || typeof value !== "object") return false;
	return "__kind" in value && value.__kind === "dom";
}

function formatPrimitive(value: unknown) {
	if (typeof value === "string") return `"${value}"`;
	if (typeof value === "number" || typeof value === "boolean")
		return String(value);
	if (value === null) return "null";
	if (value === undefined) return "undefined";
	return String(value);
}

function TreeValue({
	value,
	label,
	depth = 0,
}: {
	value: unknown;
	label?: string;
	depth?: number;
}) {
	if (
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean" ||
		value === null ||
		value === undefined
	) {
		return (
			<div className="break-all">
				{label ? `${label}: ` : ""}
				<span className="text-muted-foreground">{formatPrimitive(value)}</span>
			</div>
		);
	}

	if (isDomTextNode(value)) {
		return (
			<div className="break-all">
				{label ? `${label}: ` : ""}
				<span className="text-foreground/80">
					#text {formatPrimitive(value.text)}
				</span>
			</div>
		);
	}

	if (isDomNode(value)) {
		const attrs = value.attributes || {};
		const attrEntries = Object.entries(attrs);
		const tagSummary = `<${value.tag}${value.id ? `#${value.id}` : ""}${value.className ? `.${value.className.split(" ").filter(Boolean).join(".")}` : ""}>`;
		return (
			<details open={depth === 0} className="pl-2">
				<summary className="cursor-pointer select-none">
					{label ? `${label}: ` : ""}
					<span className="text-cyan-600 dark:text-cyan-400">{tagSummary}</span>
				</summary>
				<div className="pl-4 pt-1 space-y-1">
					{attrEntries.length > 0 && (
						<details>
							<summary className="cursor-pointer select-none text-muted-foreground">
								attributes ({attrEntries.length})
							</summary>
							<div className="pl-4 pt-1 space-y-1">
								{attrEntries.map(([key, attrValue]) => (
									<div key={key} className="break-all">
										{key}:{" "}
										<span className="text-muted-foreground">"{attrValue}"</span>
									</div>
								))}
							</div>
						</details>
					)}
					{(value.children?.length || 0) > 0 && (
						<details open>
							<summary className="cursor-pointer select-none text-muted-foreground">
								children ({value.children?.length || 0}
								{value.truncatedChildren ? "+" : ""})
							</summary>
							<div className="pl-4 pt-1 space-y-1">
								{value.children?.map((child, index) => (
									<TreeValue
										key={index}
										value={child}
										label={`[${index}]`}
										depth={depth + 1}
									/>
								))}
								{value.truncatedChildren && (
									<div className="text-amber-600 dark:text-amber-400">
										[More children truncated]
									</div>
								)}
							</div>
						</details>
					)}
					{value.depthTruncated && (
						<div className="text-amber-600 dark:text-amber-400">
							[Max depth reached]
						</div>
					)}
					{value.htmlPreview && (
						<details>
							<summary className="cursor-pointer select-none text-muted-foreground">
								html preview
							</summary>
							<pre className="whitespace-pre-wrap break-all text-[11px] text-foreground/80">
								{value.htmlPreview}
							</pre>
						</details>
					)}
				</div>
			</details>
		);
	}

	if (Array.isArray(value)) {
		return (
			<details open={depth === 0} className="pl-2">
				<summary className="cursor-pointer select-none">
					{label ? `${label}: ` : ""}[Array({value.length})]
				</summary>
				<div className="pl-4 pt-1 space-y-1">
					{value.map((item, index) => (
						<TreeValue
							key={index}
							value={item}
							label={`[${index}]`}
							depth={depth + 1}
						/>
					))}
				</div>
			</details>
		);
	}

	if (typeof value === "object") {
		const entries = Object.entries(value);
		return (
			<details open={depth === 0} className="pl-2">
				<summary className="cursor-pointer select-none">
					{label ? `${label}: ` : ""}
					{"{Object}"}
				</summary>
				<div className="pl-4 pt-1 space-y-1">
					{entries.map(([key, item]) => (
						<TreeValue key={key} value={item} label={key} depth={depth + 1} />
					))}
				</div>
			</details>
		);
	}

	return (
		<div>
			{label ? `${label}: ` : ""}
			{String(value)}
		</div>
	);
}

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
								<TreeValue key={i} value={item} />
							))}
						</div>
					))
				)}
			</div>
		</div>
	);
}
