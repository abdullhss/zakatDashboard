// src/features/MainDepartment/SacrificeData/hooks/useGetSacrificesDashData.ts

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getSacrificesDashData } from '../Services/getSacrificesData'; // تأكد من المسار
import type { NormalizedSummary, AnyRec } from '../../../../api/apiClient'; 

export interface SacrificesData {
    rows: AnyRec[];
    totalRows: number | null;
}

/**
 * هوك React Query لجلب بيانات طلبات الأضاحي للداش بورد مع التصفية.
 * @param officeId - ID المكتب المراد التصفية به.
 * @param offset - رقم أول سجل مراد عرضه.
 * @param limit - عدد الصفوف في الصفحة.
 */
export function useGetSacrificesDashData(
    officeId: number | string,
    offset: number, 
    limit: number
): UseQueryResult<SacrificesData, Error> {
    
    // إضافة officeId لمفتاح الكويري
    const queryKey = ['sacrifices-dashboard', officeId, offset, limit];

    return useQuery<SacrificesData, Error>({
        queryKey: queryKey,
        queryFn: async () => {
            // تمرير officeId إلى دالة الخدمة
            const summary: NormalizedSummary = await getSacrificesDashData(officeId, offset, limit); 

            if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
                throw new Error(summary.message || "فشل غير معروف في جلب بيانات الأضاحي.");
            }
            console.log(summary);
            
            return {
                rows: summary.rows,
                totalRows: summary.totalRows,
            } as SacrificesData;
        },
        staleTime: 60000, 
    });
}