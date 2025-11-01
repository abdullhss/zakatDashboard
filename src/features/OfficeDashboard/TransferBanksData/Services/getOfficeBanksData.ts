import { executeProcedure, analyzeExecution, PROCEDURE_NAMES } from "../../../../api/apiClient";
import type { ExecutionResult, NormalizedSummary } from "../../../../api/apiClient";
import { getSession } from "../../../../session";

export interface OfficeBankParams {
    officeId: number | string;
    accountTypeId: number | string;
    serviceTypeId: number | string;
    paymentMethodId: number | string;
}


export async function getOfficeBanksData(
    params: OfficeBankParams,
    startNum: number = 0,
    count: number = 20
): Promise<NormalizedSummary> {

    const procedureValues =
        `${params.officeId}#${params.accountTypeId}#${params.serviceTypeId}#${params.paymentMethodId}`;

    const ProcedureName = PROCEDURE_NAMES.GET_OFFICE_BANKS_DATA;

    const exec: ExecutionResult = await executeProcedure(
        ProcedureName,
        procedureValues,
        undefined,
        startNum,  
        count    
    );

    return analyzeExecution(exec);
}