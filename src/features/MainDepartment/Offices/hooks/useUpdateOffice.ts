import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOfficeFull, type OfficeUpdateInput } from "../Services/updateOffice";
import type { NormalizedSummary } from "../../../../api/apiClient";

export function useUpdateOffice() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: OfficeUpdateInput): Promise<NormalizedSummary> => {
      // هنا بافتراض إن الواجهة بتبعت القيم كاملة (full)
      // لو عايز جزئي استخدم updateOfficePartial
      return await updateOfficeFull({
        id: payload.id,
        officeName: String(payload.officeName ?? ""),
        cityId: String(payload.cityId ?? ""),
        phone: String(payload.phone ?? ""),
        address: String(payload.address ?? ""),
        isActive: (typeof payload.isActive === "boolean" ? (payload.isActive ? 1 : 0) : payload.isActive) ?? 0,
        latitude: payload.latitude ?? "",
        longitude: payload.longitude ?? "",
        photoName: payload.photoName ?? "",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["offices"] });
    },
  });
}
