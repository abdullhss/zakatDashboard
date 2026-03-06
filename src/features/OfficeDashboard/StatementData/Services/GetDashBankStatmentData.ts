// src/features/BankStatements/Services/getDashBankStatmentData.ts (بعد التعديل)

import { executeProcedure, analyzeExecution, PROCEDURE_NAMES } from "../../../../api/apiClient";
import type { ExecutionResult, NormalizedSummary } from "../../../../api/apiClient";

export interface StatementParams {
    officeId: number | string;
    accountNum: string;   // يمكن أن يكون فارغًا الآن
    fromDate: string;     // YYYY-MM-DD
    toDate: string;       // YYYY-MM-DD
}

export async function getDashBankStatmentData(
    params: StatementParams,
    startNum: number = 0, 
    count: number = 10
): Promise<NormalizedSummary> {
    
    // ✅ لم نعد نتحقق من وجود رقم الحساب، نترك الأمر للـ backend
    
    const sqlStartNum = startNum + 1; // SQL pagination يبدأ من 1
    
    const procedureValues = 
        `${params.officeId}#${params.accountNum}#${params.fromDate}#${params.toDate}#${sqlStartNum}#${count}`; 
    
    const ProcedureName = PROCEDURE_NAMES.GET_STATEMENT_DATA; 

    const exec: ExecutionResult = await executeProcedure(
        ProcedureName,
        procedureValues,
        undefined, 
        startNum,  // Offset
        count      // Fetch
    );
    
    return analyzeExecution(exec);
}