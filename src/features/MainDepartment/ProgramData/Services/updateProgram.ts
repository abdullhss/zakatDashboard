// src/features/Program/Services/updateProgram.ts

import { doTransaction, analyzeExecution, PROCEDURE_NAMES } from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";

export interface UpdateProgramPayload {
  id: number | string;
  aboutUs?: string;
  contactUs?: string;
  useConditions?: string;
  privacyPolicy?: string;
}

// دالة تنظيف النصوص من الرموز الغير مرغوبة
const scrub = (v: unknown) => String(v ?? "").replace(/#/g, "");

/**
 * دالة لتحديث حقل واحد فقط من جدول Program.
 * تبعت Id + اسم العمود + القيمة الجديدة فقط.
 */
export async function updateProgram(payload: UpdateProgramPayload): Promise<NormalizedSummary> {
  const action = 1; // 1 = Update
  const pointId = 0;

  // تحديد العمود اللي تم إرساله فعلاً
  let columnName = "";
  let columnValue = "";

  if (payload.aboutUs !== undefined) {
    columnName = "AboutUs";
    columnValue = scrub(payload.aboutUs);
  } else if (payload.contactUs !== undefined) {
    columnName = "ContactUs";
    columnValue = scrub(payload.contactUs);
  } else if (payload.useConditions !== undefined) {
    columnName = "UseConditions";
    columnValue = scrub(payload.useConditions);
  } else if (payload.privacyPolicy !== undefined) {
    columnName = "PrivacyPolicy";
    columnValue = scrub(payload.privacyPolicy);
  } else {
    throw new Error("لم يتم تمرير أي حقل لتحديثه.");
  }

  // إعداد أسماء وأعمدة التحديث
  const columnsNames = `Id#${columnName}`;
  const columnsValues = `${payload.id}#${columnValue}`;

  // تنفيذ التحديث في قاعدة البيانات
  const exec = await doTransaction({
    TableName: PROCEDURE_NAMES.PROGRAM_TABLE_NAME,
    WantedAction: action,
    ColumnsNames: columnsNames,
    ColumnsValues: columnsValues,
    PointId: pointId,
  });

  return analyzeExecution(exec);
}
