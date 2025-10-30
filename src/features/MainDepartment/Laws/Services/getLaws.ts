// src/features/Laws/Services/getLaws.ts

import { executeProcedure, analyzeExecution, PROCEDURE_NAMES } from "../../../../api/apiClient";
import type { ExecutionResult, NormalizedSummary } from "../../../../api/apiClient";

/**
 * يجلب بيانات القوانين واللوائح مع دعم الترقيم.
 * @param startNum - Offset (0, 10, 20...).
 * @param count - Fetch Limit.
 * @returns Promise<NormalizedSummary> - نتيجة موحدة للعملية.
 */
export async function getLaws(startNum: number = 0, count: number = 10): Promise<NormalizedSummary> {
    const sqlStartNum = startNum + 1; // Start index for SQL (1-based)

    const procedureValues = `${sqlStartNum}#${count}`; 
    const ProcedureName = PROCEDURE_NAMES.GET_LAWS_DATA; 

    // تنفيذ الاستعلام
    const exec: ExecutionResult = await executeProcedure(ProcedureName, procedureValues, undefined, startNum, count);

    // تحليل النتيجة
    return analyzeExecution(exec);
}
