// 56- GetDashOfficeBanksData
// ProcedureName: jO0qkiQGe4UNVcwh8EDVtF0HtNvwkx6o94a+i6+lf5k=
// ParametersValues: @OfficeId

import {
  executeProcedure,
  analyzeExecution,
  PROCEDURE_NAMES,
  type AnyRec,
  type NormalizedSummary,
} from "../../../../api/apiClient";

/** JSON ممكن ييجي كنص وأحيانًا ملفوف بين ( ... ) */
function parseWeirdJson<T = any>(v: unknown): T | [] {
  if (typeof v !== "string") return ([] as unknown) as T;
  let s = v.trim();
  if (s.startsWith("(") && s.endsWith(")")) s = s.slice(1, -1).trim();
  try { return JSON.parse(s) as T; } catch { return ([] as unknown) as T; }
}

/** استخراج داتا الحسابات */
function extractBanks(dec: any): { rows: AnyRec[]; totalRows: number } {
  const result0 = Array.isArray(dec?.data?.Result) ? dec.data.Result[0] : null;
  const banksStr =
    result0?.OfficeBanksData ??
    result0?.OfficeBankData ??
    result0?.BanksData ??
    result0?.Data ??
    null;

  const arr = banksStr ? parseWeirdJson<AnyRec[]>(banksStr) : [];
  const rows: AnyRec[] = Array.isArray(arr) ? arr : [];

  const totalRows =
    Number(
      result0?.OfficeBanksCount ??
      result0?.BanksCount ??
      result0?.TotalRowsCount ??
      result0?.TotalCount ??
      rows.length
    ) || rows.length;

  return { rows, totalRows };
}

/** تطبيع صف واحد */
function normalizeBankRow(r: AnyRec) {
  const id               = r.Id ?? r.id ?? 0;
  const officeId         = r.Office_Id ?? r.officeId ?? r.OfficeId ?? 0;
  const bankId           = r.Bank_Id ?? r.BankId ?? r.bankId ?? 0;
  const bankName         = r.BankName ?? r.bankName ?? r.Name ?? r.name ?? "";
  const accountNumber    = r.AccountNum ?? r.AccountNumber ?? r.accountNumber ?? "";
  const openingBalance   = r.OpeningBalance ?? r.openingBalance ?? "0";
  const accountTypeId    = r.AccountType_Id ?? r.accountTypeId ?? r.AccountTypeId ?? 0;
  const accountTypeName  = r.AccountTypeName ?? r.accountTypeName ?? "";
  const serviceTypeId    = r.ServiceType_Id ?? r.serviceTypeId ?? r.ServiceTypeId ?? 0;
  const serviceTypeName  = r.ServiceTypeName ?? r.serviceTypeName ?? "";
  const hasCard0         = r.AcceptBankCards ?? r.HasCard ?? r.hasCard ?? 0;
  const isActive0        = r.IsActive ?? r.Active ?? r.isActive ?? 0;

  const toBool = (v: any) =>
    typeof v === "string"
      ? ["1", "y", "yes", "t", "true"].includes(v.toLowerCase())
      : !!Number(v) || !!v;

  return {
    id: Number(id) || 0,
    officeId: Number(officeId) || 0,
    bankId: Number(bankId) || 0,
    bankName: String(bankName || "—"),
    accountNumber: String(accountNumber),
    openingBalance: String(openingBalance),
    accountTypeId: Number(accountTypeId) || 0,
    accountTypeName: String(accountTypeName || ""),
    serviceTypeId: Number(serviceTypeId) || 0,
    serviceTypeName: String(serviceTypeName || ""),
    hasCard: toBool(hasCard0),
    isActive: toBool(isActive0),
  };
}

/** جلب حسابات مكتب واحد – مع فلترة محلية احتياطية */
export async function getDashBankData(
  officeId: number | string,
  offset = 0,
  limit = 50
): Promise<NormalizedSummary> {
  const proc =
    (PROCEDURE_NAMES as any).GET_DASH_OFFICE_BANKS ??
    "jO0qkiQGe4UNVcwh8EDVtF0HtNvwkx6o94a+i6+lf5k=";

  const params = String(officeId ?? "");
  const exec = await executeProcedure(proc, params, undefined, offset, limit);

  if ((exec as any)?.decrypted) {
    const { rows: raw, totalRows } = extractBanks((exec as any).decrypted);
    const normalized = raw.map(normalizeBankRow);

    // ✅ فلترة محلية لو الـ proc رجّع أكتر من مكتب
    const wanted = String(officeId);
    const filtered = normalized.filter(r => String(r.officeId) === wanted);

    if (filtered.length !== normalized.length) {
      // للمراجعة: السيرفر رجّع حسابات لمكاتب متعددة
      console.warn(
        "[OfficeBanks] server returned mixed offices; applying client-side filter",
        { requestedOfficeId: wanted, total: normalized.length, kept: filtered.length }
      );
    }

    return {
      flags: {
        OK: true,
        OK_BUT_EMPTY: filtered.length === 0,
        INTERNAL_ERROR: false,
        FAILURE: false,
      },
      code: exec.success ? exec.code ?? 200 : exec.code ?? null,
      message: exec.success ? "" : (exec as any)?.decrypted?.error || "Execution failed.",
      totalRows: filtered.length,          // ← اللي هنعرضه فعلاً
      row: filtered[0] ?? null,
      rows: filtered,
      serverTime: (exec as any)?.decrypted?.servertime,
    };
  }

  return analyzeExecution(exec);
}
