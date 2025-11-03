import {
  executeProcedure,
  PROCEDURE_NAMES,
  analyzeExecution,
  type AnyRec,
  type NormalizedSummary,
} from "../../../../api/apiClient";

export async function getOffices(
  offset: number,
  limit: number
): Promise<NormalizedSummary> {
  // الإجراء بياخد @StartNum#@Count وبيبدأ العد من 1
  const sqlStartNum = (offset ?? 0) + 1;
  const sqlCount = Math.max(1, Number(limit) || 1);
  const params = `${sqlStartNum}#${sqlCount}`;

  const result = await executeProcedure(
    PROCEDURE_NAMES.GET_OFFICES_LIST,
    params,
    undefined,
    offset,
    limit
  );

  const dec = (result as any)?.decrypted?.data;
  if (!dec?.Result?.[0]) return analyzeExecution(result);

  const row = dec.Result[0];
  const officesCount = Number(row.OfficesCount ?? 0);
  const officesData = row.OfficesData ? JSON.parse(row.OfficesData) : [];

  return {
    flags: {
      OK: true,
      OK_BUT_EMPTY: officesData.length === 0,
      INTERNAL_ERROR: false,
      FAILURE: false,
    },
    code: 200,
    message: "",
    totalRows: officesCount,
    rows: officesData,
    row: officesData[0] ?? null,
    serverTime: (result as any)?.decrypted?.servertime,
  };
}