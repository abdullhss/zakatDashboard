// src/features/MainDepartment/GetCashCampaign/hooks/useUpdateCampaignData.ts
import { useMutation } from "@tanstack/react-query";
import { updateCampaignData, type UpdateCampaignInput } from "../Services/updateCampaignData";
import type { NormalizedSummary } from "../../../../api/apiClient";

export default function useUpdateCampaignData() {
  return useMutation<NormalizedSummary, Error, UpdateCampaignInput>({
    mutationFn: (input: UpdateCampaignInput) => updateCampaignData(input),
    onSuccess: (summary) => {
      if (summary?.flags?.FAILURE || summary?.flags?.INTERNAL_ERROR) {
        throw new Error(summary?.message || "Update failed by backend.");
      }
    },
  });
}
