import { ConfirmDeleteDialog } from "./confirm-delete-dialog";

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
		<ConfirmDeleteDialog
			title="Delete Document"
			description="Are you sure you want to delete this document?"
			confirmLabel="Delete"
			open={open}
			onOpenChange={onOpenChange}
			isDeleting={isDeleting}
			onConfirm={() => onDelete(id)}
		/>
	);
}
