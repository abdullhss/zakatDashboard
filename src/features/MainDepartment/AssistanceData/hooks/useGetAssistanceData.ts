// src/features/Assistances/hooks/useGetAssistanceData.ts
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getAssistanceData } from "../services/getAssistanceData";
import type { NormalizedSummary, AnyRec } from "../../../../api/apiClient";

export interface AssistanceData {
  rows: AnyRec[];
  totalRows: number | null;
  raw?: any;       // 👈 جديد
  carrier?: any;   // 👈 جديد
}

function safeParse<T = any>(txt: any, fb: T): T {
  if (typeof txt !== "string") return fb;
  try { return JSON.parse(txt) as T; } catch { return fb; }
}

export function useGetAssistanceData(
  officeId: number | string,
  subventionTypeId: number | string,
  offset: number,
  limit: number
): UseQueryResult<AssistanceData, Error> {

  const queryKey = ["assistances", officeId, subventionTypeId, offset, limit];

  return useQuery<AssistanceData, Error>({
    queryKey,
    queryFn: async () => {
      const summary: NormalizedSummary = await getAssistanceData(
        officeId, subventionTypeId, offset, limit
      );

      if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
        throw new Error(summary.message || "فشل غير معروف في جلب طلبات الإعانات.");
      }

      // لو السيرفر بيرجع AssistancesData كسلسلة JSON
      const carrier =
        (summary as any)?.rows?.[0] ??
        (summary as any)?.data?.Result?.[0] ??
        null;

      const parsedRows: AnyRec[] =
        carrier?.AssistancesData
          ? safeParse<AnyRec[]>(carrier.AssistancesData, [])
          : (summary.rows as AnyRec[]) ?? [];

      const total =
        Number(carrier?.AssistancesCount) ||
        Number((summary as any)?.data?.TotalRowsCount) ||
        summary.totalRows ||
        parsedRows.length ||
        0;

      return { rows: parsedRows, totalRows: total, raw: summary, carrier };
    },
    staleTime: 60_000,
  });
}
