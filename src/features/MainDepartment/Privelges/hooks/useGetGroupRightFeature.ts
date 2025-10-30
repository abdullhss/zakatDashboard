import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getGroupRightFeaturesData } from "../Services/getGroupRightFeature";
import type { AnyRec } from "../../../../api/apiClient";

export interface GroupRightFeaturesData {
  rows: AnyRec[];
  totalRows: number | null;
}

export function useGetGroupRightFeature(
  featureType: string, // "M" | "O" | "A"
  groupRightId: number
): UseQueryResult<GroupRightFeaturesData, Error> {
  const enabled = groupRightId > 0 && !!featureType;
  const queryKey = ["groupRightFeatures", featureType, groupRightId];

  return useQuery<GroupRightFeaturesData, Error>({
    queryKey,
    queryFn: async () => {
      if (!enabled) throw new Error("Invalid featureType or groupRightId");

      const summary = await getGroupRightFeaturesData(featureType, groupRightId);

      if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
        throw new Error(summary.message || "فشل غير معروف في جلب البيانات.");
      }

      // نطبع IsActive → GroupRightValue = 1/0 + نثبت حقول مساعدة
      const normalizedRows = (summary.rows ?? []).map((r: AnyRec) => {
        const isActive =
          r.IsActive === true ||
          String(r.IsActive).toLowerCase() === "true" ||
          Number(r.GroupRightValue) > 0;

        return {
          ...r,
          GroupRightValue: isActive ? 1 : 0, // للـ Switch
          DetailId: r.Id ?? r.DetailId ?? null, // سطر العلاقة في GroupRight_D
          FeatureName: r.FeatureName ?? r.Name ?? r.Feature ?? "", // توحيد
          FeatureCode: r.FeatureCode ?? r.Code ?? null,            // قد يكون فارغ
        };
      });

      return {
        rows: normalizedRows,
        totalRows: summary.totalRows ?? normalizedRows.length,
      };
    },
    enabled,
    staleTime: 60_000,
  });
}
