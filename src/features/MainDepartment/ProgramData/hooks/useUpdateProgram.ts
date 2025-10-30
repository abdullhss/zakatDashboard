// src/features/Program/hooks/useUpdateProgram.ts

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { updateProgram } from '../Services/updateProgram';
import type { NormalizedSummary } from '../../../../api/apiClient'; 
import type { UpdateProgramPayload } from '../Services/updateProgram'; 

/**
 * هوك React Query لإجراء عملية تحديث بيانات البرنامج (About Us, Policy, etc.).
 */
export function useUpdateProgram(): UseMutationResult<NormalizedSummary, Error, UpdateProgramPayload> {
  const queryClient = useQueryClient();

  return useMutation<NormalizedSummary, Error, UpdateProgramPayload>({
    mutationFn: updateProgram,
    
    onSuccess: () => {
        // تحديث أي كويري يعتمد على إعدادات البرنامج (لتجنب إعادة تحميل الصفحة)
        queryClient.invalidateQueries({ queryKey: ["programSettings"] });
    },
    
    mutationKey: ["updateProgram"],
  });
}
