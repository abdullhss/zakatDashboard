// src/features/MainDepartment/Offices/Services/updateOffice.ts

import {
  doTransaction,
  analyzeExecution,
  type NormalizedSummary,
  PROCEDURE_NAMES,
} from "../../../../api/apiClient";

const COLS_NAMES_BASE =
  "Id#OfficeName#OfficeLatitude#OfficeLongitude#City_Id#PhoneNum#Address#IsActive"; 

const COLS_WITH_PHOTO =
  COLS_NAMES_BASE + "#OfficePhotoName"; 

export type UpdateOfficePayload = {
  id: number | string;
  officeName: string;
  cityId: string | number;
  phone: string;
  address: string;
  isActive: boolean | 0 | 1;
  latitude?: string | number | null;
  longitude?: string | number | null;
  photoId?: string | number | null; 
  pointId?: number | string;
  dataToken?: string;
};

const scrub = (v: unknown) => String(v ?? "").replace(/#/g, "");
const normalizePhotoId = (v: unknown) => {
  const s = String(v ?? "").trim();
  if (!s || s === "0" || s.toLowerCase() === "undefined" || s.toLowerCase() === "null") return "";
  return s;
};

export async function updateOffice(payload: UpdateOfficePayload): Promise<NormalizedSummary> {
  const {
    id, officeName, cityId, phone, address, isActive,
    latitude, longitude, photoId, pointId = 0, dataToken,
  } = payload;

  const city = Number(cityId) || 0;
  const isActiveStr =
    (typeof isActive === "boolean" ? isActive : Number(isActive) === 1) ? "1" : "0";

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

  const photo = normalizePhotoId(photoId);

  const ColumnsNames  = photo ? COLS_WITH_PHOTO : COLS_NAMES_BASE;
  const ColumnsValues = (photo ? [...baseValues, scrub(photo)] : baseValues).join("#");

  const tx = await doTransaction({
    TableName:     PROCEDURE_NAMES.OFFICE,
    WantedAction:  1,               // Update
    ColumnsNames,                   
    ColumnsValues,
    PointId:       pointId,
    DataToken:     dataToken,
  });

  // ✅ تحليل النتيجة وتصحيح حالة النجاح إذا كان الكود 200
  const result = analyzeExecution(tx);
  
  // إذا كان كود النتيجة '200' (النجاح من السيرفر)، نتأكد أن الواجهة تعتبره نجاحاً
  if (tx?.result === '200') {
    return { ...result, flags: { ...result.flags, SUCCESS: true, FAILURE: false }, success: true };
  }

  return result;
}