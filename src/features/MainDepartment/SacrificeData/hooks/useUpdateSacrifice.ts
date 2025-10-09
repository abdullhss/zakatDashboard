import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSacrificeType, type UpdateSacrificeInput } from "../services/updateSacrifice";

export function useUpdateSacrifice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: UpdateSacrificeInput) => updateSacrificeType(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sacrifice-types"] });
    },
  });
}
