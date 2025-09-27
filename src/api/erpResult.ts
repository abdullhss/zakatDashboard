// src/api/erpResult.ts
import type { ExecutionResult } from "./apiClient";

type AnyRec = Record<string, any>;

export type TriState = {
  OK: boolean;              // 200 + no error + rows>0
  OK_BUT_EMPTY: boolean;    // 200 + no error + rows=0
  INTERNAL_ERROR: boolean;  // 200 + error text present
  FAILURE: boolean;         // non-200 or network fail
};

export type NormalizedSummary = {
  flags: TriState;
  code: number | null;        // Result code إن وجد
  message: string;            // error الداخلي أو رسالة فشل عامة
  totalRows: number | null;   // إجمالي الصفوف إن وجدت
  row: AnyRec | null;         // أول صف
  rows: AnyRec[];             // كل الصفوف
  serverTime?: string;        // وقت السيرفر (لو موجود)
};

/** يحوّل ناتج executeProcedure لشكل موحّد وسهل التسلسل إلى JSON */
export function analyzeExecution(result: ExecutionResult): NormalizedSummary {
  // قيم افتراضية آمنة
  let code: number | null = null;
  let errorText = "";
  let rows: AnyRec[] = [];
  let row: AnyRec | null = null;
  let total: number | null = null;
  let serverTime: string | undefined;

  if (result.success) {
    // من الـ apiClient: بنلاقي rows/row/meta أو data
    // @ts-ignore
    rows = result.rows ?? [];
    // @ts-ignore
    row = result.row ?? null;
    // @ts-ignore
    total = result.meta?.total ?? (Array.isArray(rows) ? rows.length : null);
    // @ts-ignore
    serverTime = result.meta?.serverTime;
    // @ts-ignore
    code = result.code ?? 200;
    errorText = ""; // نجاح بلا خطأ داخلي
  } else {
    // فشل على مستوى التنفيذ
    // @ts-ignore
    code = result.code ?? null;
    errorText = result.error || "Execution failed.";
  }

  // لو الرد المفكوك موجود ممكن نستخرج منه error داخلي حتى مع 200
  // @ts-ignore
  const dec = (result as any).decrypted;
  const internalErr =
    dec && typeof dec.error === "string" ? dec.error.trim() : "";

  // لو success=true واكتشفنا error داخلي
  if (result.success && internalErr) {
    errorText = internalErr;
  }

  const OK = !!(result.success && !internalErr && rows.length > 0);
  const OK_BUT_EMPTY = !!(result.success && !internalErr && rows.length === 0);
  const INTERNAL_ERROR = !!(result.success && !!internalErr);
  const FAILURE = !result.success;

  return {
    flags: { OK, OK_BUT_EMPTY, INTERNAL_ERROR, FAILURE },
    code,
    message: errorText,
    totalRows: total,
    row,
    rows,
    serverTime,
  };
}
