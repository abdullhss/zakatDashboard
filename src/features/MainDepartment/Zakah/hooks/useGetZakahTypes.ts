import { useQuery, keepPreviousData, type UseQueryResult } from "@tanstack/react-query";
import { getZakah } from "../Services/getZakahTypes";
import type { NormalizedSummary, AnyRec } from "../../../../api/apiClient";

export interface ZakahTypesData {
  rows: AnyRec[];
  totalRows: number | null;
}

export function useGetZakahTypes(
  offset: number,
  limit: number
): UseQueryResult<ZakahTypesData, Error> {
  return useQuery<ZakahTypesData, Error>({
    queryKey: ["zakahTypes", offset, limit],
    queryFn: async () => {
      const summary: NormalizedSummary = await getZakah(offset, limit);

      if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
        throw new Error(summary.message || "فشل غير معروف في جلب أنواع الزكاة.");
      }

      return {
        rows: summary.rows,
        totalRows: summary.totalRows,
      };
    },
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}
