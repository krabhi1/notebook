import {
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
	createFolderFn,
	deleteFolderFn,
	getFolderFn,
	getFoldersFn,
	updateFolderFn,
} from "@/server/functions/folderFn";

export const foldersQueryKey = ["folders"];

export const foldersQueryOptions = () =>
	queryOptions({
		queryKey: foldersQueryKey,
		queryFn: getFoldersFn,
	});

export function useFolders() {
	const queryClient = useQueryClient();
	const query = useQuery(foldersQueryOptions());

	const createMutation = useMutation({
		mutationFn: createFolderFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: foldersQueryKey });
		},
		onError: (error) => {
			toast.error("Failed to create folder. Please try again.", {
				description: error.message,
			});
			console.error("Error creating folder:", error);
		},
	});

	const updateMutation = useMutation({
		mutationFn: updateFolderFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: foldersQueryKey });
		},
		onError: (error) => {
			toast.error("Failed to update folder. Please try again.", {
				description: error.message,
			});
			console.error("Error updating folder:", error);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteFolderFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: foldersQueryKey });
			// Also invalidate documents since deleting a folder soft-deletes its documents
			queryClient.invalidateQueries({ queryKey: ["documents"] });
		},
		onError: (error) => {
			toast.error("Failed to delete folder. Please try again.", {
				description: error.message,
			});
			console.error("Error deleting folder:", error);
		},
	});

	return {
		folders: query.data || [],
		isLoading: query.isLoading,
		isCreating: createMutation.isPending,
		isUpdating: updateMutation.isPending,
		isDeleting: deleteMutation.isPending,
		createFolder: createMutation.mutateAsync,
		updateFolder: updateMutation.mutateAsync,
		deleteFolder: deleteMutation.mutateAsync,
	};
}

export const folderQueryKey = (id: string) => ["folder", id];

export const folderQueryOptions = (id: string) =>
	queryOptions({
		queryKey: folderQueryKey(id),
		queryFn: () => getFolderFn({ data: { id } }),
	});

export function useFolder(id: string) {
	const queryClient = useQueryClient();
	const query = useQuery(folderQueryOptions(id));

	const updateMutation = useMutation({
		mutationKey: ["folders", "update", id],
		mutationFn: updateFolderFn,
		onSuccess: (updatedFolder) => {
			queryClient.setQueryData(folderQueryKey(id), updatedFolder);
			queryClient.invalidateQueries({ queryKey: foldersQueryKey });
		},
		onError: (error) => {
			toast.error("Failed to update folder. Please try again.", {
				description: error.message,
			});
			console.error("Error updating folder:", error);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteFolderFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: foldersQueryKey });
			queryClient.invalidateQueries({ queryKey: ["documents"] });
		},
		onError: (error) => {
			toast.error("Failed to delete folder. Please try again.", {
				description: error.message,
			});
			console.error("Error deleting folder:", error);
		},
	});

	return {
		folder: query.data,
		isLoading: query.isLoading,
		isUpdating: updateMutation.isPending,
		isDeleting: deleteMutation.isPending,
		updateFolder: updateMutation.mutateAsync,
		deleteFolder: deleteMutation.mutateAsync,
	};
}
