// src/features/Projects/Services/getProjectDashData.ts
import { executeProcedure, analyzeExecution } from "../../../../api/apiClient";
import type { ExecutionResult, NormalizedSummary } from "../../../../api/apiClient";

export async function getOfficeProjectsData(
  officeId: number,
  subventionTypeId: number,
  ZakatOrSadqa: string,
  startNum: number = 0,
  count: number = 50
): Promise<NormalizedSummary> {
  const sqlStartNum = startNum + 1;
  const ProcedureName = "phjR2bFDp5o0FyA7euBbsp/Ict4BDd2zHhHDfPlrwnk=";

  const procedureValues = `${officeId}#${subventionTypeId}#${ZakatOrSadqa}#${sqlStartNum}#${count}`;
  const exec: ExecutionResult = await executeProcedure(
    ProcedureName,
    procedureValues,
    undefined,
    startNum,
    count
  );

  console.log(exec, "🔥 exec (projects data)");
  return analyzeExecution(exec);
}
