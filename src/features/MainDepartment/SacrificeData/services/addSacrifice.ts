import { doTransaction, PROCEDURE_NAMES, analyzeExecution } from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";

export interface AddSacrificeInput {
  name: string;
  price: number;
  isActive?: boolean;
  sacrificeCategory_Id: number;
}

export async function addSacrificeType(
  input: AddSacrificeInput,
): Promise<NormalizedSummary> {
  const categoryId = Number(input.sacrificeCategory_Id) || 1;
  const values =
    `0#${(input.name ?? "").trim()}#${Number(input.price) || 0}#${input.isActive === false ? 0 : 1}#${categoryId}`;

  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.ADD_SACRIFICE_TYPE,
    WantedAction: 0,
    ColumnsValues: values,
    ColumnsNames: "Id#SacrificeTypeName#SacrificeTypePrice#IsActive#SacrificeCategory_Id",
    PointId: 0,
  });

  return analyzeExecution(result);
}
