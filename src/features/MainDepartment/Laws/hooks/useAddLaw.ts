// src/features/Laws/hooks/useAddLaw.ts

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { addLaw } from '../Services/addLaw'; // تأكد من المسار
import type { NormalizedSummary } from '../../../../api/apiClient'; 
import type { AddLawPayload } from '../Services/addLaw'; // استيراد نوع الحمولة

/**
 * هوك React Query لإجراء عملية إضافة قانون/لائحة جديدة.
 */
export function useAddLaw(): UseMutationResult<NormalizedSummary, Error, AddLawPayload> {
    
    const queryClient = useQueryClient();

    return useMutation<NormalizedSummary, Error, AddLawPayload>({
        mutationFn: addLaw,
        
        onSuccess: () => {
            // تحديث قائمة القوانين بعد نجاح الإضافة
            queryClient.invalidateQueries({ queryKey: ["laws-data"] });
        },
        
        mutationKey: ["addLaw"],
    });
}