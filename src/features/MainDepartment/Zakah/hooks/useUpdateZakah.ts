import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateZakahStatus,
  type UpdateZakahStatusPayload,
} from "../Services/updateZakah";

export function useUpdateZakah() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: UpdateZakahStatusPayload) => updateZakahStatus(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["zakahTypes"] }); // يعيد الجلب بعد الحفظ
    },
  });
}
