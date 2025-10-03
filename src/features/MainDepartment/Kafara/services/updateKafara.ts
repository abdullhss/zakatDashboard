// src/features/Kafara/services/updateKafara.ts
import { doTransaction, analyzeExecution, PROCEDURE_NAMES, type NormalizedSummary } from "../../../../api/apiClient";

export type UpdateKafaraPayload = {
  id: number | string;         // غالبًا 1
  value: number | string;      // القيمة الجديدة
  pointId?: number | string;   // حسب توجيهاتك نخليها 0
};

export async function updateKafaraValue(payload: UpdateKafaraPayload): Promise<NormalizedSummary> {
  const { id, value, pointId = 0 } = payload;

  // صيغة الأعمدة: Id#KafaraValue
  const ColumnsValues = `${id}#${value}`;

  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.KAFARA_TABLE_NAME,
    WantedAction: 1, // Update
    ColumnsValues,
    ColumnsNames: "Id#KafaraValue",
    PointId: pointId, // دايمًا 0 زي ما قلت
  });

  return analyzeExecution(result);
}
