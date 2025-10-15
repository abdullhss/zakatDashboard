// src/features/MainDepartment/SacrificeData/Services/getSacrificesDashData.ts

import { executeProcedure, analyzeExecution, PROCEDURE_NAMES } from "../../../../api/apiClient";
import type { ExecutionResult, NormalizedSummary } from "../../../../api/apiClient";
import { getSession } from "../../../../session";

const GET_SACRIFICES_DASH_DATA = "GET_DASH_SACRIFICES_DATA"; 

/**
 * يجلب بيانات طلبات الأضاحي الداش بورد مع الترقيم والتصفية حسب المكتب.
 * @param officeId - ID المكتب المراد التصفية به (0 للكل).
 * @param startNum - Offset.
 * @param count - Fetch Limit.
 * @returns Promise<NormalizedSummary> - نتيجة موحدة للعملية.
 */
export async function getSacrificesDashData(
    officeId: number | string, // الآن يستقبل OfficeId
    startNum: number = 0, 
    count: number = 10,   
): Promise<NormalizedSummary> {
    
    // نستخدم OfficeId المرسل من الصفحة (والذي يمكن أن يكون 0 للكل)
    const currentOfficeId = officeId ?? 0; 
    const sqlStartNum = startNum + 1; 

    // بناء ParametersValues: @OfficeId#@StartNum#@Count
    // هذا هو الترتيب الذي يتوقعه الـ API
    const procedureValues = 
        `${currentOfficeId}#${sqlStartNum}#${count}`;
    
    const ProcedureName = PROCEDURE_NAMES.GET_SACRIFICES_DASH_DATA; 

    const exec: ExecutionResult = await executeProcedure(
        ProcedureName,
        procedureValues,
        undefined, 
        startNum,  // Offset لخاصية الـ JSON المشفرة
        count      // Fetch لخاصية الـ JSON المشفرة
    );
    
    return analyzeExecution(exec);
}