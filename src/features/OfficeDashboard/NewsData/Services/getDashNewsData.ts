import { executeProcedure, analyzeExecution, PROCEDURE_NAMES, type NormalizedSummary, type ExecutionResult } from "../../../../api/apiClient";

/**
 * يجلب البيانات الجديدة (News Data) للداش بورد مع التصفية والترقيم.
 * @param officeId - ID المكتب المراد التصفية به (0 للكل).
 * @param startNum - Offset (0, 10, 20...).
 * @param count - Fetch Limit.
 * @returns 
 */
export async function getDashNewData(
    officeId: number | string,
    startNum: number = 0,
    count: number = 10,
) : Promise<NormalizedSummary> {
    
    const currentOfficeId = officeId ?? 0;
    const sqlStartNum = startNum + 1; // Start index for SQL (usually 1-based)

    // بناء ParametersValues: @OfficeId#@StartNum#@Count
    const procedureValues = `${currentOfficeId}#${sqlStartNum}#${count}`;

    const ProcedureName = PROCEDURE_NAMES.GET_DASH_NEWS_DATA;

    // ✅ تم التصحيح: استخدام الأقواس العادية () لنداء الدالة
    const exec: ExecutionResult = await executeProcedure(
        ProcedureName,
        procedureValues,
        undefined, // DataToken (يستخدم الافتراضي)
        startNum,  // Offset لخاصية الـ JSON المُشفَّر
        count      // Fetch لخاصية الـ JSON المُشفَّر
    );
    
    // تحليل وتوحيد النتيجة
    return analyzeExecution(exec);
}