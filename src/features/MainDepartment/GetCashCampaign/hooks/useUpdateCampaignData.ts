import { useMutation } from "@tanstack/react-query";
import { updateCampaignData, type UpdateCampaignInput } from "../Services/updateCampaignData";

export default function useUpdateCampaignData() {
  return useMutation({
    mutationFn: (input: UpdateCampaignInput) => updateCampaignData(input),
  });
}
