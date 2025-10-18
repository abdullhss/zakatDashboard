// src/features/News/Services/getTypesNewsData.ts
import {
  executeProcedure,
  analyzeExecution,
  PROCEDURE_NAMES,
} from "../../../../api/apiClient";
import type {
  ExecutionResult,
  NormalizedSummary,
} from "../../../../api/apiClient";

/**
 * يجلب قائمة أنواع الأخبار (News Types) مع دعم الترقيم.
 * @param startNum - Offset (0-based).
 * @param count - Fetch Limit.
 */
export async function getTypesNewsData(
  startNum: number = 0,
  count: number = 10
): Promise<NormalizedSummary> {
  const sqlStartNum = startNum + 1; // SQL uses 1-based
  // @StartNum#@Count
  const procedureValues = `${sqlStartNum}#${count}`;
  const ProcedureName = PROCEDURE_NAMES.GET_TYPES_NEW_DATA;

  // 1) التنفيذ والحصول على النتيجة الخام
  const exec: ExecutionResult = await executeProcedure(
    ProcedureName,
    procedureValues,
    undefined,
    startNum, // Offset لخاصية الـ JSON المشفرة (لو السيرفر بيدعمها)
    count
  );

  // 2) التحليل والتوحيد لنتيجة موحدة (rows/totalRows/flags...)
  return analyzeExecution(exec);
}
