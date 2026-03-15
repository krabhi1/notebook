import { Link } from "@tanstack/react-router";
import { EyeIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditableText } from "@/components/ui/editable-text";

export function DocumentCard({
	id,
	title,
	content,
	onDelete,
	onUpdate,
}: {
	id: string;
	title: string;
	content: string;
	onDelete?: (id: string) => void;
	onUpdate?: (id: string, title: string) => Promise<unknown>;
}) {
	return (
		<div className="flex h-60 max-h-60 flex-col gap-3 overflow-hidden rounded-lg border border-border bg-card/75 p-3 shadow-sm shadow-black/5">
			<EditableText
				initialValue={title}
				onSave={async (v) => {
					return onUpdate?.(id, v);
				}}
				className="font-semibold w-fit md:w-fit"
			/>
			<pre className="flex-1 overflow-hidden rounded-md border border-border/60  p-2 text-xs text-muted-foreground">
				{content}
			</pre>
			<footer className="flex justify-end gap-2">
				<Link to={`${id}`}>
					<Button
						size="sm"
						variant="outline"
						className="border-border text-foreground"
					>
						<EyeIcon className="mr-1 size-4" />
						Open
					</Button>
				</Link>
				<Button
					variant="destructive"
					size="icon-sm"
					onClick={() => onDelete?.(id)}
					className="border-destructive text-destructive"
				>
					<Trash2Icon />
				</Button>
			</footer>
		</div>
	);
}
