import { doTransaction, analyzeExecution, type NormalizedSummary } from "../../../../api/apiClient";
import { PROCEDURE_NAMES } from "../../../../api/apiClient";

// نفس ترتيب الأعمدة المطلوب من الـ API:
// Id#OfficeName#OfficeLatitude#OfficeLongitude#City_Id#PhoneNum#Address#IsActive#OfficePhotoName

export type AddOfficePayload = {
  officeName: string;
  cityId: string | number;
  phone: string;
  address: string;
  isActive: boolean;

  latitude?: string | number | null;
  longitude?: string | number | null;
  photoName?: string | null;
  pointId?: number | string; // لو عندك userId أو أي معرف
};

export async function addOffice(payload: AddOfficePayload): Promise<NormalizedSummary> {
  const {
    officeName,
    cityId,
    phone,
    address,
    isActive,
    latitude,
    longitude,
    photoName,
    pointId,
  } = payload;

  // نحافظ على الترتيب المطلوب بالحرف:
  const ColumnsValues = [
    "",                                // Id (فاضي في الـ Insert)
    officeName ?? "",
    latitude ?? "",                    // OfficeLatitude
    longitude ?? "",                   // OfficeLongitude
    String(cityId ?? ""),              // City_Id
    phone ?? "",                       // PhoneNum
    address ?? "",                     // Address
    isActive ? "T" : "F",              // IsActive
    photoName ?? "",                   // OfficePhotoName
  ].join("#");

  const result = await doTransaction({
    TableName:   PROCEDURE_NAMES.OFFICE,
    WantedAction: 0,                   // Insert
    ColumnsValues,
    PointId: pointId ?? Date.now(),   // أي قيمة مميزة للـ transaction
    // DataToken:  // سيستخدم الافتراضي من apiClient (Zakat) لو ما أرسلتش
    // SendNotification: "F",         // لو عايز تبعت إشعار فعِّلها وضيف باقي الحقول
  });

  return analyzeExecution(result);
}
