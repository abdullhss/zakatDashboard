// src/features/AboutUs/Services/getAboutUs.ts
import { executeProcedure, analyzeExecution, PROCEDURE_NAMES } from "../../../../api/apiClient";
import type { ExecutionResult, NormalizedSummary } from "../../../../api/apiClient";

// ملاحظة: تم حذف `getSession` لأننا لا نحتاج إليها هنا
/**
 * يجلب بيانات صفحة "من نحن" (About Us).
 * @param userId
 * @returns Promise<NormalizedSummary> - نتيجة موحدة للعملية.
 */
export async function getAboutUs(userId: number | string): Promise<NormalizedSummary> {

    const procedureValues = String(userId ?? 0); 
    
    const ProcedureName = PROCEDURE_NAMES.GET_ABOUT_US_DATA; 

    const exec: ExecutionResult = await executeProcedure(
        ProcedureName,
        procedureValues,
        undefined, 
    );
    
    // 2. التحليل والتوحيد
    return analyzeExecution(exec);
}
