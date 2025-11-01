// src/features/Offices/Services/getActiveOffices.ts

import { executeProcedure, analyzeExecution, PROCEDURE_NAMES } from "../../../../api/apiClient";
import type { ExecutionResult, NormalizedSummary } from "../../../../api/apiClient";
import { getSession } from "../../../../session"; // لاستخدام getSession

/**
 * يجلب قائمة المكاتب المفعلة (Active Offices) بناءً على هوية المستخدم.
 * @param userId - ID المستخدم (لتحديد سياق الجلسة).
 * @returns Promise<NormalizedSummary> - نتيجة موحدة للعملية.
 */
export async function getActiveOffices(userId: number | string): Promise<NormalizedSummary> {
    
    // بناء ParametersValues: @UserId
    const procedureValues = String(userId ?? 0); 
    
    const ProcedureName = PROCEDURE_NAMES.GET_ACTIVE_OFFICES_DATA; 

    // 1. التنفيذ والحصول على النتيجة الخام (بدون Offset/Fetch)
    const exec: ExecutionResult = await executeProcedure(
        ProcedureName,
        procedureValues,
        undefined, 
        // لا نمرر offset و fetch هنا
        
    );
    console.log(exec, "oifhaoufhesuofjknkjlbn 555555");
    
    // 2. التحليل والتوحيد
    return analyzeExecution(exec);
}