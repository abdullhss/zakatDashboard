import { isOffice } from "../../../../session";
import type { CampaignRow } from "./types";

/** فلترة بيانات الحملة حسب مكتب المستخدم (لو الدور Office) */
export function filterRowsByOffice(rows: CampaignRow[], officeId?: number | string) {
  if (!isOffice()) return rows;
  const myOfficeId = Number(officeId || 0);
  return rows.filter((r) => Number(r?.Office_Id ?? 0) === myOfficeId);
}

/** هل لدينا معلومات مكتب داخل الداتا؟ */
export function hasOfficeColumn(rows: CampaignRow[]) {
  const sample = rows[0] || {};
  return ("OfficeName" in sample) || ("Office_Id" in sample);
}
