import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { transferMoney, type TransferMoneyPayload } from '../Services/addTransferData';
import type { NormalizedSummary } from '../../../../api/apiClient';

export function useTransferMoney(): UseMutationResult<NormalizedSummary, Error, TransferMoneyPayload> {
  const queryClient = useQueryClient();

  return useMutation<NormalizedSummary, Error, TransferMoneyPayload>({
    mutationFn: transferMoney,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-moneys'] });
    },
    mutationKey: ['transferMoney'],
  });
}