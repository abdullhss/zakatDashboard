// src/features/Laws/Services/addLaw.ts

import { doTransaction, analyzeExecution, PROCEDURE_NAMES } from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";
import { getSession } from "../../../../session"; 

// الترتيب المطلوب: Id#LawTitle#LawText#LawDate#LawAttachFile

export interface AddLawPayload {
    lawTitle: string;
    lawText: string;
    lawDate: string; // YYYY-MM-DD
    lawAttachFile?: string; // اسم الملف المرفق (بعد الرفع)
}

/**
 * تنفذ عملية إضافة قانون/لائحة جديدة (WantedAction: 0).
 */
export async function addLaw(payload: AddLawPayload): Promise<NormalizedSummary> {
    
    const { userId } = getSession(); 
    const action = 0; // 0 for Insert

    // === تحويل التاريخ من الشكل "YYYY-MM-DD" إلى "DD/MM/YYYY" ===
    const formattedDate = formatDate(payload.lawDate);

    // === بناء سلسلة القيم (5 قيم) ===
    const columnsValues = [
        "0", // 1. Id (لـ Insert)
        payload.lawTitle, // 2. LawTitle
        payload.lawText, // 3. LawText
        formattedDate, // 4. LawDate
        payload.lawAttachFile || "", // 5. LawAttachFile
    ].join("#");

    // أسماء الأعمدة لتحديد الترتيب (موصى بها)
    const columnsNames = 'Id#LawTitle#LawText#LawDate#LawAttachFile';
    
    const exec = await doTransaction({
        TableName: PROCEDURE_NAMES.LAW_TABLE_NAME, // اسم جدول القوانين المشفر
        WantedAction: action,
        ColumnsValues: columnsValues,
        ColumnsNames: columnsNames, 
        PointId: 0, // ✅ هوية المستخدم كـ PointId
    });

    return analyzeExecution(exec);
}

/**
 * دالة لتحويل التاريخ من الشكل "YYYY-MM-DD" إلى "DD/MM/YYYY"
 */
function formatDate(date: string): string {
    const dateObj = new Date(date);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // الشهر يبدأ من 0
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
}
