// src/features/SubventionTypes/services/delete.ts
import {
  doTransaction,
  analyzeExecution,
  PROCEDURE_NAMES,
  type NormalizedSummary,
} from "../../../../api/apiClient";


// src/features/SubventionTypes/services/delete.ts (بعد التعديل الموصى به)
export async function deleteSubventionType(
  id: number | string,
  pointId: number | string = 0
): Promise<NormalizedSummary> {
  const numericId = Number(id) || 0; // التأكد من أن المعرف هو رقم صالح

  // التأكد من أن الحذف يتم باستخدام id فقط
const result = await doTransaction({
  TableName: PROCEDURE_NAMES.SUBVENTION_TYPE_TABLE_NAME,
  WantedAction: 2,
  ColumnsValues: String(numericId),
  ColumnsNames: "Id",
  PointId: pointId,
});
console.log("Delete Result:", result); // مراقبة استجابة الخادم



  return analyzeExecution(result);
}
