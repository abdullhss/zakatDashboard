// src/features/Payments/Services/addPaymentApproval.ts (الكود الكامل المُعدَّل)

import { doTransaction, analyzeExecution, PROCEDURE_NAMES } from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";
import { getSession } from "../../../../session"; 

// تعريف مدخلات عملية الموافقة
export interface PaymentApprovalPayload {
    paymentId: number | string;
    isApproved: boolean; // true للقبول، false للرفض
}

/**
 * تنفذ عملية إضافة سجل موافقة/رفض الدفع في جدول Payment_Approvement.
 */
export async function addPaymentApproval(payload: PaymentApprovalPayload): Promise<NormalizedSummary> {
    
    const { userId } = getSession(); 
    const action = 0; 
    const approvalId = 0; 
    const approvedBy = userId ?? 0; 
    
    // === 1. تنسيق التاريخ بصيغة DD/MM/YYYY ===
    const now = new Date();
    // الحصول على اليوم والشهر والسنة
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // الشهر يبدأ من 0
    const year = now.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    
    // الجمع مع الوقت (HH:MM:SS) للحصول على التنسيق المطلوب للخادم
    const time = now.toTimeString().slice(0, 8);
    const dateValue = `${formattedDate} ${time}`; 
    
    // === 2. تحويل IsApproved إلى سلسلة نصية "True" أو "False" ===
    const isApprovedString = payload.isApproved ? "True" : "False";

    // الترتيب المطلوب: Id#Payment_Id#IsApproved#ApprovedDate#ApprovedBy
    const columnsValues = 
        `${approvalId}#` + 
        `${payload.paymentId}#` + 
        `${isApprovedString}#` + // ✅ استخدام "True" / "False"
        `${dateValue}#` + // ✅ استخدام التنسيق DD/MM/YYYY HH:MM:SS
        `${approvedBy}`; 

    // أسماء الأعمدة لتحديد الترتيب
    const columnsNames = 'Id#Payment_Id#IsApproved#ApprovedDate#ApprovedBy';
    
    // استخدام doTransaction
    const exec = await doTransaction({
        TableName: PROCEDURE_NAMES.PAYMENT_APPROVAL_TABLE, 
        WantedAction: 0, // 0: Insert (إضافة سجل موافقة جديد)
        ColumnsValues: columnsValues,
        ColumnsNames: columnsNames, 
        PointId: userId ?? 0, 
    });

    const summary = analyzeExecution(exec);
    if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
        throw new Error(summary.message || `فشل في تسجيل حالة الموافقة.`); 
    }
    return summary;
}