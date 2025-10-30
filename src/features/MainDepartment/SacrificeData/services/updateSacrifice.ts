import { doTransaction, PROCEDURE_NAMES, analyzeExecution } from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";

export interface UpdateSacrificeInput {
  id: number | string;
  name: string;
  price: number;
  isActive: boolean;
}

export async function updateSacrificeType(
  input: UpdateSacrificeInput,
  pointId: number | string = 1
): Promise<NormalizedSummary> {
  const values =
    `${input.id}#${(input.name ?? "").trim()}#${Number(input.price) || 0}#${input.isActive ? 1 : 0}`;

  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.ADD_SACRIFICE_TYPE, 
    WantedAction: 1, // Update
    ColumnsValues: values,
    ColumnsNames: "Id#SacrificeTypeName#SacrificeTypePrice#IsActive",
    PointId: pointId,
  });

  return analyzeExecution(result);
}
