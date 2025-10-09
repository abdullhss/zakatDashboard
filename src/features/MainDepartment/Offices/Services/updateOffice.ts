// src/features/MainDepartment/Offices/services/updateOffice.ts
import { doTransaction, analyzeExecution, type NormalizedSummary } from "../../../../api/apiClient";

/** اسم جدول المكاتب (Encrypted) من الدوكيومنت */
export const OFFICE_TABLE = "msDmpDYZ2wcHBSmvMDczrg==";

/** الحقول المطلوبة بالترتيب حسب الدوكيومنت */
const COLS = "Id#OfficeName#OfficeLatitude#OfficeLongitude#City_Id#PhoneNum#Address#IsActive#OfficePhotoName";

export type UpdateOfficePayload = {
  id: number | string;             // Id
  officeName: string;              // OfficeName
  cityId: number | string;         // City_Id
  phone: string;                   // PhoneNum
  address: string;                 // Address
  isActive: boolean | 0 | 1;       // IsActive (bit)
  latitude?: string | number | null;   // OfficeLatitude
  longitude?: string | number | null;  // OfficeLongitude
  photoName?: string | null;           // OfficePhotoName
  pointId?: number | string;           // PointId (افتراضي 0)
  dataToken?: string | number;         // إن لزم
};

const scrub = (v: unknown) => String(v ?? "").replace(/#/g, "");

export async function updateOffice(payload: UpdateOfficePayload): Promise<NormalizedSummary> {
  const {
    id, officeName, cityId, phone, address, isActive,
    latitude, longitude, photoName, pointId = 0, dataToken,
  } = payload;

  const bit = typeof isActive === "boolean" ? (isActive ? 1 : 0) : (Number(isActive) ? 1 : 0);

  const ColumnsValues = [
    String(id),
    scrub(officeName),
    scrub(latitude ?? ""),
    scrub(longitude ?? ""),
    String(cityId ?? ""),
    scrub(phone),
    scrub(address),
    String(bit),
    scrub(photoName ?? ""),
  ].join("#");

  const body: any = {
    TableName: OFFICE_TABLE,
    WantedAction: 1,          // Update
    ColumnsNames: COLS,       // ← نرسل الأسماء لضمان الترتيب
    ColumnsValues,
    PointId: pointId,
  };
  if (dataToken != null) body.DataToken = dataToken;

  const tx = await doTransaction(body);
  return analyzeExecution(tx);
}

// ✅ alias اختياري لو فيه أماكن قديمة بتستورد updateOfficeFull
export const updateOfficeFull = updateOffice;
