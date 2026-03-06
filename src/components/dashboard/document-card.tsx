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
		<div className="border rounded-md p-3 max-h-60 h-60 gap-2 flex flex-col">
			<EditableText
				initialValue={title}
				onSave={(v) => {
					return onUpdate?.(id, v);
				}}
				className="font-semibold w-fit md:w-fit"
			/>
			<pre className="block p-2 bg-surface-raised flex-1 text-xs overflow-hidden">
				{content}
			</pre>
			<footer className="flex justify-end gap-2">
				<Link to={`${id}`}>
					<Button size={"sm"}>
						<EyeIcon /> Open
					</Button>
				</Link>

				<Button
					variant={"destructive"}
					size={"icon-sm"}
					onClick={() => onDelete?.(id)}
				>
					<Trash2Icon />
				</Button>
			</footer>
		</div>
	);
}
