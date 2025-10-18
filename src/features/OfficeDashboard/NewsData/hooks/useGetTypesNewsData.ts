// src/features/News/hooks/useGetTypesNewsData.ts
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getTypesNewsData } from "../Services/getTypesNewsData";
import type { NormalizedSummary, AnyRec } from "../../../../api/apiClient";

export interface NewsTypesData {
  rows: AnyRec[];
  totalRows: number | null;
}

/**
 * هوك React Query لجلب أنواع الأخبار (مع الترقيم).
 */
export function useGetTypesNewsData(
  offset: number,
  limit: number
): UseQueryResult<NewsTypesData, Error> {
  return useQuery<NewsTypesData, Error>({
    queryKey: ["news-types", offset, limit],
    queryFn: async () => {
      const summary: NormalizedSummary = await getTypesNewsData(offset, limit);

      if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
        throw new Error(summary.message || "فشل غير معروف في جلب أنواع الأخبار.");
      }

      return {
        rows: summary.rows,
        totalRows: summary.totalRows,
      };
    },
    staleTime: 60_000,
  });
}
