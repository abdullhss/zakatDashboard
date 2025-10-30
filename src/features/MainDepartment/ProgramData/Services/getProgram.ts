// src/features/Programs/Services/getPrograms.ts

import { executeProcedure, analyzeExecution, PROCEDURE_NAMES } from "../../../../api/apiClient";
import type { ExecutionResult, NormalizedSummary } from "../../../../api/apiClient";

/**
 * يجلب بيانات البرامج المتاحة بناءً على هوية المستخدم.
 * @param userId - ID المستخدم المراد جلب برامجه (@User).
 * @returns Promise<NormalizedSummary> - نتيجة موحدة للعملية.
 */
export async function getPrograms(userId: number | string): Promise<NormalizedSummary> {
    
    // بناء ParametersValues: @User
    const procedureValues = String(userId ?? 0); 
    
    const ProcedureName = PROCEDURE_NAMES.GET_PROGRAM_DATA; 

    // 1. التنفيذ والحصول على النتيجة الخام (بدون Offset/Fetch)
    const exec: ExecutionResult = await executeProcedure(
        ProcedureName,
        procedureValues,
        undefined, 
        // لا نمرر offset و fetch هنا
    );
    
    // 2. التحليل والتوحيد
    return analyzeExecution(exec);
}