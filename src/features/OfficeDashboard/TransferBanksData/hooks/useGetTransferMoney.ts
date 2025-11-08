// src/features/Transfers/hooks/useGetTransferMoney.ts

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getTransferMoney } from '../Services/getTransferMoney'; // تأكد من المسار
import type { NormalizedSummary, AnyRec } from '../../../../api/apiClient'; 

// تعريف شكل البيانات المتوقعة بعد التحليل
export interface TransferData {
    rows: AnyRec[];
    totalRows: number | null;
    decrypted : any ;
}

/**
 * هوك React Query لجلب سجلات تحويل الأموال.
 * @param offset - Offset.
 * @param limit - عدد الصفوف في الصفحة.
 * @returns UseQueryResult - نتيجة الكويري.
 */
export function useGetTransferMoney(
    offset: number, 
    limit: number
): UseQueryResult<TransferData, Error> {
    
    const queryKey = ["transfer-moneys", offset, limit];

    return useQuery<TransferData, Error>({
        queryKey: queryKey,
        queryFn: async () => {
            const summary: NormalizedSummary = await getTransferMoney(offset, limit);

            if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
                throw new Error(summary.message || "فشل غير معروف في جلب بيانات التحويلات.");
            }
            
            return {
                rows: summary.rows,
                totalRows: summary.totalRows,
                decrypted : summary.decrypted
            } as TransferData;
        },
        staleTime: 60000, 
        keepPreviousData: true,
    });
}