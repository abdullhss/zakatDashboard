// apiClient.ts (النسخة النهائية والنظيفة)

import axios, { type AxiosResponse } from "axios";
import { AES256Encryption } from "../utils/encryption";

export type AnyRec = Record<string, any>;

// ===================================
// 1) الإعدادات
// ===================================
const API_BASE_URL =
  "https://framework.md-license.com:8093/emsserver.dll/ERPDatabaseWorkFunctions";

const API_CONFIG = {
  API_TOKEN: "TTRgG@i$$ol@m$Wegh77",
  PUBLIC_KEY: "SL@C$@rd2023$$AlMedad$Soft$2022$",
  DATA_TOKEN: "Zakat",
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const PROCEDURE_NAMES: Record<string, string> = {
  CHECK_MAIN_USER_LOGIN: "AatVcw3p5EfgNf7N40tSBY8vN7aBpsqvuSbZqL2vAeo=",
  GET_CITIES_LIST: "xR3P2FQ9gQI7pvkeyawk7A==",
  GET_BANKS_LIST: "D9Ivfj9RKABRqAjFR2qD5w==",
  BANK_TABLE_NAME: "7igUjv/3a5Aar+46eK1jiw==", 
CITIES_TABLE_NAME: "jxZ/VX2ZB73RfXPSzeav0g=="
};

const TRANSACTION_ENDPOINT = "/DoTransaction";

// ===================================
// 2) أنواع (النماذج)
// ===================================
interface ProcedureInput {
  ProcedureName: string;
  ParametersValues: string;
  DataToken: string;
  Offset?: number;
  Fetch?: number;
}

interface TransactionInput {
  TableName: string;
  WantedAction: 0 | 1 | 2; 
  ColumnsValues: string;
  PointId: number | string;
  DataToken: string;
  ColumnsNames?: string;
  SendNotification?: 'T' | 'F';
  NotificationProcedure?: string;
  NotificationPranameters?: string;
}

interface DecryptedDataShape {
  Result?: AnyRec[];
  TotalRowsCount?: number | string;
  [k: string]: any;
}

interface DecryptedResponse {
  result?: number | string;
  error?: string;
  data?: DecryptedDataShape | string | null;
  serverTime?: string;
  [k: string]: any;
}

export interface ExecOk {
  success: true;
  code: number;
  rows: AnyRec[];
  row: AnyRec | null;
  meta: {
    total?: number;
    serverTime?: string;
  };
  decrypted: DecryptedResponse;
  raw: AnyRec;
}

export interface ExecErr {
  success: false;
  code?: number;
  error: string;
  decrypted?: DecryptedResponse;
  raw?: AnyRec;
}

export type ExecutionResult = ExecOk | ExecErr;

export type TriState = {
  OK: boolean;
  OK_BUT_EMPTY: boolean;
  INTERNAL_ERROR: boolean;
  FAILURE: boolean;
};

export type NormalizedSummary = {
  flags: TriState;
  code: number | null;
  message: string;
  totalRows: number | null;
  row: AnyRec | null;
  rows: AnyRec[];
  serverTime?: string;
};

// ===================================
// 3) الدوال المساعدة
// ===================================
const isObject = (v: any): v is AnyRec =>
  !!v && typeof v === "object" && !Array.isArray(v);

function parseMaybeJson<T = any>(v: any): T | null {
  if (Array.isArray(v)) return (v as unknown) as T;
  if (isObject(v)) return (v as unknown) as T;
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return null;
    try {
      return JSON.parse(s) as T;
    } catch {
      return null;
    }
  }
  return null;
}

function pickRows(
  dataField: DecryptedResponse["data"]
): { rows: AnyRec[]; row: AnyRec | null; total?: number } {
  if (!dataField || !isObject(dataField)) return { rows: [], row: null, total: 0 };

  const dataObject = dataField as DecryptedDataShape;

  let rows: AnyRec[] = [];
  let total: number | undefined;

  // 1) ابحث عن أي حقل ينتهي بـ Data في المستوى الأعلى (مثال: CitiesData, BankInfo)
  for (const k of Object.keys(dataObject)) {
    if (k.endsWith("Data")) {
      const parsed = parseMaybeJson<AnyRec[]>(dataObject[k]);
      if (parsed && Array.isArray(parsed)) {
        rows = parsed;
        break;
      }
    }
  }

  // 2) إن لم نجد، جرّب داخل Result[0]
  if (!rows.length && Array.isArray(dataObject.Result) && dataObject.Result.length) {
    const r0 = dataObject.Result[0];
    if (isObject(r0)) {
      for (const k of Object.keys(r0)) {
        if (k.endsWith("Data")) {
          const parsed = parseMaybeJson<AnyRec[]>(r0[k]);
          if (parsed && Array.isArray(parsed)) {
            rows = parsed;
            break;
          }
        }
      }
    }
  }

  // 3) fallback نادر: لو Result نفسها مصفوفة سجلات
  if (!rows.length && Array.isArray(dataObject.Result)) {
    rows = dataObject.Result as AnyRec[];
  }

  // === الإجمالي: البحث عن Counts ===
  
  // TotalRowsCount أولاً
  if (dataObject.TotalRowsCount != null) {
    const n = Number(dataObject.TotalRowsCount);
    if (Number.isFinite(n)) total = n;
  }

  // ثم أي حقل ينتهي بـ Count في المستوى الأعلى (مثال: CitiesCount)
  if (total === undefined) {
    for (const k of Object.keys(dataObject)) {
      if (k.endsWith("Count")) {
        const n = Number((dataObject as AnyRec)[k]);
        if (Number.isFinite(n)) {
          total = n;
          break;
        }
      }
    }
  }

  // ثم داخل Result[0] لأي <X>Count
  if (total === undefined && Array.isArray(dataObject.Result) && dataObject.Result.length) {
    const r0 = dataObject.Result[0];
    if (isObject(r0)) {
      for (const k of Object.keys(r0)) {
        if (k.endsWith("Count")) {
          const n = Number((r0 as AnyRec)[k]);
          if (Number.isFinite(n)) {
            total = n;
            break;
          }
        }
      }
    }
  }

  // وأخيراً طول المصفوفة
  if (total === undefined) total = rows.length;

  return { rows, row: rows[0] ?? null, total };
}

// ===================================
// 4) دالة التحليل الموحدة
// ===================================
export function analyzeExecution(result: ExecutionResult): NormalizedSummary {
  let code: number | null = null;
  let errorText = "";
  let rows: AnyRec[] = [];
  let row: AnyRec | null = null;
  let total: number | null = null;
  let serverTime: string | undefined;

  if (result.success) {
    rows = result.rows ?? [];
    row = result.row ?? null;
    total = result.meta?.total ?? (Array.isArray(rows) ? rows.length : null);
    serverTime = result.meta?.serverTime;
    code = result.code ?? 200;
    errorText = "";
  } else {
    code = result.code ?? null;
    errorText = result.error || "Execution failed.";
  }

  const dec = (result as any).decrypted;
  const internalErr = dec && typeof dec.error === "string" ? dec.error.trim() : "";

  if (result.success && internalErr) errorText = internalErr;

  const OK = !!(result.success && !internalErr && rows.length > 0);
  const OK_BUT_EMPTY = !!(result.success && !internalErr && rows.length === 0);
  const INTERNAL_ERROR = !!(result.success && !!internalErr);
  const FAILURE = !result.success;

  return {
    flags: { OK, OK_BUT_EMPTY, INTERNAL_ERROR, FAILURE },
    code,
    message: errorText,
    totalRows: total,
    row,
    rows,
    serverTime,
  };
}

// ===================================
// 5) الدالة الرئيسية (Execute Procedure)
// ===================================
export async function executeProcedure(
  ProcedureName: string,
  procedureValues: string,
  dataToken: string = API_CONFIG.DATA_TOKEN,
  offset?: number,
  fetch?: number
): Promise<ExecutionResult> {
  try {
    const toEncrypt: ProcedureInput = {
      ProcedureName,
      ParametersValues: procedureValues,
      DataToken: dataToken,
    };

    if (offset !== undefined) toEncrypt.Offset = Math.max(0, offset);
    if (fetch !== undefined) toEncrypt.Fetch = fetch;

    console.log("%c[ERP] Procedure Input (plain) ⇒", "color:#888", toEncrypt);

    const encrypted = AES256Encryption.encrypt(toEncrypt, API_CONFIG.PUBLIC_KEY) as string;

    const payload = {
      ApiToken: API_CONFIG.API_TOKEN,
      Data: encrypted,
    };

    const res: AxiosResponse = await api.post("/ExecuteProcedure", payload);
    const raw = res.data;

    const dec: DecryptedResponse = {};
    for (const K of ["Result", "Error", "Data", "ServerTime"] as const) {
      if (raw?.[K]) {
        const decryptedValue = AES256Encryption.decrypt(raw[K], API_CONFIG.PUBLIC_KEY);

        if (typeof decryptedValue === "string") {
          const cleanString = decryptedValue.trim();
          try {
            (dec as AnyRec)[K.toLowerCase()] = JSON.parse(cleanString);
          } catch (e) {
            console.error(`[ERP] JSON parsing failed for decrypted field ${K}:`, cleanString, e);
            (dec as AnyRec)[K.toLowerCase()] = cleanString;
          }
        } else {
          (dec as AnyRec)[K.toLowerCase()] = decryptedValue;
        }
      }
    }

    const code = Number(dec.result);
    const { rows, row, total } = pickRows(dec.data);

    console.log("%c[ERP] Decrypted ⇒", "color:#0a0", dec);

    if (code === 200) {
      return {
        success: true,
        code,
        rows,
        row,
        meta: { total, serverTime: dec.serverTime },
        decrypted: dec,
        raw,
      };
    }

    return {
      success: false,
      code: Number.isFinite(code) ? code : undefined,
      error: (typeof dec.error === "string" && dec.error) || "Execution failed.",
      decrypted: dec,
      raw,
    };
  } catch (e: any) {
    console.error("[ERP] API call failed:", e);
    return {
      success: false,
      error: e?.message || "Network/Unknown error",
      raw: e?.response?.data,
    };
  }
}

// ===================================
// 6) دالة المعاملات (DoTransaction)
// ===================================
const TRANSACTION_ENDPOINT_2 = "/DoTransaction";

export async function doTransaction(
  input: Omit<TransactionInput, 'DataToken'> & { dataToken?: string }
): Promise<ExecutionResult> {
  try {
    const dataToken = input.dataToken || API_CONFIG.DATA_TOKEN;

    const toEncrypt: TransactionInput = {
      TableName: input.TableName,
      WantedAction: input.WantedAction,
      ColumnsValues: input.ColumnsValues,
      PointId: input.PointId,
      DataToken: dataToken,
      
      // تضمين الحقول الاختيارية
      ...(input.ColumnsNames && { ColumnsNames: input.ColumnsNames }),
      ...(input.SendNotification && { SendNotification: input.SendNotification }),
      ...(input.NotificationProcedure && { NotificationProcedure: input.NotificationProcedure }),
      ...(input.NotificationPranameters && { NotificationPranameters: input.NotificationPranameters }),
    };

    console.log("%c[ERP] Transaction Input (plain) ⇒", "color:#f90", toEncrypt);

    const encrypted = AES256Encryption.encrypt(toEncrypt, API_CONFIG.PUBLIC_KEY) as string;

    const payload = {
      ApiToken: API_CONFIG.API_TOKEN,
      Data: encrypted,
    };

    const res: AxiosResponse = await api.post(TRANSACTION_ENDPOINT_2, payload);
    const raw = res.data;
    
    // فك التشفير (نفس المنطق المستخدم في executeProcedure)
    const dec: DecryptedResponse = {};
    for (const K of ["Result", "Error", "Data", "ServerTime"] as const) {
        if (raw?.[K]) {
            const decryptedValue = AES256Encryption.decrypt(raw[K], API_CONFIG.PUBLIC_KEY);
            
            if (typeof decryptedValue === "string") {
                const cleanString = decryptedValue.trim();
                try {
                    (dec as AnyRec)[K.toLowerCase()] = JSON.parse(cleanString);
                } catch (e) {
                    console.error(`[ERP] JSON parsing failed for decrypted field ${K}:`, cleanString, e);
                    (dec as AnyRec)[K.toLowerCase()] = cleanString;
                }
            } else {
                (dec as AnyRec)[K.toLowerCase()] = decryptedValue;
            }
        }
    }

    const code = Number(dec.result);
    // في المعاملات، غالبًا لا نتوقع صفوفاً، لكننا نستخدم pickRows لتوحيد الناتج
    const { rows, row, total } = pickRows(dec.data); 

    if (code === 200) {
      return {
        success: true,
        code,
        rows,
        row,
        meta: { total, serverTime: dec.serverTime },
        decrypted: dec,
        raw,
      };
    }
    
    // فشل المعاملة
    return { 
        success: false, 
        code: Number.isFinite(code) ? code : undefined, 
        error: (typeof dec.error === "string" && dec.error) || "Transaction Failed.",
        decrypted: dec, 
        raw 
    };

  } catch (e: any) {
    console.error("[ERP] Transaction call failed:", e);
    return {
      success: false,
      error: e?.message || "Network/Unknown error",
      raw: e?.response?.data,
    };
  }
}