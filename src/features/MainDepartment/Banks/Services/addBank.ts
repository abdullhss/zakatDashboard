// bankService.ts (جزء الخدمات)

import  { doTransaction, PROCEDURE_NAMES, analyzeExecution } from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";

/**
 * Interface لجدول البنك (لمزيد من الأمان في TypeScript)
 */
interface BankInput {
    bankName: string;
    // يمكن إضافة المزيد من الحقول هنا
}

export async function addBank(
    input: BankInput,
    pointId: number | string = 1 
): Promise<NormalizedSummary> {
    
    const action = 0; 

    const columnsValues = `0#${input.bankName}`; 
    
    const columnsNames = 'Id#BankName'; 

    const result = await doTransaction({
        TableName: PROCEDURE_NAMES.BANK_TABLE_NAME, 
        WantedAction: action,
        ColumnsValues: columnsValues,
        ColumnsNames: columnsNames, 
        PointId: pointId,
    });
    
    return analyzeExecution(result);
}