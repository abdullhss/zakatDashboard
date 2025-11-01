import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePrivilege } from "../Services/deletePrivilege";

/**
 * React Query Mutation Hook لحذف الصلاحية
 */
export function useDeletePrivilege() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deletePrivilege(id),
    onSuccess: () => {
      // نحدث الكاش الخاص بالصلاحيات
      qc.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "privileges",
      });
    },
  });
}
