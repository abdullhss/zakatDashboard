// src/features/MainDepartment/Offices/Services/updateOffice.ts

import {
  doTransaction,
  analyzeExecution,
  type NormalizedSummary,
  PROCEDURE_NAMES,
} from "../../../../api/apiClient";

const COLS_NAMES_BASE =
  "Id#OfficeName#OfficeLatitude#OfficeLongitude#City_Id#PhoneNum#Address#IsActive";

export type UpdateOfficePayload = {
  id: number | string;
  officeName: string;
  cityId: string | number;
  phone: string;
  address: string;
  isActive: boolean | 0 | 1;
  latitude?: string | number | null;
  longitude?: string | number | null;

  // صور
  photoId?: string | number | null;       // Office photo
    HeaderPhotoName?: string | number | null; // Header photo

  pointId?: number | string;
  dataToken?: string;
};

const scrub = (v: unknown) => String(v ?? "").replace(/#/g, "");

const normalizePhotoId = (v: unknown) => {
  const s = String(v ?? "").trim();
  if (!s || s === "" || s === "0" || s === "null" || s === "undefined") return "";
  return s;
};

export async function updateOffice(payload: UpdateOfficePayload): Promise<NormalizedSummary> {
  const {
    id, officeName, cityId, phone, address, isActive,
    latitude, longitude,
    photoId, HeaderPhotoName,
    pointId = 0, dataToken,
  } = payload;

  const city = Number(cityId) || 0;

  const isActiveStr =
    (typeof isActive === "boolean" ? isActive : Number(isActive) === 1)
      ? "1"
      : "0";

  const baseValues = [
    String(id),
    scrub(officeName),
    scrub(String(latitude ?? "")),
    scrub(String(longitude ?? "")),
    String(city),
    scrub(phone),
    scrub(address),
    isActiveStr,
  ];

  const officePhoto = normalizePhotoId(photoId);
  const headerPhoto = normalizePhotoId(HeaderPhotoName);

  // ----------- تحديد الأعمدة حسب الصور اللي اتبعتت -----------
  let ColumnsNames = COLS_NAMES_BASE;
  let ColumnsValues = [...baseValues];

  if (officePhoto) {
    ColumnsNames += "#OfficePhotoName";
    ColumnsValues.push(scrub(officePhoto));
  }

  if (headerPhoto) {
    ColumnsNames += "#HeaderPhotoName";
    ColumnsValues.push(scrub(headerPhoto));
  }

  ColumnsValues = ColumnsValues.join("#");

  // -------------------------------------------------------------

  const tx = await doTransaction({
    TableName: PROCEDURE_NAMES.OFFICE,
    WantedAction: 1, // Update
    ColumnsNames,
    ColumnsValues,
    PointId: pointId,
    DataToken: dataToken,
  });

  const result = analyzeExecution(tx);

  if (tx?.result === "200") {
    return {
      ...result,
      flags: { ...result.flags, SUCCESS: true, FAILURE: false },
      success: true,
    };
  }

  return result;
}
