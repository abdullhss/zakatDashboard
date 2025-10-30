// src/features/Kafara/services/updateKafara.ts
import { doTransaction, analyzeExecution, PROCEDURE_NAMES, type NormalizedSummary } from "../../../../api/apiClient";

export type UpdateKafaraPayload = {
  id: number | string;        
  value: number | string;      
  pointId?: number | string;   
};

export async function updateKafaraValue(payload: UpdateKafaraPayload): Promise<NormalizedSummary> {
  const { id, value, pointId = 0 } = payload;

  const ColumnsValues = `${id}#${value}`;

  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.KAFARA_TABLE_NAME,
    WantedAction: 1, 
    ColumnsValues,
    ColumnsNames: "Id#KafaraValue",
    PointId: pointId, 
  });

  return analyzeExecution(result);
}
