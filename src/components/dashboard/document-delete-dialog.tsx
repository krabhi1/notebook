import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export function DocumentDeleteDialog({
	id,
	onDelete,
	open,
	onOpenChange,
	isDeleting,
}: {
	id: string;
	onDelete: (id: string) => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isDeleting: boolean;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Document</DialogTitle>
				</DialogHeader>
				<p>Are you sure you want to delete this document?</p>
				<div className="flex justify-end gap-2">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={() => {
							onDelete(id);
						}}
						disabled={isDeleting}
					>
						{isDeleting ? "Deleting..." : "Delete"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
