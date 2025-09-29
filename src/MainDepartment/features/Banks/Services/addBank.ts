// bankService.ts (جزء الخدمات)

import  { doTransaction, PROCEDURE_NAMES, analyzeExecution } from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";

/**
 * Interface لجدول البنك (لمزيد من الأمان في TypeScript)
 */
interface BankInput {
    bankName: string;
    // يمكن إضافة المزيد من الحقول هنا
}

export async function addBank(
    input: BankInput,
    pointId: number | string = 1 
): Promise<NormalizedSummary> {
    
    // 1. تحديد الإجراء المطلوب للإضافة (Insert)
    const action = 0; 
    
    // 2. بناء ColumnsValues: 0#BankName
    // Id (0 للإضافة)#BankName (القيمة)
    const columnsValues = `0#${input.bankName}`; 
    
    // 3. تحديد أسماء الأعمدة (Id#BankName)
    const columnsNames = 'Id#BankName'; 

    const result = await doTransaction({
        TableName: PROCEDURE_NAMES.BANK_TABLE_NAME, // اسم جدول البنوك المشفر (يجب أن يكون مُعرفًا في apiClient)
        WantedAction: action,
        ColumnsValues: columnsValues,
        ColumnsNames: columnsNames, 
        PointId: pointId,
    });
    
    // نستخدم analyzeExecution لتوحيد النتيجة
    return analyzeExecution(result);
}