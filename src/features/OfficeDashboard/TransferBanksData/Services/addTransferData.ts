// src/features/Transfers/Services/transferMoney.ts

import { doTransaction, analyzeExecution, PROCEDURE_NAMES } from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";
import { getSession } from "../../../../session";

/**
 * تنسيق التاريخ إلى dd/MM/yyyy
 */
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export interface TransferMoneyPayload {
  officeId: number | string;
  transferDate: string; // يمكن إدخالها بأي صيغة، سيتم تحويلها تلقائيًا
  fromBankId: number | string;
  fromAccountNum: string;
  toBankId: number | string;
  toAccountNum: string;
  transferValue: number | string;
}

const scrub = (v: unknown) => String(v ?? "").replace(/#/g, "");

export async function transferMoney(payload: TransferMoneyPayload): Promise<NormalizedSummary> {
  const { userId } = getSession();
  const action = 0; // 0 for Insert

  const transferBy = userId ?? 0;
  const transferDate = formatDate(payload.transferDate); // ✅ تنسيق التاريخ هنا
  const id = 0; // Id (لـ Insert)

  const columnsValues = [
    String(id),
    String(payload.officeId),
    transferDate,
    String(payload.fromBankId),
    scrub(payload.fromAccountNum),
    String(payload.toBankId),
    scrub(payload.toAccountNum),
    String(payload.transferValue),
    String(transferBy),
  ].join("#");

  const columnsNames =
    "Id#Office_Id#TransferDate#From_Bank_Id#From_AccountNum#To_Bank_Id#To_AccountNum#TransferValue#TransferBy";

  const exec = await doTransaction({
    TableName: PROCEDURE_NAMES.TRANSFER_MONEY_TABLE,
    WantedAction: action,
    ColumnsValues: columnsValues,
    ColumnsNames: columnsNames,
    PointId: 0,
  });

  return analyzeExecution(exec);
}
