import { doTransaction, PROCEDURE_NAMES, analyzeExecution } from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";

export interface AddSacrificeInput {
  name: string;
  price: number;
  isActive?: boolean; // default true
}
export async function addSacrificeType(
  input: AddSacrificeInput,

): Promise<NormalizedSummary> {
  const values =
    `0#${(input.name ?? "").trim()}#${Number(input.price) || 0}#${input.isActive === false ? 0 : 1}`;

  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.ADD_SACRIFICE_TYPE, // yjhWQPC+X9N5+2FVbLegdw==
    WantedAction: 0, 
    ColumnsValues: values,
    ColumnsNames: "Id#SacrificeTypeName#SacrificeTypePrice#IsActive",
    PointId: 0,

  });

  return analyzeExecution(result);
}
