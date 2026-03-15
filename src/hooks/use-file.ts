import {
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
	createFileFn,
	deleteFileFn,
	getFilesFn,
	updateFileFn,
} from "@/server/functions/fileFn";

export const filesQueryKey = (documentId: string) => ["files", documentId];

export const filesQueryOptions = (documentId: string) =>
	queryOptions({
		queryKey: filesQueryKey(documentId),
		queryFn: () => getFilesFn({ data: { documentId } }),
	});

export function useFiles(documentId: string) {
	const queryClient = useQueryClient();
	const query = useQuery(filesQueryOptions(documentId));
	const createMutation = useMutation({
		mutationFn: createFileFn,
		onSuccess: (file) => {
			// queryClient.invalidateQueries({ queryKey: filesQueryKey(documentId) });
			queryClient.setQueryData(
				filesQueryOptions(documentId).queryKey,
				(oldData) => (oldData ? [...oldData, file] : [file]),
			);
		},
		onError: (error) => {
			toast.error("Failed to create File. Please try again.", {
				description: error.message,
			});
			console.error("Error creating File:", error);
		},
	});
	const updateMutation = useMutation({
		mutationFn: updateFileFn,
		onSuccess: (updatedFile) => {
			queryClient.setQueryData(
				filesQueryOptions(documentId).queryKey,
				(oldData) =>
					oldData
						? oldData.map((file) =>
								file.id === updatedFile.id ? updatedFile : file,
							)
						: oldData,
			);
		},
		onError: (error) => {
			toast.error("Failed to update File. Please try again.", {
				description: error.message,
			});
			console.error("Error updating File:", error);
		},
	});
	const deleteMutation = useMutation({
		mutationFn: deleteFileFn,
		onSuccess: ({ id }) => {
			queryClient.setQueryData(
				filesQueryOptions(documentId).queryKey,
				(oldData) =>
					oldData ? oldData.filter((file) => file.id !== id) : oldData,
			);
		},
		onError: (error) => {
			toast.error("Failed to delete File. Please try again.", {
				description: error.message,
			});
			console.error("Error deleting File:", error);
		},
	});
	return {
		files: query.data || [],
		isLoading: query.isLoading,
		isCreating: createMutation.isPending,
		isDeleting: deleteMutation.isPending,
		isUpdating: updateMutation.isPending,
		createFile: createMutation.mutateAsync,
		updateFile: updateMutation.mutateAsync,
		deleteFile: deleteMutation.mutateAsync,
	};
}
