import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getCities } from "../Services/getCities";
import type { NormalizedSummary, AnyRec } from "../../../../api/apiClient";

export interface CitiesData {
  rows: AnyRec[];
  totalRows: number | null;
}

export function useCitiesQuery(offset: number, limit: number): UseQueryResult<CitiesData, Error> {
  const queryKey = ["cities", offset, limit];

  return useQuery<CitiesData, Error>({
    queryKey,
    queryFn: async () => {
      const summary: NormalizedSummary = await getCities(offset, limit);

      if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
        throw new Error(summary.message || "فشل غير معروف في جلب البيانات.");
      }

      return {
        rows: summary.rows,
        totalRows: summary.totalRows,
      };
    },
    staleTime: 60_000,

  });
}