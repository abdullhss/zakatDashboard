import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSubvention, type UpdateSubventionPayload } from "../Services/updateSubvention";

export function useUpdateSubventionStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (vars: UpdateSubventionPayload) => updateSubvention(vars),
    onSuccess: (_data, vars) => {
      // تحديث الكاش محليًا لكل استعلامات subventionTypes
      qc.setQueriesData({ queryKey: ["subventionTypes"] }, (old: any) => {
        if (!old) return old;

        const rows = (old.rows ?? old?.data?.rows ?? []).map((r: any) => {
          const id = r.id ?? r.Id;
          if (String(id) !== String(vars.id)) return r;

          const next: any = { ...r };

          if (typeof vars.isActive !== "undefined") {
            next.isActive = vars.isActive;
            next.IsActive = vars.isActive;
          }

          if (typeof vars.name !== "undefined") {
            next.name = vars.name;
            next.SubventionTypeName = vars.name;
          }

          if (typeof vars.allowZakat !== "undefined") {
            const v = !!vars.allowZakat;
            next.acceptZakat = v;
            next.AllowZakat = v;
            next.acceptZakat = v;   // دعم أسماء مختلفة محتملة
            next.AcceptZakat = v;
            next.IsZakat = v;
          }

          return next;
        });

        return { ...old, rows };
      });
    },
  });
}
