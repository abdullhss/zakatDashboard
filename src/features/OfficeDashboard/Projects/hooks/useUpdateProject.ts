// src/features/OfficeDashboard/Projects/hooks/useUpdateProject.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProject as updateProjectApi } from "../Services/updateProject";

// شكل البيانات المرسلة من الـ form
export interface UpdatePayload {
  id: number;
  projectName: string;
  projectDesc: string;
  subventionTypeId: number;
  wantedAmount: string;
  openingBalance: string;
  remainingAmount: string;
  allowZakat: boolean;
  importanceId: number;
  isActive: boolean;
  photoName: string;
}

// شكل الاستجابة الموحدة
export interface UpdateResponse {
  success: boolean;
  error?: string;
  data?: any;
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateResponse, Error, UpdatePayload>({
    mutationFn: async (payload) => {
      const res = await updateProjectApi(payload);
      return {
        success: !res.flags.FAILURE && !res.flags.INTERNAL_ERROR,
        error: res.message || undefined,
        data: res,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      console.log("✅ تم تحديث المشروع بنجاح وإعادة تحميل القائمة.");
    },
    onError: (error) => {
      console.error("❌ حدث خطأ أثناء التحديث:", error);
    },
    mutationKey: ["updateProject"],
  });
};
