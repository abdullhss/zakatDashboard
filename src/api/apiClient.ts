// src/api/apiClient.ts
import axios, { type AxiosResponse } from "axios";
import { AES256Encryption } from "../utils/encryption";

// ====== الإعدادات ======
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

// ====== أنواع مساعدة ======
type AnyRec = Record<string, any>;

interface ProcedureInput {
  ProcedureName: string;
  ParametersValues: string;
  DataToken: string;
}

interface DecryptedDataShape {
  TotalRowsCount?: number;
  Result?: AnyRec[];
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


const isObject = (v: any): v is AnyRec => !!v && typeof v === "object" && !Array.isArray(v);

function pickRows(dataField: DecryptedResponse["data"]): { rows: AnyRec[]; row: AnyRec | null; total?: number } {
  if (!dataField) return { rows: [], row: null, total: 0 };

  if (!isObject(dataField)) return { rows: [], row: null, total: 0 };

  const rows = Array.isArray(dataField.Result) ? dataField.Result as AnyRec[] : [];
  return { rows, row: rows[0] ?? null, total: (dataField as AnyRec).TotalRowsCount };
}
export async function executeProcedure(
  ProcedureName: string,
  procedureValues: string,
  dataToken: string = API_CONFIG.DATA_TOKEN
): Promise<ExecutionResult> {
  try {
    const toEncrypt: ProcedureInput = {
      ProcedureName,
      ParametersValues: procedureValues,
      DataToken: dataToken,
    };

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
        (dec as AnyRec)[K.toLowerCase()] = AES256Encryption.decrypt(raw[K], API_CONFIG.PUBLIC_KEY);
      }
    }

    const code = Number(dec.result);
    const { rows, row, total } = pickRows(dec.data);

    console.log("%c[ERP] Decrypted ⇒", "color:#0a0", dec);
    if (rows.length) {
      console.log("%c[ERP] Result rows (table) ⇒", "color:#0a0");
      console.table(rows);
    } else if (typeof dec.error === "string" && dec.error.trim()) {
      console.warn("[ERP] Error text ⇒", dec.error);
    }

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
