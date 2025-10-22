// src/features/MainDepartment/News/Services/deleteNewsData.ts
import {
  doTransaction,
  analyzeExecution,
  PROCEDURE_NAMES,
  type NormalizedSummary,
} from "../../../../api/apiClient";

/**
 * حذف خبر بالمعرّف الخاص به.
 * @param id رقم الخبر المطلوب حذفه
 * @param pointId (اختياري) رقم النقطة لو بتستخدم نظام النقاط في الترانزاكشن
 */
export async function deleteNewsData(
  id: number | string,
  pointId?: number | string
): Promise<NormalizedSummary> {
  if (!id && id !== 0) throw new Error("رقم الخبر غير صالح.");

  // للحذف نرسل فقط الـ Id في ColumnsValues + نحدد أسماء الأعمدة "Id"
  const ColumnsValues = String(id);
  const ColumnsNames = "Id";

  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.NEWS_TABLE_NAME, // نفس الجدول اللي استخدمناه في الإضافة
    WantedAction: 2,                             // 2 = Delete
    ColumnsValues,
    ColumnsNames,                                // مهم للحذف
    PointId: Number(pointId ?? 0),
    // DataToken بيتحدد تلقائي من apiClient أو أرسله هنا لو لازم
    // SendNotification: "F",  // (اختياري) عدم إرسال إخطار
  });

  return analyzeExecution(result);
}
