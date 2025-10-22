// src/api/apiClient.ts
import axios, { type AxiosResponse } from "axios";
import { AES256Encryption } from "../utils/encryption";

export type AnyRec = Record<string, any>;

/* ===================================
 * 1) الإعدادات
 * =================================== */
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
  BANK_TABLE_NAME: "OeTsezXwKwLlGRD40pLLHg==",
  CITIES_TABLE_NAME: "0MomPyA4q+4ZMI8avKbfUg==",
  GET_OFFICES_LIST: "eTcJ/vnBezzSD18bWEaw1PQzCrDtz1E9ZsA2hLVgjhU=",
  OFFICE: "msDmpDYZ2wcHBSmvMDczrg==",
  ACCOUNT_TYPES: "GQIZZERj0S9ZOfY1hfnllyAjhmG5JhWEQf8hMuGilWA=",
   GET_DASH_OFFICE_BANKS: "jO0qkiQGe4UNVcwh8EDVtF0HtNvwkx6o94a+i6+lf5k=",
  GET_SUBVENTION_TYPES: "CjSj0j5kAa/aqk9LMpWvCavGukOw8WsDmvfzbXkXVaI=",
  SUBVENTION_TYPE_TABLE_NAME: "l+3chSRUz867HysB0r4EWQ==", // For ADDING & DELETING & UPDATING 
 GET_KAFARA_VALUES: "T8mEvmQC2AYQQYTmdNYTU/U5ngsTOI/NJy4+CGMFmAM=",
  KAFARA_TABLE_NAME: "gggqsde9BRYL7OcqrwJ7jw==", // for updating kafara value
  GET_ZAKAH_TYPES: "8AFjIZeX9cjy7pMRrml6FO5YoUub6zJXVMIhh/yYrlk=",
  UPDATE_ZAKAH_TYPES: "qe+QzzxA0+wsdPqshbdRrQ==", //for updating zakah status
  GET_GROUP_RIGHT_DATA: "JLwtcLn8SZNZPWof/CzIvDXZnUMGA2QmTOscUBGqORs=",
  GET_FEATURES_DATA: "ZhEv0ofVhejGIX2/As9S6w==",
   GROUP_RIGHT: "M8VBuM2f3OsFRzuHNORBqQ==",     // 11- GroupRight
  GROUP_RIGHT_D: "wLOgTIhs+yAlMfhfpR9Hmg==",   // 12- GroupRight_D
   GET_FEATURES_BY_GROUP: "rPZXg2bpV1n9cBmjo+xzxPuUQqoHOmQW8jTEf8pOzFo=", // FeatureFOR UPDATE PAGE
    GET_WORK_USERS_DATA: "DunhuDiDke6AaKtXnSA7y9dsXr2xJdeI/NYAUwgD4Xg=", // 109-GetWorkUsersData
    GET_GROUP_RIGHT_FEATURES_DATA: "rPZXg2bpV1n9cBmjo+xzxPuUQqoHOmQW8jTEf8pOzFo=",
    Zakah_GOLD_VALUE: "T+uXWr/5gc+YZsR9SZKxeQ==",
    GET_SACRIFICES_TYPES_DATA: "BuFxFqz2qLdv8Q6E+j0XT/TUax4yIRsqrXkuc2DpOWU=",
    ADD_SACRIFICE_TYPE: "yjhWQPC+X9N5+2FVbLegdw==",
    GET_DASH_ASSISTANCES_DATA: "BRS3bAAF18bzUTsgdRNLAc0qkwzHQQSl45LE0afsSfc=", // مراجعة طلب الإعانات
    GET_DASH_CAMPAIGNS_DATA: "W1+18V1NJ8jOLNpNXd3t8zcC//3vLKdAYFTUmyBOIGo=",

    // FOR OFFICES
    GetDashBoardOfficeProjectsData: "D1gxIpW0jvHPzz2gPx4IHqN4at88/6GP4fdm/xzsQXg=",
    ADD_UPDATE_PROJECTS: "w8GZW8O/lAQVG6R99L1C/w==",
    GET_SACRIFICES_DASH_DATA : "BuFxFqz2qLdv8Q6E+j0XTxOo0qAoVzk713Cv64+LkYk=",
    GET_DASH_PAYMENT_DATA: "L3a0q9MFH3v/HTZoKRF4KTUAuRfsH+PlpkNfOd9+U+E=",
     PAYMENT_APPROVAL_TABLE: "i2uNerMmNgbb7CAgjyifheN/MX9KgcurTRI6fmGAwKw=",
     GET_DASH_NEWS_DATA: "D1gxIpW0jvHPzz2gPx4IHsMenSKRzg6GpMH2gJxxN8g=",
     GET_TYPES_NEW_DATA: "4VqIN2QLEsIVgrrrZ9+QTf47UlCZzoc1uZeOQx5MsEI=",
     NEWS_TABLE_NAME: "M3zRwxiJknLboYsWUx3adg==",
};

/* ===================================
 * 2) أنواع (النماذج)
 * =================================== */
interface ProcedureInput {
  ProcedureName: string;
  ParametersValues: string;
  DataToken: string;
  Offset?: number;
  Fetch?: number;
}

interface TransactionInput {
  TableName: string;
  WantedAction: 0 | 1 | 2; // 0 Insert, 1 Update, 2 Delete
  ColumnsValues: string;
  PointId: number | string;
  DataToken: string;
  ColumnsNames?: string;
  SendNotification?: "T" | "F";
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

/* ===================================
 * 3) الدوال المساعدة
 * =================================== */
const isObject = (v: any): v is AnyRec =>
  !!v && typeof v === "object" && !Array.isArray(v);

/** يقلّل الأخطاء عندما تكون الاستجابة نصًا وليس JSON */
function tryParseJson<T = any>(s: string): T | string {
  const t = s?.trim?.() ?? "";
  if (!t) return t;
  const first = t[0];
  if (first !== "{" && first !== "[" && first !== '"') return t;
  try {
    return JSON.parse(t) as T;
  } catch {
    return t;
  }
}

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

  // 1) أي مفتاح ينتهي بـ Data
  for (const k of Object.keys(dataObject)) {
    if (k.endsWith("Data")) {
      const parsed = parseMaybeJson<AnyRec[]>(dataObject[k]);
      if (parsed && Array.isArray(parsed)) {
        rows = parsed;
        break;
      }
    }
  }

  // 2) داخل Result[0]
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

  // 3) fallback: Result كمصفوفة سجلات
  if (!rows.length && Array.isArray(dataObject.Result)) {
    rows = dataObject.Result as AnyRec[];
  }

  // === الإجمالي ===
  if (dataObject.TotalRowsCount != null) {
    const n = Number(dataObject.TotalRowsCount);
    if (Number.isFinite(n)) total = n;
  }
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
  if (total === undefined) total = rows.length;

  return { rows, row: rows[0] ?? null, total };
}

/* ===================================
 * 4) دالة التحليل الموحدة
 * =================================== */
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
// **************************
// export const getBase64 = (file) => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => resolve(reader.result);
//     reader.onerror = (error) => reject(error);
//   });
// };
//  export async function  UploadFileWebSite({ action , file, fileId = "", SessionID, onProgress, controller }) {
//     console.log('test');
    
//     if (!file && action !== "Delete") return console.error("No file provided");

//    const convertedFile = {
//       MainId:0,
//       SubId:0,
//       DetailId:0,
//       FileType:`.${file?.name.split('.').pop()}`,
//       Description:"",
//       Name:file?.name||" "
//     }
    
//     let jsonData = {
//       ApiToken: API_CONFIG.API_TOKEN,
//       Data: AES256Encryption.encrypt({
//         ActionType: action,
//         FileId: fileId,
//         ...convertedFile,
//         DataToken: API_CONFIG.DATA_TOKEN,
//         SessionID,
//       }),
      
//       encode_plc1: file?((await getBase64(file))?.split(',')[1]):"",
//     };
//     console.log(jsonData)
    
//     let { data } = await axios.post(
      
//       "/UploadFileWebSite", 
//       jsonData,
//       {
//         signal: controller?.signal,
//         onUploadProgress: (progressEvent) => {
//           if (onProgress && progressEvent.total) {
//             const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//             onProgress(progress);
//           }
//         },
//       }
//     );
//     console.log(AES256Encryption.decrypt(data.FileId))
//     return {
//       status: AES256Encryption.decrypt(data.Result),
//       id: AES256Encryption.decrypt(data.FileId),
//       error: AES256Encryption.decrypt(data.Error),
//     };
//   }
/* ===================================
 * 5) ExecuteProcedure
 * =================================== */
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

    const payload = { ApiToken: API_CONFIG.API_TOKEN, Data: encrypted };

    const res: AxiosResponse = await api.post("/ExecuteProcedure", payload);
    const raw = res.data;

    const dec: DecryptedResponse = {};
    for (const K of ["Result", "Error", "Data", "ServerTime"] as const) {
      if (raw?.[K]) {
        const decryptedValue = AES256Encryption.decrypt(raw[K], API_CONFIG.PUBLIC_KEY);
        if (typeof decryptedValue === "string") {
          (dec as AnyRec)[K.toLowerCase()] = tryParseJson(decryptedValue);
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

/* ===================================
 * 6) DoTransaction (صف واحد)
 * =================================== */
const TRANSACTION_ENDPOINT_2 = "/DoTransaction";

export async function doTransaction(
  input: Omit<TransactionInput, "DataToken"> & { dataToken?: string }
): Promise<ExecutionResult> {
  try {
    const dataToken = input.dataToken || API_CONFIG.DATA_TOKEN;

    const toEncrypt: TransactionInput = {
      TableName: input.TableName,
      WantedAction: input.WantedAction,
      ColumnsValues: input.ColumnsValues,
      PointId: input.PointId,
      DataToken: dataToken,
    };

    if ("ColumnsNames" in input) (toEncrypt as AnyRec).ColumnsNames = (input as AnyRec).ColumnsNames;
    if ("SendNotification" in input) (toEncrypt as AnyRec).SendNotification = (input as AnyRec).SendNotification;
    if ("NotificationProcedure" in input) (toEncrypt as AnyRec).NotificationProcedure = (input as AnyRec).NotificationProcedure;
    if ("NotificationPranameters" in input) (toEncrypt as AnyRec).NotificationPranameters = (input as AnyRec).NotificationPranameters;

    console.log("%c[ERP] Transaction Input (plain) ⇒", "color:#f90", toEncrypt);

    const encrypted = AES256Encryption.encrypt(toEncrypt, API_CONFIG.PUBLIC_KEY) as string;
    const payload = { ApiToken: API_CONFIG.API_TOKEN, Data: encrypted };
    const res: AxiosResponse = await api.post(TRANSACTION_ENDPOINT_2, payload);
    const raw = res.data;

    const dec: DecryptedResponse = {};
    for (const K of ["Result", "Error", "Data", "ServerTime"] as const) {
      if (raw?.[K]) {
        const decryptedValue = AES256Encryption.decrypt(raw[K], API_CONFIG.PUBLIC_KEY);
        if (typeof decryptedValue === "string") {
          (dec as AnyRec)[K.toLowerCase()] = tryParseJson(decryptedValue);
        } else {
          (dec as AnyRec)[K.toLowerCase()] = decryptedValue;
        }
      }
    }

    const code = Number(dec.result);
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

    return {
      success: false,
      code: Number.isFinite(code) ? code : undefined,
      error: (typeof dec.error === "string" && dec.error) || "Transaction Failed.",
      decrypted: dec,
      raw,
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

/* ===================================
 * 7) DoMultiTransaction (صفوف متعددة/جداول متعددة)
 * =================================== */
const DO_MULTI_ENDPOINT = "/DoMultiTransaction";

type MultiTxInput = {
  MultiTableName: string;       
  MultiColumnsValues: string;    
  WantedAction: 0 | 1 | 2;       
  PointId: number | string;
  dataToken?: string;
  MultiColumnsNames?: string;    
};

export async function doMultiTransaction(input: MultiTxInput): Promise<ExecutionResult> {
  try {
    const dataToken = input.dataToken || API_CONFIG.DATA_TOKEN;

    const toEncrypt: Record<string, any> = {
      MultiTableName: input.MultiTableName,
      MultiColumnsValues: input.MultiColumnsValues,
      WantedAction: input.WantedAction,
      PointId: input.PointId,
      DataToken: dataToken,
    };
    if ("MultiColumnsNames" in input) {
      (toEncrypt as AnyRec).MultiColumnsNames = input.MultiColumnsNames;
    }

    console.log("%c[ERP] MultiTransaction Input (plain) ⇒", "color:#06c", toEncrypt);

    const encrypted = AES256Encryption.encrypt(toEncrypt, API_CONFIG.PUBLIC_KEY) as string;
    const payload = { ApiToken: API_CONFIG.API_TOKEN, Data: encrypted };

    const res: AxiosResponse = await api.post(DO_MULTI_ENDPOINT, payload);
    const raw = res.data;

    const dec: DecryptedResponse = {};
    for (const K of ["Result", "Error", "Data", "ServerTime"] as const) {
      if (raw?.[K]) {
        const decryptedValue = AES256Encryption.decrypt(raw[K], API_CONFIG.PUBLIC_KEY);
        if (typeof decryptedValue === "string") {
          (dec as AnyRec)[K.toLowerCase()] = tryParseJson(decryptedValue);
        } else {
          (dec as AnyRec)[K.toLowerCase()] = decryptedValue;
        }
      }
    }

    const code = Number(dec.result);
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

    return {
      success: false,
      code: Number.isFinite(code) ? code : undefined,
      error: (typeof dec.error === "string" && dec.error) || "MultiTransaction Failed.",
      decrypted: dec,
      raw,
    };
  } catch (e: any) {
    console.error("[ERP] MultiTransaction call failed:", e);
    return {
      success: false,
      error: e?.message || "Network/Unknown error",
      raw: e?.response?.data,
    };
  }
}
