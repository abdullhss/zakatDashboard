// src/features/MainDepartment/Privelges/Services/getGroupRightFeatures.ts
import {
  executeProcedure,
  analyzeExecution,
  type ExecutionResult,
  type NormalizedSummary,
  PROCEDURE_NAMES,
} from "../../../../api/apiClient";

// تحويل أي تمثيل لآراي
function toArraySafe(input: any): any[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  if (typeof input === "object" && Array.isArray((input as any).items)) {
    return (input as any).items;
  }
  return [];
}

/**
 * قراءة ميزات مجموعة صلاحيات معينة
 * @param featureType "1" لمجموعة M أو "2" لمجموعة O (على حسب نظامك)
 * @param groupRightId رقم المجموعة المطلوبة
 * @param offset تخطي
 * @param fetch  عدد عناصر
 */
export async function getGroupRightFeatures(
  featureType: string | number,
  groupRightId: string | number,
  offset = 0,
  fetch = 100
): Promise<
  NormalizedSummary & {
    rows: Array<{ Id?: number; Feature_Id?: number; FeatureName?: string; IsActive?: number }>;
    totalRows: number;
  }
> {
  const ft = String(featureType ?? "1").trim();
  const gid = String(groupRightId ?? "").trim();
  if (!gid) throw new Error("GroupRightId مطلوب.");

  const paramsValues = `${ft}#${gid}`;

  const exec: ExecutionResult = await executeProcedure(
    PROCEDURE_NAMES.GET_GROUP_RIGHT_FEATURES_DATA, // لازم يكون معرّف في apiClient
    paramsValues,
    offset,
    fetch
  );

  // normalize
  const base = analyzeExecution(exec) as any;

  // شكل الريسبونس بيختلف؛ نجرب احتمالات شائعة
  const r0 =
    (exec as any)?.data?.Result?.[0] ??
    (base as any)?.data?.Result?.[0] ??
    (exec as any)?.data?.[0] ??
    (base as any)?.data?.[0] ??
    {};

  const rows = toArraySafe(
    r0.FeaturesData ??
      r0.featuresData ??
      r0.GroupRightFeaturesData ??
      r0.groupRightFeaturesData ??
      r0.Rows ??
      r0.rows
  );

  const totalRows =
    Number(
      r0.FeaturesCount ??
        r0.featuresCount ??
        r0.TotalRowsCount ??
        r0.totalRowsCount ??
        rows.length
    ) || rows.length;

  return { ...(base as NormalizedSummary), rows, totalRows };
}
