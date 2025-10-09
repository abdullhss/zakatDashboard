// src/features/SubventionTypes/hooks/useUpdateSubvention.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSubventionStatus } from "../Services/updateSubvention"; // دالة الـ DoTransaction بتاعتك

type Vars = { id: number | string; isActive: boolean; pointId?: number };

export function useUpdateSubventionStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (vars: Vars) => updateSubventionStatus(vars),
    onSuccess: (_data, vars) => {
      // حدّث الكاش لجميع الاستعلامات اللي مفتاحها subventionTypes
      qc.setQueriesData(
        { queryKey: ["subventionTypes"] },
        (old: any) => {
          if (!old) return old;
          const nextRows = (old.rows ?? old?.data?.rows ?? []).map((r: any) => {
            const id = r.id ?? r.Id;
            if (String(id) === String(vars.id)) {
              // غيّر الحقلين اللي بتستخدمهم في الواجهة
              return {
                ...r,
                isActive: vars.isActive,
                IsActive: vars.isActive, // لو في أماكن تانية معتمدة على الكابيتال
              };
            }
            return r;
          });
          return { ...old, rows: nextRows };
        }
      );
      // مفيش invalidateQueries عشان ما نفلترش تاني من السيرفر
    },
  });
}
