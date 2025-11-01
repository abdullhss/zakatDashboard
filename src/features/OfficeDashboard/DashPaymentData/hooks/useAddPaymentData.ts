// src/features/OfficeDashboard/Payments/hooks/useAddPaymentData.ts

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { addPaymentData, type AddPaymentPayload } from '../Services/addPaymentData'; // تأكد من المسار
import type { NormalizedSummary } from '../../../../api/apiClient'; 

/**
 * هوك React Query لإجراء عملية إضافة مدفوعات مكتب جديدة.
 */
export function useAddPaymentData(): UseMutationResult<NormalizedSummary, Error, AddPaymentPayload> {
    
    const queryClient = useQueryClient();

    return useMutation<NormalizedSummary, Error, AddPaymentPayload>({
        mutationFn: addPaymentData,
        
        onSuccess: () => {
            // تحديث قائمة مدفوعات المكتب بعد النجاح
            queryClient.invalidateQueries({ queryKey: ["office-payments"] });
        },
        
        mutationKey: ["addOfficePayment"],
    });
}