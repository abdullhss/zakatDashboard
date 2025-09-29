// الخدمات الخاصة بالبنوك (إضافة/تعديل/حذف)
import { doTransaction, PROCEDURE_NAMES, analyzeExecution } from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";

// الحقول المتوقعة
export interface BankInput {
  bankName: string;
  bankCode?: string; // اختياري إن كانت موجودة في الجدول
}

// ========== Add ==========
export async function addBank(
  input: BankInput,
  pointId: number | string = 1
): Promise<NormalizedSummary> {
  // نفس الإضافة السابقة (باسم البنك فقط). لو عندك BankCode في الإضافة بدّل ColumnsNames/Values
  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.BANK_TABLE_NAME,
    WantedAction: 0,                         // Insert
    ColumnsValues: `0#${input.bankName}`,    // Id=0 للإضافة
    ColumnsNames: "Id#BankName",
    PointId: pointId,
  });

  return analyzeExecution(result);
}

// ========== Update (WantedAction = 1) ==========

// ========== Delete (WantedAction = 2) ==========
export async function deleteBank(
  id: number | string,
  pointId: number | string = 1
): Promise<NormalizedSummary> {
  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.BANK_TABLE_NAME,
    WantedAction: 2, // Delete
    ColumnsValues: `${id}`,
    ColumnsNames: "Id",
    PointId: pointId,
  });

  return analyzeExecution(result);
}
