// src/features/SubventionTypes/services/add.ts
import {
  doTransaction,
  analyzeExecution,
  PROCEDURE_NAMES,
  type NormalizedSummary,
} from "../../../../api/apiClient";

export type AddSubventionTypeInput = {
  name: string;                // SubventionTypeName
  desc?: string;               // SubventionTypeDesc
  limit?: number | string;     // SubventionTypeLimit
  offices?: number | string;   // Offices
  isActive?: boolean;          // IsActive
};

export async function addSubventionType(
  input: AddSubventionTypeInput
): Promise<NormalizedSummary> {
  const {
    name,
    desc = "",
    limit = "",
    offices = "",
    isActive = true,
  } = input;

  // ترتيب الأعمدة حسب الدوكيومنت:
  // Id#SubventionTypeName#SubventionTypeDesc#SubventionTypeLimit#Offices#IsActive
  const columnsValues = [
    "0",                      // Id للإضافة
    name ?? "",
    desc ?? "",
    String(limit ?? ""),
    String(offices ?? ""),
    isActive ? "1" : "0",
  ].join("#");

  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.SUBVENTION_TYPE_TABLE_NAME,
    WantedAction: 0,                       // Insert
    ColumnsValues: columnsValues,
    ColumnsNames:
      "Id#SubventionTypeName#SubventionTypeDesc#SubventionTypeLimit#Offices#IsActive",
    PointId: 0,                            // حسب تعليماتك: دايمًا 0
  });

  return analyzeExecution(result);
}
