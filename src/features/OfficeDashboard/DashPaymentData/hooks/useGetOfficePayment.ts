// src/features/OfficeDashboard/Payments/hooks/useGetOfficePayment.ts

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getOfficePayment } from '../Services/getOfficePayment'; // تأكد من المسار
import type { NormalizedSummary, AnyRec } from '../../../../api/apiClient'; 
import { getSession } from '../../../../session'; // لاستخدام getSession

// تعريف شكل البيانات المتوقعة بعد التحليل
export interface OfficePaymentData {
    rows: AnyRec[];
    totalRows: number | null;
}

/**
 * هوك React Query لجلب مدفوعات المكتب الحالي.
 * @param offset - Offset.
 * @param limit - عدد الصفوف في الصفحة.
 * @param filterOfficeId - ID المكتب (يسمح بالتجاوز إذا كان المكون يُستخدم للتصفية).
 * @returns UseQueryResult - نتيجة الكويري.
 */
export function useGetOfficePayment(
    offset: number, 
    limit: number,
    filterOfficeId?: number | string, // قيمة اختيارية لتجاوز OfficeId الجلسة
): UseQueryResult<OfficePaymentData, Error> {
    
    const { officeId: sessionOfficeId } = getSession();
    // نستخدم OfficeId الجلسة كقيمة أساسية، أو القيمة الممررة كـ filterOfficeId
    const currentOfficeId = filterOfficeId ?? sessionOfficeId ?? 0;

    const queryKey = ["office-payments", currentOfficeId, offset, limit];

    return useQuery<OfficePaymentData, Error>({
        queryKey: queryKey,
        queryFn: async () => {
            // تمرير OfficeId الإلزامي
            const summary: NormalizedSummary = await getOfficePayment(currentOfficeId, offset, limit);

            if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
                throw new Error(summary.message || "فشل غير معروف في جلب بيانات مدفوعات المكتب.");
            }
            
            return {
                rows: summary.rows,
                totalRows: summary.totalRows,
            } as OfficePaymentData;
        },
        staleTime: 60000, 
        keepPreviousData: true,
        // تأكد من أننا لا نجلب بيانات إذا كان OfficeId = 0 (باستثناء الإدارة العامة)
        enabled: currentOfficeId !== 0,
    });
}