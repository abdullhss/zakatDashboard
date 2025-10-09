// services/assistanceService.ts

import { analyzeExecution, executeProcedure, PROCEDURE_NAMES } from "../../../../api/apiClient";
import type { ExecutionResult, NormalizedSummary } from "../../../../api/apiClient";


/**
 * يجلب بيانات طلبات الإعانات الداش بورد مع التصفية والترقيم.
 * @param officeId - ID المكتب المراد التصفية به.
 * @param subventionTypeId - ID نوع الإعانة المراد التصفية به.
 * @param startNum - العدد الذي يبدأ منه (Offset).
 * @param count - عدد الصفوف المراد جلبها (Fetch).
 * @returns Promise<NormalizedSummary> - نتيجة موحدة للعملية.
 */
export async function getAssistanceData(
    officeId: number | string,
    subventionTypeId: number | string,
    startNum: number = 0, 
    count: number = 10,   
): Promise<NormalizedSummary> {
    
    // النظام يتوقع أن يبدأ العد في الـ SQL من 1 للبارامتر @StartNum#@Count
    const sqlStartNum = startNum + 1; 

    // بناء ParametersValues: @OfficeId#@SubventionTypeId#@StartNum#@Count
    const procedureValues = 
        `${officeId}#${subventionTypeId}#${sqlStartNum}#${count}`;
    
    const ProcedureName = PROCEDURE_NAMES.GET_DASH_ASSISTANCES_DATA; 

    // 1. التنفيذ والحصول على النتيجة الخام
    const result: ExecutionResult = await executeProcedure(
        ProcedureName,
        procedureValues,
        undefined, 
        startNum,  // Offset (لخاصية الـ JSON المشفرة)
        count      // Fetch (لخاصية الـ JSON المشفرة)
    );
    
    // 2. التحليل والتوحيد (يتم مرة واحدة)
    return analyzeExecution(result);
}