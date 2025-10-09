import { executeProcedure, PROCEDURE_NAMES, analyzeExecution } from "../../../../api/apiClient";
import type { ExecutionResult, NormalizedSummary } from "../../../../api/apiClient";

/**
 * @param startNum 
 * @param count     
 */
export async function getCampaignData(startNum: number, count: number): Promise<NormalizedSummary> {
  const sqlStartNum = startNum + 1; // SQL يبدأ من 1
  const procedureValues = `${sqlStartNum}#${count}`;
  const ProcedureName = PROCEDURE_NAMES.GET_DASH_CAMPAIGNS_DATA;

  const result: ExecutionResult = await executeProcedure(
    ProcedureName,
    procedureValues,
    undefined,
    startNum, 
    count     
  );

  return analyzeExecution(result);
}
