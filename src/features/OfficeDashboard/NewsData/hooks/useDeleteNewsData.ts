// src/features/MainDepartment/News/hooks/useDeleteNewsData.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNewsData } from "../Services/deleteNewsData";

export function useDeleteNewsData() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (opts: { id: number | string; pointId?: number | string }) =>
      deleteNewsData(opts.id, opts.pointId),

    onSuccess: (_data, _vars) => {
      // جدّد أي لستات أخبار مفتوحة
      qc.invalidateQueries({ queryKey: ["dash-news"] });
      qc.invalidateQueries({ queryKey: ["news-data"] });
    },
  });
}
