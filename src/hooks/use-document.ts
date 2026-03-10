import {
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
	createDocumentFn,
	deleteDocumentFn,
	getDocumentFn,
	getDocumentsFn,
	updateDocumentFn,
} from "@/server/functions/documentFn";
export const documentsQueryKey = ["documents"];
export const documentsQueryOptions = () =>
	queryOptions({
		queryKey: documentsQueryKey,
		queryFn: getDocumentsFn,
	});

export function useDocuments() {
	const queryClient = useQueryClient();
	const query = useQuery(documentsQueryOptions());
	const createMutation = useMutation({
		mutationFn: createDocumentFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: documentsQueryKey });
		},
		onError: (error) => {
			toast.error("Failed to create document. Please try again.", {
				description: error.message,
			});
			console.error("Error creating document:", error);
		},
	});
	const updateMutation = useMutation({
		mutationFn: updateDocumentFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: documentsQueryKey });
		},
		onError: (error) => {
			toast.error("Failed to update document. Please try again.", {
				description: error.message,
			});
			console.error("Error updating document:", error, error);
		},
	});
	const deleteMutation = useMutation({
		mutationFn: deleteDocumentFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: documentsQueryKey });
		},
		onError: (error) => {
			toast.error("Failed to delete document. Please try again.", {
				description: error.message,
			});
			console.error("Error deleting document:", error);
		},
	});

	return {
		documents: query.data || [],
		isLoading: query.isLoading,
		isCreating: createMutation.isPending,
		isDeleting: deleteMutation.isPending,
		isUpdating: updateMutation.isPending,
		createDocument: createMutation.mutateAsync,
		updateDocument: updateMutation.mutateAsync,
		deleteDocument: deleteMutation.mutateAsync,
	};
}

export const documentQueryKey = (id: string) => ["document", id];
export const documentQueryOptions = (id: string) =>
	queryOptions({
		queryKey: documentQueryKey(id),
		queryFn: () => getDocumentFn({ data: { id } }),
	});

export function useDocument(id: string) {
	const queryClient = useQueryClient();
	const query = useQuery(documentQueryOptions(id));
	const updateMutation = useMutation({
		mutationKey: ["documents", "update", id],
		mutationFn: updateDocumentFn,
		onSuccess: (updatedDoc) => {
			queryClient.setQueryData(documentQueryOptions(id).queryKey, updatedDoc);
		},
		onError: (error) => {
			toast.error("Failed to update document. Please try again.", {
				description: error.message,
			});
			console.error("Error updating document:", error);
		},
	});
	const deleteMutation = useMutation({
		mutationFn: deleteDocumentFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: documentQueryKey(id) });
			queryClient.invalidateQueries({ queryKey: documentsQueryKey });
		},
		onError: (error) => {
			toast.error("Failed to delete document. Please try again.", {
				description: error.message,
			});
			console.error("Error deleting document:", error);
		},
	});

	return {
		document: query.data,
		isLoading: query.isLoading,
		isUpdating: updateMutation.isPending,
		isDeleting: deleteMutation.isPending,
		updateDocument: updateMutation.mutateAsync,
		deleteDocument: deleteMutation.mutateAsync,
	};
}
