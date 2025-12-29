// src/features/Payments/hooks/useGetDashPyamentData.ts

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getDashPaymentData } from '../Services/getDashPaymentData'; 
import type { NormalizedSummary, AnyRec } from '../../../../api/apiClient'; 

export interface PaymentData {
    rows: AnyRec[];
    totalRows: number | null;
    decrypted:any
}

export function useGetDashPyamentData(
    officeId: number | string,
    selectedAction : number ,
    offset: number, 
    limit: number
): UseQueryResult<PaymentData, Error> {
    
    const queryKey = ['payments-dashboard', officeId , selectedAction , offset, limit];

    return useQuery<PaymentData, Error>({
        queryKey: queryKey,
        queryFn: async () => {
            const summary: NormalizedSummary = await getDashPaymentData(officeId,selectedAction, offset, limit);

            if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
                throw new Error(summary.message || "فشل غير معروف في جلب بيانات المدفوعات.");
            }
            
            return {
                rows: summary.rows,
                totalRows: summary.totalRows,
                decrypted : summary.decrypted
            } as PaymentData;
        },
        staleTime: 60000, 
    });
}
