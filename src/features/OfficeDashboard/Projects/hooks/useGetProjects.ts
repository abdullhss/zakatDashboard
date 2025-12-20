import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "../Services/getProjects";

export function useGetProjects(completeType: "N" | "C" | "S", start = 0, count = 20 , SubventionTypeId: number = 0) {
  return useQuery({
    queryKey: ["projects", completeType, start, SubventionTypeId],
    queryFn: () => fetchProjects(completeType, start, count, SubventionTypeId),
    enabled: !!completeType,
  });
}
