// src/features/MainDepartment/Privelges/hooks/useGroupRightFeatures.ts
import { useQuery } from "@tanstack/react-query";
import { getGroupRightFeatures } from "../Services/getGroupRightFeatures";

export function useGroupRightFeatures(
  featureType: string | number,
  groupRightId: string | number,
  offset = 0,
  fetch = 200
) {
  const key = `${featureType}-${groupRightId}-${offset}-${fetch}`;
  return useQuery({
    queryKey: ["group-right-features", key],
    queryFn: () => getGroupRightFeatures(featureType, groupRightId, offset, fetch),
    keepPreviousData: true,
    enabled: Boolean(groupRightId),
  });
}
