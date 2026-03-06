// src/features/BankStatements/hooks/useGetDashBankStatmentData.ts (بعد التعديل)

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  getDashBankStatmentData,
  type StatementParams,
} from "../Services/GetDashBankStatmentData";
import type { NormalizedSummary, AnyRec } from "../../../../api/apiClient";
import { getSession } from "../../../../session";

export interface BankStatementData {
  rows: AnyRec[];
  totalRows: number | null;
  decrypted: any;
}

function formatDateToMMDDYYYY(date: string | Date): string {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}-${day}-${year}`;
}

export function useGetOfficePayment(
  params: StatementParams,
  offset: number = 0,
  limit: number = 10
): UseQueryResult<BankStatementData, Error> {
  const { officeId } = getSession();

  const formattedParams = {
    ...params,
    officeId: params.officeId ?? officeId ?? 0,
    fromDate: formatDateToMMDDYYYY(params.fromDate),
    toDate: formatDateToMMDDYYYY(params.toDate),
  };

  // ✅ الشرط الآن: التاريخين فقط مطلوبين، رقم الحساب يمكن أن يكون فارغًا
  const isReady =
    Boolean(formattedParams.fromDate) && Boolean(formattedParams.toDate);

  const queryKey = [
    "bank-statement",
    formattedParams.officeId,
    formattedParams.accountNum, // سيظل جزءًا من المفتاح حتى لو كان فارغًا
    formattedParams.fromDate,
    formattedParams.toDate,
    offset,
    limit,
  ];

  return useQuery<BankStatementData, Error>({
    queryKey,
    queryFn: async () => {
      const summary: NormalizedSummary = await getDashBankStatmentData(
        formattedParams,
        offset,
        limit
      );

      if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
        throw new Error(summary.message || "فشل جلب بيانات كشف الحساب.");
      }

      return {
        rows: summary.rows,
        totalRows: summary.totalRows,
        decrypted: summary.decrypted,
      };
    },
    staleTime: 60_000,
    keepPreviousData: true,
    enabled: isReady,
  });
}