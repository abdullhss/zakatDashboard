// src/features/Users/services/getWorkUsersData.ts
import {
  executeProcedure,
  analyzeExecution,
  type NormalizedSummary,
  PROCEDURE_NAMES,
} from "../../../../api/apiClient";
import { AES256Encryption } from "../../../../utils/encryption";
import { scopeEncSQLToOffice } from "../../../../session";

/** تشفير @EncSQL (مع تقييد تلقائي بالأوفيس لو الدور O) */
function buildEncSQL(rawSQL?: string): string {
  const scoped = scopeEncSQLToOffice(rawSQL || "");
  if (!scoped) return "";
  // استخدم نفس الـ KEY المستخدم عندك
  return AES256Encryption.encrypt(
    scoped,
    "SL@C$@rd2023$$AlMedad$Soft$2022$"
  ) as string;
}

/** استدعاء 109-GetWorkUsersData (StartNum 1-based) */
export async function getWorkUsersData(
  startNum: number = 1,   // 1-based
  count: number = 50,
  encSQLRaw?: string,
  dataToken?: string,
  officeID : number = 0 , 
): Promise<NormalizedSummary> {
  const s = Number.isFinite(startNum) ? Math.trunc(startNum) : 1;
  const c = Number.isFinite(count) ? Math.trunc(count) : 50;

  const startParam = Math.max(1, s);
  const countParam = Math.max(1, c);

  const encSQL = buildEncSQL(encSQLRaw || "");
  const procedureValues = `${startParam}#${countParam}#${encSQL}#${officeID}`;
  console.log(procedureValues);
  
  const execRes = await executeProcedure(
    PROCEDURE_NAMES.GET_WORK_USERS_DATA,
    procedureValues,
    dataToken
  );
  console.log(analyzeExecution(execRes));
  
  return analyzeExecution(execRes);
}
