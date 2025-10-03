import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addSubventionType, type AddSubventionTypeInput } from "../Services/addSubvention";

export function useAddSubventionType() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddSubventionTypeInput) => addSubventionType(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subventionTypes"] });
    },
  });
}
