import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addSacrificeType, type AddSacrificeInput } from "../services/addSacrifice";

export function useAddSacrifice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: AddSacrificeInput) => addSacrificeType(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sacrifice-types"] });
    },
  });
}
