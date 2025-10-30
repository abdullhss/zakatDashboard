// src/features/Programs/hooks/useProgramQuery.ts

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getPrograms } from "../Services/getProgram";
import type { NormalizedSummary, AnyRec } from "../../../../api/apiClient";
import { getSession } from "../../../../session"; 

// تعريف شكل البيانات المتوقعة بعد التحليل
export interface ProgramData {
    rows: AnyRec[];
    totalRows: number | null;
}

/**
 * هوك React Query لجلب بيانات البرامج المتاحة بناءً على هوية المستخدم.
 * @returns UseQueryResult - نتيجة الكويري.
 */
export function useGetProgramData(): UseQueryResult<ProgramData, Error> {
    
    const { userId } = getSession(); // جلب ID المستخدم من الجلسة
    const currentUserId = userId ?? 0;

    const queryKey = ["user-programs", currentUserId];

    return useQuery<ProgramData, Error>({
        queryKey: queryKey,
        queryFn: async () => {
            // نداء دالة الخدمة بدون ترقيم
            const summary: NormalizedSummary = await getPrograms(currentUserId);

            if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
              throw new Error(summary.message || "فشل غير معروف في جلب بيانات البرامج.");
            }
            
            return {
              rows: summary.rows,
              totalRows: summary.totalRows,
            } as ProgramData;
      },
      staleTime: Infinity, // البرامج لا تتغير كثيرًا
    });
}