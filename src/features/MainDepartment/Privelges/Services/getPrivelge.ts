// src/features/MainDepartment/Privelges/Services/getPrivelge.ts
import {
  executeProcedure,
  analyzeExecution,
  type NormalizedSummary,
  type ExecutionResult,
  PROCEDURE_NAMES,
  type ExecOk,
} from "../../../../api/apiClient";

export type RoleCode = "M" | "O";

/** حاول ترجيع مصفوفة آمنة من أي شكل */
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
  }s
  if (typeof input === "object" && Array.isArray((input as any).items)) {
    return (input as any).items;
  }
  return [];
}

export async function getPrivileges(
  roleOrType: RoleCode | string = "M",
  start = 0,
  count = 50
): Promise<NormalizedSummary & { rows: any[]; totalRows: number }> {
  const role = String(roleOrType ?? "M").trim().toUpperCase() || "M";
  const start1 = Math.max(1, start + 1);
  const safeCount = Math.max(1, count);
  const procedureValues = `${role}#${start1}#${safeCount}`;

  const exec: ExecutionResult = await executeProcedure(
    PROCEDURE_NAMES.GET_GROUP_RIGHT_DATA,
    procedureValues
  );

  // ملخص قياسي (فيه flags/message…)
  const base = analyzeExecution(exec) as NormalizedSummary;

  // ✅ المكان الصحيح للـ data المفكوكة
  const dec = (exec as ExecOk)?.decrypted;
  const decData: any = dec?.data;

  // بنحاول نجيب أول عنصر من Result
  const r0 =
    (Array.isArray(decData?.Result) && decData?.Result?.[0]) ||
    decData?.[0] ||
    {};

  // بعض السيرفرات بترجع GroupRightsData كنص JSON
  const rows =
    toArraySafe(
      r0.GroupRightsData ??
        r0.grouprightsdata ??
        r0.groupRightsData ??
        r0.Rows ??
        r0.rows
    ) || [];

  const totalRows =
    Number(
      r0.GroupRightsCount ??
        r0.grouprightscount ??
        r0.groupRightsCount ??
        r0.TotalRowsCount ??
        r0.totalRowsCount ??
        rows.length
    ) || rows.length;

  // نُرجع نفس الـ base لكن مع rows/totalRows المصححة
  return { ...base, rows, totalRows };
}
