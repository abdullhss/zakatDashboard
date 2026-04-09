/** تصنيف المشروع — يُرسل كـ ProjectCategory_Id (1–6) */
export const PROJECT_CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "1", label: "عام" },
  { value: "2", label: "امان للاسكان" },
  { value: "3", label: "المشاريع الانتاجية" },
  { value: "4", label: "احكام التنفيذ" },
  { value: "5", label: "سقيا الماء" },
  { value: "6", label: "اماطة الاذى" },
];

export function getProjectCategoryLabel(
  id: string | number | null | undefined
): string {
  const v = String(id ?? "").trim();
  if (!v || v === "0") return "—";
  const found = PROJECT_CATEGORY_OPTIONS.find((o) => o.value === v);
  return found?.label ?? "—";
}
