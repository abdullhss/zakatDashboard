import {
  executeProcedure,
  PROCEDURE_NAMES,
  analyzeExecution,
  type AnyRec,
  type NormalizedSummary,
} from "../../../../api/apiClient";

/** JSON ممكن ييجي كنص وأحيانًا ملفوف بين ( ... ) */
function parseWeirdJson<T = any>(v: unknown): T | [] {
  if (typeof v !== "string") return ([] as unknown) as T;
  let s = v.trim();
  if (s.startsWith("(") && s.endsWith(")")) s = s.slice(1, -1).trim();
  try {
    return JSON.parse(s) as T;
  } catch {
    return ([] as unknown) as T;
  }
}

/** نفكّ الداتا من الشكل المُشفّر للـ proc مع تعدد الأسماء المحتملة */
function extractAccountTypes(dec: any): { rows: AnyRec[]; totalRows: number } {
  const result0 = Array.isArray(dec?.data?.Result) ? dec.data.Result[0] : null;

  // اسم الحقل الذي يحتوي على JSON للصفوف (نحتاط لبدائل شائعة)
  const dataStr =
    result0?.AccountTypesData ??
    result0?.AccountTypeData ??
    result0?.Data ??
    null;

  const arr = dataStr ? parseWeirdJson<AnyRec[]>(dataStr) : [];
  const rows: AnyRec[] = Array.isArray(arr) ? arr : [];

  // إجمالي السجلات (نحتاط لعدة أسماء)
  const totalRows =
    Number(
      result0?.AccountTypesCount ??
      result0?.AccountTypeCount ??
      result0?.TotalCount ??
      result0?.Count ??
      rows.length
    ) || rows.length;

  return { rows, totalRows };
}

/** تطبيع صف نوع حساب */
function normalizeAccountType(r: AnyRec) {
  const id =
    r.Id ?? r.id ?? r.AccountTypeId ?? r.Account_Type_Id ?? r.Code ?? r.code ?? 0;

  const name =
    r.AccountTypeName ?? r.Name ?? r.Title ?? r.accountTypeName ?? "—";

  const isActive0 = r.IsActive ?? r.Active ?? r.is_active ?? undefined;
  const isActive =
    isActive0 === undefined
      ? undefined
      : (typeof isActive0 === "string"
          ? ["t", "true", "1", "y", "yes"].includes(isActive0.toLowerCase())
          : !!Number(isActive0) || !!isActive0);

  return {
    id: Number(id) || 0,
    name: String(name),
    ...(isActive === undefined ? {} : { isActive }),
  };
}

/**
 * API: جلب أنواع الحسابات (Server-side pagination)
 * ParametersValues يتوقع: "@StartNum#@Count"
 * StartNum هنا 1-based لذلك بنعمل offset+1
 */
export async function getAccountTypes(
  offset: number,
  limit: number
): Promise<NormalizedSummary> {
  const startNum = Math.max(1, (Number(offset) || 0) + 1); // 1-based
  const count = Math.max(1, Number(limit) || 1);
  const params = `${startNum}#${count}`;

  // ⚠️ نمرّر الأوفست/العداد داخل ParametersValues فقط (بدون Offset/Fetch في دالة التنفيذ)
  const exec = await executeProcedure(
    PROCEDURE_NAMES.ACCOUNT_TYPES,
    params
  );

  if ((exec as any)?.decrypted) {
    const { rows: rawRows, totalRows } = extractAccountTypes((exec as any).decrypted);
    const normalized = rawRows.map(normalizeAccountType);

    return {
      flags: {
        OK: true,
        OK_BUT_EMPTY: normalized.length === 0,
        INTERNAL_ERROR: false,
        FAILURE: false,
      },
      code: exec.success ? exec.code ?? 200 : exec.code ?? null,
      message: exec.success ? "" : (exec as any)?.decrypted?.error || "Execution failed.",
      totalRows,
      row: normalized[0] ?? null,
      rows: normalized,
      serverTime: (exec as any)?.decrypted?.servertime,
    };
  }

  return analyzeExecution(exec);
}
