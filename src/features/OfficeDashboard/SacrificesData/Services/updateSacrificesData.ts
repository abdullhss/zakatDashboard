import { doTransaction, analyzeExecution } from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";

export interface UpdateSacrificeOrderInput {
  Id: number | string;
  SacrificeOrderDate: string | Date | null;
  Office_Id: number | string | null;
  GeneralUser_Id: number | string | null;
  SacrificeOrderTotalAmount: number | string | null;
  IsApproved: boolean | number | "T" | "F" | null;
  ApprovedDate: string | Date | null;
  ApprovedBy: number | string | null;
  IsDone: boolean | number | "T" | "F" | null;
}

/** DD/MM/YYYY */
function fmtDate(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") {
    if (/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(v)) {
      const [y,m,d] = v.slice(0,10).split("-");
      return `${d}/${m}/${y}`;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return v;
    if (/^\d{8}$/.test(v)) {
      const y=v.slice(0,4), m=v.slice(4,6), d=v.slice(6,8);
      return `${d}/${m}/${y}`;
    }
    return v;
  }
  const d = v instanceof Date ? v : new Date(v as any);
  const dd = String(d.getDate()).padStart(2,"0");
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

function boolishTo01(v: unknown): number {
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "number") return v ? 1 : 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return ["t","true","1","yes","y","مفعل","نعم"].includes(s) ? 1 : 0;
  }
  return 0;
}

export async function updateSacrificesData(
  payload: UpdateSacrificeOrderInput,
  pointId: number | string = 1
): Promise<NormalizedSummary> {
  const ColumnsNames =
    "Id#IsApproved#ApprovedDate#ApprovedBy";

  const today = new Date();
  const approvedDate = payload.ApprovedDate ? fmtDate(payload.ApprovedDate) : fmtDate(today);

  const ColumnsValues = [
    payload.Id ?? "",
    String(boolishTo01(payload.IsApproved)),
    approvedDate,
    payload.ApprovedBy ?? "",
  ].join("#");

  const result = await doTransaction({
    TableName: "akNrCC3HOjYZr7wlP2MSFg==", // SacrificeOrder
    WantedAction: 1,
    ColumnsValues,
    ColumnsNames,
    PointId: 0,
  });

  return analyzeExecution(result);
}
