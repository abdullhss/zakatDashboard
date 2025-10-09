// src/features/Sacrifice/hooks/useGetSacrificeTypes.ts
import { useQuery } from "@tanstack/react-query";
import { getSacrificeTypes } from "../services/getSacrificeTypes";

export function useGetSacrifices(startNum = 1, count = 25, auto = true) {
  return useQuery({
    queryKey: ["sacrifice-types", startNum, count],
    queryFn: () => getSacrificeTypes(startNum, count),
    enabled: !!auto,
    keepPreviousData: true,
  });
}
