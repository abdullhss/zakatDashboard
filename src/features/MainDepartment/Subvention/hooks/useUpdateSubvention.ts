// src/features/SubventionTypes/hooks/useUpdateStatus.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSubventionStatus, type UpdateStatusPayload } from "../Services/updateSubvention";

export function useUpdateSubventionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateStatusPayload) => updateSubventionStatus(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subventionTypes"] });
    },
  });
}
