import { doTransaction, PROCEDURE_NAMES, analyzeExecution } from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";
export async function deleteCity(
  id: number | string,
  pointId: number | string = 1
): Promise<NormalizedSummary> {
  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.CITIES_TABLE_NAME,
    WantedAction: 2,                  // Delete
    ColumnsValues: String(id),        // نرسل الـ Id فقط
    ColumnsNames: "Id",               // أول عمود هو الـ Id
    PointId: pointId,
  });

  return analyzeExecution(result);
}