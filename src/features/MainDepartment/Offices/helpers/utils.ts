// utils.ts
import type { BankDetailsValues } from "../BankDetailsSection";

export const accountTypeMap: Record<string, number> = { checking: 1, saving: 2, "1": 1, "2": 2 };
export const serviceTypeMap: Record<string, number> = { sadaka: 1,   zakat: 2,  "1": 1, "2": 2 };

export const scrub = (v: unknown) => String(v ?? "").replace(/#/g, "");

export const toId = (map: Record<string, number>, v: unknown): number => {
  const s = String(v ?? "");
  const n = Number(s);
  if (Number.isFinite(n) && s !== "" && !Number.isNaN(n)) return n;
  return map[s] ?? 0;
};

export function normalizeBank(b: BankDetailsValues): BankDetailsValues {
  return {
    ...b,
    bankId: String(Number(b.bankId) || 0),
    accountTypeId: String(toId(accountTypeMap, b.accountTypeId)),
    serviceTypeId:  String(toId(serviceTypeMap,  b.serviceTypeId)),
    openingBalance: String(Number(b.openingBalance) || 0),
    accountNumber: scrub(b.accountNumber),
  };
}

export function extractNewOfficeId(dec: any): string | null {
  try {
    const d = dec?.data ?? {};
    const candidates = [
      d?.NewId, d?.OfficeId, d?.Id,
      d?.Result?.[0]?.NewId, d?.Result?.[0]?.OfficeId, d?.Result?.[0]?.Id,
      dec?.newId, dec?.id, dec?.resultId,
    ].filter((x) => x != null);
    return candidates.length ? String(candidates[0]) : null;
  } catch {
    return null;
  }
}
