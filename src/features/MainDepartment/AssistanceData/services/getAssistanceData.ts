    
import { analyzeExecution, executeProcedure, PROCEDURE_NAMES } from "../../../../api/apiClient";
import type { ExecutionResult, NormalizedSummary } from "../../../../api/apiClient";


/**
 * @param officeId 
 * @param subventionTypeId 
 * @param startNum
 * @param count
 * @returns 
 */
export async function getAssistanceData(
    officeId: number | string,
    subventionTypeId: number | string,
    startNum: number = 0, 
    count: number = 10,   
): Promise<NormalizedSummary> {
    
    const sqlStartNum = startNum + 1; 

    const procedureValues = 
        `${officeId}#${subventionTypeId}#${sqlStartNum}#${count}`;
    
    const ProcedureName = PROCEDURE_NAMES.GET_DASH_ASSISTANCES_DATA; 

    const result: ExecutionResult = await executeProcedure(
        ProcedureName,
        procedureValues,
        undefined, 
        startNum,  
        count        );
    
    return analyzeExecution(result);
}