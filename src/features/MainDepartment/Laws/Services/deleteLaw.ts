// src/features/Laws/Services/deleteLaw.ts

import { doTransaction, analyzeExecution, PROCEDURE_NAMES } from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";
import { getSession } from "../../../../session"; 

// الترتيب المطلوب للحذف يكتفي عادةً بالـ Id فقط
export interface DeleteLawPayload {
    id: number | string; // ID القانون المراد حذفه
}

/**
 * تنفذ عملية حذف قانون/لائحة موجودة (WantedAction: 2).
 */
export async function deleteLaw(payload: DeleteLawPayload): Promise<NormalizedSummary> {
    
    const { userId } = getSession(); 
    const action = 2; // 2 لـ Delete
    
    // === بناء سلسلة القيم: Id فقط ===
    const columnsValues = String(payload.id); // نرسل فقط ID القانون المراد حذفه
  
    // أسماء الأعمدة لتحديد الترتيب (Id فقط)
    const columnsNames = 'Id';

    const exec = await doTransaction({
        TableName: PROCEDURE_NAMES.LAW_TABLE_NAME, // اسم جدول القوانين المشفر
        WantedAction: action,
        ColumnsValues: columnsValues,
        ColumnsNames: columnsNames, 
        PointId: userId ?? 0, // هوية المستخدم
    });

    return analyzeExecution(exec);
}