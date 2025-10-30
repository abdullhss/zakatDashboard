// src/features/Laws/hooks/useDeleteLaw.ts

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { deleteLaw, type DeleteLawPayload } from '../Services/deleteLaw';
import type { NormalizedSummary } from '../../../../api/apiClient'; 

/**
 * هوك React Query لإجراء عملية حذف قانون/لائحة.
 */
export function useDeleteLaw(): UseMutationResult<NormalizedSummary, Error, DeleteLawPayload['id']> {
    
    const queryClient = useQueryClient();

    return useMutation<NormalizedSummary, Error, DeleteLawPayload['id']>({
        // نستخدم ID فقط كمعامل للدالة
        mutationFn: (id) => deleteLaw({ id }),
        
        onSuccess: () => {
            // تحديث قائمة القوانين بعد نجاح الحذف
            queryClient.invalidateQueries({ queryKey: ["laws-data"] });
        },
        
        mutationKey: ["deleteLaw"],
    });
}