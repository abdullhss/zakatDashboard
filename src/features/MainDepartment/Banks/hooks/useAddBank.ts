
import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { addBank } from '../Services/addBank'; 
import type { NormalizedSummary } from '../../../../api/apiClient'; 
export interface AddBankInput {
    bankName: string;
}
export function useAddBank(): UseMutationResult<NormalizedSummary, Error, AddBankInput> {
    const queryClient = useQueryClient();
    return useMutation<NormalizedSummary, Error, AddBankInput>({
        mutationFn: async (newBank: AddBankInput) => {
            const summary: NormalizedSummary = await addBank(newBank);
                        if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
                throw new Error(summary.message || "فشل غير معروف في إضافة البنك.");
            }
            return summary;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banks'] });
                        console.log("تمت إضافة البنك بنجاح!");
        },
        onError: (error) => {
            console.error("فشل الإضافة:", error.message);
        }
    });
}