// src/features/SubventionTypes/hooks/useAddSubvention.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addSubventionType, type AddSubventionTypeInput } from "../Services/addSubvention"; // تأكد من المسار/الكيس

export function useAddSubventionType() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddSubventionTypeInput) => addSubventionType(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subventionTypes"] });
    },
  });
}
