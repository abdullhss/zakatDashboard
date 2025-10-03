// src/features/SubventionTypes/hooks/useDelete.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSubventionType } from "../Services/deleteSubvention";

export function useDeleteSubventionType() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteSubventionType(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subventionTypes"] });
    },
  });
}
