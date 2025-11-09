import {
  doMultiTransaction,
  analyzeExecution,
  PROCEDURE_NAMES,
  type NormalizedSummary,
} from "../../../../api/apiClient";

// Helpers
const caretJoin = (...parts: string[]) =>
  parts.map((p) => String(p ?? "").trim())
       .map((s) => s.replace(/(\^|#)+$/g, "").replace(/^(\^|#)+/g, ""))
       .join("^");

export type UpsertOneFeaturePayload = {
  groupRightId: number | string;
  featureId: number | string;
  isActive: boolean;
  detailId?: number | string | null; // لو موجود يبقى Update
  pointId?: number | string;
};

const D_TABLE = PROCEDURE_NAMES.GROUP_RIGHT_D; // "wLOgTIhs+yAlMfhfpR9Hmg=="

/**
 * Upsert لسطر واحد في GroupRight_D
 * GroupRight_D Columns: Id#GroupRight_Id#Feature_Id#IsActive
 * - Insert:  WantedAction=0 والقيمة تبدأ بـ 0#
 * - Update:  WantedAction=1 ولازم نبعث الـ DetailId في أول عمود
 */
export async function upsertOneGroupRightFeature(
  p: UpsertOneFeaturePayload
): Promise<NormalizedSummary> {
  const { groupRightId, featureId, isActive, detailId, pointId = 0 } = p;

  if (!groupRightId || !featureId) {
    throw new Error("Feature ID أو GroupRight ID غير صالح.");
  }

  const activeBit = isActive ? 1 : 0;
  const wantedAction = detailId ? 1 : 0;

    let officeID = 0;
    const role = localStorage.getItem("role")
    if(role == "O"){
      officeID = JSON.parse(localStorage.getItem("mainUser") || "").Office_Id
    }

  const columnsValues = detailId
    ? `${detailId}#${groupRightId}#${featureId}#${activeBit}`     // Update
    : `0#${groupRightId}#${featureId}#${activeBit}`;              // Insert

  const payload = {
    MultiTableName: caretJoin(D_TABLE),
    MultiColumnsValues: caretJoin(columnsValues),
    WantedAction: wantedAction,
    PointId: 0,
  };
  
  // للتشخيص
  console.log("[ERP] MultiTransaction Input (plain) =>", payload);

  const res = await doMultiTransaction(payload);
  return analyzeExecution(res);
}
