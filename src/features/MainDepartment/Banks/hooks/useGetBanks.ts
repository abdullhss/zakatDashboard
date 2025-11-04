// src/features/MainDepartment/Banks/hooks/useGetBanks.ts
import { useQuery, keepPreviousData, type UseQueryResult } from "@tanstack/react-query";
import { getBanks } from "../Services/getBanks";
import type { NormalizedSummary, AnyRec } from "../../../../api/apiClient";

export interface BanksData {
  rows: AnyRec[];
  totalRows: number | null;
  decrypted:any ; 
}

export function useBanksQuery(offset: number, limit: number): UseQueryResult<BanksData, Error> {
  return useQuery<BanksData, Error>({
    queryKey: ["banks", offset, limit],
    queryFn: async () => {
      const summary: NormalizedSummary = await getBanks(offset, limit);
      console.log(summary);
      
      if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
        throw new Error(summary.message || "فشل غير معروف في جلب بيانات البنوك.");
      }

      return {
        rows: summary.rows,
        totalRows: summary.totalRows,
        decrypted : summary.decrypted
      };
    },
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}
