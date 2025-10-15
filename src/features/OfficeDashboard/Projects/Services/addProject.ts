import { doTransaction } from "../../../../api/apiClient";
import { getOfficeIdForPayload } from "../../../../session";

// TableName (encrypted) جاي لك من الـ Spec
const PROJECTS_TABLE_NAME = "w8GZW8O/lAQVG6R99L1C/w==";

// ممكن تخليها ثابتة عامة لو عندكم PointId على مستوى النظام
const POINT_ID = 0;

export type AddProjectInput = {
  projectName: string;
  projectDesc?: string;
  subventionTypeId?: number | string;      // تصنيف المشروع (لو عندك ID لها)
  wantedAmount?: number | string;          // ProjectWantedAmount
  openingBalance?: number | string;        // ProjectOpeningBalance
  remainingAmount?: number | string;       // ProjectRemainingAmount
  allowZakat?: boolean;                    // AllowZakat → 1/0
  importanceId?: number | string;          // حالياً 0
  isActive?: boolean;                      // default true
  photoName?: string;                      // اسم ملف الصورة (اختياري)
};

export async function addProject(input: AddProjectInput) {
  const officeId = getOfficeIdForPayload();

  const int = (v: any, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const to01 = (b: any) => (b ? 1 : 0);

  const cols = [
    0, // Id عند الإضافة
    (input.projectName ?? "").trim(),
    (input.projectDesc ?? "").trim(),
    int(input.subventionTypeId, 0),
    int(input.wantedAmount, 0),
    int(input.openingBalance, 0),
    int(input.remainingAmount, 0),
    to01(input.allowZakat ?? true),
    int(input.importanceId ?? 0, 0), // حالياً 0
    int(officeId, 0),
    to01(input.isActive ?? true),
    (input.photoName ?? "").trim(),
  ];

  // نكوّن ColumnsValues مفصولة بـ #
  const ColumnsValues = cols.join("#");

  const tx = await doTransaction({
    TableName: PROJECTS_TABLE_NAME,
    WantedAction: 0,               // 0 = Insert
    ColumnsValues,
    PointId: POINT_ID,
  });

  return tx;
}
