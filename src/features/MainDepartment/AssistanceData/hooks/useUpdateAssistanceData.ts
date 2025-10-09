// src/features/Assistances/hooks/useUpdateAssistanceData.ts
import { useMutation } from "@tanstack/react-query";
import { updateAssistanceData, type UpdateAssistanceInput } from "../services/updateAssistanceData";

export default function useUpdateAssistanceData() {
  return useMutation({
    mutationFn: (input: UpdateAssistanceInput) => updateAssistanceData(input),
  });
}
