// src/features/Privileges/hooks/useGetFeaturesByGroup.ts
import { useQuery } from "@tanstack/react-query";
import { getFeaturesByGroup } from "../Services/getFeaturesByGroup";

export function useGetFeaturesByGroup(
  featureType: number | string,
  groupRightId: number | string
) {
  return useQuery({
    queryKey: ["featuresByGroup", featureType, groupRightId],
    queryFn: () => getFeaturesByGroup(featureType, groupRightId),
    keepPreviousData: true,
    staleTime: 60_000,
  });
}
