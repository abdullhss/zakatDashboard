// src/features/Program/Services/updateProgram.ts

import { doTransaction, analyzeExecution, PROCEDURE_NAMES } from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";

export interface UpdateProgramPayload {
  id: number | string; // مفتاح التعديل
  aboutUs?: string;
  contactUs?: string;
  useConditions?: string;
  privacyPolicy?: string;
}

// دالة تنظيف البيانات (مُضمَّنة للحماية من علامات الـ #)
const scrub = (v: unknown) => String(v ?? "").replace(/#/g, "");

/**
 * تنفذ عملية تحديث سجل إعدادات البرنامج (WantedAction: 1).
 */
export async function updateProgram(payload: UpdateProgramPayload): Promise<NormalizedSummary> {
  const action = 1; // 1 لـ Update
  const pointId = 0; // PointId الافتراضي

  // جلب البيانات الحالية
  const existingData = await getExistingData(payload.id); // دالة لربط البيانات الحالية من الخادم (يمكنك استخدام getProgramData هنا)

  // إعداد القيم المعدلة فقط
  const columnsValues: string[] = [String(payload.id)];

  // إضافة القيم المعدلة أو القديمة
  columnsValues.push(payload.aboutUs ? scrub(payload.aboutUs) : scrub(existingData.AboutUs));
  columnsValues.push(payload.contactUs ? scrub(payload.contactUs) : scrub(existingData.ContactUs));
  columnsValues.push(payload.useConditions ? scrub(payload.useConditions) : scrub(existingData.UseConditions));
  columnsValues.push(payload.privacyPolicy ? scrub(payload.privacyPolicy) : scrub(existingData.PrivacyPolicy));

  const columnsNames = "Id#AboutUs#ContactUs#UseConditions#PrivacyPolicy";   

  // تنفيذ المعاملة باستخدام doTransaction
  const exec = await doTransaction({
    TableName: PROCEDURE_NAMES.PROGRAM_TABLE_NAME, // نستخدم اسم الجدول الصحيح
    WantedAction: action,
    ColumnsValues: columnsValues.join("#"), // اجمع القيم مع #
    ColumnsNames: columnsNames,
    PointId: pointId,
  });

  return analyzeExecution(exec);
}

// دالة للحصول على البيانات الحالية (يمكنك ربطها بالـ API لديك)
async function getExistingData(id: number | string) {
  const result = await fetch(`/api/getProgramData/${id}`);
  const data = await result.json();
  return data.rows[0];  // إرجاع البيانات الأولى
}
