// src/features/MainDepartment/Offices/Services/updateOffice.ts
import {
  doTransaction,
  analyzeExecution,
  type NormalizedSummary,
  PROCEDURE_NAMES,
} from "../../../../api/apiClient";

// نفس ترتيب الأعمدة المطلوب من الـ API
const COLS_NAMES =
  "Id#OfficeName#OfficeLatitude#OfficeLongitude#City_Id#PhoneNum#Address#IsActive#OfficePhotoName";

export type UpdateOfficePayload = {
  id: number | string;              // Id (لازم أول عمود)
  officeName: string;
  cityId: string | number;
  phone: string;
  address: string;
  isActive: boolean | 0 | 1;        // بنحوّلها لـ "T"/"F" أو "1"/"0" حسب نظامك
  latitude?: string | number | null;
  longitude?: string | number | null;
  photoName?: string | null;        // هنا بنبعت FileId
  pointId?: number | string;        // عادة 0 عندكم
  dataToken?: string;               // لو محتاج تبعتها
};

const scrub = (v: unknown) => String(v ?? "").replace(/#/g, "");

export async function updateOffice(payload: UpdateOfficePayload): Promise<NormalizedSummary> {
  const {
    id, officeName, cityId, phone, address, isActive,
    latitude, longitude, photoName, pointId = 0, dataToken,
  } = payload;

  // City_Id كرقم صريح
  const city = Number(cityId) || 0;

  // بعض الجداول تفضّل "T"/"F" — لو نظامك يشتغل بـ 1/0 غيّر للسطر اللي بعده
  const isActiveStr = (typeof isActive === "boolean" ? isActive : Number(isActive) === 1) ? "1" : "0";
  // const isActiveStr = (typeof isActive === "boolean" ? isActive : Number(isActive) === 1) ? "T" : "F";

  const ColumnsValues = [
    String(id),                 // 1) Id
    scrub(officeName),          // 2) OfficeName
    scrub(latitude ?? ""),      // 3) OfficeLatitude
    scrub(longitude ?? ""),     // 4) OfficeLongitude
    String(city),               // 5) City_Id
    scrub(phone),               // 6) PhoneNum
    scrub(address),             // 7) Address
    isActiveStr,                // 8) IsActive
    scrub(photoName ?? ""),     // 9) OfficePhotoName (FileId)
  ].join("#");

  const tx = await doTransaction({
    TableName:     PROCEDURE_NAMES.OFFICE, // أو "msDmpDYZ2wcHBSmvMDczrg=="
    WantedAction:  1,                      // Update
    ColumnsNames:  COLS_NAMES,
    ColumnsValues,
    PointId:       pointId,                // 0 حسب نظامك
    DataToken:     dataToken,              // اختياري
  });

  // لو عايز تشوف رسالة السيرفر:
  // console.log("[ERP decrypted]:", (tx as any)?.decrypted);

  return analyzeExecution(tx);
}
