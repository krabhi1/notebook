console.log("Excalidraw loaded");
export default function ExcalidrawEditor({ docId }: { docId: string }) {
	return (
		<div>
			<p className="text-muted-foreground">Excalidraw editor {docId}</p>
		</div>
	);
}
