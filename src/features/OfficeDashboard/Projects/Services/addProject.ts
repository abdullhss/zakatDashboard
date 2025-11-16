// src/features/OfficeDashboard/Projects/Services/addProject.ts
import { doTransaction } from "../../../../api/apiClient";
import { getOfficeIdForPayload } from "../../../../session";

// من الـ Spec
const PROJECTS_TABLE_NAME = "w8GZW8O/lAQVG6R99L1C/w==";
const POINT_ID = 0;

export type AddProjectInput = {
  projectName: string;
  projectDesc?: string;
  subventionTypeId?: number | string;
  wantedAmount?: number | string;
  openingBalance?: number | string;
  remainingAmount?: number | string;
  allowZakat?: boolean;
  importanceId?: number | string;
  isActive?: boolean;
  projectPhotoName?: string; // ← هنرسل الـ id هنا (لو موجود)
  IsUrgent: string;
  ViewInMainScreen: string;
};

export async function addProject(input: AddProjectInput) {
  const officeId = getOfficeIdForPayload();

  const int = (v: any, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };
  const to01 = (b: any) => (b ? 1 : 0);

  // ترتيب الأعمدة مطابق للنص:
  // Id#ProjectName#ProjectDesc#SubventionType_Id#ProjectWantedAmount#ProjectOpeningBalance#ProjectRemainingAmount#AllowZakat#Importance_Id#Office_Id#IsActive#ProjectPhotoName
  const cols = [
    0,                                           // Id بإضافة = 0
    (input.projectName ?? "").trim(),            // ProjectName
    (input.projectDesc ?? "").trim(),            // ProjectDesc
    int(input.subventionTypeId, 0),              // SubventionType_Id
    int(input.wantedAmount, 0),                  // ProjectWantedAmount
    int(input.openingBalance, 0),                // ProjectOpeningBalance
    int(input.remainingAmount, 0),               // ProjectRemainingAmount
    to01(input.allowZakat ?? true),              // AllowZakat
    int(input.importanceId ?? 0, 0),             // Importance_Id
    int(officeId, 0),                            // Office_Id
    to01(input.isActive ?? true),                // IsActive
    (input.projectPhotoName ?? "").trim(),       // ProjectPhotoName ← هنا بنبعت الـ id
    input.IsUrgent?"True" : "False", // IsUrgent
    input.ViewInMainScreen?"True" : "False", // ViewInMainScreen
  ];

  const ColumnsValues = cols.join("#");

  return doTransaction({
    TableName: PROJECTS_TABLE_NAME,
    WantedAction: 0,
    ColumnsValues,
    PointId: POINT_ID,
  });
}
