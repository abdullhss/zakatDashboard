// src/features/ZakahGold/Services/getZakahValue.ts

import { executeProcedure, analyzeExecution, PROCEDURE_NAMES } from "../../../../api/apiClient";
import type { ExecutionResult, NormalizedSummary } from "../../../../api/apiClient";

/**
 * يجلب قيمة الذهب الحالية للزكاة بناءً على هوية المستخدم.
 * @param userId - ID المستخدم (لتحديد السياق).
 * @returns Promise<NormalizedSummary> - نتيجة موحدة للعملية.
 */
export async function getZakahValue(userId: number | string): Promise<NormalizedSummary> {
    
    // بناء ParametersValues: @User (قيمة واحدة)
    const procedureValues = String(userId ?? 0); 
    
    const ProcedureName = PROCEDURE_NAMES.GET_ZAKAH_GOLD_VALUE; 

    // التنفيذ والحصول على النتيجة الخام (بدون Offset/Fetch)
    const exec: ExecutionResult = await executeProcedure(
        ProcedureName,
        procedureValues,
        undefined, 
    );
    
    // التحليل والتوحيد
    return analyzeExecution(exec);
}