import { useQuery, keepPreviousData, type UseQueryResult } from "@tanstack/react-query";
import { getDashBankData } from "../Services/getDashBankData";
import type { AnyRec } from "../../../../api/apiClient";

export interface OfficeBanksData {
  rows: AnyRec[];
  totalRows: number;
}

export function useGetDashBankData(
  officeId: number | string | null | undefined,
  offset = 0,
  limit = 50
): UseQueryResult<OfficeBanksData, Error> {
  const enabled = officeId !== undefined && officeId !== null && String(officeId) !== "";

  return useQuery<OfficeBanksData, Error>({
    enabled,
    queryKey: ["office-banks", String(officeId ?? ""), offset, limit],
    queryFn: async () => {
      const summary = await getDashBankData(String(officeId ?? ""), offset, limit);

      if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
        throw new Error(summary.message || "فشل جلب الحسابات البنكية للمكتب.");
      }

      return {
        rows: (summary.rows as AnyRec[]) ?? [],
        totalRows: Number(summary.totalRows ?? 0),
      };
    },
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}
