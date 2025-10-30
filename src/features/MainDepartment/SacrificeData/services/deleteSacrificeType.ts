import { doTransaction, PROCEDURE_NAMES, analyzeExecution } from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";

export async function deleteSacrificeType(
  id: number | string,
  pointId: number | string = 1
): Promise<NormalizedSummary> {
  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.ADD_SACRIFICE_TYPE,
    WantedAction: 2,                 
    ColumnsValues: String(id),      
    ColumnsNames: "Id",
    PointId: pointId,

  });
  return analyzeExecution(result);
}
