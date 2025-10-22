// src/hooks/useUpdateBank.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBankAccount } from "../Services/addAccount";

export function useUpdateBank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number | string; input: any }) =>
      updateBankAccount(id, input),

    onSuccess: () => {
      // تحديث الكاش بعد النجاح
      queryClient.invalidateQueries(["bankAccounts"]);
    },

    onError: (err) => {
      console.error("Update bank account failed:", err);
    },
  });
}
