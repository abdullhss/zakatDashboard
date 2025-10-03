// src/features/SubventionTypes/services/updateStatus.ts
import {
  doTransaction,
  analyzeExecution,
  PROCEDURE_NAMES,
  type NormalizedSummary,
} from "../../../../api/apiClient";

export type UpdateStatusPayload = {
  id: number | string;
  isActive: boolean;
  pointId?: number | string;
};

export async function updateSubventionStatus(
  payload: UpdateStatusPayload
): Promise<NormalizedSummary> {
  const { id, isActive, pointId = 0 } = payload;

  // نحدّث فقط Id و IsActive
  const columnsValues = `${id}#${isActive ? "1" : "0"}`;

  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.SUBVENTION_TYPE_TABLE_NAME, // تأكّد من وجوده في apiClient
    WantedAction: 1, // Update
    ColumnsValues: columnsValues,
    ColumnsNames: "Id#IsActive",
    PointId: pointId,
  });

  return analyzeExecution(result);
}
