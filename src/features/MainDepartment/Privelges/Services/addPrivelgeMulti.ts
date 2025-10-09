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

const pipeJoin = (rows: string[]) =>
  rows.map((r) => String(r ?? "").trim()).map((s) => s.replace(/(\^)+/g, "")).join("|");

const sanitizeName = (s: string) =>
  String(s ?? "").replaceAll("^", " ").replaceAll("|", " ").replaceAll("#", " ").trim();

export type MultiTablePart = {
  tableName: string;      // encrypted table name
  columnsValues: string;  // "0#...#..." أو "0#...|0#..."
};

export type AddGroupRightWithFeaturesPayload = {
  groupRightName?: string;
  groupRightType?: string | number;  // "M" أو "O"
  groupRightId?: string | number;
  featureIds: Array<string | number>;
  isActive?: boolean;
  pointId?: string | number;
};

const M_TABLE = PROCEDURE_NAMES.GROUP_RIGHT;    // "M8VBuM2f3OsFRzuHNORBqQ=="
const D_TABLE = PROCEDURE_NAMES.GROUP_RIGHT_D;  // "wLOgTIhs+yAlMfhfpR9Hmg=="

function composeMultiTx(
  tables: MultiTablePart[],
  wantedAction: number | string,
  pointId: number | string = 0
) {
  const MultiTableName     = caretJoin(...tables.map((t) => t.tableName));
  const MultiColumnsValues = caretJoin(...tables.map((t) => t.columnsValues));
  const payload = {
    MultiTableName,
    MultiColumnsValues,
    WantedAction: typeof wantedAction === "string" ? Number(wantedAction) : wantedAction,
    PointId: pointId,
  };
  console.log("[ERP] MultiTransaction Input (plain) =>", payload);
  return payload;
}

export async function addGroupRightWithFeatures(
  payload: AddGroupRightWithFeaturesPayload
): Promise<NormalizedSummary> {
  const {
    groupRightName,
    groupRightType,
    groupRightId,
    featureIds,
    isActive = true,
    pointId = 0,
  } = payload;

  if (!featureIds?.length) {
    return analyzeExecution({
      result: "200",
      error: "",
      data: { Result: [{ TotalRowsCount: "0" }] },
      outparams: {},
      servertime: "",
    } as any);
  }

  const activeBit = isActive ? 1 : 0;

  // إضافة تفاصيل لمجموعة موجودة
  if (groupRightId != null && groupRightId !== "") {
    const detailValues = pipeJoin(
      featureIds.map((fid) => `0#${groupRightId}#${fid}#${activeBit}`)
    );
    const multi = composeMultiTx(
      [{ tableName: D_TABLE, columnsValues: detailValues }],
      0,
      pointId
    );
    const res = await doMultiTransaction(multi);
    return analyzeExecution(res);
  }

  // إنشاء مجموعة جديدة + ربط الميزات
  const roleCode = String(groupRightType ?? "M").toUpperCase(); // "M" أو "O"
  const name = sanitizeName(groupRightName ?? "");
  if (!name) throw new Error("اسم المجموعة مطلوب.");

  // GroupRight:   Id#GroupRightName#GroupRightType
  // GroupRight_D: Id#GroupRight_Id#Feature_Id#IsActive
  const masterValues = `0#${name}#${roleCode}`;
  const detailValues = pipeJoin(
    featureIds.map((fid) => `0#@T0#${fid}#${activeBit}`)
  );

  const multi = composeMultiTx(
    [
      { tableName: M_TABLE, columnsValues: masterValues },
      { tableName: D_TABLE, columnsValues: detailValues },
    ],
    0,
    pointId
  );

  const res = await doMultiTransaction(multi);
  return analyzeExecution(res);
}
