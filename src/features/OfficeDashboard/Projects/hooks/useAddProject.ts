import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addProject, type AddProjectInput } from "../Services/addProject";

export function useAddProject() {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ["projects", "add"],
    mutationFn: async (payload: AddProjectInput) => {
      const res = await addProject(payload);
      if (!res.success) {
        throw new Error(res.error || "Add project failed");
      }
      return res;
    },
    onSuccess: () => {
      // لو عندك كاش لقائمة المشاريع
      qc.invalidateQueries({ queryKey: ["projects"] }).catch(() => {});
    },
  });
}
