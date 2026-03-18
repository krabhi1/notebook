import { queryOptions, useQuery } from "@tanstack/react-query";
import { getResourceFn } from "@/server/functions/resourceFn";

export const resourceQueryKey = (id: string) => ["resource", id];
export const folderQueryOptions = (id: string) =>
	queryOptions({
		queryKey: resourceQueryKey(id),
		queryFn: () => getResourceFn({ data: id }),
	});

export function useResource(id: string) {
	const query = useQuery(folderQueryOptions(id));
	return {
		resource: query.data,
		isLoading: query.isLoading,
		error: query.error,
	};
}
