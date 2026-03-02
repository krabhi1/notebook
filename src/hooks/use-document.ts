import {
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";

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
	});
	const updateMutation = useMutation({
		mutationFn: updateDocumentFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: documentsQueryKey });
		},
	});
	const deleteMutation = useMutation({
		mutationFn: deleteDocumentFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: documentsQueryKey });
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
	});
	const deleteMutation = useMutation({
		mutationFn: deleteDocumentFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: documentQueryKey(id) });
			queryClient.invalidateQueries({ queryKey: documentsQueryKey });
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
