// src/features/sacrifices/types.ts

/** فئات نوع الأضحية: 1 تبرع بأضحية، 2 صدقة لحم، 3 تصدق بعقيقة */
export const SACRIFICE_CATEGORIES = [
  { id: 1, label: "تبرع بأضحية" },
  { id: 2, label: "صدقة لحم" },
  { id: 3, label: "تصدق بعقيقة" },
] as const;

export type SacrificeCategoryId = 1 | 2 | 3;

export function getSacrificeCategoryLabel(categoryId: number | null | undefined): string {
  if (categoryId == null) return "—";
  const c = SACRIFICE_CATEGORIES.find((x) => x.id === Number(categoryId));
  return c?.label ?? "—";
}

export type SacrificeRow = {
  Id: number | string;
  Name: string;
  Price: number | null;
  IsActive: boolean;
  SacrificeCategory_Id: number | null;
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
