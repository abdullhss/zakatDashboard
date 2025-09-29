import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBank } from "../Services/deleteBank";

export function useDeleteBank() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await deleteBank(id);
      if (!(res.flags.OK || res.flags.OK_BUT_EMPTY)) {
        throw new Error(res.message || "فشل حذف البنك");
      }
      return res;
    },
    onSuccess: () => {
      // هنفترض مفتاح الاستعلام ["banks"] مثل useBanksQuery
      qc.invalidateQueries({ queryKey: ["banks"] });
    },
  });
}
