// src/features/Laws/Services/updateLaw.ts

import { doTransaction, analyzeExecution, PROCEDURE_NAMES } from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";

// الترتيب المطلوب: Id#LawTitle#LawText#LawDate#LawAttachFile

export interface UpdateLawPayload {
    id: number | string; // ID القانون المراد تعديله
    lawTitle: string;
    lawText: string;
    lawDate: string; // YYYY-MM-DD
    lawAttachFile?: string; // اسم الملف المرفق (بعد الرفع)
}

/**
 * دالة لتنسيق التاريخ ليصبح بالشكل DD/MM/YYYY
 */
function formatDate(date: string): string {
    const dateObj = new Date(date);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // الشهر يبدأ من 0
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
}

export async function updateLaw(payload: UpdateLawPayload): Promise<NormalizedSummary> {

    // تنسيق التاريخ بالشكل المطلوب
    const formattedDate = formatDate(payload.lawDate);

    const action = 1; // 1 لـ Update
    
    const columnsValues = [
        String(payload.id), // 1. Id (مفتاح التعديل)
        payload.lawTitle, // 2. LawTitle
        payload.lawText, // 3. LawText
        formattedDate, // 4. LawDate (التاريخ بعد التنسيق)
        payload.lawAttachFile || "", // 5. LawAttachFile
    ].join("#");

    const columnsNames = 'Id#LawTitle#LawText#LawDate#LawAttachFile';
    
    const exec = await doTransaction({
        TableName: PROCEDURE_NAMES.LAW_TABLE_NAME, 
        WantedAction: action,
        ColumnsValues: columnsValues,
        ColumnsNames: columnsNames, 
        PointId: 0, // هوية المستخدم
    });

    return analyzeExecution(exec);
}
