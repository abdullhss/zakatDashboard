import { doTransaction, PROCEDURE_NAMES, analyzeExecution } from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";
import type { BankInput } from "./deleteBank";
export async function updateBank(
  id: number | string,
  input: BankInput,
  pointId: number | string = 1
): Promise<NormalizedSummary> {
  const hasCode = !!(input.bankCode && String(input.bankCode).trim());
  const ColumnsNames = hasCode ? "Id#BankName#BankCode" : "Id#BankName";
  const ColumnsValues = hasCode
    ? `${id}#${input.bankName}#${input.bankCode}`
    : `${id}#${input.bankName}`;

  const result = await doTransaction({
    TableName: PROCEDURE_NAMES.BANK_TABLE_NAME,
    WantedAction: 1, // Update
    ColumnsValues,
    ColumnsNames,
    PointId: pointId,
  });

  return analyzeExecution(result);
}
