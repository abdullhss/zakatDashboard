// src/features/Sacrifice/services/getSacrificeTypes.ts
import {
  executeProcedure,
  analyzeExecution,
  type ExecutionResult,
  type NormalizedSummary,
  PROCEDURE_NAMES,
} from "../../../../api/apiClient";

function jsonParseSafe<T = any>(v: any, fallback: T): T {
  if (v == null) return fallback;
  if (typeof v === "string") {
    try { return JSON.parse(v) as T; } catch { return fallback; }
  }
  return v as T;
}

function toArraySafe(input: any): any[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof input === "string") {
    try { const p = JSON.parse(input); return Array.isArray(p) ? p : []; }
    catch { return []; }
  }
  if (typeof input === "object" && Array.isArray((input as any).items)) {
    return (input as any).items;
  }
  return [];
}

export async function getSacrificeTypes(
  startNum = 1,
  count = 25
): Promise<NormalizedSummary & { rows: any[]; totalRows: number; row?: any }> {
  const params = `${Math.max(1, startNum)}#${Math.max(1, count)}`;

  const exec: ExecutionResult = await executeProcedure(
    PROCEDURE_NAMES.GET_SACRIFICES_TYPES_DATA,
    params
  );

  // قد يرجّع لنا analyzeExecution نسخة مُطبَّعة (rows/row/totalRows)
  const base = analyzeExecution(exec) as any;

  // 1) جرّب الصفوف المُطبَّعة أولاً
  let rows: any[] =
    ((exec as any)?.rows ?? base?.rows ?? []) as any[];

  // 2) لو فاضية، فكّ من Result[0].SacrificeTypesData
  if (!rows.length) {
    let r0: any =
      (exec as any)?.data?.Result?.[0] ??
      (base as any)?.data?.Result?.[0] ??
      (exec as any)?.data?.[0] ??
      (base as any)?.data?.[0] ??
      {};

    r0 = jsonParseSafe(r0, r0);

    const raw =
      r0.SacrificeTypesData ??
      r0.sacrificetypesdata ??
      r0.Rows ??
      r0.rows ??
      null;

    rows = toArraySafe(raw);

    // تشخيص خفيف (مش تحذير مُزعِج)
    if (!rows.length) {
      console.info(
        "[getSacrificeTypes] fallback parse produced 0 rows.",
        { r0, exec }
      );
    }
  }

  // 3) احسب الإجمالي من أكثر من مصدر
  let totalRows: number | undefined;

  const pickNum = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  totalRows =
    pickNum((exec as any)?.totalRows) ??
    pickNum(base?.totalRows) ??
    pickNum((exec as any)?.row?.SacrificeTypesCount) ??
    pickNum(base?.row?.SacrificeTypesCount) ??
    pickNum((exec as any)?.row?.sacrificetypescount) ??
    pickNum(base?.row?.sacrificetypescount) ??
    pickNum((exec as any)?.row?.TotalRowsCount) ??
    pickNum(base?.row?.TotalRowsCount) ??
    pickNum((exec as any)?.row?.totalRowsCount) ??
    pickNum(base?.row?.totalRowsCount) ??
    rows.length;

  const rowSummary =
    (exec as any)?.row ?? base?.row ?? undefined;

  return { ...(base as NormalizedSummary), rows, totalRows: totalRows!, row: rowSummary };
}
