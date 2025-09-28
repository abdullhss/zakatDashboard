import { executeProcedure, PROCEDURE_NAMES, analyzeExecution } from "../../../../api/apiClient";
import type { ExecutionResult, NormalizedSummary } from "../../../../api/apiClient";

/**
 * @param startNum 
 * @param count    
 */
export async function getCities(startNum: number, count: number): Promise<NormalizedSummary> {
  // بعض الأنظمة تبدأ العد من 1 داخل SQL
  const sqlStartNum = startNum + 1;

  // بناء ParametersValues: @StartNum#@Count
  const procedureValues = `${sqlStartNum}#${count}`;
  const ProcedureName = PROCEDURE_NAMES.GET_CITIES_LIST;

  const result: ExecutionResult = await executeProcedure(
    ProcedureName,
    procedureValues,
    undefined,
    startNum, // Offset (في الـ JSON المشفر)
    count     // Fetch
  );

  return analyzeExecution(result);
}
