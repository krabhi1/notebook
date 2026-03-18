import { queryOptions, useQuery } from "@tanstack/react-query";
import { getResourceFn } from "@/server/functions/resourceFn";

export const resourceQueryKey = (id: string) => ["resource", id];
export const resourceQueryOptions = (id: string) =>
	queryOptions({
		queryKey: resourceQueryKey(id),
		queryFn: () => getResourceFn({ data: id }),
	});

export function useResource(id: string) {
	const query = useQuery(resourceQueryOptions(id));
	return {
		resource: query.data,
		isLoading: query.isLoading,
		error: query.error,
	};
}
