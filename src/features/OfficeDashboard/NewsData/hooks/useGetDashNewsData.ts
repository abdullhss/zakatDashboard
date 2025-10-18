// src/features/MainDepartment/News/hooks/useGetNewsData.ts

import { useQuery, type UseQueryResult } from "@tanstack/react-query"; // ✅ تصحيح استيراد useQuery
import { getDashNewData } from "../Services/getDashNewsData";
import type { NormalizedSummary, AnyRec } from "../../../../api/apiClient"; // استيراد AnyRec

// === تعريف نوع البيانات للنتائج (مطلوب) ===
export interface NewsData {
    rows: AnyRec[];
    totalRows: number | null;
}
// ===========================================

/**
 * هوك React Query لجلب بيانات الأخبار/الأخبار الجديدة للداش بورد.
 * @param officeId - ID المكتب المراد التصفية به.
 * @param offset - Offset.
 * @param limit - Fetch Limit.
 * @returns UseQueryResult - نتيجة الكويري.
 */
export function useGetNewsData(
    officeId: number | string,
    offset: number, 
    limit: number
) : UseQueryResult<NewsData, Error> {
    
    const queryKey = [`news-dashboard`, officeId, offset, limit];

    return useQuery<NewsData, Error>({
        queryKey: queryKey,
        queryFn: async () => {
            const summary: NormalizedSummary = await getDashNewData(officeId, offset, limit)

            if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
              // نستخدم رسالة الخادم إذا كانت متاحة
              throw new Error(summary.message || "فشل غير معروف في جلب بيانات الأخبار.")
            }
            
            return {
              rows: summary.rows,
              totalRows: summary.totalRows,
            } as NewsData;
      },
      staleTime: 60000
    })
}