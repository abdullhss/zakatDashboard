// import { executeProcedure, PROCEDURE_NAMES, analyzeExecution } from "../../../../api/apiClient";
// import type { ExecutionResult, NormalizedSummary } from "../../../../api/apiClient";
// /**
//  * @param startNum
//  * @param count
//  */
// export async function getZakah(startNum: number, count: number): Promise<NormalizedSummary> {
//     const sqlStartNum = startNum + 1;
//     const procedureValues = `${sqlStartNum}#${count}`
//     const ProcedureName = PROCEDURE_NAMES.GET_ZAKAH_TYPES
    
//     const result: ExecutionResult = await executeProcedure(
//         ProcedureName,
//         procedureValues,
//         startNum,
//         count
//     )
//     return analyzeExecution(result)
// }
// src/features/ZakahTypes/services/getZakah.ts
import {
  executeProcedure,
  PROCEDURE_NAMES,
  analyzeExecution,
  type ExecutionResult,
  type NormalizedSummary,
} from "../../../../api/apiClient";

/**
 * @param startNum 
 * @param count    
 */
export async function getZakah(startNum: number, count: number): Promise<NormalizedSummary> {
  const sqlStartNum = startNum + 1;
  const procedureValues = `${sqlStartNum}#${count}`;
  const ProcedureName = PROCEDURE_NAMES.GET_ZAKAH_TYPES;


  const result: ExecutionResult = await executeProcedure(
    ProcedureName,
    procedureValues,
    undefined,       
    startNum,         
    count            
  );

  return analyzeExecution(result);
}
