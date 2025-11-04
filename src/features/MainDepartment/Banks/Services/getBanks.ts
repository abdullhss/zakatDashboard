import { executeProcedure, PROCEDURE_NAMES, analyzeExecution } from "../../../../api/apiClient";
import type { ExecutionResult, NormalizedSummary } from "../../../../api/apiClient";

/**
 * يجلب قائمة البنوك مع دعم الترقيم.
 * @param startNum Offset: 0, 8, 16...
 * @param count    Fetch/Limit
 */
export async function getBanks(startNum: number, count: number): Promise<NormalizedSummary> {
  // بعض الـ procs بتبدأ العد داخلياً من 1
  const sqlStartNum = startNum + 1;

  // نفس فورمات الـ params (@StartNum#@Count)
  const procedureValues = `${sqlStartNum}#${count}`;
  console.log(procedureValues);
  
  const result: ExecutionResult = await executeProcedure(
    PROCEDURE_NAMES.GET_BANKS_LIST,
    procedureValues,
    undefined,
    startNum,
    count
  );
  console.log(result);
  
  return analyzeExecution(result);
}
