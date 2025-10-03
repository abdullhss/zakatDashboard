import {
  doTransaction,
  PROCEDURE_NAMES,
  analyzeExecution,
  type NormalizedSummary,
} from "../../../../api/apiClient";

export type OfficeUpdateInput = {
  id: number | string;

  officeName?: string | null;
  cityId?: string | number | null;
  phone?: string | null;
  address?: string | null;
  isActive?: boolean | 0 | 1;

  latitude?: string | number | null;
  longitude?: string | number | null;
  photoName?: string | null;
};

/**
 * ✅ الطريقة الآمنة: نرسل كل الأعمدة بالترتيب المطلوب
 * Id#OfficeName#OfficeLatitude#OfficeLongitude#City_Id#PhoneNum#Address#IsActive#OfficePhotoName
 */
export async function updateOfficeFull(
  row: Required<Pick<OfficeUpdateInput, "id">> & {
    officeName: string;
    cityId: string | number;
    phone: string;
    address: string;
    isActive: boolean | 0 | 1;
    latitude?: string | number | null;
    longitude?: string | number | null;
    photoName?: string | null;
  },
  pointId: number | string = 0
): Promise<NormalizedSummary> {
  const cols = [
    "Id",
    "OfficeName",
    "OfficeLatitude",
    "OfficeLongitude",
    "City_Id",
    "PhoneNum",
    "Address",
    "IsActive",
    "OfficePhotoName",
  ].join("#");

  const vals = [
    row.id,
    row.officeName ?? "",
    row.latitude ?? "",
    row.longitude ?? "",
    row.cityId ?? "",
    row.phone ?? "",
    row.address ?? "",
    (typeof row.isActive === "boolean" ? (row.isActive ? 1 : 0) : row.isActive) ?? 0, // 0/1
    row.photoName ?? "",
  ].join("#");

  const res = await doTransaction({
    TableName: PROCEDURE_NAMES.OFFICE,
    WantedAction: 1, // Update
    ColumnsNames: cols,
    ColumnsValues: vals,
    PointId: pointId,
  });

  return analyzeExecution(res);
}

/**
 * ⚠️ لو جدولك يسمح بتحديث جزئي (مش دايمًا بيقبل)
 * مرّر أسماء الأعمدة وقيمها فقط
 */
export async function updateOfficePartial(
  id: number | string,
  patch: Partial<Omit<OfficeUpdateInput, "id">>,
  pointId: number | string = 0
): Promise<NormalizedSummary> {
  const names: string[] = ["Id"];
  const values: (string | number)[] = [id];

  if (patch.officeName !== undefined) {
    names.push("OfficeName");
    values.push(patch.officeName ?? "");
  }
  if (patch.latitude !== undefined) {
    names.push("OfficeLatitude");
    values.push(patch.latitude ?? "");
  }
  if (patch.longitude !== undefined) {
    names.push("OfficeLongitude");
    values.push(patch.longitude ?? "");
  }
  if (patch.cityId !== undefined) {
    names.push("City_Id");
    values.push(String(patch.cityId ?? ""));
  }
  if (patch.phone !== undefined) {
    names.push("PhoneNum");
    values.push(patch.phone ?? "");
  }
  if (patch.address !== undefined) {
    names.push("Address");
    values.push(patch.address ?? "");
  }
  if (patch.isActive !== undefined) {
    names.push("IsActive");
    const bit = typeof patch.isActive === "boolean" ? (patch.isActive ? 1 : 0) : patch.isActive;
    values.push(bit ?? 0);
  }
  if (patch.photoName !== undefined) {
    names.push("OfficePhotoName");
    values.push(patch.photoName ?? "");
  }

  const res = await doTransaction({
    TableName: PROCEDURE_NAMES.OFFICE,
    WantedAction: 1, // Update
    ColumnsNames: names.join("#"),
    ColumnsValues: values.join("#"),
    PointId: pointId,
  });

  return analyzeExecution(res);
}
