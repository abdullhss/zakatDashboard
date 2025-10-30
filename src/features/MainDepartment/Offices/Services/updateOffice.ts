// src/features/MainDepartment/Offices/Services/updateOffice.ts
import {
  doTransaction,
  analyzeExecution,
  type NormalizedSummary,
  PROCEDURE_NAMES,
} from "../../../../api/apiClient";

const COLS_NAMES_BASE =
  "Id#OfficeName#OfficeLatitude#OfficeLongitude#City_Id#PhoneNum#Address#IsActive"; // ← بدون الصورة

const COLS_WITH_PHOTO =
  COLS_NAMES_BASE + "#OfficePhotoName"; // ← لما يكون عندنا PhotoId

export type UpdateOfficePayload = {
  id: number | string;
  officeName: string;
  cityId: string | number;
  phone: string;
  address: string;
  isActive: boolean | 0 | 1;
  latitude?: string | number | null;
  longitude?: string | number | null;
  photoId?: string | number | null;   // ← بنبعته لو موجود بس
  pointId?: number | string;
  dataToken?: string;
};

const scrub = (v: unknown) => String(v ?? "").replace(/#/g, "");
const normalizePhotoId = (v: unknown) => {
  const s = String(v ?? "").trim();
  // اعتبر القيم دي = مفيش صورة
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
    String(id),            // 1) Id
    scrub(officeName),     // 2) OfficeName
    scrub(latitude ?? ""), // 3) OfficeLatitude
    scrub(longitude ?? ""),// 4) OfficeLongitude
    String(city),          // 5) City_Id
    scrub(phone),          // 6) PhoneNum
    scrub(address),        // 7) Address
    isActiveStr,           // 8) IsActive
  ];

  const photo = normalizePhotoId(photoId);

  // لو عندنا PhotoId → ضيف العمود والقيمة
  const ColumnsNames  = photo ? COLS_WITH_PHOTO : COLS_NAMES_BASE;
  const ColumnsValues = (photo ? [...baseValues, scrub(photo)] : baseValues).join("#");

  const tx = await doTransaction({
    TableName:     PROCEDURE_NAMES.OFFICE,
    WantedAction:  1,               // Update
    ColumnsNames,                   // ← أحيانًا بدون OfficePhotoName
    ColumnsValues,
    PointId:       pointId,
    DataToken:     dataToken,
  });

  return analyzeExecution(tx);
}
