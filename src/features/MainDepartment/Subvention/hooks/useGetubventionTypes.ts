// src/features/SubventionTypes/hooks/useGetSubventionTypes.ts
import { useQuery, keepPreviousData, type UseQueryResult } from "@tanstack/react-query";
import { getSubventionTypes } from "../Services/getubventionTypes";
import type { AnyRec, NormalizedSummary } from "../../../../api/apiClient";

export interface SubventionTypesData {
  rows: AnyRec[];
  totalRows: number | null;
  decrypted:any;
}

export function useGetSubventionTypes(
  offset: number,
  limit: number
): UseQueryResult<SubventionTypesData, Error> {
  return useQuery<SubventionTypesData, Error>({
    queryKey: ["subventionTypes", offset, limit],
    queryFn: async () => {
      const summary: NormalizedSummary = await getSubventionTypes(offset, limit);

      if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
        throw new Error(summary.message || "فشل في جلب أنواع الإعانة.");
      }

      return {
        rows: summary.rows,
        totalRows: summary.totalRows,
        decrypted : summary.decrypted,
      };
    },
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}
