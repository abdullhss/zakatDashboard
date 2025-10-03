// src/features/Kafara/hooks/useUpdateKafaraValue.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateKafaraValue, type UpdateKafaraPayload } from "../services/updateKafara";

export function useUpdateKafaraValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: UpdateKafaraPayload) => updateKafaraValue(p),
    onSuccess: () => {
      // نحدّث القراءة عشان الحقل يرجع متزامن
      qc.invalidateQueries({ queryKey: ["kafaraValue"] });
    },
  });
}
