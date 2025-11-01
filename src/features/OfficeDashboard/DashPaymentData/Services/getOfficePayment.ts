// src/features/OfficeDashboard/Payments/Services/getOfficePayment.ts

import { executeProcedure, analyzeExecution, PROCEDURE_NAMES } from "../../../../api/apiClient";
import type { ExecutionResult, NormalizedSummary } from "../../../../api/apiClient";

/**
 * يجلب بيانات مدفوعات مكتب محدد مع دعم الترقيم.
 * ParametersValues = @OfficeId#@StartNum#@Count
 * @param officeId - ID المكتب المراد التصفية به.
 * @param startNum - Offset.
 * @param count - Fetch Limit.
 * @returns Promise<NormalizedSummary> - نتيجة موحدة للعملية.
 */
export async function getOfficePayment(
    officeId: number | string,
    startNum: number = 0, 
    count: number = 10
): Promise<NormalizedSummary> {
    
    const currentOfficeId = officeId ?? 0;
    const sqlStartNum = startNum + 1; // Start index for SQL (1-based)

    // بناء ParametersValues: @OfficeId#@StartNum#@Count
    const procedureValues = `${currentOfficeId}#${sqlStartNum}#${count}`; 
    
    const ProcedureName = PROCEDURE_NAMES.GET_DASH_OFFICE_PAYMENTS_DATA; 

    // 1. التنفيذ والحصول على النتيجة الخام
    const exec: ExecutionResult = await executeProcedure(
        ProcedureName,
        procedureValues,
        undefined, 
        startNum,  // Offset
        count      // Fetch
    );
    
    // 2. التحليل والتوحيد
    return analyzeExecution(exec);
}