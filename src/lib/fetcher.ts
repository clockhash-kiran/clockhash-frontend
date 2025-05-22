// hooks/useProjects.ts
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export function useProjects() {
    const { data, error, isLoading, mutate } = useSWR("/api/projects", fetcher, {
        revalidateOnFocus: false, // Optional: prevents refetching on tab focus
    });

    return {
        projects: data || [],
        isLoading,
        isError: error,
        mutate, // use this to revalidate manually after create/update/delete
    };
}
