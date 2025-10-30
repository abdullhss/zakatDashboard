import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSacrificesData, type UpdateSacrificeOrderInput } from "../Services/updateSacrificesData";

export function useUpdateSacrificesData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: UpdateSacrificeOrderInput) => updateSacrificesData(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sacrifice-orders"] });
      qc.invalidateQueries({ queryKey: ["sacrifice-orders", "paged"] });
      qc.invalidateQueries({ queryKey: ["sacrifices-dashboard"] });
    },
  });
}
