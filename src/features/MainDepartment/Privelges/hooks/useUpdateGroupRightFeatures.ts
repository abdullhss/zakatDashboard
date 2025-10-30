import { useMutation } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { getSession } from "../../../../session";
import { upsertOneGroupRightFeature } from "../Services/updateGroupRightFeatures";

interface UpdateFeaturePayload {
  groupRightId: number | string;
  featureId: number | string;
  detailId?: number | string | null;
  isActive: boolean;
}

export function useUpdateGroupRightFeatureValue(refetch: () => void) {
  const toast = useToast();
  const { officeId } = getSession();
  const pointId = officeId;

  return useMutation({
    mutationFn: async (payload: UpdateFeaturePayload) => {
      const { groupRightId, featureId, isActive, detailId } = payload;

      const summary = await upsertOneGroupRightFeature({
        groupRightId,
        featureId,
        isActive,
        detailId,
        pointId,
      });

      if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
        throw new Error(summary.message || "فشل التحديث.");
      }
      return summary;
    },
    onSuccess: () => {
      toast({ title: "تم تحديث الصلاحية بنجاح", status: "success", duration: 1500 });
      refetch();
    },
    onError: (error: any) => {
      toast({ title: "فشل التحديث", description: error?.message, status: "error" });
    },
  });
}
