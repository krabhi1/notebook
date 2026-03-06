import { Link } from "@tanstack/react-router";
import { EyeIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DocumentCard({
	id,
	title,
	content,
	onDelete,
}: {
	id: string;
	title: string;
	content: string;
	onDelete?: (id: string) => void;
}) {
	return (
		<div className="border rounded-md p-3 max-h-60 h-60 gap-2 flex flex-col justify-between">
			<h3 className="font-bold">{title}</h3>
			<pre className="block text-xs overflow-hidden">{content}</pre>
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
