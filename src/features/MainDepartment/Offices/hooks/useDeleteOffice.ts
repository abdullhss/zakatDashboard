import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteOffice, deactivateOffice } from "../Services/deleteOffice";

export function useDeleteOffice() {
  const qc = useQueryClient();

  const hardDelete = useMutation({
    mutationFn: (id: number | string) => deleteOffice(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["offices"] });
    },
  });

  const softDeactivate = useMutation({
    mutationFn: (id: number | string) => deactivateOffice(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["offices"] });
    },
  });

  return { hardDelete, softDeactivate };
}
