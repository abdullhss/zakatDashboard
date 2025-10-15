import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "../Services/getProjects";

export function useGetProjects(completeType: "N" | "C" | "S", start = 0, count = 20) {
  return useQuery({
    queryKey: ["projects", completeType, start],
    queryFn: () => fetchProjects(completeType, start, count),
    enabled: !!completeType,
  });
}
