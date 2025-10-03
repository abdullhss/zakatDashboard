import { useQuery, keepPreviousData, type UseQueryResult } from "@tanstack/react-query";
import { getOffices } from "../Services/getOffice";
import type { NormalizedSummary, AnyRec } from "../../../../api/apiClient";

export interface OfficesData {
  rows: AnyRec[];
  totalRows: number | null;
}

export function useGetOffices(
  offset: number,
  limit: number,
  userId?: number
): UseQueryResult<OfficesData, Error> {
  return useQuery<OfficesData, Error>({
    queryKey: ["offices", offset, limit, userId ?? "auto"],
    queryFn: async () => {
      const summary: NormalizedSummary = await getOffices(offset, limit, userId);

      if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
        throw new Error(summary.message || "فشل غير معروف في جلب بيانات المكاتب.");
      }

      return {
        rows: summary.rows,           // ← مطبّعة بالفعل
        totalRows: summary.totalRows, // ← عدد السجلات
      };
    },
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}
