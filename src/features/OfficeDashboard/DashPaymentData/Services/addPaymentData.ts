// src/features/OfficeDashboard/Payments/Services/addPaymentData.ts

import {
  doTransaction,
  analyzeExecution,
  PROCEDURE_NAMES,
} from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";
import { getSession } from "../../../../session";

// ✅ الترتيب المطلوب للحقول:
// Id#PaymentDate#PaymentDesc#PaymentValue#Action_Id#SubventionType_Id#Project_Id#Office_Id#Bank_Id#AccountNum#AttachmentPhotoName#WorkUser_Id#UsersCount

export interface AddPaymentPayload {
  paymentDate: string; // dd/MM/yyyy أو yyyy-MM-dd
  paymentValue: number | string;
  actionId: number | string;
  subventionTypeId: number | string;
  projectId: number | string;
  bankId: number | string;
  accountNum: string;
  usersCount: number;
  zakahName: string; // اسم نوع الزكاة (يتخزن في PaymentDesc)
}

const scrub = (v: unknown) => String(v ?? "").replace(/#/g, "");

// ✅ تنسيق التاريخ بالشكل المطلوب (dd/MM/yyyy)
const formatDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return scrub(dateStr); // fallback لو التاريخ غير صالح
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`; // ✅ dd/MM/yyyy
};

export async function addPaymentData(
  payload: AddPaymentPayload
): Promise<NormalizedSummary> {
  const { userId, officeId } = getSession();

  const id = 0;
  const action = 0; 
  const workUserId = userId ?? 0;
  const currentOfficeId = officeId ?? 0;

  // ✅ استخدم اسم الزكاة كـ PaymentDesc
  const paymentDesc = scrub(payload.zakahName || "");

  // ✅ لو مفيش مرفق نحط "0"
  const attachmentValue = "0";

  // ✅ تنسيق التاريخ
  const formattedDate = formatDate(payload.paymentDate);

  // ✅ بناء القيم بالترتيب الصحيح
  const columnsValues = [
    String(id), 
    formattedDate,
    paymentDesc, 
    String(payload.paymentValue),
    String(payload.actionId),
    String(payload.subventionTypeId), 
    String(payload.projectId), 
    String(currentOfficeId), 
    String(payload.bankId),
    scrub(payload.accountNum), 
    String(workUserId), 
    String(payload.usersCount || 0), 
  ].join("#");

  // ✅ أسماء الأعمدة بالترتيب الصحيح
  const columnsNames =
    "Id#PaymentDate#PaymentDesc#PaymentValue#Action_Id#SubventionType_Id#Project_Id#Office_Id#Bank_Id#AccountNum#WorkUser_Id#UsersCount";

  // ✅ تنفيذ العملية
  const exec = await doTransaction({
    TableName: PROCEDURE_NAMES.OFFICE_PAYMENT_TABLE,
    WantedAction: action,
    ColumnsValues: columnsValues,
    ColumnsNames: columnsNames,
    PointId: 0,
    // DataToken: "Zakat", // ثابت لأنها زكاة
  });

  // ✅ تحليل النتيجة وإرجاعها
  return analyzeExecution(exec);
}
