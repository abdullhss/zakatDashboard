import type { ExecutionResult } from "./apiClient";

type AnyRec = Record<string, any>;

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
  const internalErr =
    dec && typeof dec.error === "string" ? dec.error.trim() : "";

  if (result.success && internalErr) {
    errorText = internalErr;
  }

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
