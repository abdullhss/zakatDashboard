import { doTransaction, PROCEDURE_NAMES, analyzeExecution } from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";

export interface AddSacrificeInput {
  name: string;
  price: number;
  isActive?: boolean; // default true
}

/**
 * DoTransaction:
 *  TableName: yjhWQPC+X9N5+2FVbLegdw== (ADD_SACRIFICE_TYPE)
 *  WantedAction: 0 (Insert)
 *  ColumnsValues: Id#SacrificeTypeName#SacrificeTypePrice#IsActive
 *  ColumnsNames: اختياري لكن بنبعته زي Cities
 *  PointId: افتراضي 1 (زي cityService)
 */
export async function addSacrificeType(
  input: AddSacrificeInput,
  pointId: number | string = 1
): Promise<NormalizedSummary> {
  const values =
    `0#${(input.name ?? "").trim()}#${Number(input.price) || 0}#${input.isActive === false ? 0 : 1}`;

  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.ADD_SACRIFICE_TYPE, // yjhWQPC+X9N5+2FVbLegdw==
    WantedAction: 0, // Insert
    ColumnsValues: values,
    ColumnsNames: "Id#SacrificeTypeName#SacrificeTypePrice#IsActive",
    PointId: pointId,
    // لو doTransaction بيضيف DataToken تلقائيًا زي Cities سيبها؛
    // لو لازم صراحة: أضف DataToken: "Zakat"
  });

  return analyzeExecution(result);
}
