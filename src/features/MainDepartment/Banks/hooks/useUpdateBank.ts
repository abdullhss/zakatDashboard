import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBank } from "../Services/updateBank";

type UpdateInput = {
  id: number | string;
  bankName: string;
  bankCode?: string;
};

export function useUpdateBank() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, bankName, bankCode }: UpdateInput) => {
      const res = await updateBank(id, { bankName, bankCode });
      if (!(res.flags.OK || res.flags.OK_BUT_EMPTY)) {
        throw new Error(res.message || "فشل تعديل البنك");
      }
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["banks"] });
    },
  });
}
