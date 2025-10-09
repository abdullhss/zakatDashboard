import { doTransaction, PROCEDURE_NAMES, analyzeExecution } from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";

/** DELETE: نبعت الـId فقط */
export async function deleteSacrificeType(
  id: number | string,
  pointId: number | string = 1
): Promise<NormalizedSummary> {
  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.ADD_SACRIFICE_TYPE, // yjhWQPC+X9N5+2FVbLegdw==
    WantedAction: 2,                 // Delete
    ColumnsValues: String(id),       // 👈 Id فقط
    ColumnsNames: "Id",
    PointId: pointId,
    // لو عندك DataToken لازم يتبعت صراحة:
    // DataToken: "Zakat",
  });
  return analyzeExecution(result);
}
