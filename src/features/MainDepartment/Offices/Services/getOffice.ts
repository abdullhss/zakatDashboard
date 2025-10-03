import {
  executeProcedure,
  PROCEDURE_NAMES,
  analyzeExecution,
  type AnyRec,
  type NormalizedSummary,
} from "../../../../api/apiClient";

/** JSON بييجي كنص و أحيانًا ملفوف ( ... ) */
function parseWeirdJson<T = any>(v: unknown): T | [] {
  if (typeof v !== "string") return ([] as unknown) as T;
  let s = v.trim();
  if (s.startsWith("(") && s.endsWith(")")) s = s.slice(1, -1).trim();
  try {
    return JSON.parse(s) as T;
  } catch {
    return ([] as unknown) as T;
  }
}

function extractOffices(dec: any): AnyRec[] {
  const result0 = Array.isArray(dec?.data?.Result) ? dec.data.Result[0] : null;
  const officesStr = result0?.OfficesData ?? result0?.OfficeData ?? null;
  if (!officesStr) return [];
  const arr = parseWeirdJson<AnyRec[]>(officesStr);
  return Array.isArray(arr) ? arr : [];
}

/** نطبع السجل لشكل الجدول */
function normalizeOfficeRow(r: AnyRec) {
  const id        = r.Id ?? r.id ?? r.OfficeId ?? r.Office_Id ?? 0;
  const name      = r.OfficeName ?? r.CompanyName ?? r.Name ?? r.name ?? "—";
  const phone     = r.PhoneNum ?? r.Phone ?? r.phone ?? "";
  const city      = r.CityName ?? r.City ?? r.city ?? "—";
  const isActive0 = r.IsActive ?? r.Active ?? r.isActive ?? false;

  const isActive =
    typeof isActive0 === "string"
      ? ["t", "true", "1", "y", "yes"].includes(isActive0.toLowerCase())
      : !!Number(isActive0) || !!isActive0;

  return {
    id: Number(id) || 0,
    companyName: String(name),
    phone: String(phone),
    city: String(city),
    isActive,
  };
}

/** API: جلب المكاتب مع التطبيع */
export async function getOffices(
  offset: number,
  limit: number,
  userId?: number
): Promise<NormalizedSummary> {
  // الإجراء عندكم بياخد UserId كسلسلة؛ لو المعاملات مختلفة عدّل هنا
  const params = userId != null ? String(userId) : "";

  const exec = await executeProcedure(
    PROCEDURE_NAMES.GET_OFFICES_LIST,
    params,
    undefined,           // dataToken (نفس الديفولت في apiClient)
    offset,
    limit
  );

  // لو نجح، هنقرأ OfficesData يدويًا من decrypted ونطبعها
  if ((exec as any)?.decrypted) {
    const officesRaw = extractOffices((exec as any).decrypted);
    const normalized = officesRaw.map(normalizeOfficeRow);

    return {
      flags: {
        OK: normalized.length > 0,
        OK_BUT_EMPTY: normalized.length === 0,
        INTERNAL_ERROR: false,
        FAILURE: false,
      },
      code: exec.success ? exec.code ?? 200 : exec.code ?? null,
      message: exec.success ? "" : (exec as any)?.decrypted?.error || "Execution failed.",
      totalRows: normalized.length,
      row: normalized[0] ?? null,
      rows: normalized,
      serverTime: (exec as any)?.decrypted?.serverTime,
    };
  }

  // fallback لتحليل موحّد (مش هيوصل rows المطبّعة)
  return analyzeExecution(exec);
}
