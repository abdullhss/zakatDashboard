// src/features/Laws/hooks/useGetLaws.ts

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getLaws } from '../Services/getLaws'; 
import type { NormalizedSummary, AnyRec } from '../../../../api/apiClient'; 

// تعريف شكل البيانات المتوقعة بعد التحليل
export interface LawsData {
    rows: AnyRec[];
    totalRows: number | null;
    decrypted : any ;
}

/**
 * هوك React Query لجلب بيانات القوانين واللوائح.
 * @param offset - Offset.
 * @param limit - عدد الصفوف في الصفحة.
 * @returns UseQueryResult - نتيجة الكويري.
 */
export function useGetLaws(offset: number, limit: number): UseQueryResult<LawsData, Error> {
    const queryKey = ["laws-data", offset, limit]; 

    return useQuery<LawsData, Error>({
        queryKey,
        queryFn: async () => {
            const summary: NormalizedSummary = await getLaws(offset, limit);

            if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
                throw new Error(summary.message || "فشل في جلب بيانات القوانين.");
            }

            return {
                rows: summary.rows,
                totalRows: summary.totalRows,
                decrypted : summary.decrypted
            } as LawsData;
        },
        staleTime: 60000, 
        keepPreviousData: true,
    });
}
