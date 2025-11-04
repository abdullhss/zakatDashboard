// src/features/SubventionTypes/services/getSubventionTypes.ts
import { executeProcedure, analyzeExecution, PROCEDURE_NAMES, type NormalizedSummary } from "../../../../api/apiClient";

export async function getSubventionTypes(
  offset: number = 0,
  limit: number = 10
): Promise<NormalizedSummary> {
  const startNum = Math.max(1, offset + 1);

  const exec = await executeProcedure(
    PROCEDURE_NAMES.GET_SUBVENTION_TYPES,
    `${startNum}#${limit}`
  );
  return analyzeExecution(exec);
}
