// src/features/Transfers/Services/getTransferMoney.ts

import { executeProcedure, analyzeExecution, PROCEDURE_NAMES } from "../../../../api/apiClient";
import type { ExecutionResult, NormalizedSummary } from "../../../../api/apiClient";

/**
 * يجلب بيانات سجلات تحويل الأموال (Transfers Data) مع دعم الترقيم.
 * ParametersValues = @StartNum#@Count
 * @param startNum - Offset (0, 10, 20...).
 * @param count - Fetch Limit.
 * @returns Promise<NormalizedSummary> - نتيجة موحدة للعملية.
 */
export async function getTransferMoney(
    startNum: number = 0, 
    count: number = 10
): Promise<NormalizedSummary> {
    
    const sqlStartNum = startNum + 1; // Start index for SQL (1-based)

    // بناء ParametersValues: @StartNum#@Count
    const procedureValues = `${sqlStartNum}#${count}`; 
    
    const ProcedureName = PROCEDURE_NAMES.GET_TRANSFER_MONEYS_DATA; 

    // 1. التنفيذ والحصول على النتيجة الخام
    const exec: ExecutionResult = await executeProcedure(
        ProcedureName,
        procedureValues,
        undefined, 
        startNum,  // Offset لخاصية الـ JSON المشفرة
        count      // Fetch لخاصية الـ JSON المشفرة
    );
    
    // 2. التحليل والتوحيد
    return analyzeExecution(exec);
}