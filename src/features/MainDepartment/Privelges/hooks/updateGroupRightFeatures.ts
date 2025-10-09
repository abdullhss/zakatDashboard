// src/features/MainDepartment/Privelges/Services/updateGroupRightFeatures.ts
import {
  doMultiTransaction,
  analyzeExecution,
  PROCEDURE_NAMES,
  type NormalizedSummary,
} from "../../../../api/apiClient";

type Entry = { featureId: string | number; isActive: boolean };

const D_TABLE = PROCEDURE_NAMES.GROUP_RIGHT_D; // جدول التفاصيل: "wLOgTIhs+yAlMfhfpR9Hmg=="

function caretJoin(...parts: string[]) {
  return parts
    .map((p) => String(p ?? "").trim())
    .map((s) => s.replace(/(\^|#)+$/g, "").replace(/^(\^|#)+/g, ""))
    .join("^");
}
const pipeJoin = (rows: string[]) =>
  rows.map((r) => String(r ?? "").trim()).map((s) => s.replace(/(\^)+/g, "")).join("|");

/**
 * استبدال/تحديث حالة الميزات لمجموعة
 * يكوّن MultiTransaction على جدول GroupRight_D فقط
 */
export async function updateGroupRightFeatures(
  groupRightId: string | number,
  entries: Entry[],
  pointId: string | number = 0
): Promise<NormalizedSummary> {
  const gid = String(groupRightId ?? "").trim();
  if (!gid) throw new Error("GroupRightId مطلوب.");
  if (!entries?.length) {
    // لا تغييرات
    return analyzeExecution({
      result: "200",
      error: "",
      data: { Result: [{ TotalRowsCount: "0" }] },
      outparams: {},
      servertime: "",
    } as any);
  }

  // Detail format: Id#GroupRight_Id#Feature_Id#IsActive
  const detailValues = pipeJoin(
    entries.map((e) => `0#${gid}#${e.featureId}#${e.isActive ? 1 : 0}`)
  );

  const payload = {
    MultiTableName: D_TABLE,
    MultiColumnsValues: detailValues,
    WantedAction: 0, // Insert (system expected to upsert/update if exists)
    PointId: pointId,
  };

  // console.log("[ERP] Save Features (plain) =>", payload);
  const res = await doMultiTransaction(payload);
  return analyzeExecution(res);
}
