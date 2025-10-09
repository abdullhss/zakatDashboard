import {
  doTransaction,
  analyzeExecution,
  PROCEDURE_NAMES,
  type NormalizedSummary,
} from "../../../../api/apiClient";

export type UpdateZakahStatusPayload = {
  id: number | string;
  isActive: boolean;
  pointId?: number | string;
};

export async function updateZakahStatus(
  payload: UpdateZakahStatusPayload
): Promise<NormalizedSummary> {
  const { id, isActive, pointId = 0 } = payload;

  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.UPDATE_ZAKAH_TYPES, // ✅ الجدول الصحيح
    WantedAction: 1,                                   // Update
    ColumnsNames: "Id#IsActive",                       // نحدّث الحالة فقط
    ColumnsValues: `${id}#${isActive ? 1 : 0}`,
    PointId: pointId,                                  // دايمًا 0 زي ما اتفقنا
  });

  return analyzeExecution(result);
}
