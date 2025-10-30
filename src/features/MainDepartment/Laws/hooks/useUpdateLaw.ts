// src/features/Laws/hooks/useUpdateLaw.ts

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { updateLaw, type UpdateLawPayload } from '../Services/updateLaw';
import type { NormalizedSummary } from '../../../../api/apiClient'; 

/**
 * هوك React Query لإجراء عملية تحديث قانون/لائحة موجودة.
 */
export function useUpdateLaw(): UseMutationResult<NormalizedSummary, Error, UpdateLawPayload> {
    
    const queryClient = useQueryClient();

    return useMutation<NormalizedSummary, Error, UpdateLawPayload>({
        mutationFn: updateLaw,
        
        onSuccess: () => {
            // تحديث قائمة القوانين بعد نجاح التعديل
            queryClient.invalidateQueries({ queryKey: ["laws-data"] });
        },
        
        mutationKey: ["updateLaw"],
    });
}