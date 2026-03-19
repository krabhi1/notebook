import { useEffect, useRef, useState } from "react";
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type EditableTextProps = {
	initialValue: string;
	onSave?: (value: string) => Promise<unknown>;
	className?: string;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
} & React.HTMLAttributes<HTMLElement>;

export function EditableText({
	initialValue,
	onSave,
	className,
	open,
	onOpenChange,
	...props
}: EditableTextProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const [text, setText] = useState(initialValue);
	const [draft, setDraft] = useState(initialValue);
	const inputRef = useRef<HTMLInputElement>(null);

	const controlled = open !== undefined;
	const isOpen = controlled ? open : internalOpen;
	const setOpen = (nextOpen: boolean) => {
		if (controlled) {
			onOpenChange?.(nextOpen);
			return;
		}
		setInternalOpen(nextOpen);
	};

	useEffect(() => {
		if (isOpen) return;
		setText(initialValue);
		setDraft(initialValue);
	}, [initialValue, isOpen]);

	useEffect(() => {
		if (!isOpen) return;
		inputRef.current?.focus();
		inputRef.current?.select();
	}, [isOpen]);

	const close = () => {
		setDraft(text);
		setOpen(false);
	};

	const save = async () => {
		const nextValue = draft.trim();
		if (nextValue === "" || nextValue === text) {
			close();
			return;
		}

		try {
			await onSave?.(nextValue);
			setText(nextValue);
			setDraft(nextValue);
			setOpen(false);
		} catch (_) {
			setDraft(text);
		}
	};

	return (
		<Popover
			open={isOpen}
			onOpenChange={controlled ? undefined : setInternalOpen}
		>
			{controlled ? (
				<PopoverAnchor asChild>
					<span
						className={cn(
							"w-full inline-block px-1.5 py-1 border border-transparent! focus:outline-none overflow-clip text-ellipsis whitespace-nowrap",
							className,
						)}
						{...props}
					>
						{text || "Untitled"}
					</span>
				</PopoverAnchor>
			) : (
				<PopoverAnchor asChild>
					<button
						type="button"
						className={cn(
							"w-full text-left px-1.5 py-1 border border-transparent! focus:outline-none overflow-clip text-ellipsis whitespace-nowrap cursor-pointer",
							className,
						)}
						onClick={(event) => {
							event.stopPropagation();
							setOpen(true);
						}}
						onKeyDown={(event) => {
							if (event.key === "Enter" || event.key === " ") {
								event.preventDefault();
								setOpen(true);
							}
						}}
						{...props}
					>
						{text || "Untitled"}
					</button>
				</PopoverAnchor>
			)}
			<PopoverContent
				align="start"
				sideOffset={6}
				className="w-72 p-2"
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					inputRef.current?.focus();
					inputRef.current?.select();
				}}
			>
				<input
					ref={inputRef}
					value={draft}
					onChange={(event) => setDraft(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							void save();
						}
						if (event.key === "Escape") {
							event.preventDefault();
							close();
						}
					}}
					className="w-full border border-border rounded px-2 py-1.5 focus:outline-none bg-background"
				/>
				<div className="flex items-center justify-end gap-2">
					<button
						type="button"
						className="text-xs text-muted-foreground hover:text-foreground"
						onClick={close}
					>
						Cancel
					</button>
					<button
						type="button"
						className="text-xs font-medium text-foreground"
						onClick={() => {
							void save();
						}}
					>
						Save
					</button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
