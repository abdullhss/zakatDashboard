import { useMutation } from "@tanstack/react-query";
import type { NormalizedSummary } from "../../../../api/apiClient";
import { addOffice, type AddOfficePayload } from "../Services/AddOffice";

export function useAddOffice() {
  return useMutation<NormalizedSummary, Error, AddOfficePayload>({
    mutationFn: async (payload: AddOfficePayload) => {
      const summary = await addOffice(payload);
      if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
        throw new Error(summary.message || "فشل إضافة المكتب.");
      }
      return summary;
    },
  });
}
