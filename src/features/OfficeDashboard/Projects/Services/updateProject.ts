import { doTransaction, analyzeExecution, PROCEDURE_NAMES } from "../../../../api/apiClient";
import type { NormalizedSummary } from "../../../../api/apiClient";
import { getSession } from "../../../../session";

export interface UpdatePayload {
  id: number;
  projectName: string;
  projectDesc: string;
  subventionTypeId: number;
  wantedAmount: string;
  openingBalance: string;
  remainingAmount: string;
  allowZakat: boolean;
  importanceId: number;
  isActive: boolean;
  photoName: string; // ← هنا بنبعت الـID
}

const scrub = (v: unknown) => String(v ?? "").replace(/#/g, "");

export async function updateProject(payload: UpdatePayload): Promise<NormalizedSummary> {
  const { userId, officeId } = getSession();
  const pointId = userId ?? 0;
  const currentOfficeId = officeId ?? 0;

  const columnsNames =
    "Id#ProjectName#ProjectDesc#SubventionType_Id#ProjectWantedAmount#ProjectOpeningBalance#ProjectRemainingAmount#AllowZakat#Importance_Id#Office_Id#IsActive#ProjectPhotoName";

  const columnsValues =
    `${payload.id}#` +
    `${scrub(payload.projectName)}#` +
    `${scrub(payload.projectDesc) || ""}#` +
    `${payload.subventionTypeId}#` +
    `${scrub(payload.wantedAmount)}#` +
    `${scrub(payload.openingBalance)}#` +
    `${scrub(payload.remainingAmount)}#` +
    `${payload.allowZakat ? 1 : 0}#` +
    `${payload.importanceId}#` +
    `${currentOfficeId}#` +
    `${payload.isActive ? 1 : 0}#` +
    `${scrub(payload.photoName)}`;

  console.log("🧩 ColumnsValues for update:", columnsValues);

  const exec = await doTransaction({
    TableName: PROCEDURE_NAMES.ADD_UPDATE_PROJECTS,
    WantedAction: 1, // Update
    ColumnsValues: columnsValues,
    ColumnsNames: columnsNames,
    PointId: pointId,
  });

  const summary = analyzeExecution(exec);
  if (summary.flags.FAILURE || summary.flags.INTERNAL_ERROR) {
    throw new Error(summary.message || "فشل تعديل المشروع.");
  }

  return summary;
}
