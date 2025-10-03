// src/features/SubventionTypes/services/delete.ts
import {
  doTransaction,
  analyzeExecution,
  PROCEDURE_NAMES,
  type NormalizedSummary,
} from "../../../../api/apiClient";


export async function deleteSubventionType(
  id: number | string,
  pointId: number | string = 0
): Promise<NormalizedSummary> {
  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.SUBVENTION_TYPE_TABLE_NAME,
    WantedAction: 2,
    ColumnsValues: String(id),
    ColumnsNames: "Id",
    PointId: pointId,
  });

  return analyzeExecution(result);
}
