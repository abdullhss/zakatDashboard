// src/features/MainDepartment/Banks/Services/addBank.ts
import { doTransaction, PROCEDURE_NAMES, analyzeExecution } from "../../../../api/apiClient";
import type { NormalizedSummary, ExecutionResult } from "../../../../api/apiClient";

/** نموذج الإدخال */
interface BankInput { bankName: string; }

/** تأمين رمز # داخل القيم */
const packValues = (parts: (string | number | null | undefined)[]) =>
  parts.map(v => (v == null ? "" : String(v)).replace(/#/g, "##")).join("#");

/** هل النتيجة فشل داخلي من السيرفر (رسالة نصية)؟ */
const isServerError = (res: ExecutionResult) =>
  !res.success || (res as any)?.decrypted?.error;

/**
 * إضافة بنك — مع Fallback تلقائي بين:
 * 1) Id#BankName  -> "#<name>"
 * 2) Id#Bank      -> "#<name>"
 * 3) BankName     -> "<name>"
 * 4) Bank         -> "<name>"
 */
export async function addBank(
  input: BankInput,
  pointId: number | string = 0
): Promise<NormalizedSummary> {
  const name = (input.bankName ?? "").trim();

  // محاولات بالتسلسل
  const attempts = [
    { ColumnsNames: "Id#BankName", ColumnsValues: packValues(["", name]) },
    { ColumnsNames: "Id#Bank",     ColumnsValues: packValues(["", name]) },
    { ColumnsNames: "BankName",    ColumnsValues: packValues([name])     },
    { ColumnsNames: "Bank",        ColumnsValues: packValues([name])     },
  ];

  let last: ExecutionResult | null = null;

  for (const a of attempts) {
    const res = await doTransaction({
      TableName: PROCEDURE_NAMES.BANK_TABLE_NAME, 
      WantedAction: 0, // Insert
      ColumnsValues: a.ColumnsValues,
      ColumnsNames:  a.ColumnsNames,
      PointId: pointId,
    });

    last = res;
    if (!isServerError(res)) {
      return analyzeExecution(res);
    }

    const errTxt = ((res as any)?.decrypted?.error || "").toString();
    if (!/Fields|valid|table|columns/i.test(errTxt)) {
      return analyzeExecution(res);
    }
  }

  return analyzeExecution(last as ExecutionResult);
}
