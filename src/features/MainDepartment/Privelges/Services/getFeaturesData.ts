import {
  executeProcedure,
  analyzeExecution,
  type NormalizedSummary,
  type ExecutionResult,
  PROCEDURE_NAMES,
} from "../../../../api/apiClient";

export type RoleCode = "M" | "O" | "A" | "U";

export type FeaturesSummary = NormalizedSummary & { rows: any[] };

/**
 * يجلب الميزات حسب كود الدور RoleCode.
 * يضمن وجود "rows" دائمًا كمصفوفة مهما كان شكل استجابة الـ SP.
 *
 * @param roleCode  كود الدور المطلوب ("M" افتراضيًا)
 */
export async function getFeatures(roleCode?: RoleCode | string): Promise<FeaturesSummary> {
  // افتراضي "M" + توحيد و uppercase
  const procedureValues = String(roleCode ?? "M").trim().toUpperCase();

  if (!procedureValues) {
    throw new Error("[getFeatures] Empty role code – expected a RoleCode like 'M'.");
  }

  const raw: ExecutionResult = await executeProcedure(
    PROCEDURE_NAMES.GET_FEATURES_DATA, // "ZhEv0ofVhejGIX2/As9S6w=="
    procedureValues
  );

  const summary = analyzeExecution(raw) as any;

  let rows: any[] = [];

  const candidate =
    summary?.rows ?? 
    summary?.FeaturesData ?? 
    summary?.data?.[0]?.FeaturesData ?? 
    summary?.Result?.[0]?.FeaturesData ?? 
    "";

  if (Array.isArray(candidate)) {
    rows = candidate;
  } else if (typeof candidate === "string") {
    const s = candidate.trim();
    if (s) {
      try {
        const parsed = JSON.parse(s);
        rows = Array.isArray(parsed) ? parsed : [];
      } catch {
        rows = []; // لو مش JSON صالح
      }
    } else {
      rows = []; // سترينج فاضي
    }
  } else if (candidate && typeof candidate === "object") {
    // أحيانًا بيكون كائن فيه items
    rows = Array.isArray((candidate as any).items) ? (candidate as any).items : [];
  }

  // لوج تشخيصي
  console.log("[getFeatures] roleCode:", procedureValues, "rows:", rows.length);

  return { ...summary, rows };
}
