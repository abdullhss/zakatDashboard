import {
  doMultiTransaction,
  analyzeExecution,
  PROCEDURE_NAMES,
  type NormalizedSummary,
} from "../../../../api/apiClient";
import { getSession } from "../../../../session";
import { useGetFeatures } from "../hooks/useGetFeaturesData";

// Helpers
const caretJoin = (...parts: string[]) =>
  parts.map((p) => String(p ?? "").trim())
       .map((s) => s.replace(/(\^|#)+$/g, "").replace(/^(\^|#)+/g, ""))
       .join("^");

const pipeJoin = (rows: string[]) =>
  rows.map((r) => String(r ?? "").trim()).map((s) => s.replace(/(\^)+/g, "")).join("^");

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
  allFeatures?: any[];
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
    allFeatures = [],
  } = payload;

  const role = localStorage.getItem("role");

  if (!featureIds?.length && !allFeatures?.length) {
    return analyzeExecution({
      result: "200",
      error: "",
      data: { Result: [{ TotalRowsCount: "0" }] },
      outparams: {},
      servertime: "",
    } as any);
  }

  const activeBit = isActive ? "true" : "false";

  // === حالة تعديل مجموعة موجودة ===
  if (groupRightId != null && groupRightId !== "") {
    // ابعت كل الفيتشرز، اللي في featureIds يكون true، والباقي false
    const allDetails = allFeatures.map((f) => {
      const isActive = featureIds.includes(Number(f.Id)) ? "true" : "false";
      return `0#${groupRightId}#${f.Id}#${isActive}`;
    });

    const detailValues = pipeJoin(allDetails);

    const multi = composeMultiTx(
      [{ tableName: D_TABLE, columnsValues: detailValues }],
      0,
      pointId
    );

    const res = await doMultiTransaction(multi);
    return analyzeExecution(res);
  }

  // === حالة إنشاء مجموعة جديدة ===
  // === حالة إنشاء مجموعة جديدة ===
  let officeID = 0;
  if (role == "O") {
    officeID = JSON.parse(localStorage.getItem("mainUser") || "{}")?.Office_Id ?? 0;
  }

  const roleCode = String(groupRightType ?? "M").toUpperCase();
  const name = sanitizeName(groupRightName ?? "");
  if (!name) throw new Error("اسم المجموعة مطلوب.");

  const masterValues = `0#${name}#${roleCode}#${officeID}`;

  // هنا التصحيح
  const allFeaturesFinal = allFeatures.map((f) => {
    const isActive = featureIds.map(String).includes(String(f.Id)) ? "true" : "false";
    return {
      tableName: D_TABLE,
      columnsValues: `0#0#${f.Id}#${isActive}`,
    };
  });

  const tables: MultiTablePart[] = [
    { tableName: M_TABLE, columnsValues: masterValues },
    ...allFeaturesFinal,
  ];

  const multi = composeMultiTx(tables, 0, pointId);
  const res = await doMultiTransaction(multi);
  return analyzeExecution(res);

}
