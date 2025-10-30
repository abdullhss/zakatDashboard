// src/features/MainDepartment/GetCashCampaign/hooks/useGetCampaignData.ts
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getCampaignData } from "../Services/getCampaignData";
import type { NormalizedSummary, AnyRec } from "../../../../api/apiClient";

export interface CampainData {
  rows: AnyRec[];
  totalRows: number | null;
}

export function useGetCampaignQuery(
  offset: number,
  limit: number
): UseQueryResult<CampainData, Error> {
  const queryKey = ["campaign", offset, limit];

  return useQuery<CampainData, Error>({
    queryKey,
    queryFn: async () => {
      const summary: NormalizedSummary = await getCampaignData(offset, limit);

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