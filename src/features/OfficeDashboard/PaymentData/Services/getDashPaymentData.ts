import { executeProcedure, analyzeExecution, PROCEDURE_NAMES } from "../../../../api/apiClient";
import type { ExecutionResult, NormalizedSummary } from "../../../../api/apiClient";

// هذه الدالة تجلب البيانات باستخدام الـ Procedure
export async function getDashPaymentData(
    officeId: number | string, 
    selectedAction : number = 0, 
    startNum: number = 0, 
    count: number = 10,   
): Promise<NormalizedSummary> {
    
    const currentOfficeId = officeId ?? 0; 
    const sqlStartNum = startNum + 1; 

    // بناء المعاملات التي ستُرسل إلى Procedure
    const procedureValues = `${currentOfficeId}#${selectedAction}#${sqlStartNum}#${count}`;
    
    const ProcedureName = PROCEDURE_NAMES.GET_DASH_PAYMENT_DATA; 

    // استدعاء الـ Procedure
    const exec: ExecutionResult = await executeProcedure(
        ProcedureName,
        procedureValues,
        undefined, 
        startNum,  // المدى الذي سيتم جلب البيانات منه
        count      // الحد الأقصى لعدد النتائج
    );
    
    return analyzeExecution(exec);  // تحليل النتيجة التي أُرجعت من الـ Procedure
}
