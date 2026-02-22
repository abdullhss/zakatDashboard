import { doTransaction, PROCEDURE_NAMES, analyzeExecution } from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";

export interface UpdateSacrificeInput {
  id: number | string;
  name: string;
  price: number;
  isActive: boolean;
  sacrificeCategory_Id: number;
}

export async function updateSacrificeType(
  input: UpdateSacrificeInput,
  pointId: number | string = 1
): Promise<NormalizedSummary> {
  const categoryId = Number(input.sacrificeCategory_Id) || 1;
  const values =
    `${input.id}#${(input.name ?? "").trim()}#${Number(input.price) || 0}#${input.isActive ? 1 : 0}#${categoryId}`;

  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.ADD_SACRIFICE_TYPE,
    WantedAction: 1,
    ColumnsValues: values,
    ColumnsNames: "Id#SacrificeTypeName#SacrificeTypePrice#IsActive#SacrificeCategory_Id",
    PointId: pointId,
  });

  return analyzeExecution(result);
}
