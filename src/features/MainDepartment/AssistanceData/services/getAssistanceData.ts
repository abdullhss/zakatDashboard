    
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
    status : number | string ,
    startNum: number = 0, 
    count: number = 10,   
): Promise<NormalizedSummary> {
    
    const sqlStartNum = startNum + 1; 
    const role = localStorage.getItem("role")
    var procedureValues ; 
    var ProcedureName ;
    if(role =="O"){
        procedureValues = `${officeId}#${subventionTypeId}#${sqlStartNum}#${count}`;
        ProcedureName = PROCEDURE_NAMES.GET_DASH_ASSISTANCES_DATA; 
    }
    else{
        procedureValues = `${officeId}#${subventionTypeId}#${status}#${sqlStartNum}#${count}`;
        ProcedureName = "BDFv99IH9vmKIsOPuxMbulJM8B49xNXLxfCnqOZfaEw="; 
    }
     

    const result: ExecutionResult = await executeProcedure(
        ProcedureName,
        procedureValues,
        undefined, 
        startNum,  
        count        );
    
    return analyzeExecution(result);
}