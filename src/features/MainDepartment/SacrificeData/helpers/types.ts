// src/features/sacrifices/types.ts
export type SacrificeRow = {
  Id: number | string;
  Name: string;
  Price: number | null;
  IsActive: boolean;
};

/** تنسيق السعر بالليبي */
export function formatLYD(n: number | null | undefined) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  try {
    return Number(n).toLocaleString("ar-LY", { maximumFractionDigits: 0 }) + " د.ل";
  } catch {
    return `${n} د.ل`;
  }
}
