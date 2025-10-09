import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSacrificeType } from "../services/deleteSacrificeType";

export function useDeleteSacrifice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteSacrificeType(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sacrifice-types"] });
    },
  });
}
