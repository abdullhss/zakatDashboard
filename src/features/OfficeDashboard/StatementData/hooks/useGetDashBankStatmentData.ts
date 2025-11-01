// src/features/BankStatements/hooks/useGetDashBankStatmentData.ts

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  getDashBankStatmentData,
  type StatementParams,
} from "../Services/GetDashBankStatmentData";
import type { NormalizedSummary, AnyRec } from "../../../../api/apiClient";
import { getSession } from "../../../../session";

// ✅ شكل البيانات اللي بترجع بعد التحليل
export interface BankStatementData {
  rows: AnyRec[];
  totalRows: number | null;
}

// ✅ دالة لتنسيق التاريخ لصيغة MM-dd-yyyy
function formatDateToMMDDYYYY(date: string | Date): string {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}-${day}-${year}`;
}

/**
 * 🔹 هوك React Query لجلب كشف الحساب البنكي مع فلترة بالتاريخ
 */
export function useGetOfficePayment(
  params: StatementParams,
  offset: number = 0,
  limit: number = 10
): UseQueryResult<BankStatementData, Error> {
  const { officeId } = getSession();

  // ✅ تنسيق التاريخين قبل إرسالهم في البارامترات
  const formattedParams = {
    ...params,
    officeId: params.officeId ?? officeId ?? 0,
    fromDate: formatDateToMMDDYYYY(params.fromDate),
    toDate: formatDateToMMDDYYYY(params.toDate),
  };

  // ✅ نمنع الكويري إلا لو في رقم حساب + تاريخين صالحين
  const isReady =
    Boolean(formattedParams.accountNum) &&
    Boolean(formattedParams.fromDate) &&
    Boolean(formattedParams.toDate);

  // ✅ مفتاح الكويري عشان React Query تعرف تميّز الطلبات المختلفة
  const queryKey = [
    "bank-statement",
    formattedParams.officeId,
    formattedParams.accountNum,
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
      };
    },
    staleTime: 60_000,
    keepPreviousData: true,
    enabled: isReady,
  });
}
