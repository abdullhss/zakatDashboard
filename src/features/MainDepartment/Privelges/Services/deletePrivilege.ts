import {
  doMultiTransaction,
  analyzeExecution,
  PROCEDURE_NAMES,
  type NormalizedSummary,
} from "../../../../api/apiClient";

// نفس دوال المساعدة المستخدمة في باقي السيرفيس
const caretJoin = (...parts: string[]) =>
  parts.map((p) => String(p ?? "").trim())
       .map((s) => s.replace(/(\^|#)+$/g, "").replace(/^(\^|#)+/g, ""))
       .join("^");

/**
 * حذف صلاحية (GroupRight)
 */
export async function deletePrivilege(groupRightId: string | number): Promise<NormalizedSummary> {
  if (!groupRightId) throw new Error("معرّف المجموعة غير صالح.");

  const M_TABLE = PROCEDURE_NAMES.GROUP_RIGHT; // جدول الماستر
  const multi = {
    MultiTableName: M_TABLE,
    MultiColumnsValues: String(groupRightId), // نحذف بالـ ID فقط
    WantedAction: 2, // ← 2 معناها حذف
    PointId: 0,
  };

  console.log("[ERP] Delete Privilege Input =>", multi);
  const res = await doMultiTransaction(multi);
  return analyzeExecution(res);
}
