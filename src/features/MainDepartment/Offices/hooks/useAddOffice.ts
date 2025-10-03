import { useMutation } from "@tanstack/react-query";
import type { NormalizedSummary } from "../../../../api/apiClient";
import { addOffice } from "../Services/AddOffice";

export type OfficePayload = {
  officeName: string;
  cityId: string | number;
  phone: string;
  address: string;
  isActive: boolean;
  latitude?: string | number | null;
  longitude?: string | number | null;
  photoName?: string | null;
  pointId?: number | string;
};

export function useAddOffice() {
  return useMutation<NormalizedSummary, Error, OfficePayload>({
    mutationFn: async (payload: OfficePayload) => {
      const summary = await addOffice(payload);
      if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
        throw new Error(summary.message || "فشل إضافة المكتب.");
      }
      return summary;
    },
  });
}
