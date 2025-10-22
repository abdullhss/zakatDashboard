import { useQuery, keepPreviousData, type UseQueryResult } from "@tanstack/react-query";
import { getAccountTypes } from "../Services/getAccountTypes";
import type { AnyRec } from "../../../../api/apiClient";

export interface AccountTypesData {
  rows: Array<{ id: number; name: string; isActive?: boolean }>;
  totalRows: number;
}

export function useGetAccountTypes(
  offset: number,
  limit: number
): UseQueryResult<AccountTypesData, Error> {
  return useQuery<AccountTypesData, Error>({
    queryKey: ["accountTypes", offset, limit],
    queryFn: async () => {
      const summary = await getAccountTypes(offset, limit);

      if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
        throw new Error(summary.message || "فشل في جلب أنواع الحسابات.");
      }

      return {
        rows: (summary.rows as AnyRec[]).map(r => ({
          id: Number(r.id ?? r.Id) || 0,
          name: String(r.name ?? r.AccountTypeName ?? "—"),
          ...(r.isActive === undefined ? {} : { isActive: !!r.isActive }),
        })),
        totalRows: Number(summary.totalRows ?? 0),
      };
    },
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}
