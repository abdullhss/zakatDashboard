// src/features/Payments/hooks/useAddPaymentApproval.ts

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { addPaymentApproval } from '../Services/addPayment';
import type { NormalizedSummary } from '../../../../api/apiClient'; 
import type { PaymentApprovalPayload } from '../Services/addPayment'; 


export function useAddPaymentApproval(): UseMutationResult<NormalizedSummary, Error, PaymentApprovalPayload> {
    
    const queryClient = useQueryClient();

    return useMutation<NormalizedSummary, Error, PaymentApprovalPayload>({
        mutationFn: addPaymentApproval,
        
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payments-dashboard"] });

        },
        
        mutationKey: ["addPaymentApproval"],
    });
}