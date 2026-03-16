import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { and, eq, isNull } from "drizzle-orm";
import { Fragment, useState } from "react";
import { z } from "zod";
import CodeDocument from "@/components/dashboard/document/code-doc";
import ExcalidrawDocument from "@/components/dashboard/document/excalidraw-doc";
import MermaidDocument from "@/components/dashboard/document/mermaid-doc";
import { DocumentCard } from "@/components/dashboard/document-card";
import { DocumentDeleteDialog } from "@/components/dashboard/document-delete-dialog";
import { FolderCard } from "@/components/dashboard/folder-card";
import { NewResourceButton } from "@/components/dashboard/new-resource-button";
import { useDocuments } from "@/hooks/use-document";
import { useFiles } from "@/hooks/use-file";
import { useFolders } from "@/hooks/use-folder";
import { db } from "@/server/db";
import type { Document, File as FileType, Folder } from "@/server/db/schema";
import {
	documents as documentsTable,
	files as filesTable,
	folders as foldersTable,
} from "@/server/db/schema";
import { authMiddleware } from "@/server/middleware";

/**
 * Server function to "probe" an ID and fetch its parent chain for breadcrumbs.
 */
const getResourceFn = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(z.string())
	.handler(async ({ data: id, context: { user } }) => {
		// 1. Check if it's a folder
		const folder = await db
			.select()
			.from(foldersTable)
			.where(
				and(
					eq(foldersTable.id, id),
					eq(foldersTable.userId, user.id),
					isNull(foldersTable.deletedAt),
				),
			)
			.get();

		if (folder) {
			const parents = [];
			let currentParentId = folder.parentId;

			while (currentParentId) {
				const parent = await db
					.select()
					.from(foldersTable)
					.where(eq(foldersTable.id, currentParentId))
					.get();
				if (parent) {
					parents.unshift(parent);
					currentParentId = parent.parentId;
				} else {
					currentParentId = null;
				}
			}

			return { type: "folder" as const, data: folder, parents };
		}

		// 2. Check if it's a document
		const doc = await db
			.select()
			.from(documentsTable)
			.where(
				and(
					eq(documentsTable.id, id),
					eq(documentsTable.userId, user.id),
					isNull(documentsTable.deletedAt),
				),
			)
			.get();

		if (doc) {
			const parents = [];
			let currentParentId = doc.folderId;

			while (currentParentId) {
				const parent = await db
					.select()
					.from(foldersTable)
					.where(eq(foldersTable.id, currentParentId))
					.get();
				if (parent) {
					parents.unshift(parent);
					currentParentId = parent.parentId;
				} else {
					currentParentId = null;
				}
			}

			const docFiles = await db
				.select()
				.from(filesTable)
				.where(eq(filesTable.documentId, doc.id))
				.all();

			return { type: "document" as const, data: doc, files: docFiles, parents };
		}

		return null;
	});

export const Route = createFileRoute("/(auth)/d/$")({
	loader: async ({ params: { _splat } }) => {
		const splat = _splat || "";
		const pathSegments = splat.split("/").filter(Boolean);
		const targetId = pathSegments[pathSegments.length - 1];

		if (!targetId) throw notFound();

		const resource = await getResourceFn({ data: targetId });
		if (!resource) throw notFound();

		return { ...resource, pathSegments };
	},
	component: ResourceComponent,
});

function ResourceComponent() {
	const resource = Route.useLoaderData();

	if (resource.type === "folder") {
		return (
			<FolderView
				folderId={resource.data.id}
				title={resource.data.title}
				parents={resource.parents}
				pathSegments={resource.pathSegments}
			/>
		);
	}

	return (
		<div className="flex flex-col h-full">
			<nav className="flex items-center text-sm text-muted-foreground gap-2 px-6 py-4 border-b bg-muted/10 shrink-0">
				<Link to="/" className="hover:text-foreground transition-colors">
					Dashboard
				</Link>
				{resource.parents.map((p, idx) => (
					<Fragment key={p.id}>
						<span className="text-muted-foreground/50">/</span>
						<Link
							to="/d/$"
							params={{
								_splat: resource.pathSegments.slice(0, idx + 1).join("/"),
							}}
							className="hover:text-foreground truncate max-w-[120px]"
						>
							{p.title}
						</Link>
					</Fragment>
				))}
				<span className="text-muted-foreground/50">/</span>
				<span className="font-medium text-foreground truncate">
					{resource.data.title}
				</span>
			</nav>
			<div className="flex-1 min-h-0">
				<DocumentView doc={resource.data} initialFiles={resource.files || []} />
			</div>
		</div>
	);
}

function FolderView({
	folderId,
	title,
	parents,
	pathSegments,
}: {
	folderId: string;
	title: string;
	parents: Folder[];
	pathSegments: string[];
}) {
	const { folders: allFolders, updateFolder, deleteFolder } = useFolders();
	const {
		docs: allDocs,
		deleteDocument,
		updateDocument,
		isDeleting: isDeletingDoc,
	} = useDocuments();

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

	const subFolders = allFolders.filter((f) => f.parentId === folderId);
	const subDocs = allDocs.filter((d) => d.folderId === folderId);

	return (
		<div className="flex flex-col gap-8 h-full overflow-y-scroll px-8 py-8 max-w-7xl mx-auto w-full">
			<div className="flex flex-col gap-4 shrink-0">
				<nav className="flex items-center text-sm text-muted-foreground gap-2 shrink-0 flex-wrap">
					<Link
						to="/"
						className="hover:text-foreground transition-colors font-medium"
					>
						Dashboard
					</Link>
					{parents.map((p, idx) => (
						<Fragment key={p.id}>
							<span className="text-muted-foreground/40">/</span>
							<Link
								to="/d/$"
								params={{ _splat: pathSegments.slice(0, idx + 1).join("/") }}
								className="hover:text-foreground transition-colors font-medium truncate max-w-[150px]"
							>
								{p.title}
							</Link>
						</Fragment>
					))}
					<span className="text-muted-foreground/40">/</span>
				</nav>

				<div className="flex items-center justify-between">
					<h1 className="text-3xl font-bold tracking-tight">{title}</h1>
					<div className="flex items-center gap-2">
						<NewResourceButton folderId={folderId} />
					</div>
				</div>
			</div>

			<div className="flex flex-col gap-10">
				{subFolders.length > 0 && (
					<div className="flex flex-col gap-4">
						<h2 className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em] px-1">
							Folders
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{subFolders.map((f) => (
								<FolderCard
									key={f.id}
									id={f.id}
									title={f.title}
									onDelete={() => deleteFolder({ data: { id: f.id } })}
									onUpdate={(id, title) =>
										updateFolder({ data: { id, title } })
									}
								/>
							))}
						</div>
					</div>
				)}

				<div className="flex flex-col gap-4">
					<h2 className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em] px-1">
						Files
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{subDocs.map((doc) => (
							<DocumentCard
								key={doc.id}
								id={doc.id}
								title={doc.title}
								type={doc.type}
								onDelete={() => {
									setSelectedDocId(doc.id);
									setDeleteDialogOpen(true);
								}}
								onUpdate={(id, title) =>
									updateDocument({ data: { id, title } })
								}
							/>
						))}
						{subDocs.length === 0 && (
							<p className="text-sm text-muted-foreground/50 italic col-span-full py-12 text-center border-2 border-dashed rounded-2xl bg-muted/5">
								This folder is empty
							</p>
						)}
					</div>
				</div>
			</div>

			{selectedDocId && (
				<DocumentDeleteDialog
					id={selectedDocId}
					open={deleteDialogOpen}
					onOpenChange={setDeleteDialogOpen}
					onDelete={async (id) => {
						await deleteDocument(
							{ data: { id } },
							{
								onSuccess: () => {
									setDeleteDialogOpen(false);
									setSelectedDocId(null);
								},
							},
						);
					}}
					isDeleting={isDeletingDoc}
				/>
			)}
		</div>
	);
}

function DocumentView({
	doc,
	initialFiles,
}: {
	doc: Document;
	initialFiles: FileType[];
}) {
	const { files } = useFiles(doc.id as string);
	const currentFiles = files.length > 0 ? files : initialFiles;

	if (doc.type === "mermaid") return <MermaidDocument doc={doc} />;
	if (doc.type === "excalidraw") return <ExcalidrawDocument doc={doc} />;
	if (doc.type === "code")
		return <CodeDocument doc={doc} files={currentFiles} />;

	return <div>Unknown document type</div>;
}
