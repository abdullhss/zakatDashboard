// src/features/Users/services/getWorkUsersData.ts
import {
  executeProcedure,
  analyzeExecution,
  type NormalizedSummary,
  PROCEDURE_NAMES,
} from "../../../../api/apiClient";
import { AES256Encryption } from "../../../../utils/encryption";

/** تشفير @EncSQL إن وُجدت */
function buildEncSQL(rawSQL?: string): string {
  if (!rawSQL) return "";
  // استخدم نفس PUBLIC_KEY لديك
  return AES256Encryption.encrypt(
    rawSQL,
    "SL@C$@rd2023$$AlMedad$Soft$2022$"
  ) as string;
}

/** استدعاء 109-GetWorkUsersData (مع 1-based StartNum) */
export async function getWorkUsersData(
  startNum: number = 1,  // ← 1-based
  count: number = 50,
  encSQLRaw?: string,
  dataToken?: string
): Promise<NormalizedSummary> {
  const s = Number.isFinite(startNum) ? Math.trunc(startNum) : 1;
  const c = Number.isFinite(count) ? Math.trunc(count) : 50;

  const startParam = Math.max(1, s);  // أحزمة أمان
  const countParam = Math.max(1, c);

  const encSQL = buildEncSQL(encSQLRaw || "");
  const procedureValues = `${startParam}#${countParam}#${encSQL}`;

  const execRes = await executeProcedure(
    PROCEDURE_NAMES.GET_WORK_USERS_DATA,
    procedureValues,
    dataToken
  );

  return analyzeExecution(execRes);
}
